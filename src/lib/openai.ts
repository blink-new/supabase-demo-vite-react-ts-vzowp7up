
import { supabase } from './supabase'

export async function generateTaskLabel(taskDescription: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-label', {
      body: { task: taskDescription }
    })

    if (error) {
      console.error('Supabase function error:', error)
      throw new Error('Failed to generate label')
    }
    
    if (!data || !data.label) {
      console.error('Invalid response:', data)
      throw new Error('Invalid label response')
    }

    return data.label
  } catch (error) {
    console.error('Error generating label:', error)
    throw error // Let the component handle the error
  }
}