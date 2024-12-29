'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { User } from '@supabase/supabase-js'
import { User, Profile } from '@/types'

export function ProfileForm() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, website')
          .eq('id', user.id)
          .single() as { data: Profile | null, error: any }

        if (error) {
          console.error('Error fetching profile:', error)
        } else if (data) {
          setUsername(data.username || '')
          setWebsite(data.website || '')
        }
      }
    }

    fetchUser()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username, website, updated_at: new Date().toISOString() })

    if (error) {
      toast.error('Error updating profile')
    } else {
      toast.success('Profile updated successfully')
    }
    setIsLoading(false)
  }

  if (!user) return null

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="text" value={user.email} disabled />
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  )
}

