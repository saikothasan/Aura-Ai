import { AuthForm } from '@/components/auth-form'

export default function LoginPage() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-md bg-background/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-border p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Login / Register</h1>
        <AuthForm />
      </div>
    </div>
  )
}

