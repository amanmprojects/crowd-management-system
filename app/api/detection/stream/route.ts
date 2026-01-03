/**
 * Detection Stream API Route (Server-Sent Events)
 * 
 * GET /api/detection/stream
 * 
 * PURPOSE:
 * Provides real-time detection updates to the frontend using SSE.
 * Instead of the frontend polling every second, the server PUSHES updates.
 * 
 * Also starts the automatic detection loop when the first client connects.
 * The loop runs every 1 second, fetching detections from the Python server.
 * 
 * HOW SSE WORKS:
 * 1. Browser opens a long-lived HTTP connection
 * 2. Server sends "data: {...}\n\n" messages as events occur
 * 3. Browser receives events via EventSource API
 * 4. Connection stays open until browser closes it
 * 
 * FRONTEND USAGE:
 * ```javascript
 * const eventSource = new EventSource('/api/detection/stream');
 * eventSource.onmessage = (event) => {
 *   const detection = JSON.parse(event.data);
 *   console.log(`Detected ${detection.people_count} people`);
 * };
 * ```
 * 
 * MESSAGE FORMAT:
 * data: {"timestamp":"2026-01-03T16:00:00Z","people_count":5,"boxes":[...]}
 */

import { subscribeToDetections, getLatestDetection } from '@/lib/services/state';
import { startDetectionLoop } from '@/lib/services/detectionLoop';

export const dynamic = 'force-dynamic'; // Disable caching for SSE

export async function GET() {
    // Start the detection loop (safe to call multiple times - only starts once)
    startDetectionLoop();

    // Create a readable stream that we'll write SSE messages to
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Helper function to send an SSE message
            const sendEvent = (data: object) => {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            // Send the current detection immediately (if available)
            const current = getLatestDetection();
            if (current) {
                sendEvent(current);
            }

            // Subscribe to future detection updates
            const unsubscribe = subscribeToDetections((detection) => {
                try {
                    sendEvent(detection);
                } catch {
                    // Stream closed, cleanup
                    unsubscribe();
                }
            });

            // Send a heartbeat every 30 seconds to keep the connection alive
            // Some proxies/load balancers close idle connections
            const heartbeatInterval = setInterval(() => {
                try {
                    const heartbeat = `: heartbeat\n\n`; // SSE comment (ignored by client)
                    controller.enqueue(encoder.encode(heartbeat));
                } catch {
                    // Stream closed
                    clearInterval(heartbeatInterval);
                    unsubscribe();
                }
            }, 30000);

            // Cleanup when client disconnects
            // Note: Next.js handles this automatically when the connection closes
        },
    });

    // Return the stream with SSE headers
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            // Prevent buffering (important for real-time updates)
            'X-Accel-Buffering': 'no',
        },
    });
}
