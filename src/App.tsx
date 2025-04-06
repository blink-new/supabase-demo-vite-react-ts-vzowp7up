
import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import TaskDashboard from './components/TaskDashboard'

function App() {
  const [session, setSession] = useState(null)

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
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-8 text-gray-800">
          Supabase Tasks Demo
        </h1>
        
        {!session ? (
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
            />
          </div>
        ) : (
          <TaskDashboard session={session} />
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App