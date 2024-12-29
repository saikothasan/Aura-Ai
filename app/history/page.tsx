import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HistoryPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('id, created_at, messages(id)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return <div>Error loading conversation history</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Conversation History</h1>
      {conversations && conversations.length > 0 ? (
        <ul className="space-y-4">
          {conversations.map((conversation) => (
            <li key={conversation.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Link href={`/conversation/${conversation.id}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(conversation.created_at).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {conversation.messages.length} messages
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No conversations found.</p>
      )}
    </div>
  )
}

