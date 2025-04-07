
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { Upload, X } from 'lucide-react'

interface ProfilePictureProps {
  session: Session | null
}

export function ProfilePicture({ session }: ProfilePictureProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    if (session?.user.id) {
      getExistingAvatar()
    }
  }, [session?.user.id])

  async function getExistingAvatar() {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session?.user.id)
        .single()

      if (profile?.avatar_url) {
        const { data } = await supabase.storage
          .from('avatars')
          .getPublicUrl(profile.avatar_url)
        
        setAvatarUrl(data.publicUrl)
      }
    } catch (error) {
      console.error('Error loading avatar:', error)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      setAvatarFile(file)

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file)
      setAvatarUrl(objectUrl)

    } catch (error) {
      toast.error('Error selecting image!')
      console.error('Error:', error)
    } finally {
      setUploading(false)
    }
  }

  async function saveAvatar() {
    try {
      if (!avatarFile || !session) return

      setUploading(true)

      // Upload image
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile)

      if (uploadError) throw uploadError

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          avatar_url: fileName,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      toast.success('Avatar updated!')
      getExistingAvatar() // Refresh to get the new URL
    } catch (error) {
      toast.error('Error uploading avatar!')
      console.error('Error:', error)
    } finally {
      setUploading(false)
      setAvatarFile(null)
    }
  }

  async function removeAvatar() {
    try {
      if (!session) return

      setUploading(true)

      // Get current avatar filename
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single()

      if (profile?.avatar_url) {
        // Remove from storage
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([profile.avatar_url])

        if (removeError) throw removeError
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      setAvatarUrl(null)
      setAvatarFile(null)
      toast.success('Avatar removed!')
    } catch (error) {
      toast.error('Error removing avatar!')
      console.error('Error:', error)
    } finally {
      setUploading(false)
    }
  }

  if (!session) return null

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
      
      <div className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          {avatarUrl ? (
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                onClick={removeAvatar}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove avatar"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="space-y-2">
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          {avatarFile && (
            <button
              onClick={saveAvatar}
              disabled={uploading}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Save Avatar'}
            </button>
          )}
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center">
          Upload a profile picture. Supported formats: JPG, PNG, GIF
        </p>
      </div>
    </div>
  )
}