/**
 * Camera Status API Route
 * 
 * GET /api/camera/status
 * 
 * PURPOSE:
 * Returns the current status of the camera (online/offline).
 * The frontend uses this to display a status indicator.
 * 
 * RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "online": true,
 *     "name": "DroidCam Main",
 *     "url": "http://192.168.68.172:4747/cam/1/frame.jpg",
 *     "streamUrl": "http://192.168.68.172:4747/video",
 *     "lastCheck": "2026-01-03T16:00:00Z"
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { checkCameraStatus } from '@/lib/services/camera';
import type { ApiResponse, CameraStatus } from '@/lib/types';

export async function GET() {
    try {
        // Check if camera is reachable
        const status = await checkCameraStatus();

        const response: ApiResponse<CameraStatus> = {
            success: true,
            data: status,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        const response: ApiResponse<CameraStatus> = {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check camera status',
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, { status: 500 });
    }
}
