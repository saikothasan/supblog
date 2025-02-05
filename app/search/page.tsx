"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { searchPosts, getCategories, getTags } from "@/lib/supabase"
import { Head } from "@/app/components/Head"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"

export default function Search() {
  const [posts, setPosts] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<any>({})
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initialQuery = searchParams.get("q") || ""
    setQuery(initialQuery)
    fetchPosts(initialQuery)
    fetchCategories()
    fetchTags()
  }, [searchParams])

  async function fetchPosts(searchQuery: string) {
    setLoading(true)
    const { data, error, count } = await searchPosts(searchQuery, filters, currentPage)
    if (error) {
      console.error("Error searching posts:", error)
    } else {
      setPosts(data || [])
      setTotalPosts(count || 0)
    }
    setLoading(false)
  }

  async function fetchCategories() {
    const { data, error } = await getCategories()
    if (error) {
      console.error("Error fetching categories:", error)
    } else {
      setCategories(data || [])
    }
  }

  async function fetchTags() {
    const { data, error } = await getTags()
    if (error) {
      console.error("Error fetching tags:", error)
    } else {
      setTags(data || [])
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
    fetchPosts(query)
  }

  function handleFilterChange(key: string, value: string) {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <>
      <Head title="Search Posts" description="Search for blog posts" />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Search Posts</h1>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </div>
          <div className="flex space-x-4">
            <Select
              options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
              onChange={(value) => handleFilterChange("category", value)}
              placeholder="Filter by category"
            />
            <Select
              options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
              onChange={(value) => handleFilterChange("tag", value)}
              placeholder="Filter by tag"
            />
          </div>
        </form>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      <Link href={`/post/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        By {post.author} on {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/post/${post.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalItems={totalPosts} pageSize={10} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </>
  )
}

