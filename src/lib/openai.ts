
import { supabase } from './supabase'

export async function generateTaskLabel(taskDescription: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-label', {
      body: { task: taskDescription }
    })

    if (error) throw error
    return data.label
  } catch (error) {
    console.error('Error generating label:', error)
    return 'Task' // fallback label
  }
}