import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getPosts(page = 1, limit = 10, searchTerm = "") {
  const start = (page - 1) * limit
  const end = start + limit - 1

  let query = supabase
    .from("posts")
    .select("id, title, author, created_at, user_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, end)

  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
  }

  const { data, error, count } = await query

  return { data, error, count }
}

export async function getPost(id: string) {
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()

  return { data, error }
}

export async function createPost(
  title: string,
  content: string,
  author: string,
  userId: string | undefined,
  categoryId: string,
  tags: string[],
) {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert([{ title, content, author, user_id: userId, category_id: categoryId }])
    .select()
    .single()

  if (postError) return { error: postError }

  if (tags.length > 0) {
    const { error: tagError } = await supabase
      .from("post_tags")
      .insert(tags.map((tagId) => ({ post_id: post.id, tag_id: tagId })))

    if (tagError) return { error: tagError }
  }

  return { data: post, error: null }
}

export async function updatePost(id: string, title: string, content: string) {
  const { data, error } = await supabase.from("posts").update({ title, content }).eq("id", id).select()

  return { data, error }
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id)

  return { error }
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  return { data, error }
}

export async function createComment(postId: string, author: string, content: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id: postId, author, content }])
    .select()

  return { data, error }
}

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name")
  return { data, error }
}

export async function getTags() {
  const { data, error } = await supabase.from("tags").select("*").order("name")
  return { data, error }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()
  return { data, error }
}

export async function updateUserProfile(
  userId: string,
  profile: { display_name: string; bio: string; avatar_url: string },
) {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, ...profile })
    .select()
  return { data, error }
}

export async function incrementPostViews(postId: string) {
  const { data, error } = await supabase.rpc("increment_post_views", { post_id: postId })
  return { data, error }
}

export async function likePost(postId: string, userId: string) {
  const { data, error } = await supabase.rpc("toggle_post_like", { post_id: postId, user_id: userId })
  return { data, error }
}

export async function getRelatedPosts(categoryId: string, currentPostId: string, limit = 4) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .eq("category_id", categoryId)
    .neq("id", currentPostId)
    .order("created_at", { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function getCommentReplies(commentId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("parent_id", commentId)
    .order("created_at", { ascending: true })
  return { data, error }
}

export async function createCommentReply(postId: string, parentId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, parent_id: parentId, user_id: userId, content })
    .select()
  return { data, error }
}

export async function upvoteComment(commentId: string, userId: string) {
  const { data, error } = await supabase
    .from("comment_votes")
    .upsert({ comment_id: commentId, user_id: userId, vote: 1 })
    .select()
  return { data, error }
}

export async function downvoteComment(commentId: string, userId: string) {
  const { data, error } = await supabase
    .from("comment_votes")
    .upsert({ comment_id: commentId, user_id: userId, vote: -1 })
    .select()
  return { data, error }
}

export async function getPostsByTag(tagId: string, page = 1, limit = 10) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data, error, count } = await supabase
    .from("posts")
    .select("*, tags!inner(*)", { count: "exact" })
    .eq("tags.id", tagId)
    .range(start, end)

  return { data, error, count }
}

export async function searchPosts(query: string, filters: any = {}, page = 1, limit = 10) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  let queryBuilder = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .range(start, end)

  if (filters.category) {
    queryBuilder = queryBuilder.eq("category_id", filters.category)
  }

  if (filters.tag) {
    queryBuilder = queryBuilder.eq("tags.id", filters.tag)
  }

  if (filters.author) {
    queryBuilder = queryBuilder.eq("author", filters.author)
  }

  const { data, error, count } = await queryBuilder

  return { data, error, count }
}

export async function bookmarkPost(postId: string, userId: string) {
  const { data, error } = await supabase.from("bookmarks").upsert({ post_id: postId, user_id: userId }).select()
  return { data, error }
}

export async function unbookmarkPost(postId: string, userId: string) {
  const { error } = await supabase.from("bookmarks").delete().match({ post_id: postId, user_id: userId })
  return { error }
}

export async function getBookmarkedPosts(userId: string, page = 1, limit = 10) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data, error, count } = await supabase
    .from("bookmarks")
    .select("posts(*)", { count: "exact" })
    .eq("user_id", userId)
    .range(start, end)

  return { data, error, count }
}

export async function getPostAnalytics(postId: string) {
  const { data, error } = await supabase.rpc("get_post_analytics", { post_id: postId })
  return { data, error }
}

export async function sharePostToSocialMedia(postId: string, platform: string) {
  // This is a placeholder function. In a real-world scenario, you would integrate
  // with social media APIs to share the post programmatically.
  console.log(`Sharing post ${postId} to ${platform}`)
  return { success: true }
}

