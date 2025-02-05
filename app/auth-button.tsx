"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, signIn, signUp, signOut, getCurrentUser } from "@/lib/supabase"

export function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) alert(error.message)
    } else {
      const { error } = await signUp(email, password)
      if (error) alert(error.message)
      else alert("Check your email for the confirmation link!")
    }
    setShowAuthForm(false)
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) alert(error.message)
  }

  if (isLoading) return null

  return (
    <div>
      {user ? (
        <button onClick={handleSignOut} className="bg-red-500 text-white px-4 py-2 rounded">
          Sign Out
        </button>
      ) : (
        <button onClick={() => setShowAuthForm(true)} className="bg-green-500 text-white px-4 py-2 rounded">
          Sign In / Sign Up
        </button>
      )}
      {showAuthForm && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleAuth} className="bg-white p-8 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold">{isLogin ? "Sign In" : "Sign Up"}</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded">
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-blue-500">
              {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            <button type="button" onClick={() => setShowAuthForm(false)} className="w-full text-gray-500">
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

