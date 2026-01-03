/**
 * Type Definitions for Crowd Management System
 * 
 * These interfaces define the shape of data used throughout the app.
 * They ensure type safety and provide documentation for what data looks like.
 */

// =============================================================================
// DETECTION TYPES
// =============================================================================

/**
 * A bounding box representing a detected person in the frame.
 * Coordinates are in pixels relative to the frame dimensions.
 */
export interface BoundingBox {
    /** X coordinate of the top-left corner */
    x: number;
    /** Y coordinate of the top-left corner */
    y: number;
    /** Width of the bounding box */
    width: number;
    /** Height of the bounding box */
    height: number;
    /** Optional confidence score from the model (0-1) */
    confidence?: number;
}

/**
 * Result from the detection service (YOLO).
 * This is what the Python CV service returns after processing a frame.
 */
export interface DetectionResult {
    /** ISO timestamp of when detection was performed */
    timestamp: string;
    /** Number of people detected in the frame */
    people_count: number;
    /** Array of bounding boxes for each detected person */
    boxes: BoundingBox[];
    /** Time taken to process the frame (milliseconds) */
    processing_time_ms?: number;
}

// =============================================================================
// CAMERA TYPES
// =============================================================================

/**
 * Camera connection status.
 */
export interface CameraStatus {
    /** Whether the camera is reachable */
    online: boolean;
    /** Camera identifier/name */
    name: string;
    /** URL used to connect to the camera */
    url: string;
    /** Stream URL for live video (MJPEG) */
    streamUrl: string;
    /** ISO timestamp of last successful connection check */
    lastCheck: string;
    /** Error message if camera is offline */
    error?: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standard API response wrapper.
 * Used for consistent API responses across all endpoints.
 */
export interface ApiResponse<T> {
    /** Whether the request was successful */
    success: boolean;
    /** Response data (present if success is true) */
    data?: T;
    /** Error message (present if success is false) */
    error?: string;
    /** ISO timestamp of the response */
    timestamp: string;
}

// =============================================================================
// SSE EVENT TYPES
// =============================================================================

/**
 * Server-Sent Event data for detection updates.
 * This is the shape of data pushed to the frontend via SSE.
 */
export interface DetectionEvent {
    /** Event type identifier */
    type: 'detection';
    /** The detection result data */
    data: DetectionResult;
}

/**
 * Server-Sent Event data for camera status updates.
 */
export interface CameraStatusEvent {
    /** Event type identifier */
    type: 'camera_status';
    /** The camera status data */
    data: CameraStatus;
}

/** Union type for all SSE events */
export type SSEEvent = DetectionEvent | CameraStatusEvent;
