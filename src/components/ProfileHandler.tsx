
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface ProfileHandlerProps {
  session: Session
}

export function ProfileHandler({ session }: ProfileHandlerProps) {
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 means no rows returned - this is expected for new users
          throw fetchError
        }

        if (!existingProfile) {
          // Create new profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              user_id: session.user.id,
            })

          if (insertError) throw insertError
        }
      } catch (error) {
        console.error('Error initializing profile:', error)
        toast.error('Failed to initialize profile')
      }
    }

    initializeProfile()
  }, [session])

  return null
}