'use client'

import { useDashboard } from './DashboardContext'

export default function FloorPlanMap() {
  const { cameras, setExpandedCamera } = useDashboard()

  // Define camera positions on the map (x, y coordinates in percentage)
  const cameraPositions: Record<string, { x: number; y: number }> = {
    '1': { x: 20, y: 15 }, // Main Entrance
    '2': { x: 50, y: 60 }, // Food Court
    '3': { x: 75, y: 25 }, // Parking Lot
    '4': { x: 40, y: 80 }, // Auditorium
    '5': { x: 85, y: 85 }, // Exit Gate
    '6': { x: 15, y: 50 }, // Lobby
  }

  const getMarkerColor = (crowdLevel: string, status: string) => {
    if (status !== 'online') return '#9CA3AF' // gray
    switch (crowdLevel) {
      case 'low': return '#10B981' // green
      case 'medium': return '#F59E0B' // yellow
      case 'high': return '#EF4444' // red
      default: return '#9CA3AF'
    }
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">Floor Plan View</h3>
      
      {/* Map Container */}
      <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-gray-400 dark:text-gray-600" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Building Layout (Simple SVG representation) */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Main Building */}
          <rect x="10%" y="10%" width="80%" height="80%" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2" rx="4" />
          
          {/* Entrance Area */}
          <rect x="15%" y="10%" width="20%" height="15%" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="25%" y="18%" fontSize="10" fill="#1E40AF" textAnchor="middle">North Gate</text>
          
          {/* Common Area */}
          <rect x="10%" y="40%" width="30%" height="30%" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="25%" y="56%" fontSize="10" fill="#92400E" textAnchor="middle">Common Area</text>
          
          {/* Food Court */}
          <rect x="45%" y="50%" width="25%" height="25%" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5" />
          <text x="57.5%" y="63%" fontSize="10" fill="#991B1B" textAnchor="middle">Food Court</text>
          
          {/* Parking */}
          <rect x="70%" y="15%" width="20%" height="20%" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="80%" y="26%" fontSize="10" fill="#1E40AF" textAnchor="middle">Parking</text>
          
          {/* Auditorium */}
          <rect x="35%" y="75%" width="30%" height="15%" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1.5" />
          <text x="50%" y="83.5%" fontSize="10" fill="#6B21A8" textAnchor="middle">Auditorium</text>
          
          {/* Exit */}
          <rect x="80%" y="80%" width="10%" height="10%" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="85%" y="86%" fontSize="8" fill="#1E40AF" textAnchor="middle">Exit</text>
        </svg>

        {/* Camera Markers */}
        {cameras.map((camera) => {
          const pos = cameraPositions[camera.id]
          if (!pos) return null

          const markerColor = getMarkerColor(camera.crowdLevel, camera.status)
          const isPulsing = camera.crowdLevel === 'high' || camera.crowdLevel === 'medium'

          return (
            <div
              key={camera.id}
              className="absolute cursor-pointer group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => setExpandedCamera(camera.id)}
            >
              {/* Pulsing Ring for High/Medium Crowd */}
              {isPulsing && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: markerColor,
                    opacity: 0.3,
                    transform: 'translate(-25%, -25%)',
                  }}
                />
              )}

              {/* Camera Icon */}
              <div
                className="relative w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-125"
                style={{ backgroundColor: markerColor }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>

              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
                <div className="bg-gray-900 dark:bg-gray-950 text-white text-xs rounded px-3 py-2 whitespace-nowrap shadow-xl border border-gray-700 dark:border-gray-600 transition-colors">
                  <p className="font-semibold">{camera.name}</p>
                  <p className="text-gray-300 dark:text-gray-400">{camera.peopleCount} people</p>
                  <p className={`font-medium ${
                    camera.crowdLevel === 'high' ? 'text-red-400' :
                    camera.crowdLevel === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {camera.crowdLevel.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400"></div>
          <span className="text-gray-600 dark:text-gray-400 transition-colors">Low Density</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-pulse"></div>
          <span className="text-gray-600 dark:text-gray-400 transition-colors">Medium Density</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-400 animate-pulse"></div>
          <span className="text-gray-600 dark:text-gray-400 transition-colors">High Density</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-400 transition-colors">Offline</span>
        </div>
      </div>
    </div>
  )
}
