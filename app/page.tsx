"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getPosts } from "@/lib/supabase"
import { useDebounce } from "@/lib/hooks"
import { Head } from "@/app/components/Head"
import { NewsletterSubscription } from "@/app/components/NewsletterSubscription"
import { TagNavigation } from "@/app/components/TagNavigation"
import { OptimizedImage } from "@/app/components/OptimizedImage"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Post {
  id: string
  title: string
  author: string
  created_at: string
  excerpt: string
  image_url: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [loading, setLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    fetchPosts()
  }, [debouncedSearchTerm]) // Removed page dependency

  async function fetchPosts() {
    setLoading(true)
    const { data, error, count } = await getPosts(page, 10, debouncedSearchTerm)
    if (error) {
      console.error("Error fetching posts:", error)
    } else {
      setPosts(data || [])
      setTotalPosts(count || 0)
      if (page === 1 && data && data.length > 0) {
        setFeaturedPost(data[0])
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Head title="Home" description="Welcome to our professional blog. Read the latest articles on various topics." />
      <div className="space-y-10">
        {featuredPost && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Featured Post</h2>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <OptimizedImage
                  src={featuredPost.image_url}
                  alt={featuredPost.title}
                  width={800}
                  height={400}
                  className="mb-4 rounded-lg"
                />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  <Link href={`/post/${featuredPost.id}`} className="hover:underline">
                    {featuredPost.title}
                  </Link>
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  By {featuredPost.author} on {new Date(featuredPost.created_at).toLocaleDateString()}
                </p>
                <p className="mt-4 text-gray-700 dark:text-gray-300">{featuredPost.excerpt}</p>
                <div className="mt-4">
                  <Link
                    href={`/post/${featuredPost.id}`}
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Read more<span aria-hidden="true"> →</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Latest Posts</h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <TagNavigation />

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <OptimizedImage
                        src={post.image_url}
                        alt={post.title}
                        width={400}
                        height={200}
                        className="mb-4 rounded-lg"
                      />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        <Link href={`/post/${post.id}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        By {post.author} on {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{post.excerpt}</p>
                      <div className="mt-4">
                        <Link
                          href={`/post/${post.id}`}
                          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Read more<span aria-hidden="true"> →</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={() => setPage(page - 1)} disabled={page === 1} />
                  </PaginationItem>
                  {/* Add page numbers here if needed */}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={() => setPage(page + 1)} disabled={posts.length < 10} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </section>

        <section>
          <NewsletterSubscription />
        </section>
      </div>
    </>
  )
}

