/**
 * Detection Trigger API Route
 * 
 * POST /api/detection/trigger
 * 
 * PURPOSE:
 * Manually triggers a detection cycle. Used for:
 * 1. Testing - verify detection works without waiting for auto loop
 * 2. Debugging - trigger detection on demand
 * 
 * WHAT IT DOES:
 * 1. Calls the Python server's /get-frame endpoint
 * 2. Python server fetches frame from DroidCam and runs YOLO
 * 3. Saves result to state
 * 4. Returns the detection result
 * 
 * RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "timestamp": "2026-01-03T16:00:00Z",
 *     "people_count": 5,
 *     "boxes": [...],
 *     "processing_time_ms": 150
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { detectPeople } from '@/lib/services/detection';
import { setLatestDetection } from '@/lib/services/state';
import type { DetectionResult } from '@/lib/types';

interface TriggerResponse {
    success: boolean;
    data?: DetectionResult;
    error?: string;
    timestamp: string;
}

export async function POST() {
    try {
        // Run detection via Python server
        const detection = await detectPeople();

        // Save to state (this also notifies SSE listeners)
        setLatestDetection(detection);

        const response: TriggerResponse = {
            success: true,
            data: detection,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Detection trigger failed:', error);

        const response: TriggerResponse = {
            success: false,
            error: error instanceof Error ? error.message : 'Detection failed',
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, { status: 500 });
    }
}

// Also support GET for easy browser testing
export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger detection',
        hint: 'curl -X POST http://localhost:3000/api/detection/trigger',
    });
}
