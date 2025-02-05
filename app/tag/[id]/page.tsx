"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getPostsByTag } from "@/lib/supabase"
import { Head } from "@/app/components/Head"
import { Pagination } from "@/components/ui/pagination"

export default function TagPosts({ params }: { params: { id: string } }) {
  const [posts, setPosts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
  }, [params.id, currentPage]) //This hook specifies more dependencies than necessary: params.id, currentPage

  async function fetchPosts() {
    setLoading(true)
    const { data, error, count } = await getPostsByTag(params.id, currentPage)
    if (error) {
      console.error("Error fetching posts:", error)
    } else {
      setPosts(data || [])
      setTotalPosts(count || 0)
    }
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Head
        title={`Posts tagged with ${posts[0]?.tags[0]?.name}`}
        description={`Browse all posts tagged with ${posts[0]?.tags[0]?.name}`}
      />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Posts tagged with &quot;{posts[0]?.tags[0]?.name}&quot;</h1>
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
        <Pagination currentPage={currentPage} totalItems={totalPosts} pageSize={10} onPageChange={setCurrentPage} />
      </div>
    </>
  )
}

