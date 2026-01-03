/**
 * DetectionOverlay Component
 * 
 * PURPOSE:
 * Draws bounding boxes on a canvas that overlays the video feed.
 * Subscribes to SSE stream for real-time updates.
 * 
 * HOW IT WORKS:
 * 1. Canvas is positioned absolutely over the video
 * 2. Component connects to /api/detection/stream (SSE)
 * 3. When new detection arrives, we clear canvas and draw new boxes
 * 4. Uses requestAnimationFrame for smooth rendering
 * 
 * CANVAS COORDINATE SYSTEM:
 * Detection boxes have x, y, width, height in the original video dimensions.
 * We need to scale these to match the canvas size (which may be different).
 * 
 * PROPS:
 * - videoWidth: Original video width (for scaling calculations)
 * - videoHeight: Original video height (for scaling calculations)
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { DetectionResult, BoundingBox } from '@/lib/types';

interface DetectionOverlayProps {
    videoWidth?: number;
    videoHeight?: number;
    className?: string;
}

export default function DetectionOverlay({
    videoWidth = 640,
    videoHeight = 480,
    className = ''
}: DetectionOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [detection, setDetection] = useState<DetectionResult | null>(null);
    const [connected, setConnected] = useState(false);

    /**
     * Draws bounding boxes on the canvas.
     * Called whenever detection data updates.
     */
    const drawBoxes = useCallback((boxes: BoundingBox[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get the actual display size of the canvas
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // Set canvas internal resolution to match display size
        // This prevents blurry lines
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // Calculate scale factors
        const scaleX = displayWidth / videoWidth;
        const scaleY = displayHeight / videoHeight;

        // Clear previous drawings
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Style for bounding boxes
        ctx.strokeStyle = '#00ff00'; // Green
        ctx.lineWidth = 2;
        ctx.font = '14px monospace';
        ctx.fillStyle = '#00ff00';

        // Draw each box
        boxes.forEach((box, index) => {
            // Scale coordinates to canvas size
            const x = box.x * scaleX;
            const y = box.y * scaleY;
            const width = box.width * scaleX;
            const height = box.height * scaleY;

            // Draw rectangle
            ctx.strokeRect(x, y, width, height);

            // Draw label background
            const label = `Person ${index + 1}`;
            const labelWidth = ctx.measureText(label).width + 8;
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.fillRect(x, y - 20, labelWidth, 20);

            // Draw label text
            ctx.fillStyle = '#000000';
            ctx.fillText(label, x + 4, y - 5);

            // Reset fill style for next iteration
            ctx.fillStyle = '#00ff00';
        });
    }, [videoWidth, videoHeight]);

    /**
     * Connect to SSE stream and listen for detection updates.
     */
    useEffect(() => {
        // Create SSE connection
        const eventSource = new EventSource('/api/detection/stream');

        eventSource.onopen = () => {
            setConnected(true);
            console.log('SSE connected');
        };

        eventSource.onmessage = (event) => {
            try {
                const data: DetectionResult = JSON.parse(event.data);
                setDetection(data);
                drawBoxes(data.boxes);
            } catch (error) {
                console.error('Failed to parse SSE message:', error);
            }
        };

        eventSource.onerror = () => {
            setConnected(false);
            console.error('SSE connection error');
        };

        // Cleanup on unmount
        return () => {
            eventSource.close();
        };
    }, [drawBoxes]);

    // Redraw boxes when detection changes or window resizes
    useEffect(() => {
        if (detection) {
            drawBoxes(detection.boxes);
        }

        // Redraw on resize
        const handleResize = () => {
            if (detection) {
                drawBoxes(detection.boxes);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [detection, drawBoxes]);

    return (
        <>
            {/* Canvas overlay - positioned absolutely over video */}
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
            />

            {/* Connection indicator */}
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded text-xs">
                <span
                    className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="text-white">
                    {connected ? 'Live' : 'Connecting...'}
                </span>
            </div>
        </>
    );
}
