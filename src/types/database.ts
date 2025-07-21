export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string // Clerk user_id (UUID)
          email: string | null
          first_name: string | null
          last_name: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          image_url?: string | null
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          user_id: string
          name: string
          system_prompt: string
          avatar_url: string | null
          model_config: {
            model: string // e.g., "gpt-4", "claude-3-sonnet", "gemini-pro"
            temperature?: number
            max_tokens?: number
            top_p?: number
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          system_prompt: string
          avatar_url?: string | null
          model_config: {
            model: string
            temperature?: number
            max_tokens?: number
            top_p?: number
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          system_prompt?: string
          avatar_url?: string | null
          model_config?: {
            model?: string
            temperature?: number
            max_tokens?: number
            top_p?: number
          }
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          agent_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          role?: 'user' | 'assistant'
          content?: string
        }
      }
    }
  }
}