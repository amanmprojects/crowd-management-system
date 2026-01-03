import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // Show the message only if there's an error indicating user doesn't exist
  const showNewUserMessage = searchParams.error === 'no-account'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access the Crowd Management System</p>
        </div>
        
        {/* New User Message - Only shown when error=no-account */}
        {showNewUserMessage && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>New user?</strong> Please{' '}
                  <Link href="/sign-up" className="font-semibold underline hover:text-blue-900">
                    sign up first
                  </Link>
                  {' '}to create your account.
                </p>
              </div>
            </div>
          </div>
        )}

        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl"
            }
          }}
          forceRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
