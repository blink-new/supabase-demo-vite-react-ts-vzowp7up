
import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { Header } from './components/Header'
import { TaskDashboard } from './components/TaskDashboard'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TaskDashboard session={session} />
      </main>
    </div>
  )
}

export default App