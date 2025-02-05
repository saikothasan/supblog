"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, getUserProfile, updateUserProfile } from "@/lib/supabase"
import { Head } from "@/app/components/Head"

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  async function fetchUserAndProfile() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      const { data: profileData } = await getUserProfile(currentUser.id)
      setProfile(profileData)
      setDisplayName(profileData?.display_name || "")
      setBio(profileData?.bio || "")
      setAvatarUrl(profileData?.avatar_url || "")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (user) {
      const { error } = await updateUserProfile(user.id, { display_name: displayName, bio, avatar_url: avatarUrl })
      if (error) {
        console.error("Error updating profile:", error)
      } else {
        alert("Profile updated successfully")
      }
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <>
      <Head title="User Profile" description="Manage your user profile" />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
              Avatar URL
            </label>
            <input
              type="text"
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Profile
          </button>
        </form>
      </div>
    </>
  )
}

