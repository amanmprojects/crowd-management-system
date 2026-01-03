// Gets the video stream from localhost:8000/stream-with-boxes and displays it in a box
'use client';

import { Pause } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface VideoBoxProps {
    className?: string;
    isPaused?: boolean;
}

function VideoBox({ className = "", isPaused = false }: VideoBoxProps) {
    // Using MJPEG stream directly in img tag
    // Port 8000 is used by the python server, but get from env variables
    const streamUrl = (process.env.NEXT_PUBLIC_PYTHON_SERVER_URL || 'http://localhost:8000') + '/stream-with-boxes';
    const imgRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Handle stream resumption by forcing a reload
    useEffect(() => {
        if (!isPaused && imgRef.current) {
            // Force reload of the stream by updating src with timestamp
            imgRef.current.src = `${streamUrl}?t=${Date.now()}`;
        }
    }, [isPaused, streamUrl]);

    return (
        <div className={`overflow-hidden shadow-sm bg-black flex items-center justify-center relative ${className}`}>
            <img
                ref={imgRef}
                src={streamUrl}
                alt="Live Video Stream"
                className={`w-full h-full object-contain ${isPaused ? 'opacity-50' : ''}`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsLoaded(false)}
                style={{ display: isLoaded ? 'block' : 'none' }}
            />
            
            {/* Placeholder when stream is not loaded */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-cyan-500/50 text-sm">Connecting to stream...</div>
                </div>
            )}
            
            {/* Paused overlay */}
            {isPaused && isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
                            <Pause className="w-8 h-8 text-amber-400" />
                        </div>
                        <span className="text-amber-400 text-sm font-bold tracking-wider">PAUSED</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoBox;