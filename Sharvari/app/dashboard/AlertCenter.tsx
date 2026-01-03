'use client'

import { useState, useRef, useEffect } from 'react'
import { useDashboard } from './DashboardContext'
import type { Alert } from './DashboardContext'

export default function AlertCenter() {
  const { alerts, acknowledgeAlert, dismissAlert, setExpandedCamera } = useDashboard()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get unacknowledged count
  const unacknowledgedCount = alerts.filter(
    (alert) => !alert.acknowledged && !alert.dismissed
  ).length

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (alert.dismissed) return false
    if (filter === 'all') return true
    return alert.priority === filter
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAcknowledge = (id: string, cameraId?: string) => {
    acknowledgeAlert(id)
    if (cameraId) {
      setExpandedCamera(cameraId)
      setIsOpen(false)
    }
  }

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Alert Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 transform hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge */}
        {unacknowledgedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col transition-colors duration-300">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alerts</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unacknowledgedCount} unread
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  filter === 'critical'
                    ? 'bg-red-600 dark:bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  filter === 'warning'
                    ? 'bg-yellow-600 dark:bg-yellow-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  filter === 'info'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Info
              </button>
            </div>
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No alerts to display</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                      !alert.acknowledged ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.priority)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {alert.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                            {formatTime(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {alert.message}
                        </p>
                        {alert.cameraName && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                            📹 {alert.cameraName}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => handleAcknowledge(alert.id, alert.cameraId)}
                              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
                            >
                              {alert.cameraId ? 'View Camera →' : 'Acknowledge'}
                            </button>
                          )}
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:underline transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredAlerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => {
                  alerts.filter((a) => !a.dismissed).forEach((a) => acknowledgeAlert(a.id))
                }}
                className="w-full text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
