import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Crowd Management System</h1>
          <p className="text-indigo-200">Create your account</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/95 backdrop-blur-sm shadow-2xl',
            }
          }}
        />
      </div>
    </div>
  )
}
