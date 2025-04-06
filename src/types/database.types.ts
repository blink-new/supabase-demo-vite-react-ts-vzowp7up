
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
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
    }
  }
}