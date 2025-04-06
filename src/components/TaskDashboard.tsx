
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import type { Task } from '../types/database.types'

export default function TaskDashboard({ session }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks' 
        }, 
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast.error('Error loading tasks!')
    } finally {
      setLoading(false)
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([
          { title: newTask.trim(), user_id: session.user.id, is_complete: false },
        ])

      if (error) throw error
      setNewTask('')
      toast.success('Task added!')
    } catch (error) {
      toast.error('Error adding task!')
    }
  }

  async function toggleTask(task: Task) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_complete: !task.is_complete })
        .eq('id', task.id)

      if (error) throw error
      toast.success('Task updated!')
    } catch (error) {
      toast.error('Error updating task!')
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Task deleted!')
    } catch (error) {
      toast.error('Error deleting task!')
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addTask} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Task
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm transition-all hover:shadow-md"
          >
            <input
              type="checkbox"
              checked={task.is_complete}
              onChange={() => toggleTask(task)}
              className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span
              className={`flex-1 ${
                task.is_complete ? 'line-through text-gray-400' : 'text-gray-700'
              }`}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </div>
  )
}