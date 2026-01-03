/**
 * Detection Service
 * 
 * Handles communication with the Python CV server for YOLO-based person detection.
 * The Python server (main.py) runs YOLO and returns detection results.
 * 
 * The service:
 * - Fetches detection results from Python server's /detect endpoint (lightweight, no image)
 * - Transforms the response to our internal DetectionResult format
 * - Handles errors gracefully
 */

import type { DetectionResult, BoundingBox } from '../types';

// =============================================================================
// CONFIGURATION
// =============================================================================

function getConfig() {
    return {
        // URL of the Python FastAPI server running YOLO
        pythonServerUrl: process.env.PYTHON_SERVER_URL || 'http://localhost:8000',
    };
}

// =============================================================================
// TYPES
// =============================================================================

/**
 * Response from Python server's /detect endpoint.
 * Lightweight response with only bounding boxes (no image).
 */
interface DetectResponse {
    persons: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        confidence: number;
    }>;
    person_count: number;
}

// =============================================================================
// DETECTION TRANSFORMATION
// =============================================================================

/**
 * Transforms the Python server's detection format to our internal format.
 * 
 * Python server returns bounding boxes as (x1, y1, x2, y2) coordinates,
 * but our frontend expects (x, y, width, height) format.
 * 
 * @param serverResponse - Response from Python server's /detect endpoint
 * @returns DetectionResult in our internal format
 */
function transformDetection(serverResponse: DetectResponse): DetectionResult {
    const boxes: BoundingBox[] = serverResponse.persons.map(person => ({
        x: person.x1,
        y: person.y1,
        width: person.x2 - person.x1,
        height: person.y2 - person.y1,
        confidence: person.confidence,
    }));

    return {
        timestamp: new Date().toISOString(),
        people_count: serverResponse.person_count,
        boxes,
        processing_time_ms: undefined,
    };
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Detects people in the current camera frame.
 * 
 * Uses the lightweight /detect endpoint which returns only bounding boxes
 * (no image data), reducing network overhead for the polling loop.
 * 
 * @returns Promise<DetectionResult> - Detection results with bounding boxes
 * 
 * @example
 * const result = await detectPeople();
 * console.log(`Detected ${result.people_count} people`);
 * console.log(`Bounding boxes:`, result.boxes);
 */
export async function detectPeople(): Promise<DetectionResult> {
    const config = getConfig();
    const startTime = Date.now();
    
    // Use lightweight /detect endpoint (no image in response)
    const response = await fetch(`${config.pythonServerUrl}/detect`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        throw new Error(`Python server returned status ${response.status}`);
    }

    const serverResponse: DetectResponse = await response.json();
    
    // Transform to our internal format
    const result = transformDetection(serverResponse);
    
    // Add processing time
    result.processing_time_ms = Date.now() - startTime;
    
    return result;
}

/**
 * Checks if the Python CV server is available.
 * Makes a request to verify connectivity.
 * 
 * @returns Promise<boolean> - true if server is reachable
 */
export async function checkCVServiceHealth(): Promise<boolean> {
    const config = getConfig();

    try {
        const response = await fetch(`${config.pythonServerUrl}/detect`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}
