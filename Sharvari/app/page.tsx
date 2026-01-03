import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-4xl px-6">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Crowd Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Real-Time Crowd Tracking and Safety Monitoring
        </p>
        <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
          Monitor crowd density in public places such as events, festivals, campuses, malls, and transport hubs. 
          Get live crowd visibility to reduce overcrowding, improve safety, and help organizers make timely decisions.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/sign-in"
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up"
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
