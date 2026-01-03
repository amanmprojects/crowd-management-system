'use client'

import { useDashboard } from '../dashboard/DashboardContext'
import { useMemo } from 'react'

export default function AnalyticsContent() {
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

    // Group by zone
    const zoneStats = cameras.reduce((acc, camera) => {
      if (!acc[camera.zone]) {
        acc[camera.zone] = { count: 0, people: 0, capacity: 0, high: 0 }
      }
      acc[camera.zone].count++
      acc[camera.zone].people += camera.peopleCount
      acc[camera.zone].capacity += camera.capacity
      if (camera.crowdLevel === 'high') acc[camera.zone].high++
      return acc
    }, {} as Record<string, { count: number; people: number; capacity: number; high: number }>)

    return {
      totalPeople,
      totalCapacity,
      onlineCameras,
      offlineCameras,
      activeIncidents,
      crowdDistribution,
      utilizationRate,
      safetyScore,
      zoneStats,
    }
  }, [cameras, incidents])

  const topCrowdedCameras = useMemo(() => {
    return [...cameras]
      .filter((c) => c.status === 'online')
      .sort((a, b) => (b.peopleCount / b.capacity) - (a.peopleCount / a.capacity))
      .slice(0, 10)
  }, [cameras])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Safety Score */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white rounded-lg shadow-lg dark:shadow-indigo-500/20 p-6 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Safety Score</h3>
            <svg className="w-8 h-8 opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-1">{Math.round(analytics.safetyScore)}%</div>
          <div className="text-xs opacity-75">
            {analytics.safetyScore >= 90 ? 'Excellent' : analytics.safetyScore >= 70 ? 'Good' : 'Needs Attention'}
          </div>
        </div>

        {/* Total People */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border-l-4 border-green-500 dark:border-green-400 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Total People</h3>
            <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{analytics.totalPeople}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Across all locations</div>
        </div>

        {/* Utilization Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border-l-4 border-yellow-500 dark:border-yellow-400 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Utilization Rate</h3>
            <svg className="w-8 h-8 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{Math.round(analytics.utilizationRate)}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">of {analytics.totalCapacity} capacity</div>
        </div>

        {/* Active Incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border-l-4 border-red-500 dark:border-red-400 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Active Incidents</h3>
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{analytics.activeIncidents}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Requires attention</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 transition-colors">Crowd Level Distribution</h3>
          <div className="space-y-4">
            {/* High */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-400"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">High Density</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white transition-colors">
                  {analytics.crowdDistribution.high} cameras
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-300">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(analytics.crowdDistribution.high / cameras.length) * 100}%` }}
                >
                  {analytics.crowdDistribution.high > 0 && (
                    <span className="text-xs font-bold text-white">
                      {Math.round((analytics.crowdDistribution.high / cameras.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Medium Density</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white transition-colors">
                  {analytics.crowdDistribution.medium} cameras
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-300">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(analytics.crowdDistribution.medium / cameras.length) * 100}%` }}
                >
                  {analytics.crowdDistribution.medium > 0 && (
                    <span className="text-xs font-bold text-white">
                      {Math.round((analytics.crowdDistribution.medium / cameras.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Low */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Low Density</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white transition-colors">
                  {analytics.crowdDistribution.low} cameras
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-300">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(analytics.crowdDistribution.low / cameras.length) * 100}%` }}
                >
                  {analytics.crowdDistribution.low > 0 && (
                    <span className="text-xs font-bold text-white">
                      {Math.round((analytics.crowdDistribution.low / cameras.length) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 transition-colors">Zone Statistics</h3>
          <div className="space-y-3">
            {Object.entries(analytics.zoneStats).map(([zone, stats]) => {
              const percentage = (stats.people / stats.capacity) * 100
              return (
                <div key={zone} className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white transition-colors">{zone}</span>
                    <span className={`text-sm font-bold transition-colors ${
                      percentage >= 85 ? 'text-red-600 dark:text-red-400' :
                      percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400 transition-colors">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.count}</span> cameras
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.people}</span> people
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.capacity}</span> capacity
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Crowded Cameras Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 transition-colors">Top 10 Most Crowded Cameras</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">Camera</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">Zone</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">People</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">Capacity</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">Utilization</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 transition-colors">Status</th>
              </tr>
            </thead>
            <tbody>
              {topCrowdedCameras.map((camera, index) => {
                const percentage = (camera.peopleCount / camera.capacity) * 100
                return (
                  <tr key={camera.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-sm transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white transition-colors">{camera.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm transition-colors">{camera.location}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm transition-colors">{camera.zone}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white transition-colors">{camera.peopleCount}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400 transition-colors">{camera.capacity}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold transition-colors ${
                        percentage >= 85 ? 'text-red-600 dark:text-red-400' :
                        percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {Math.round(percentage)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                        camera.crowdLevel === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        camera.crowdLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {camera.crowdLevel}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
