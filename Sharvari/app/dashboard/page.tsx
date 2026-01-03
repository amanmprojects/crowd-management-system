import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardProvider } from './DashboardContext'
import { ThemeProvider } from '../ThemeContext'
import CameraGrid from './CameraGrid'
import ZoneSidebar from './ZoneSidebar'
import IncidentSidebar from './IncidentSidebar'
import DarkModeToggle from './DarkModeToggle'
import AlertCenter from './AlertCenter'
import AlertToastContainer from './AlertToastContainer'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <ThemeProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
          {/* Top Navigation Bar */}
          <header className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-800 dark:to-blue-800 text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left: Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md transform hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Crowd Management System</h1>
                    <p className="text-xs text-indigo-100 dark:text-indigo-200">Real-Time Monitoring</p>
                  </div>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                  <span className="px-4 py-2 rounded-lg text-sm font-medium bg-white bg-opacity-20 dark:bg-opacity-30 backdrop-blur-sm">
                    Live Monitoring
                  </span>
                  <Link 
                    href="/analytics" 
                    className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 dark:hover:bg-opacity-30 transition-all duration-200"
                  >
                    Analytics
                  </Link>
                </nav>

                {/* Center: Live Status (for smaller screens) */}
                <div className="md:hidden flex items-center gap-2 bg-white bg-opacity-20 dark:bg-opacity-30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium">Live</span>
                </div>

                {/* Right: Alerts, Dark Mode Toggle & User Profile */}
                <div className="flex items-center gap-4">
                  <AlertCenter />
                  <DarkModeToggle />
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-indigo-100 dark:text-indigo-200">Administrator</p>
                  </div>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
          </header>

          {/* Alert Toast Notifications */}
          <AlertToastContainer />

          {/* Main Layout: Command Center Style */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Zones */}
            <aside className="w-64 flex-shrink-0 overflow-y-auto">
              <ZoneSidebar />
            </aside>

            {/* Center: Camera Grid */}
            <main className="flex-1 overflow-y-auto p-6">
              <CameraGrid />
            </main>

            {/* Right Sidebar: Incidents */}
            <aside className="w-80 flex-shrink-0 overflow-y-auto">
              <IncidentSidebar />
            </aside>
          </div>
        </div>
      </DashboardProvider>
    </ThemeProvider>
  )
}
