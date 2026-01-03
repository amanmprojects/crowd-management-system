import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      {/* Login button */}
      <Link href="/api/auth/login">Login</Link>
      {/* Sign up button */}
      <Link href="/dashboard">Dashboard</Link>
    </div>
  );
}
