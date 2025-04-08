
import { useState } from 'react'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { nanoid } from 'nanoid'

interface Task {
  id: string
  text: string
  completed: boolean
  label: string
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])

  const addTask = ({ text, label }: { text: string; label: string }) => {
    setTasks([
      ...tasks,
      {
        id: nanoid(),
        text,
        completed: false,
        label,
      },
    ])
  }

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  return (
    <div className="mx-auto max-w-2xl p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks with AI-generated labels
        </p>
      </div>
      <TaskInput onAddTask={addTask} />
      <TaskList
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />
    </div>
  )
}