// Gets the video stream from localhost:8000/stream-with-boxes and displays it in a box
'use client';

import { Pause, VideoOff } from 'lucide-react';
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
    const [hasError, setHasError] = useState(false);
    const [key, setKey] = useState<number | null>(null); // Initialize as null to prevent hydration mismatch
    const [isMounted, setIsMounted] = useState(false);

    // Set initial key only on client after mount
    useEffect(() => {
        setIsMounted(true);
        setKey(Date.now());
    }, []);

    // Handle stream resumption by forcing a reload
    useEffect(() => {
        if (!isPaused) {
            setKey(Date.now());
            setHasError(false);
        }
    }, [isPaused]);

    // Retry connection on error
    useEffect(() => {
        if (hasError) {
            const timer = setTimeout(() => {
                setKey(Date.now());
                setHasError(false);
            }, 5000); // Retry every 5 seconds
            return () => clearTimeout(timer);
        }
    }, [hasError]);

    return (
        <div className={`overflow-hidden shadow-sm bg-black flex items-center justify-center relative ${className}`}>
            {!isMounted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <VideoOff className="w-12 h-12 text-cyan-500/30" />
                    <div className="text-cyan-500/50 text-sm">Initializing stream...</div>
                </div>
            ) : !hasError ? (
                <img
                    key={key}
                    ref={imgRef}
                    src={`${streamUrl}?t=${key}`}
                    alt="Live Video Stream"
                    className={`w-full h-full object-contain ${isPaused ? 'opacity-50' : ''}`}
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <VideoOff className="w-12 h-12 text-cyan-500/30" />
                    <div className="text-cyan-500/50 text-sm">Connecting to stream...</div>
                    <div className="text-cyan-500/30 text-xs">Retrying in 5s</div>
                </div>
            )}
            
            {/* Paused overlay */}
            {isPaused && !hasError && (
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