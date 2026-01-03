'use client'

import { useDashboard } from '../contexts/DashboardContext'
import AlertNotification from './AlertNotification'

export default function AlertToastContainer() {
  const { alerts, acknowledgeAlert, dismissAlert, setExpandedCamera } = useDashboard()

  // Show only recent unacknowledged alerts (max 3)
  const activeAlerts = alerts
    .filter((alert) => !alert.acknowledged && !alert.dismissed)
    .slice(0, 3)

  const handleAcknowledge = (id: string) => {
    const alert = alerts.find((a) => a.id === id)
    acknowledgeAlert(id)
    if (alert?.cameraId) {
      setExpandedCamera(alert.cameraId)
    }
  }

  if (activeAlerts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {activeAlerts.map((alert) => (
        <AlertNotification
          key={alert.id}
          alert={alert}
          onDismiss={dismissAlert}
          onAcknowledge={handleAcknowledge}
        />
      ))}
    </div>
  )
}
