'use client'

import { useEffect, useState } from 'react'
import { useDashboard } from './DashboardContext'
import AlertNotification from './AlertNotification'
import type { Alert } from './DashboardContext'

export default function AlertToastContainer() {
  const { alerts, dismissAlert } = useDashboard()
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // Show only the latest 3 unacknowledged, undismissed alerts
    const recentAlerts = alerts
      .filter((alert) => !alert.acknowledged && !alert.dismissed)
      .slice(0, 3)

    setVisibleAlerts(recentAlerts)
  }, [alerts])

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {visibleAlerts.map((alert) => (
          <AlertNotification
            key={alert.id}
            alert={alert}
            onDismiss={dismissAlert}
          />
        ))}
      </div>
    </div>
  )
}
