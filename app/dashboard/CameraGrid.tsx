'use client'

import { useDashboard, type Camera } from '../contexts/DashboardContext'
import { useState, useRef, useEffect } from 'react'
import type { BoundingBox } from '@/lib/types'

export default function CameraGrid() {
  const { cameras, expandedCamera, setExpandedCamera, selectedZone, latestDetection } = useDashboard()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter cameras by selected zone
  const filteredCameras = selectedZone
    ? cameras.filter((camera) => camera.zone === selectedZone)
    : cameras

  const handleCameraClick = (cameraId: string) => {
    setExpandedCamera(expandedCamera === cameraId ? null : cameraId)
  }

  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const getStatusRingColor = (level: string, status: string) => {
    if (status !== 'online') return 'ring-gray-400'
    switch (level) {
      case 'low': return 'ring-green-500'
      case 'medium': return 'ring-yellow-500 animate-pulse'
      case 'high': return 'ring-red-500 animate-pulse'
      default: return 'ring-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-4 border border-gray-100 dark:border-gray-700 transition-all duration-300">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
            {selectedZone ? `${selectedZone} Cameras` : 'All Cameras'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
            {filteredCameras.length} camera{filteredCameras.length !== 1 ? 's' : ''} monitoring
          </p>
        </div>
        
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-300">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
              Grid View
            </div>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              List View
            </div>
          </button>
        </div>
      </div>

      {/* Camera Grid */}
      <div className={`grid gap-4 transition-all duration-300 ${
        expandedCamera 
          ? 'grid-cols-1' 
          : viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
      }`}>
        {filteredCameras.map((camera) => {
          const isExpanded = expandedCamera === camera.id
          const isHidden = expandedCamera && !isExpanded

          if (isHidden) return null

          const percentage = (camera.peopleCount / camera.capacity) * 100

          return (
            <div
              key={camera.id}
              onClick={() => handleCameraClick(camera.id)}
              className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl dark:hover:shadow-indigo-500/20 ring-4 ${getStatusRingColor(camera.crowdLevel, camera.status)} ${
                isExpanded ? 'col-span-full shadow-2xl' : 'shadow-lg hover:scale-[1.02]'
              }`}
            >
              {/* Camera Header */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">{camera.name}</h3>
                      {camera.isLive && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">{camera.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      camera.status === 'online' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : camera.status === 'connecting'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {camera.status === 'online' ? '● Online' : camera.status === 'connecting' ? '◐ Connecting' : '○ Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Camera Feed */}
              <div className={`bg-gray-900 dark:bg-black relative ${
                isExpanded ? 'h-[500px]' : 'h-[200px]'
              }`}>
                {camera.isLive && camera.status === 'online' && camera.streamUrl ? (
                  <LiveCameraFeed 
                    streamUrl={camera.streamUrl} 
                    boxes={latestDetection?.boxes || []}
                    isExpanded={isExpanded}
                  />
                ) : camera.status === 'online' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 border-4 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">Camera Feed Loading...</p>
                      <p className="text-gray-500 dark:text-gray-600 text-xs mt-1">Simulated feed</p>
                    </div>
                  </div>
                ) : camera.status === 'connecting' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-sm">Connecting to camera...</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-600 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">Camera Offline</p>
                    </div>
                  </div>
                )}
                
                {/* Expand/Collapse indicator */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-50 dark:bg-opacity-70 rounded-full p-2 hover:bg-opacity-70 dark:hover:bg-opacity-90 transition-all">
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {isExpanded ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    )}
                  </svg>
                </div>
              </div>

              {/* Camera Stats */}
              <div className="p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">People Count</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{camera.peopleCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Capacity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{Math.round(percentage)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Crowd Level</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getCrowdLevelColor(camera.crowdLevel)}`}>
                      {camera.crowdLevel}
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 transition-colors duration-300">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        percentage >= 85
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : percentage >= 60
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    <span>0</span>
                    <span>{camera.capacity}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 transition-colors">Additional Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 transition-colors">Last Updated</p>
                        <p className="font-medium text-gray-900 dark:text-white transition-colors">{camera.lastUpdate.toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 transition-colors">Camera ID</p>
                        <p className="font-medium text-gray-900 dark:text-white transition-colors">{camera.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 transition-colors">Zone</p>
                        <p className="font-medium text-gray-900 dark:text-white transition-colors">{camera.zone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 transition-colors">Max Capacity</p>
                        <p className="font-medium text-gray-900 dark:text-white transition-colors">{camera.capacity}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Show all cameras button when one is expanded */}
      {expandedCamera && (
        <div className="text-center">
          <button
            onClick={() => setExpandedCamera(null)}
            className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Show All Cameras
          </button>
        </div>
      )}
    </div>
  )
}

// Live camera feed component with bounding box overlay
function LiveCameraFeed({ streamUrl, boxes, isExpanded }: { streamUrl: string; boxes: BoundingBox[]; isExpanded: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  // Draw bounding boxes on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const img = imgRef.current
    if (!canvas || !container || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Match canvas to container size
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (boxes.length === 0) return

    // Calculate the actual displayed image dimensions (object-contain scaling)
    const imgAspect = 640 / 480  // Original video aspect ratio
    const containerAspect = rect.width / rect.height

    let displayWidth: number, displayHeight: number, offsetX: number, offsetY: number

    if (containerAspect > imgAspect) {
      // Container is wider - image height fills container
      displayHeight = rect.height
      displayWidth = displayHeight * imgAspect
      offsetX = (rect.width - displayWidth) / 2
      offsetY = 0
    } else {
      // Container is taller - image width fills container
      displayWidth = rect.width
      displayHeight = displayWidth / imgAspect
      offsetX = 0
      offsetY = (rect.height - displayHeight) / 2
    }

    // Scale factors from original 640x480 to displayed size
    const scaleX = displayWidth / 640
    const scaleY = displayHeight / 480

    // Draw boxes
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    ctx.font = 'bold 14px sans-serif'

    boxes.forEach((box, index) => {
      const x = offsetX + box.x * scaleX
      const y = offsetY + box.y * scaleY
      const width = box.width * scaleX
      const height = box.height * scaleY

      // Draw rectangle
      ctx.strokeRect(x, y, width, height)

      // Draw label background
      const label = `Person ${index + 1}`
      const metrics = ctx.measureText(label)
      const labelHeight = 20
      const labelPadding = 4
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.9)'
      ctx.fillRect(x, y - labelHeight - 2, metrics.width + labelPadding * 2, labelHeight)

      // Draw label text
      ctx.fillStyle = '#000000'
      ctx.fillText(label, x + labelPadding, y - 7)
    })
  }, [boxes, imgLoaded, isExpanded])

  // Redraw on resize
  useEffect(() => {
    const handleResize = () => {
      if (imgLoaded && boxes.length > 0) {
        // Trigger redraw
        setImgLoaded(false)
        setTimeout(() => setImgLoaded(true), 10)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [imgLoaded, boxes])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <img
        ref={imgRef}
        src={streamUrl}
        alt="Live camera feed"
        className="w-full h-full object-contain"
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgLoaded(false)}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ imageRendering: 'crisp-edges' }}
      />
      {/* Person count overlay */}
      {boxes.length > 0 && (
        <div className="absolute top-3 left-3 bg-black/70 text-green-400 px-3 py-1 rounded-lg text-sm font-mono">
          {boxes.length} person{boxes.length !== 1 ? 's' : ''} detected
        </div>
      )}
    </div>
  )
}
