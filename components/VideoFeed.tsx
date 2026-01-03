/**
 * VideoFeed Component
 * 
 * PURPOSE:
 * Displays the live video stream from DroidCam.
 * 
 * HOW IT WORKS:
 * MJPEG is a stream of JPEG images. Browsers can display it directly
 * using a regular <img> tag - no JavaScript decoding needed!
 * 
 * The src points directly to DroidCam's /video endpoint, which sends
 * a continuous stream of JPEG frames. The browser handles the rest.
 * 
 * WHY DIRECT TO DROIDCAM:
 * - No backend proxy needed (less load on your server)
 * - Native browser handling (smooth, efficient)
 * - Lower latency (frames go straight to browser)
 * 
 * PROPS:
 * - streamUrl: The MJPEG stream URL (e.g., http://192.168.68.172:4747/video)
 * - className: Optional CSS classes for styling
 */

'use client';

import { useState, useEffect } from 'react';

interface VideoFeedProps {
    streamUrl: string;
    className?: string;
}

export default function VideoFeed({ streamUrl, className = '' }: VideoFeedProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Reset error when streamUrl changes
    useEffect(() => {
        setError(null);
        setLoading(true);
    }, [streamUrl]);

    return (
        <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
            {/* Loading state */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>Connecting to camera...</p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
                    <div className="text-white text-center p-4">
                        <p className="text-lg font-semibold mb-2">Camera Error</p>
                        <p className="text-sm opacity-80">{error}</p>
                        <button
                            onClick={() => { setError(null); setLoading(true); }}
                            className="mt-4 px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Video feed - MJPEG stream displays in a regular img tag! */}
            <img
                src={streamUrl}
                alt="Live camera feed"
                className={`w-full h-full object-contain ${error ? 'invisible' : ''}`}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError('Could not connect to camera stream');
                }}
            />
        </div>
    );
}
