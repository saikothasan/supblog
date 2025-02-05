"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getPost,
  updatePost,
  deletePost,
  getCurrentUser,
  incrementPostViews,
  likePost,
  getRelatedPosts,
  bookmarkPost,
  unbookmarkPost,
  getBookmarkStatus,
} from "@/lib/supabase"
import { Comments } from "@/app/components/Comments"
import { Head } from "@/app/components/Head"
import { TextToSpeech } from "@/app/components/TextToSpeech"
import { NewsletterSubscription } from "@/app/components/NewsletterSubscription"
import { SocialShare } from "@/app/components/SocialShare"
import { OptimizedImage } from "@/app/components/OptimizedImage"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import Link from "next/link"
import { Clock, ThumbsUp, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export default function Post({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likes, setLikes] = useState(0)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [readingTime, setReadingTime] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchPost()
    fetchCurrentUser()
    incrementViews()
  }, [params.id])

  async function fetchPost() {
    const { data, error } = await getPost(params.id)
    if (error) {
      console.error("Error fetching post:", error)
    } else {
      setPost(data)
      setEditedTitle(data.title)
      setEditedContent(data.content)
      setLikes(data.likes)
      fetchRelatedPosts(data.category?.id, data.id)
      calculateReadingTime(data.content)
      checkIfBookmarked(data.id)
    }
  }

  async function fetchRelatedPosts(categoryId: string, postId: string) {
    const { data, error } = await getRelatedPosts(categoryId, postId)
    if (error) {
      console.error("Error fetching related posts:", error)
    } else {
      setRelatedPosts(data || [])
    }
  }

  async function fetchCurrentUser() {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  async function incrementViews() {
    await incrementPostViews(params.id)
  }

  async function handleUpdate() {
    const { data, error } = await updatePost(params.id, editedTitle, editedContent)
    if (error) {
      console.error("Error updating post:", error)
      toast({
        title: "Error",
        description: "Failed to update the post. Please try again.",
        variant: "destructive",
      })
    } else {
      setPost(data)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Post updated successfully.",
      })
    }
  }

  async function handleDelete() {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const { error } = await deletePost(params.id)
      if (error) {
        console.error("Error deleting post:", error)
        toast({
          title: "Error",
          description: "Failed to delete the post. Please try again.",
          variant: "destructive",
        })
      } else {
        router.push("/")
        toast({
          title: "Success",
          description: "Post deleted successfully.",
        })
      }
    }
  }

  async function handleLike() {
    if (currentUser) {
      const { data, error } = await likePost(params.id, currentUser.id)
      if (error) {
        console.error("Error liking post:", error)
        toast({
          title: "Error",
          description: "Failed to like the post. Please try again.",
          variant: "destructive",
        })
      } else {
        setLikes(data.likes)
        toast({
          title: "Success",
          description: "Post liked successfully.",
        })
      }
    } else {
      toast({
        title: "Error",
        description: "You must be logged in to like a post.",
        variant: "destructive",
      })
    }
  }

  function calculateReadingTime(content: string) {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    const time = Math.ceil(wordCount / wordsPerMinute)
    setReadingTime(`${time} min read`)
  }

  async function checkIfBookmarked(postId: string) {
    if (currentUser) {
      const { data, error } = await getBookmarkStatus(postId, currentUser.id)
      if (error) {
        console.error("Error checking bookmark status:", error)
      } else {
        setIsBookmarked(data.is_bookmarked)
      }
    }
  }

  async function handleBookmark() {
    if (currentUser) {
      if (isBookmarked) {
        const { error } = await unbookmarkPost(post.id, currentUser.id)
        if (error) {
          console.error("Error removing bookmark:", error)
          toast({
            title: "Error",
            description: "Failed to remove bookmark. Please try again.",
            variant: "destructive",
          })
        } else {
          setIsBookmarked(false)
          toast({
            title: "Success",
            description: "Bookmark removed successfully.",
          })
        }
      } else {
        const { error } = await bookmarkPost(post.id, currentUser.id)
        if (error) {
          console.error("Error adding bookmark:", error)
          toast({
            title: "Error",
            description: "Failed to add bookmark. Please try again.",
            variant: "destructive",
          })
        } else {
          setIsBookmarked(true)
          toast({
            title: "Success",
            description: "Post bookmarked successfully.",
          })
        }
      }
    } else {
      toast({
        title: "Error",
        description: "You must be logged in to bookmark a post.",
        variant: "destructive",
      })
    }
  }

  if (!post) return <div>Loading...</div>

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <>
      <Head
        title={post.title}
        description={post.excerpt || `${post.content.substring(0, 160)}...`}
        image={post.image_url}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        authors={[post.author]}
        section={post.category?.name}
      />
      <article className="max-w-4xl mx-auto">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <ReactQuill value={editedContent} onChange={setEditedContent} />
            <div className="space-x-2">
              <Button onClick={handleUpdate}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <OptimizedImage
                  src={post.author_avatar || "https://via.placeholder.com/40"}
                  alt={post.author}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{post.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {readingTime}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLike}>
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{likes}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBookmark}>
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "text-yellow-500" : ""}`} />
                </Button>
              </div>
            </div>
            <OptimizedImage
              src={post.image_url}
              alt={post.title}
              width={800}
              height={400}
              className="mb-8 rounded-lg"
            />
            <TextToSpeech text={post.content} />
            <div
              className="prose dark:prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Share this post</h2>
              <SocialShare postId={post.id} title={post.title} url={shareUrl} />
            </div>
            {currentUser && currentUser.id === post.user_id && (
              <div className="space-x-2 mb-8">
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            )}
          </>
        )}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/post/${relatedPost.id}`}>
                  <div className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold">{relatedPost.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(relatedPost.created_at).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-12">
          <NewsletterSubscription />
        </div>
        <div className="mt-12">
          <Comments postId={post.id} />
        </div>
      </article>
    </>
  )
}

