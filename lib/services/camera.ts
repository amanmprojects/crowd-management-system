/**
 * Camera Service
 * 
 * Handles all communication with the Python CV server.
 * The Python server (main.py) is the only service that interacts with the IP camera.
 * 
 * - Fetches frames with detection from Python server
 * - Checks Python server health/online status
 * - Provides stream URL for frontend to display video
 */

import type { CameraStatus } from '../types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Get configuration from environment variables.
 * Falls back to defaults if not set.
 */
function getConfig() {
    // Base URL of the Python CV server
    const pythonServerUrl = process.env.PYTHON_SERVER_URL || 'http://localhost:8000';
    
    return {
        // URL to fetch frame with detections from Python server
        frameUrl: `${pythonServerUrl}/get-frame`,
        // URL for live video stream (MJPEG) from Python server
        streamUrl: `${pythonServerUrl}/stream`,
        // Base URL for health checks
        pythonServerUrl,
        // Human-readable name
        name: process.env.CAMERA_NAME || 'DroidCam via Python Server',
    };
}

// =============================================================================
// FRAME CAPTURE WITH DETECTION
// =============================================================================

/**
 * Response from Python server's /get-frame endpoint.
 * Contains both the frame image and detection results.
 */
export interface PythonServerFrame {
    /** Base64-encoded JPEG image */
    image: string;
    /** Array of detected persons with bounding boxes */
    persons: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        confidence: number;
    }>;
    /** Number of persons detected */
    person_count: number;
}

/**
 * Fetches a frame with detections from the Python server.
 * 
 * @returns Promise<PythonServerFrame> - The frame data with detections
 * @throws Error if Python server is unreachable or returns invalid response
 * 
 * @example
 * const data = await fetchFrameWithDetection();
 * console.log(`Detected ${data.person_count} people`);
 */
export async function fetchFrameWithDetection(): Promise<PythonServerFrame> {
    const config = getConfig();

    const response = await fetch(config.frameUrl, {
        // Don't cache - we want fresh frames every time
        cache: 'no-store',
        // Timeout after 10 seconds (includes YOLO processing time)
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        throw new Error(`Python server returned status ${response.status}`);
    }

    const data = await response.json();
    return data as PythonServerFrame;
}

/**
 * Fetches a frame from the Python server and returns the raw image buffer.
 * 
 * @returns Promise<Buffer> - The raw JPEG image bytes
 * @throws Error if Python server is unreachable or returns invalid response
 */
export async function fetchFrame(): Promise<Buffer> {
    const data = await fetchFrameWithDetection();
    // Decode base64 image
    return Buffer.from(data.image, 'base64');
}

/**
 * Fetches a frame and returns it as a base64 string.
 * Useful for sending to APIs that expect base64-encoded images.
 * 
 * @returns Promise<string> - Base64-encoded JPEG image
 */
export async function fetchFrameAsBase64(): Promise<string> {
    const data = await fetchFrameWithDetection();
    return data.image;
}

// =============================================================================
// CAMERA STATUS
// =============================================================================

/** Stores the last known camera status */
let lastStatus: CameraStatus | null = null;

/**
 * Checks if the Python server (and camera) is online and reachable.
 * 
 * Makes a GET request to the /get-frame endpoint. If successful, both the
 * Python server and camera are working.
 * 
 * @returns Promise<CameraStatus> - Current camera status
 * 
 * @example
 * const status = await checkCameraStatus();
 * if (status.online) {
 *   console.log('Camera is working!');
 * } else {
 *   console.log('Camera error:', status.error);
 * }
 */
export async function checkCameraStatus(): Promise<CameraStatus> {
    const config = getConfig();
    const now = new Date().toISOString();

    try {
        // Try to fetch a frame from the Python server
        const response = await fetch(config.frameUrl, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });

        const data = await response.json();

        if (response.ok && !data.error) {
            lastStatus = {
                online: true,
                name: config.name,
                url: config.pythonServerUrl,
                streamUrl: config.streamUrl,
                lastCheck: now,
            };
        } else {
            lastStatus = {
                online: false,
                name: config.name,
                url: config.pythonServerUrl,
                streamUrl: config.streamUrl,
                lastCheck: now,
                error: data.error || `HTTP ${response.status}`,
            };
        }
    } catch (error) {
        // Network error, timeout, etc.
        lastStatus = {
            online: false,
            name: config.name,
            url: config.pythonServerUrl,
            streamUrl: config.streamUrl,
            lastCheck: now,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }

    return lastStatus;
}

/**
 * Gets the last known camera status without making a new request.
 * Useful for getting cached status without network overhead.
 * 
 * @returns CameraStatus | null - Last known status, or null if never checked
 */
export function getLastCameraStatus(): CameraStatus | null {
    return lastStatus;
}

/**
 * Gets the camera stream URL for the frontend to display.
 * This is the MJPEG URL that browsers can display directly.
 * 
 * @returns string - The MJPEG stream URL
 */
export function getCameraStreamUrl(): string {
    return getConfig().streamUrl;
}
