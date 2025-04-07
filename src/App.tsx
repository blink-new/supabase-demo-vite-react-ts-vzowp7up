
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { TaskDashboard } from './components/TaskDashboard'
import { ProfilePicture } from './components/ProfilePicture'
import type { Session } from '@supabase/supabase-js'
import { Toaster } from 'react-hot-toast'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {!session ? (
          <Auth />
        ) : (
          <div className="space-y-8">
            <ProfilePicture session={session} />
            <TaskDashboard session={session} />
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
}