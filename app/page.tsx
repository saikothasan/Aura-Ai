import { ChatForm } from '@/components/chat-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

function LoadingSkeleton() {
  return (
    <div className="space-y-2 sm:space-y-4">
      <Skeleton className="h-4 w-[200px] sm:w-[250px]" />
      <Skeleton className="h-4 w-[150px] sm:w-[200px]" />
      <Skeleton className="h-4 w-[250px] sm:w-[300px]" />
    </div>
  )
}

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-4xl bg-background/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-border">
        <Suspense fallback={<LoadingSkeleton />}>
          <ChatForm />
        </Suspense>
      </div>
    </div>
  )
}

