"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getTags } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

export function TagNavigation() {
  const [tags, setTags] = useState<any[]>([])

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await getTags()
      if (error) {
        console.error("Error fetching tags:", error)
      } else {
        setTags(data || [])
      }
    }
    fetchTags()
  }, [])

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tag/${tag.id}`}>
            <Badge variant="secondary" className="cursor-pointer">
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}

