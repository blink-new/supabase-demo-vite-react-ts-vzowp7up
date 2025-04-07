
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface ProfileHandlerProps {
  session: Session
}

export function ProfileHandler({ session }: ProfileHandlerProps) {
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (!existingProfile) {
          // Create new profile if it doesn't exist
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              user_id: session.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (error) throw error
        }
      } catch (error) {
        console.error('Error initializing profile:', error)
      }
    }

    initializeProfile()
  }, [session])

  return null
}