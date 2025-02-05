"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createPost, getCurrentUser, getCategories, getTags } from "@/lib/supabase"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import { Head } from "@/app/components/Head"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export default function NewPost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchCategoriesAndTags()
  }, [])

  async function fetchCategoriesAndTags() {
    const { data: categoriesData } = await getCategories()
    const { data: tagsData } = await getTags()
    setCategories(categoriesData || [])
    setTags(tagsData || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const user = await getCurrentUser()
    const { data, error } = await createPost(title, content, author, user?.id, categoryId, selectedTags)

    if (error) {
      console.error("Error creating post:", error)
      alert("An error occurred while creating the post")
    } else {
      router.push("/")
    }
  }

  return (
    <>
      <Head title="Create New Post" description="Create a new blog post" />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="mt-2 space-y-2">
              {tags.map((tag: any) => (
                <label key={tag.id} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    value={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id])
                      } else {
                        setSelectedTags(selectedTags.filter((id) => id !== tag.id))
                      }
                    }}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <ReactQuill value={content} onChange={setContent} className="mt-1" />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Post
          </button>
        </form>
      </div>
    </>
  )
}

