
export interface Task {
  id: string
  created_at: string
  title: string
  is_complete: boolean
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
    }
  }
}