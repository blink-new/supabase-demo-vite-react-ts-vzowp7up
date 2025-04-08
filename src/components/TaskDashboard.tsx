
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../types/database.types'
import type { Session } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useToast } from '../hooks/use-toast'

interface TaskDashboardProps {
  session: Session | null
}

export function TaskDashboard({ session }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let channel: RealtimeChannel | null = null

    if (session) {
      fetchTasks()
      
      channel = supabase
        .channel('tasks-channel')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'tasks',
            filter: `user_id=eq.${session.user.id}`
          }, 
          (payload) => {
            console.log('INSERT event received:', payload)
            const newTask = payload.new as Task
            setTasks(current => [newTask, ...current])
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            console.log('UPDATE event received:', payload)
            const updatedTask = payload.new as Task
            setTasks(current => 
              current.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              )
            )
          }
        )
        .on('postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            console.log('DELETE event received:', payload)
            const deletedTask = payload.old as Task
            setTasks(current => 
              current.filter(task => task.id !== deletedTask.id)
            )
          }
        )
        .subscribe()

      return () => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      }
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [session])

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load tasks"
      })
    } finally {
      setLoading(false)
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim() || !session) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: newTask.trim(), 
            user_id: session.user.id, 
            is_complete: false 
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Immediately update UI with the new task
      if (data) {
        setTasks(current => [data, ...current])
        setNewTask('')
        toast({
          title: "Success",
          description: "Task added successfully"
        })
      }
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add task"
      })
    }
  }

  async function toggleTask(task: Task) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_complete: !task.is_complete })
        .eq('id', task.id)
        .eq('user_id', session?.user.id)
        .select()
        .single()

      if (error) throw error

      // Immediately update UI with the updated task
      if (data) {
        setTasks(current =>
          current.map(t => t.id === data.id ? data : t)
        )
        toast({
          title: "Success",
          description: "Task updated successfully"
        })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update task"
      })
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', session?.user.id)

      if (error) throw error

      // Immediately update UI by removing the deleted task
      setTasks(current => current.filter(task => task.id !== id))
      toast({
        title: "Success",
        description: "Task deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete task"
      })
    }
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Task Manager</h2>
        <p className="text-gray-600">Please sign in to manage your tasks.</p>
      </div>
    )
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