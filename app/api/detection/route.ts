/**
 * Detection API Route
 * 
 * GET /api/detection
 * Returns the latest detection result (people count + bounding boxes).
 * 
 * PURPOSE:
 * Frontend calls this to get current detection data.
 * Alternative to SSE if you prefer polling.
 * 
 * RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "timestamp": "2026-01-03T16:00:00Z",
 *     "people_count": 5,
 *     "boxes": [{ "x": 120, "y": 60, "width": 80, "height": 190 }],
 *     "processing_time_ms": 150
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { getLatestDetection } from '@/lib/services/state';
import type { ApiResponse, DetectionResult } from '@/lib/types';

export async function GET() {
    const detection = getLatestDetection();

    if (!detection) {
        // No detection has run yet
        const response: ApiResponse<null> = {
            success: true,
            data: null,
            timestamp: new Date().toISOString(),
        };
        return NextResponse.json(response);
    }

    const response: ApiResponse<DetectionResult> = {
        success: true,
        data: detection,
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
}
