
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface ProfileHandlerProps {
  session: Session
}

export function ProfileHandler({ session }: ProfileHandlerProps) {
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (fetchError) {
          console.error('Fetch error:', fetchError)
          throw fetchError
        }

        if (!existingProfile) {
          console.log('Creating new profile for user:', session.user.id)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              user_id: session.user.id,
              updated_at: new Date().toISOString()
            })
            .select()

          if (insertError) {
            console.error('Insert error:', insertError)
            throw insertError
          }

          toast.success('Profile created successfully')
        }
      } catch (error: any) {
        console.error('Profile initialization error:', error)
        
        // If we haven't exceeded max retries and the error is a 404,
        // increment retry count which will trigger another attempt
        if (retryCount < MAX_RETRIES && 
            (error.message?.includes('404') || error.code === '404')) {
          setRetryCount(prev => prev + 1)
          toast.error(`Retrying profile creation... (${retryCount + 1}/${MAX_RETRIES})`)
        } else {
          toast.error('Failed to initialize profile. Please refresh the page.')
        }
      }
    }

    // Add a small delay before initialization to ensure Supabase is ready
    const timer = setTimeout(() => {
      initializeProfile()
    }, 1000)

    return () => clearTimeout(timer)
  }, [session, retryCount])

  return null
}