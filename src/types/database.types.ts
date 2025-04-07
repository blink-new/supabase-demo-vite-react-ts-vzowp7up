
export interface Task {
  id: string
  created_at: string
  title: string
  is_complete: boolean
  user_id: string
}

export interface Profile {
  id: string
  created_at: string
  updated_at: string | null
  avatar_url: string | null
  user_id: string
}

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task
        Insert: {
          title: string
          user_id: string
          is_complete?: boolean
        }
        Update: {
          title?: string
          is_complete?: boolean
        }
      }
      profiles: {
        Row: Profile
        Insert: {
          id: string
          avatar_url?: string | null
          user_id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}