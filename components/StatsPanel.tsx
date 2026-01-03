/**
 * StatsPanel Component
 * 
 * PURPOSE:
 * Displays statistics at a glance:
 * - Number of people detected
 * - Camera status (online/offline)
 * - Last update time
 * - Processing latency
 * 
 * HOW IT WORKS:
 * 1. Fetches camera status from /api/camera/status
 * 2. Subscribes to detection updates (same SSE as overlay)
 * 3. Updates stats in real-time as data arrives
 */

'use client';

import { useState, useEffect } from 'react';
import type { DetectionResult, CameraStatus } from '@/lib/types';

interface StatsPanelProps {
    className?: string;
}

export default function StatsPanel({ className = '' }: StatsPanelProps) {
    const [detection, setDetection] = useState<DetectionResult | null>(null);
    const [cameraStatus, setCameraStatus] = useState<CameraStatus | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Fetch camera status periodically
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/camera/status');
                const data = await response.json();
                if (data.success && data.data) {
                    setCameraStatus(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch camera status:', error);
            }
        };

        // Fetch immediately, then every 10 seconds
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    // Subscribe to detection updates via SSE
    useEffect(() => {
        const eventSource = new EventSource('/api/detection/stream');

        eventSource.onmessage = (event) => {
            try {
                const data: DetectionResult = JSON.parse(event.data);
                setDetection(data);
                setLastUpdate(new Date());
            } catch (error) {
                console.error('Failed to parse SSE message:', error);
            }
        };

        return () => eventSource.close();
    }, []);

    // Format time ago
    const formatTimeAgo = (date: Date | null) => {
        if (!date) return 'Never';
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    // Update "time ago" display every second
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
            {/* People Count */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-80 uppercase tracking-wide">People Detected</p>
                <p className="text-4xl font-bold mt-1">
                    {detection?.people_count ?? '-'}
                </p>
            </div>

            {/* Camera Status */}
            <div className={`rounded-xl p-4 text-white shadow-lg ${cameraStatus?.online
                    ? 'bg-gradient-to-br from-green-600 to-green-800'
                    : 'bg-gradient-to-br from-red-600 to-red-800'
                }`}>
                <p className="text-sm opacity-80 uppercase tracking-wide">Camera</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`w-3 h-3 rounded-full ${cameraStatus?.online ? 'bg-green-300 animate-pulse' : 'bg-red-300'
                        }`} />
                    <span className="text-2xl font-bold">
                        {cameraStatus?.online ? 'Online' : 'Offline'}
                    </span>
                </div>
                <p className="text-xs opacity-60 mt-1">
                    {cameraStatus?.name ?? 'Unknown'}
                </p>
            </div>

            {/* Last Update */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-80 uppercase tracking-wide">Last Update</p>
                <p className="text-2xl font-bold mt-1">
                    {formatTimeAgo(lastUpdate)}
                </p>
                <p className="text-xs opacity-60 mt-1">
                    {lastUpdate?.toLocaleTimeString() ?? 'Waiting...'}
                </p>
            </div>

            {/* Processing Time */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-80 uppercase tracking-wide">Processing</p>
                <p className="text-2xl font-bold mt-1">
                    {detection?.processing_time_ms
                        ? `${Math.round(detection.processing_time_ms)}ms`
                        : '-'}
                </p>
                <p className="text-xs opacity-60 mt-1">
                    Detection latency
                </p>
            </div>
        </div>
    );
}
