'use client'

import { useDashboard } from './DashboardContext'

export default function ZoneSidebar() {
  const { cameras, selectedZone, setSelectedZone } = useDashboard()

  // Group cameras by zone
  const zones = cameras.reduce((acc, camera) => {
    if (!acc[camera.zone]) {
      acc[camera.zone] = []
    }
    acc[camera.zone].push(camera)
    return acc
  }, {} as Record<string, typeof cameras>)

  const getZoneHealth = (zoneCameras: typeof cameras) => {
    const onlineCount = zoneCameras.filter((c) => c.status === 'online').length
    const highCrowdCount = zoneCameras.filter((c) => c.crowdLevel === 'high').length
    const mediumCrowdCount = zoneCameras.filter((c) => c.crowdLevel === 'medium').length

    if (highCrowdCount > 0) return 'critical'
    if (mediumCrowdCount > 0) return 'warning'
    if (onlineCount === zoneCameras.length) return 'healthy'
    return 'degraded'
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-700'
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700'
      case 'healthy':
        return 'bg-green-100 border-green-500 text-green-700'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'critical':
        return '⚠️'
      case 'warning':
        return '⚡'
      case 'healthy':
        return '✓'
      default:
        return '○'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors">Zones</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Monitor location health</p>
      </div>

      {/* Zone List */}
      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => setSelectedZone(null)}
          className={`w-full mb-2 p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.01] ${
            selectedZone === null
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 shadow-md'
              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white transition-colors">All Zones</span>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded transition-colors">
              {cameras.length} cameras
            </span>
          </div>
        </button>

        {Object.entries(zones).map(([zoneName, zoneCameras]) => {
          const health = getZoneHealth(zoneCameras)
          const isSelected = selectedZone === zoneName
          const onlineCameras = zoneCameras.filter((c) => c.status === 'online').length
          const totalPeople = zoneCameras.reduce((sum, c) => sum + c.peopleCount, 0)

          return (
            <button
              key={zoneName}
              onClick={() => setSelectedZone(isSelected ? null : zoneName)}
              className={`w-full mb-2 p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.01] ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 shadow-md dark:shadow-indigo-500/20'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md dark:hover:shadow-gray-900/50'
              }`}
            >
              {/* Zone Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white transition-colors">{zoneName}</span>
                <span className="text-xl">{getHealthIcon(health)}</span>
              </div>

              {/* Zone Stats */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors">Cameras</span>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors">
                    {onlineCameras}/{zoneCameras.length} online
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors">People</span>
                  <span className="font-medium text-gray-900 dark:text-white transition-colors">{totalPeople}</span>
                </div>
              </div>

              {/* Health Badge */}
              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded border-l-2 transition-all ${getHealthColor(
                    health
                  )}`}
                >
                  {health.charAt(0).toUpperCase() + health.slice(1)}
                </span>
              </div>

              {/* Camera List (when expanded) */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-1 transition-colors">
                  {zoneCameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full transition-all ${
                            camera.status === 'online' ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-600'
                          }`}
                        />
                        <span className="text-gray-700 dark:text-gray-300 transition-colors">{camera.name}</span>
                      </div>
                      <span
                        className={`font-medium transition-colors ${
                          camera.crowdLevel === 'high'
                            ? 'text-red-600 dark:text-red-400'
                            : camera.crowdLevel === 'medium'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {camera.peopleCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md">
            <div className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
              {cameras.filter((c) => c.status === 'online').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Online</div>
          </div>
          <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md">
            <div className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
              {Object.keys(zones).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Zones</div>
          </div>
        </div>
      </div>
    </div>
  )
}
