
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user.id) {
      getExistingAvatar()
    }
  }, [session?.user.id])

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function getExistingAvatar() {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session?.user.id)
        .maybeSingle()

      if (error) throw error

      if (profile?.avatar_url) {
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(profile.avatar_url)
        
        setAvatarUrl(data.publicUrl)
        setPreviewUrl(null) // Clear any preview when loading existing avatar
      }
    } catch (error) {
      console.error('Error loading avatar:', error)
      toast.error('Failed to load avatar')
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

      // Cleanup old preview if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      // Create a preview URL for immediate display
      const newPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(newPreviewUrl)
      setAvatarUrl(null) // Clear the old avatar URL while uploading

      // Upload immediately when file is selected
      await saveAvatar(file)
    } catch (error) {
      toast.error('Error uploading image!')
      console.error('Error:', error)
    } finally {
      setUploading(false)
    }
  }

  async function saveAvatar(file: File) {
    try {
      if (!session) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profileError) throw profileError

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: fileName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.user.id)

        if (updateError) throw updateError
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            avatar_url: fileName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (insertError) throw insertError
      }

      // Update the avatar URL state with the permanent URL
      setAvatarUrl(urlData.publicUrl)
      setAvatarFile(null)
      // Clear preview after successful upload
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      toast.success('Avatar updated!')
    } catch (error) {
      toast.error('Error saving avatar!')
      console.error('Error:', error)
    }
  }

  async function removeAvatar() {
    try {
      if (!session) return

      setUploading(true)

      // Get current avatar filename
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profileError) throw profileError

      if (profile?.avatar_url) {
        // Remove from storage
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([profile.avatar_url])
          
        if (storageError) throw storageError
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      setAvatarUrl(null)
      setAvatarFile(null)
      // Clear preview if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      toast.success('Avatar removed!')
    } catch (error) {
      toast.error('Error removing avatar!')
      console.error('Error:', error)
    } finally {
      setUploading(false)
    }
  }

  const displayUrl = previewUrl || avatarUrl

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
      
      <div className="space-y-4">
        {/* Avatar Preview */}
        <div className="flex justify-center">
          {displayUrl ? (
            <div className="relative">
              <img
                src={displayUrl}
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
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center">
          Upload a profile picture. Supported formats: JPG, PNG, GIF
        </p>
      </div>
    </div>
  )
}