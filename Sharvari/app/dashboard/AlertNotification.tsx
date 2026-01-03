'use client'

import { useEffect, useState } from 'react'
import type { Alert } from './DashboardContext'

interface AlertNotificationProps {
  alert: Alert
  onDismiss: (id: string) => void
}

export default function AlertNotification({ alert, onDismiss }: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto-dismiss after 8 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, 8000)

    return () => {
      clearTimeout(timer)
      clearTimeout(dismissTimer)
    }
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(alert.id)
    }, 300)
  }

  const getAlertStyles = () => {
    switch (alert.priority) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-500 dark:border-red-400',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100',
          title: 'text-red-800 dark:text-red-200',
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-500 dark:border-yellow-400',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-900 dark:text-yellow-100',
          title: 'text-yellow-800 dark:text-yellow-200',
        }
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-500 dark:border-blue-400',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100',
          title: 'text-blue-800 dark:text-blue-200',
        }
    }
  }

  const getAlertIcon = () => {
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
      case 'info':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const styles = getAlertStyles()

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${styles.bg} ${styles.border} border-l-4 rounded-lg shadow-xl dark:shadow-gray-900/50 p-4 max-w-md backdrop-blur-sm transition-colors duration-300`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getAlertIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={`text-sm font-bold ${styles.title} transition-colors`}>
                {alert.title}
              </h4>
              <span className={`text-xs ${styles.text} opacity-75 transition-colors`}>
                {alert.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className={`text-sm ${styles.text} transition-colors`}>
              {alert.message}
            </p>
            {alert.cameraName && (
              <p className={`text-xs ${styles.text} opacity-75 mt-1 transition-colors`}>
                Camera: {alert.cameraName}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${styles.icon} hover:opacity-80 transition-opacity`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Progress bar for auto-dismiss */}
        <div className="mt-2 h-1 bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              alert.priority === 'critical'
                ? 'bg-red-500'
                : alert.priority === 'warning'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{
              width: '100%',
              animation: 'shrink 8s linear forwards',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}
