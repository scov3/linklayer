export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          auth_provider: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          auth_provider?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      vaults: {
        Row: {
          id: string
          name: string
          owner_id: string
          is_shared: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          is_shared?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          is_shared?: boolean
          description?: string | null
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          vault_id: string
          title: string
          content: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vault_id: string
          title?: string
          content?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          vault_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          vault_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          name?: string
          color?: string
        }
      }
      note_tags: {
        Row: {
          note_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          tag_id?: string
        }
      }
      links: {
        Row: {
          id: string
          source_note_id: string
          target_note_id: string
          link_type: string
          created_at: string
        }
        Insert: {
          id?: string
          source_note_id: string
          target_note_id: string
          link_type?: string
          created_at?: string
        }
        Update: {
          link_type?: string
        }
      }
      vault_members: {
        Row: {
          id: string
          vault_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          joined_at: string
        }
        Insert: {
          id?: string
          vault_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          joined_at?: string
        }
        Update: {
          role?: 'owner' | 'editor' | 'viewer'
        }
      }
      chat_messages: {
        Row: {
          id: string
          vault_id: string
          user_id: string
          content: string
          attached_note_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vault_id: string
          user_id: string
          content: string
          attached_note_id?: string | null
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Vault = Database['public']['Tables']['vaults']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Link = Database['public']['Tables']['links']['Row']
export type VaultMember = Database['public']['Tables']['vault_members']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
