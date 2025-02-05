"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function NewsletterSubscription() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from("newsletter_subscribers").insert({ email })

    if (error) {
      setMessage("Error subscribing. Please try again.")
    } else {
      setMessage("Successfully subscribed!")
      setEmail("")
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Subscribe to our Newsletter</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-3 py-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Subscribe
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}

