"use client"

import { useState } from "react"
import { sharePostToSocialMedia } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin } from "lucide-react"

interface SocialShareProps {
  postId: string
  title: string
  url: string
}

export function SocialShare({ postId, title, url }: SocialShareProps) {
  const [isSharing, setIsSharing] = useState(false)

  async function handleShare(platform: string) {
    setIsSharing(true)
    try {
      await sharePostToSocialMedia(postId, platform)
      alert(`Successfully shared to ${platform}`)
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error)
      alert(`Failed to share to ${platform}`)
    }
    setIsSharing(false)
  }

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={() => handleShare("facebook")} disabled={isSharing}>
        <Facebook className="w-4 h-4 mr-2" />
        Facebook
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleShare("twitter")} disabled={isSharing}>
        <Twitter className="w-4 h-4 mr-2" />
        Twitter
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")} disabled={isSharing}>
        <Linkedin className="w-4 h-4 mr-2" />
        LinkedIn
      </Button>
    </div>
  )
}

