/**
 * Dashboard Page
 * 
 * PURPOSE:
 * The main dashboard that combines all components:
 * - Live video feed from DroidCam
 * - Bounding box overlay from detection
 * - Statistics panel
 * 
 * LAYOUT:
 * ┌───────────────────────────────────────┐
 * │  Header: Crowd Monitoring Dashboard   │
 * ├───────────────────────────────────────┤
 * │                                       │
 * │   ┌─────────────────────────────┐    │
 * │   │     Video Feed               │    │
 * │   │     + Detection Overlay      │    │
 * │   └─────────────────────────────┘    │
 * │                                       │
 * │   ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
 * │   │Count│ │Cam │ │Time│ │Proc│       │
 * │   └────┘ └────┘ └────┘ └────┘       │
 * │                                       │
 * └───────────────────────────────────────┘
 */

'use client';

import { useEffect, useState } from 'react';
import VideoFeed from '@/components/VideoFeed';
import DetectionOverlay from '@/components/DetectionOverlay';
import StatsPanel from '@/components/StatsPanel';

// Default stream URL - points to Python server's MJPEG stream endpoint
const DEFAULT_STREAM_URL = 'http://localhost:8000/stream';

export default function Dashboard() {
  const [streamUrl, setStreamUrl] = useState<string>(DEFAULT_STREAM_URL);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client before rendering video
  // (MJPEG streams can't be server-rendered)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch the stream URL from camera status API
  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        const response = await fetch('/api/camera/status');
        const data = await response.json();
        if (data.success && data.data?.streamUrl) {
          setStreamUrl(data.data.streamUrl);
        }
      } catch (error) {
        console.error('Failed to fetch stream URL:', error);
      }
    };

    fetchStreamUrl();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Crowd Monitoring Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Real-time crowd density monitoring
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/detection/trigger', { method: 'POST' });
                  const data = await response.json();
                  console.log('Manual trigger result:', data);
                } catch (error) {
                  console.error('Trigger failed:', error);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
            >
              Trigger Detection
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Video Feed with Overlay */}
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl mb-8">
          {isClient ? (
            <>
              <VideoFeed
                streamUrl={streamUrl}
                className="w-full h-full"
              />
              <DetectionOverlay
                videoWidth={640}
                videoHeight={480}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Loading video feed...</p>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <StatsPanel className="mb-8" />

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Video streams via Python server • YOLO detection runs automatically every 1 second •
            <span className="text-gray-400"> Python server connects to DroidCam</span>
          </p>
        </div>
      </main>
    </div>
  );
}
