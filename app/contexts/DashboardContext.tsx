'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { DetectionResult } from '@/lib/types'

export type CrowdLevel = 'low' | 'medium' | 'high' | 'critical'
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
  streamUrl?: string
  isLive?: boolean // True if this is the live camera feed
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
  latestDetection: DetectionResult | null
  totalPeople: number
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

// Python server stream URL
const PYTHON_SERVER_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL || 'http://localhost:8000'

// Initial cameras - Only LIVE camera from Python server
const initialCameras: Camera[] = [
  {
    id: '1',
    name: 'Live Camera',
    location: 'DroidCam Feed',
    zone: 'Main Area',
    status: 'connecting',
    crowdLevel: 'low',
    peopleCount: 0,
    capacity: 100,
    lastUpdate: new Date(),
    streamUrl: `${PYTHON_SERVER_URL}/stream`,
    isLive: true,
  },
]

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>(initialCameras)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [expandedCamera, setExpandedCamera] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'warning'>('all')
  const [latestDetection, setLatestDetection] = useState<DetectionResult | null>(null)

  // Connect to SSE stream for real-time detection updates
  useEffect(() => {
    const eventSource = new EventSource('/api/detection/stream')

    eventSource.onopen = () => {
      console.log('SSE connected')
      // Mark live camera as online
      setCameras(prev => prev.map(camera => 
        camera.isLive ? { ...camera, status: 'online' as CameraStatus } : camera
      ))
    }

    eventSource.onmessage = (event) => {
      try {
        const data: DetectionResult = JSON.parse(event.data)
        setLatestDetection(data)
        
        // Update the live camera with real detection data
        setCameras(prev => prev.map(camera => {
          if (camera.isLive) {
            const percentage = (data.people_count / camera.capacity) * 100
            let crowdLevel: CrowdLevel = 'low'
            if (percentage >= 85) crowdLevel = 'high'
            else if (percentage >= 60) crowdLevel = 'medium'

            return {
              ...camera,
              status: 'online' as CameraStatus,
              peopleCount: data.people_count,
              crowdLevel,
              lastUpdate: new Date(),
            }
          }
          return camera
        }))
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      // Mark live camera as connecting/offline
      setCameras(prev => prev.map(camera => 
        camera.isLive ? { ...camera, status: 'connecting' as CameraStatus } : camera
      ))
    }

    return () => {
      eventSource.close()
    }
  }, [])

  // Simulate real-time updates for non-live cameras
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras((prev) =>
        prev.map((camera) => {
          // Skip live camera and offline cameras
          if (camera.isLive || camera.status === 'offline') return camera

          // Randomly fluctuate people count for simulated cameras
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

  const addIncident = useCallback((incident: Omit<Incident, 'id' | 'timestamp'>) => {
    const newIncident: Incident = {
      ...incident,
      id: `inc-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    setIncidents((prev) => [newIncident, ...prev].slice(0, 50))
  }, [])

  // Auto-generate incidents based on crowd levels
  useEffect(() => {
    cameras.forEach((camera) => {
      const percentage = (camera.peopleCount / camera.capacity) * 100
      
      if (percentage >= 90 && camera.crowdLevel === 'high') {
        const hasRecentBreach = incidents.some(
          (inc) =>
            inc.cameraId === camera.id &&
            inc.type === 'breach' &&
            !inc.resolved &&
            Date.now() - inc.timestamp.getTime() < 60000
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
            Date.now() - inc.timestamp.getTime() < 120000
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
  }, [cameras, incidents, addIncident])

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
      const isDuplicate = prev.some(
        (alert) =>
          alert.cameraId === cameraId &&
          alert.priority === priority &&
          alert.title === title &&
          !alert.dismissed &&
          Date.now() - alert.timestamp.getTime() < (priority === 'critical' ? 120000 : priority === 'warning' ? 180000 : 300000)
      )

      if (isDuplicate) return prev

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
      return [newAlert, ...prev].slice(0, 100)
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

  // Auto-generate alerts based on camera status
  useEffect(() => {
    cameras.forEach((camera) => {
      const percentage = (camera.peopleCount / camera.capacity) * 100

      if (percentage >= 95) {
        createAlert(
          'critical',
          'Capacity Breach',
          `${camera.name} has exceeded safe capacity (${camera.peopleCount}/${camera.capacity})`,
          camera.id,
          camera.name
        )
      } else if (percentage >= 85) {
        createAlert(
          'warning',
          'High Crowd Density',
          `${camera.name} is at ${Math.round(percentage)}% capacity`,
          camera.id,
          camera.name
        )
      }

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

  // Calculate total people across all cameras
  const totalPeople = cameras.reduce((sum, camera) => sum + camera.peopleCount, 0)

  return (
    <DashboardContext.Provider
      value={{
        cameras,
        incidents,
        alerts,
        expandedCamera,
        selectedZone,
        filterLevel,
        latestDetection,
        totalPeople,
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
