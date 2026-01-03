import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardProvider } from '../dashboard/DashboardContext'
import { ThemeProvider } from '../ThemeContext'
import AnalyticsContent from './AnalyticsContent'
import DarkModeToggle from '../dashboard/DarkModeToggle'

export default async function AnalyticsPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <ThemeProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-300">
        {/* Top Navigation Bar */}
        <header className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-800 dark:to-blue-800 text-white shadow-lg dark:shadow-gray-900/50 sticky top-0 z-50 transition-colors duration-300">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Title */}
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl font-bold">Analytics Dashboard</h1>
                  <p className="text-xs text-indigo-100 dark:text-indigo-200">Detailed Insights & Reports</p>
                </div>
              </div>

              {/* Center: Navigation */}
              <nav className="hidden md:flex items-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  Live Monitoring
                </Link>
                <span className="px-4 py-2 rounded-lg text-sm font-medium bg-white bg-opacity-20">
                  Analytics
                </span>
              </nav>

              {/* Right: User Profile */}
              <div className="flex items-center gap-4">
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnalyticsContent />
        </main>
      </div>
      </DashboardProvider>
    </ThemeProvider>
  )
}
