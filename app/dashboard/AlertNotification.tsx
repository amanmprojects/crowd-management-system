'use client'

import { useEffect, useState } from 'react'
import type { Alert } from '../contexts/DashboardContext'

interface AlertNotificationProps {
  alert: Alert
  onDismiss: (id: string) => void
  onAcknowledge: (id: string) => void
}

export default function AlertNotification({ alert, onDismiss, onAcknowledge }: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Auto dismiss after 8 seconds for non-critical alerts
  useEffect(() => {
    if (alert.priority !== 'critical') {
      const timer = setTimeout(() => {
        handleDismiss()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [alert.priority])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss(alert.id)
    }, 300)
  }

  const handleAcknowledge = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onAcknowledge(alert.id)
    }, 300)
  }

  const getPriorityStyles = () => {
    switch (alert.priority) {
      case 'critical':
        return {
          container: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
          icon: 'text-red-500 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-600 dark:text-red-300',
          button: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-500 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-200',
          message: 'text-yellow-600 dark:text-yellow-300',
          button: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600',
        }
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-500 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-600 dark:text-blue-300',
          button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
        }
    }
  }

  const styles = getPriorityStyles()

  const getIcon = () => {
    switch (alert.priority) {
      case 'critical':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div
      className={`
        w-96 border rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform
        ${styles.container}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.title}`}>
              {alert.title}
            </h4>
            <p className={`text-xs mt-1 ${styles.message}`}>
              {alert.message}
            </p>
            {alert.cameraName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📹 {alert.cameraName}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleAcknowledge}
            className={`px-3 py-1.5 text-xs font-medium text-white rounded transition-colors ${styles.button}`}
          >
            {alert.cameraId ? 'View Camera' : 'Acknowledge'}
          </button>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {alert.priority !== 'critical' && (
        <div className="h-1 bg-gray-200 dark:bg-gray-600">
          <div
            className="h-full bg-current transition-all ease-linear"
            style={{
              width: isVisible ? '0%' : '100%',
              transitionDuration: isVisible ? '8s' : '0s',
            }}
          />
        </div>
      )}
    </div>
  )
}
