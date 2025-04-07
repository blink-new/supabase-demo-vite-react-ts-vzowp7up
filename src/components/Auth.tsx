
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

export function Auth() {
  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold text-center mb-6">Task Manager</h1>
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#3b82f6',
                brandAccent: '#2563eb',
              },
            },
          },
          className: {
            container: 'flex flex-col gap-4',
            button: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors',
            input: 'px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full',
            label: 'text-sm font-medium text-gray-700',
          },
        }}
        providers={['google', 'github']}
        theme="default"
      />
    </div>
  )
}