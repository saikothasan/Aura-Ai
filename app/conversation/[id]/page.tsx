import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .eq('id', params.id)
    .single()

  if (error || !conversation) {
    notFound()
  }

  if (session?.user.id !== conversation.user_id && !conversation.is_public) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Conversation</h1>
      <div className="space-y-4">
        {conversation.messages.map((message: any) => (
          <div key={message.id} className="border rounded-lg p-4">
            <div className="font-semibold mb-2">{message.role === 'user' ? 'You' : 'Aura'}</div>
            <ReactMarkdown className="prose dark:prose-invert">
              {message.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  )
}

