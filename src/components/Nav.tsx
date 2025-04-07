
import { User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface NavProps {
  session: Session | null
}

export function Nav({ session }: NavProps) {
  const user = session?.user
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Task Manager
            </h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-500">
                Please sign in to continue
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}