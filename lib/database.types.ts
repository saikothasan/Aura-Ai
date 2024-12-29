export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          created_at: string
          user_id: string
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          is_public?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          conversation_id: string
          role: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          conversation_id: string
          role: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string
          role?: string
          content?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

