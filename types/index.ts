import { Database } from '@/lib/database.types'

export type Message = {
  id: string
  role: "user" | "assistant" // Narrowed to match your expected values
  content: string
  created_at?: string
}

export type Conversation = {
  id: string
  user_id: string
  created_at: string
  is_public: boolean
  messages: Message[]
}

export type Profile = Database['public']['Tables']['profiles']['Row']

export type User = {
  id: string
  email?: string
}

