import { ProfileForm } from '@/components/profile-form'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-md bg-background/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-border p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
        <ProfileForm />
      </div>
    </div>
  )
}

