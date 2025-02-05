"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  supabase,
  getComments,
  createComment,
  createCommentReply,
  upvoteComment,
  downvoteComment,
} from "@/lib/supabase"
import { useUser } from "@/lib/useUser"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"

interface Comment {
  id: string
  author: string
  content: string
  created_at: string
  user_id: string
  votes: number
}

export function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    fetchComments()
    const channel = supabase
      .channel("realtime comments")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, (payload) => {
        setComments((prevComments) => [...prevComments, payload.new as Comment])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchComments() {
    const { data, error } = await getComments(postId)
    if (error) {
      console.error("Error fetching comments:", error)
    } else {
      setComments(data || [])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      alert("You must be logged in to comment.")
      return
    }
    const { data, error } = await createComment(postId, user.id, newComment)
    if (error) {
      console.error("Error adding comment:", error)
    } else {
      setNewComment("")
    }
  }

  async function handleReply(commentId: string) {
    if (!user) {
      alert("You must be logged in to reply.")
      return
    }
    const { data, error } = await createCommentReply(postId, commentId, user.id, replyContent)
    if (error) {
      console.error("Error adding reply:", error)
    } else {
      setReplyingTo(null)
      setReplyContent("")
      fetchComments() // Refetch comments to include the new reply
    }
  }

  async function handleUpvote(commentId: string) {
    if (!user) {
      alert("You must be logged in to vote.")
      return
    }
    const { error } = await upvoteComment(commentId, user.id)
    if (error) {
      console.error("Error upvoting comment:", error)
    } else {
      fetchComments() // Refetch comments to update vote count
    }
  }

  async function handleDownvote(commentId: string) {
    if (!user) {
      alert("You must be logged in to vote.")
      return
    }
    const { error } = await downvoteComment(commentId, user.id)
    if (error) {
      console.error("Error downvoting comment:", error)
    } else {
      fetchComments() // Refetch comments to update vote count
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4 p-4 bg-gray-100 rounded">
          <div className="flex items-center mb-2">
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src={`https://avatar.vercel.sh/${comment.user_id}`} />
              <AvatarFallback>{comment.author[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{comment.author}</span>
          </div>
          <p className="mb-2">{comment.content}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{new Date(comment.created_at).toLocaleString()}</span>
            <Button variant="ghost" size="sm" onClick={() => handleUpvote(comment.id)}>
              <ThumbsUp className="w-4 h-4 mr-1" />
              {comment.votes > 0 && comment.votes}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDownvote(comment.id)}>
              <ThumbsDown className="w-4 h-4 mr-1" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)}>
              <MessageSquare className="w-4 h-4 mr-1" />
              Reply
            </Button>
          </div>
          {replyingTo === comment.id && (
            <div className="mt-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="mb-2"
              />
              <Button onClick={() => handleReply(comment.id)}>Submit Reply</Button>
            </div>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          required
        />
        <Button type="submit">Add Comment</Button>
      </form>
    </div>
  )
}

