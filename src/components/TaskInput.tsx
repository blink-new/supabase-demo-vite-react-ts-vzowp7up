
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useToast } from './ui/use-toast'
import { generateTaskLabel } from '../lib/openai'
import { Loader2 } from 'lucide-react'

interface TaskInputProps {
  onAddTask: (task: { text: string; label: string }) => void
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [task, setTask] = useState('')
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task.trim()) return

    setIsGeneratingLabel(true)
    try {
      const label = await generateTaskLabel(task)
      onAddTask({ text: task, label })
      setTask('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate task label',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingLabel(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1"
      />
      <Button type="submit" disabled={isGeneratingLabel || !task.trim()}>
        {isGeneratingLabel ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Task'
        )}
      </Button>
    </form>
  )
}