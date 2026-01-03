'use client'

import { useState } from 'react'
import { DashboardProvider, useDashboard } from '../contexts/DashboardContext'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import CameraGrid from './CameraGrid'
import ZoneSidebar from './ZoneSidebar'
import IncidentSidebar from './IncidentSidebar'
import AlertCenter from './AlertCenter'
import AlertToastContainer from './AlertToastContainer'
import DarkModeToggle from './DarkModeToggle'
import Link from 'next/link'

function DashboardContent() {
  const { cameras, incidents, totalPeople, setExpandedCamera, expandedCamera } = useDashboard()
  const { isDark } = useTheme()
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  // Calculate stats
  const liveCameras = cameras.filter((c) => c.status === 'online').length
  const crowdedZones = cameras.filter((c) => c.crowdLevel === 'high' || c.crowdLevel === 'critical').length
  const recentIncidents = incidents.filter(
    (i) => new Date().getTime() - i.timestamp.getTime() < 3600000
  ).length

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Crowd Management System</h1>
                  <p className="text-xs text-indigo-200">Real-time Detection & Monitoring</p>
                </div>
              </div>
            </div>

            {/* Center Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalPeople}</p>
                <p className="text-xs text-indigo-200">Total People</p>
              </div>
              <div className="w-px h-10 bg-white bg-opacity-20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-green-300">{liveCameras}</p>
                <p className="text-xs text-indigo-200">Live Cameras</p>
              </div>
              <div className="w-px h-10 bg-white bg-opacity-20" />
              <div className="text-center">
                <p className={`text-2xl font-bold ${crowdedZones > 0 ? 'text-red-300' : 'text-green-300'}`}>
                  {crowdedZones}
                </p>
                <p className="text-xs text-indigo-200">Crowded Zones</p>
              </div>
              <div className="w-px h-10 bg-white bg-opacity-20" />
              <div className="text-center">
                <p className={`text-2xl font-bold ${recentIncidents > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
                  {recentIncidents}
                </p>
                <p className="text-xs text-indigo-200">Recent Incidents</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <AlertCenter />
              <Link
                href="/analytics"
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                title="Analytics"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Link>
              <div className="w-px h-8 bg-white bg-opacity-20" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">Operator</p>
                  <p className="text-xs text-indigo-200">Control Room</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex justify-around bg-white bg-opacity-10 rounded-lg py-2">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{totalPeople}</p>
              <p className="text-xs text-indigo-200">People</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-300">{liveCameras}</p>
              <p className="text-xs text-indigo-200">Cameras</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${crowdedZones > 0 ? 'text-red-300' : 'text-green-300'}`}>
                {crowdedZones}
              </p>
              <p className="text-xs text-indigo-200">Alerts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Left Sidebar - Zones */}
        <div className={`hidden lg:flex transition-all duration-300 ${leftSidebarOpen ? 'w-72' : 'w-0'}`}>
          {leftSidebarOpen && <ZoneSidebar />}
        </div>

        {/* Sidebar Toggle - Left */}
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="hidden lg:flex items-center justify-center w-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${leftSidebarOpen ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Camera Grid */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
          <CameraGrid />
        </div>

        {/* Sidebar Toggle - Right */}
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="hidden lg:flex items-center justify-center w-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${rightSidebarOpen ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Right Sidebar - Incidents */}
        <div className={`hidden lg:flex transition-all duration-300 ${rightSidebarOpen ? 'w-72' : 'w-0'}`}>
          {rightSidebarOpen && <IncidentSidebar />}
        </div>
      </div>

      {/* Alert Toast Container */}
      <AlertToastContainer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ThemeProvider>
  )
}
