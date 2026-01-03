/**
 * Detection Loop Service
 * 
 * Runs automatic detection every 1 second by polling the Python server.
 * Updates the state which notifies all SSE listeners.
 * 
 * This runs as a singleton - only one loop runs regardless of how many
 * times this module is imported.
 */

import { detectPeople } from './detection';
import { setLatestDetection } from './state';

// =============================================================================
// CONFIGURATION
// =============================================================================

/** How often to run detection (in milliseconds) */
const DETECTION_INTERVAL_MS = 1000;

// =============================================================================
// LOOP STATE
// =============================================================================

let isRunning = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

// =============================================================================
// DETECTION LOOP
// =============================================================================

/**
 * Runs a single detection cycle.
 * Fetches frame from Python server and updates state.
 */
async function runDetection(): Promise<void> {
    try {
        const result = await detectPeople();
        setLatestDetection(result);
    } catch (error) {
        // Log but don't crash - the loop should keep trying
        console.error('[DetectionLoop] Detection failed:', error instanceof Error ? error.message : error);
    }
}

/**
 * Starts the automatic detection loop.
 * Safe to call multiple times - will only start one loop.
 */
export function startDetectionLoop(): void {
    if (isRunning) {
        console.log('[DetectionLoop] Already running');
        return;
    }

    console.log('[DetectionLoop] Starting automatic detection every', DETECTION_INTERVAL_MS, 'ms');
    isRunning = true;

    // Run immediately on start
    runDetection();

    // Then run every interval
    intervalId = setInterval(runDetection, DETECTION_INTERVAL_MS);
}

/**
 * Stops the automatic detection loop.
 */
export function stopDetectionLoop(): void {
    if (!isRunning || !intervalId) {
        console.log('[DetectionLoop] Not running');
        return;
    }

    console.log('[DetectionLoop] Stopping');
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
}

/**
 * Returns whether the loop is currently running.
 */
export function isDetectionLoopRunning(): boolean {
    return isRunning;
}
