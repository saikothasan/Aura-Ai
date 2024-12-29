import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ChatForm } from '@/components/chat-form'
import { Conversation, Message } from '@/types'

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .eq('id', params.id)
    .single() as { data: Conversation | null, error: any }

  if (error || !conversation) {
    notFound()
  }

  if (session?.user.id !== conversation.user_id && !conversation.is_public) {
    notFound()
  }

  const initialMessages = conversation.messages.map((message: Message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
  }))

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-4xl bg-background/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-border">
        <ChatForm initialMessages={initialMessages} />
      </div>
    </div>
  )
}

