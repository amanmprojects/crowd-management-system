/**
 * State Service
 * 
 * In-memory storage for the application state.
 * Stores the latest detection result so multiple parts of the app can access it.
 * 
 * WHY IN-MEMORY?
 * - We only care about CURRENT state, not history
 * - Fast read/write (no database overhead)
 * - If server restarts, we just start fresh (acceptable for this use case)
 * 
 * HOW IT WORKS:
 * 1. Detection loop runs every 1 second
 * 2. Loop calls setLatestDetection(result) to save the result
 * 3. SSE stream and API endpoints call getLatestDetection() to read it
 * 4. Frontend receives updates and displays them
 */

import type { DetectionResult, CameraStatus } from '../types';

// =============================================================================
// STATE STORAGE
// =============================================================================

/** 
 * The most recent detection result.
 * Updated every time we run detection (typically every 1 second).
 */
let latestDetection: DetectionResult | null = null;

/**
 * The most recent camera status.
 * Updated whenever we check camera health.
 */
let cameraStatus: CameraStatus | null = null;

/**
 * List of callbacks to notify when detection changes.
 * Used by SSE to push updates to connected clients.
 */
type DetectionListener = (result: DetectionResult) => void;
const detectionListeners: Set<DetectionListener> = new Set();

// =============================================================================
// DETECTION STATE
// =============================================================================

/**
 * Saves a new detection result to state.
 * Also notifies all registered listeners (SSE clients).
 * 
 * @param result - The detection result from YOLO
 * 
 * @example
 * // In detection loop:
 * const result = await detectPeople(frame);
 * setLatestDetection(result);  // Saves and notifies listeners
 */
export function setLatestDetection(result: DetectionResult): void {
    latestDetection = result;

    // Notify all listeners (SSE connections)
    detectionListeners.forEach(listener => {
        try {
            listener(result);
        } catch (error) {
            // If a listener throws, remove it (connection probably closed)
            console.error('Error notifying listener:', error);
            detectionListeners.delete(listener);
        }
    });
}

/**
 * Gets the most recent detection result.
 * 
 * @returns DetectionResult | null - The latest result, or null if no detection has run yet
 * 
 * @example
 * const current = getLatestDetection();
 * if (current) {
 *   console.log(`${current.people_count} people detected`);
 * }
 */
export function getLatestDetection(): DetectionResult | null {
    return latestDetection;
}

// =============================================================================
// CAMERA STATUS STATE
// =============================================================================

/**
 * Saves camera status to state.
 * 
 * @param status - The current camera status
 */
export function setCameraStatus(status: CameraStatus): void {
    cameraStatus = status;
}

/**
 * Gets the current camera status.
 * 
 * @returns CameraStatus | null - The camera status, or null if never checked
 */
export function getCameraStatus(): CameraStatus | null {
    return cameraStatus;
}

// =============================================================================
// EVENT LISTENERS (for SSE)
// =============================================================================

/**
 * Registers a listener to be notified when new detection results arrive.
 * Used by SSE endpoint to push updates to the frontend.
 * 
 * @param listener - Callback function to call with each new detection
 * @returns Function to unsubscribe the listener
 * 
 * @example
 * // In SSE endpoint:
 * const unsubscribe = subscribeToDetections((result) => {
 *   stream.write(`data: ${JSON.stringify(result)}\n\n`);
 * });
 * 
 * // When client disconnects:
 * unsubscribe();
 */
export function subscribeToDetections(listener: DetectionListener): () => void {
    detectionListeners.add(listener);

    // Return unsubscribe function
    return () => {
        detectionListeners.delete(listener);
    };
}

/**
 * Gets the number of active SSE listeners.
 * Useful for monitoring/debugging.
 */
export function getListenerCount(): number {
    return detectionListeners.size;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Clears all state. Useful for testing or resetting.
 */
export function clearState(): void {
    latestDetection = null;
    cameraStatus = null;
    detectionListeners.clear();
}

/**
 * Gets a summary of current state for debugging.
 */
export function getStateSummary() {
    return {
        hasDetection: latestDetection !== null,
        lastDetectionTime: latestDetection?.timestamp ?? null,
        peopleCount: latestDetection?.people_count ?? 0,
        cameraOnline: cameraStatus?.online ?? null,
        activeListeners: detectionListeners.size,
    };
}
