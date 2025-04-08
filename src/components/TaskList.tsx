
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { X } from 'lucide-react'

interface Task {
  id: string
  text: string
  completed: boolean
  label: string
}

interface TaskListProps {
  tasks: Task[]
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskList({ tasks, onToggleTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No tasks yet. Add one above!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between space-x-2 rounded-lg border p-4"
        >
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleTask(task.id)}
            />
            <div>
              <p className={task.completed ? 'line-through text-muted-foreground' : ''}>
                {task.text}
              </p>
              <Badge variant="secondary" className="mt-1">
                {task.label}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTask(task.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}