'use client'

import { useDashboard } from './DashboardContext'
import { useMemo } from 'react'

export default function AnalyticsSidebar() {
  const { cameras, incidents } = useDashboard()

  const analytics = useMemo(() => {
    const totalPeople = cameras.reduce((sum, c) => sum + c.peopleCount, 0)
    const totalCapacity = cameras.reduce((sum, c) => sum + c.capacity, 0)
    const onlineCameras = cameras.filter((c) => c.status === 'online').length
    const offlineCameras = cameras.filter((c) => c.status === 'offline').length
    const activeIncidents = incidents.filter((inc) => !inc.resolved).length
    
    const crowdDistribution = {
      low: cameras.filter((c) => c.crowdLevel === 'low').length,
      medium: cameras.filter((c) => c.crowdLevel === 'medium').length,
      high: cameras.filter((c) => c.crowdLevel === 'high').length,
    }

    const utilizationRate = totalCapacity > 0 ? (totalPeople / totalCapacity) * 100 : 0
    const safetyScore = Math.max(0, 100 - (activeIncidents * 10) - (crowdDistribution.high * 15))

    return {
      totalPeople,
      totalCapacity,
      onlineCameras,
      offlineCameras,
      activeIncidents,
      crowdDistribution,
      utilizationRate,
      safetyScore,
    }
  }, [cameras, incidents])

  const topCrowdedCameras = useMemo(() => {
    return [...cameras]
      .filter((c) => c.status === 'online')
      .sort((a, b) => (b.peopleCount / b.capacity) - (a.peopleCount / a.capacity))
      .slice(0, 5)
  }, [cameras])

  return (
    <div className="h-full flex flex-col bg-white border-l shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 sticky top-0">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Analytics</h2>
        <p className="text-xs text-gray-500">Real-time metrics</p>
      </div>

      {/* Safety Score */}
      <div className="p-4 border-b bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-600 mb-2">Global Safety Score</div>
          <div
            className={`text-4xl font-bold mb-2 ${
              analytics.safetyScore >= 90
                ? 'text-green-600'
                : analytics.safetyScore >= 70
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {Math.round(analytics.safetyScore)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                analytics.safetyScore >= 90
                  ? 'bg-green-500'
                  : analytics.safetyScore >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${analytics.safetyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Total People</span>
            <span className="text-sm font-bold text-gray-900">{analytics.totalPeople}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Capacity Usage</span>
            <span className="text-sm font-bold text-gray-900">
              {Math.round(analytics.utilizationRate)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Online Cameras</span>
            <span className="text-sm font-bold text-green-600">{analytics.onlineCameras}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Active Alerts</span>
            <span className="text-sm font-bold text-red-600">{analytics.activeIncidents}</span>
          </div>
        </div>
      </div>

      {/* Crowd Distribution */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Crowd Distribution</h3>
        <div className="space-y-2">
          {/* High */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">High Density</span>
              <span className="font-medium text-red-600">{analytics.crowdDistribution.high}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(analytics.crowdDistribution.high / cameras.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Medium */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Medium Density</span>
              <span className="font-medium text-yellow-600">
                {analytics.crowdDistribution.medium}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(analytics.crowdDistribution.medium / cameras.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Low */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Low Density</span>
              <span className="font-medium text-green-600">{analytics.crowdDistribution.low}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(analytics.crowdDistribution.low / cameras.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Crowded Cameras */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Most Crowded</h3>
        <div className="space-y-2">
          {topCrowdedCameras.map((camera, index) => {
            const percentage = (camera.peopleCount / camera.capacity) * 100
            return (
              <div key={camera.id} className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                    <span className="text-xs font-medium text-gray-900">{camera.name}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      percentage >= 85
                        ? 'text-red-600'
                        : percentage >= 60
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{camera.peopleCount} people</span>
                  <span>of {camera.capacity}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
