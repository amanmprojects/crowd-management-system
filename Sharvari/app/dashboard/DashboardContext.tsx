'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export type CrowdLevel = 'low' | 'medium' | 'high'
export type CameraStatus = 'online' | 'offline' | 'connecting'

export interface Camera {
  id: string
  name: string
  location: string
  zone: string
  status: CameraStatus
  crowdLevel: CrowdLevel
  peopleCount: number
  capacity: number
  lastUpdate: Date
}

export interface Incident {
  id: string
  timestamp: Date
  cameraId: string
  cameraName: string
  type: 'breach' | 'warning' | 'info'
  message: string
  resolved: boolean
}

export type AlertPriority = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  timestamp: Date
  priority: AlertPriority
  title: string
  message: string
  cameraId?: string
  cameraName?: string
  acknowledged: boolean
  dismissed: boolean
}

interface DashboardContextType {
  cameras: Camera[]
  incidents: Incident[]
  alerts: Alert[]
  expandedCamera: string | null
  selectedZone: string | null
  filterLevel: 'all' | 'critical' | 'warning'
  setExpandedCamera: (id: string | null) => void
  setSelectedZone: (zone: string | null) => void
  setFilterLevel: (level: 'all' | 'critical' | 'warning') => void
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => void
  resolveIncident: (id: string) => void
  updateCameraStatus: (id: string, updates: Partial<Camera>) => void
  acknowledgeAlert: (id: string) => void
  dismissAlert: (id: string) => void
  getUnacknowledgedAlerts: () => Alert[]
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

const mockCameras: Camera[] = [
  {
    id: '1',
    name: 'Main Entrance',
    location: 'North Gate',
    zone: 'Entrance',
    status: 'online',
    crowdLevel: 'low',
    peopleCount: 45,
    capacity: 200,
    lastUpdate: new Date(),
  },
  {
    id: '2',
    name: 'Food Court',
    location: 'Building A',
    zone: 'Common Area',
    status: 'online',
    crowdLevel: 'high',
    peopleCount: 342,
    capacity: 300,
    lastUpdate: new Date(),
  },
  {
    id: '3',
    name: 'Parking Lot',
    location: 'Level 2',
    zone: 'Parking',
    status: 'online',
    crowdLevel: 'medium',
    peopleCount: 156,
    capacity: 250,
    lastUpdate: new Date(),
  },
  {
    id: '4',
    name: 'Auditorium',
    location: 'Main Hall',
    zone: 'Event Space',
    status: 'online',
    crowdLevel: 'low',
    peopleCount: 89,
    capacity: 500,
    lastUpdate: new Date(),
  },
  {
    id: '5',
    name: 'Exit Gate',
    location: 'South Wing',
    zone: 'Entrance',
    status: 'offline',
    crowdLevel: 'low',
    peopleCount: 0,
    capacity: 150,
    lastUpdate: new Date(),
  },
  {
    id: '6',
    name: 'Lobby',
    location: 'Building B',
    zone: 'Common Area',
    status: 'online',
    crowdLevel: 'medium',
    peopleCount: 203,
    capacity: 300,
    lastUpdate: new Date(),
  },
]

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [expandedCamera, setExpandedCamera] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'warning'>('all')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras((prev) =>
        prev.map((camera) => {
          if (camera.status === 'offline') return camera

          // Randomly fluctuate people count
          const change = Math.floor(Math.random() * 20) - 10
          const newCount = Math.max(0, Math.min(camera.capacity, camera.peopleCount + change))
          
          // Determine new crowd level
          const percentage = (newCount / camera.capacity) * 100
          let newLevel: CrowdLevel = 'low'
          if (percentage >= 85) newLevel = 'high'
          else if (percentage >= 60) newLevel = 'medium'

          return {
            ...camera,
            peopleCount: newCount,
            crowdLevel: newLevel,
            lastUpdate: new Date(),
          }
        })
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-generate incidents based on crowd levels
  useEffect(() => {
    cameras.forEach((camera) => {
      const percentage = (camera.peopleCount / camera.capacity) * 100
      
      if (percentage >= 90 && camera.crowdLevel === 'high') {
        // Check if we already have a recent breach incident for this camera
        const hasRecentBreach = incidents.some(
          (inc) =>
            inc.cameraId === camera.id &&
            inc.type === 'breach' &&
            !inc.resolved &&
            Date.now() - inc.timestamp.getTime() < 60000 // Within last minute
        )

        if (!hasRecentBreach) {
          addIncident({
            cameraId: camera.id,
            cameraName: camera.name,
            type: 'breach',
            message: `Capacity breach detected: ${camera.peopleCount}/${camera.capacity} people`,
            resolved: false,
          })
        }
      } else if (percentage >= 70 && percentage < 90 && camera.crowdLevel === 'medium') {
        const hasRecentWarning = incidents.some(
          (inc) =>
            inc.cameraId === camera.id &&
            inc.type === 'warning' &&
            !inc.resolved &&
            Date.now() - inc.timestamp.getTime() < 120000 // Within last 2 minutes
        )

        if (!hasRecentWarning) {
          addIncident({
            cameraId: camera.id,
            cameraName: camera.name,
            type: 'warning',
            message: `Approaching capacity: ${camera.peopleCount}/${camera.capacity} people`,
            resolved: false,
          })
        }
      }
    })
  }, [cameras])

  const addIncident = useCallback((incident: Omit<Incident, 'id' | 'timestamp'>) => {
    const newIncident: Incident = {
      ...incident,
      id: `inc-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    setIncidents((prev) => [newIncident, ...prev].slice(0, 50)) // Keep last 50 incidents
  }, [])

  const resolveIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, resolved: true } : inc))
    )
  }, [])

  const updateCameraStatus = useCallback((id: string, updates: Partial<Camera>) => {
    setCameras((prev) =>
      prev.map((camera) =>
        camera.id === id ? { ...camera, ...updates, lastUpdate: new Date() } : camera
      )
    )
  }, [])

  const createAlert = useCallback((
    priority: AlertPriority,
    title: string,
    message: string,
    cameraId?: string,
    cameraName?: string
  ) => {
    setAlerts((prev) => {
      // Check if similar alert already exists in last few minutes
      const isDuplicate = prev.some(
        (alert) =>
          alert.cameraId === cameraId &&
          alert.priority === priority &&
          alert.title === title &&
          !alert.dismissed &&
          Date.now() - alert.timestamp.getTime() < (priority === 'critical' ? 120000 : priority === 'warning' ? 180000 : 300000)
      )

      if (isDuplicate) {
        return prev
      }

      const newAlert: Alert = {
        id: `alert-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        priority,
        title,
        message,
        cameraId,
        cameraName,
        acknowledged: false,
        dismissed: false,
      }
      return [newAlert, ...prev].slice(0, 100) // Keep last 100 alerts
    })
  }, [])

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert))
    )
  }, [])

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, dismissed: true } : alert))
    )
  }, [])

  const getUnacknowledgedAlerts = useCallback(() => {
    return alerts.filter((alert) => !alert.acknowledged && !alert.dismissed)
  }, [alerts])

  // Auto-generate alerts based on camera status and incidents
  useEffect(() => {
    cameras.forEach((camera) => {
      const percentage = (camera.peopleCount / camera.capacity) * 100

      // Critical: Capacity breach
      if (percentage >= 95) {
        createAlert(
          'critical',
          'Capacity Breach',
          `${camera.name} has exceeded safe capacity (${camera.peopleCount}/${camera.capacity})`,
          camera.id,
          camera.name
        )
      }
      // Warning: High crowd level
      else if (percentage >= 85) {
        createAlert(
          'warning',
          'High Crowd Density',
          `${camera.name} is at ${Math.round(percentage)}% capacity`,
          camera.id,
          camera.name
        )
      }

      // Info: Camera offline
      if (camera.status === 'offline') {
        createAlert(
          'info',
          'Camera Offline',
          `${camera.name} is currently offline`,
          camera.id,
          camera.name
        )
      }
    })
  }, [cameras, createAlert])

  return (
    <DashboardContext.Provider
      value={{
        cameras,
        incidents,
        alerts,
        expandedCamera,
        selectedZone,
        filterLevel,
        setExpandedCamera,
        setSelectedZone,
        setFilterLevel,
        addIncident,
        resolveIncident,
        updateCameraStatus,
        acknowledgeAlert,
        dismissAlert,
        getUnacknowledgedAlerts,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
