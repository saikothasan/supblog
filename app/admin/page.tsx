"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, getCategories, getTags, createPost } from "@/lib/supabase"
import { Head } from "@/app/components/Head"
import Link from "next/link"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    fetchUserAndData()
  }, [])

  async function fetchUserAndData() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    const { data: categoriesData } = await getCategories()
    setCategories(categoriesData || [])

    const { data: tagsData } = await getTags()
    setTags(tagsData || [])
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await createPost("categories", {
      name: newCategory,
      slug: newCategory.toLowerCase().replace(/\s+/g, "-"),
    })
    if (error) {
      console.error("Error creating category:", error)
    } else {
      setCategories([...categories, data])
      setNewCategory("")
    }
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await createPost("tags", { name: newTag, slug: newTag.toLowerCase().replace(/\s+/g, "-") })
    if (error) {
      console.error("Error creating tag:", error)
    } else {
      setTags([...tags, data])
      setNewTag("")
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <>
      <Head title="Admin Dashboard" description="Manage your blog" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Categories</h2>
            <ul className="list-disc pl-5 mb-4">
              {categories.map((category) => (
                <li key={category.id}>{category.name}</li>
              ))}
            </ul>
            <form onSubmit={handleCreateCategory} className="space-y-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="w-full px-3 py-2 border rounded"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Add Category
              </button>
            </form>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Tags</h2>
            <ul className="list-disc pl-5 mb-4">
              {tags.map((tag) => (
                <li key={tag.id}>{tag.name}</li>
              ))}
            </ul>
            <form onSubmit={handleCreateTag} className="space-y-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag name"
                className="w-full px-3 py-2 border rounded"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Add Tag
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/new-post" className="bg-green-500 text-white px-4 py-2 rounded">
            Create New Post
          </Link>
        </div>
      </div>
    </>
  )
}

