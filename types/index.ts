import { Database } from '@/lib/database.types'
import { Message as SDKMessage } from "@ai-sdk/ui-utils";

export type Message = Omit<SDKMessage, "role"> & {
  role: "user" | "assistant"; // Narrowing down allowed roles
};


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

