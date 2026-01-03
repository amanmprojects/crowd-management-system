# Crowd Management System

Real-Time Crowd Tracking and Safety Monitoring System built with Next.js and Clerk Authentication.

## Features

- 🔐 **Secure Authentication** - Powered by Clerk with Sign In/Sign Up
- 📊 **Dashboard** - Protected dashboard for authenticated users
- 🎨 **Modern UI** - Built with Next.js 14, TypeScript, and Tailwind CSS
- 🔒 **Route Protection** - Middleware-based route protection

## Getting Started

### Prerequisites

- Bun (recommended) or Node.js 18+
- A Clerk account ([Sign up for free](https://clerk.com))

### Installation

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up Clerk:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Create a new application
   - Copy your API keys
   - Update `.env.local` with your keys:
     ```env
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

3. **Run the development server:**
   ```bash
   bun run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

```
├── app/
│   ├── dashboard/          # Protected dashboard page
│   ├── sign-in/           # Sign in page
│   ├── sign-up/           # Sign up page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with ClerkProvider
│   └── page.tsx           # Home page
├── middleware.ts          # Route protection middleware
├── .env.local            # Environment variables
└── package.json
```

## Available Routes

- `/` - Home page (public)
- `/sign-in` - Sign in page (public)
- `/sign-up` - Sign up page (public)
- `/dashboard` - Dashboard (protected - requires authentication)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Technologies Used

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Authentication:** Clerk
- **Styling:** Tailwind CSS
- **UI Components:** React 18

## Next Steps

This project currently has authentication set up. You can extend it by adding:

- Real-time crowd monitoring features
- Heat maps and visualizations
- Alert system for safety thresholds
- Location management
- Data analytics dashboard
- Integration with cameras/sensors

## License

This project is for educational purposes.
