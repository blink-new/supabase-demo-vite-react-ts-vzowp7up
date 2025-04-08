
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { TaskDashboard } from './components/TaskDashboard'
import { ProfilePicture } from './components/ProfilePicture'
import { ProfileHandler } from './components/ProfileHandler'
import { Nav } from './components/Nav'
import type { Session } from '@supabase/supabase-js'
import { Toaster } from '@/components/ui/toaster'

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
      <Nav session={session} />
      <main className="container mx-auto py-8 px-4">
        {!session ? (
          <Auth />
        ) : (
          <>
            <ProfileHandler session={session} />
            <div className="space-y-8">
              <ProfilePicture session={session} />
              <TaskDashboard session={session} />
            </div>
          </>
        )}
      </main>
      <Toaster />
    </div>
  )
}