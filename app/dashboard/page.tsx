"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, getPostAnalytics } from "@/lib/supabase"
import { Head } from "@/app/components/Head"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any[]>([])

  useEffect(() => {
    fetchUserAndAnalytics()
  }, [])

  async function fetchUserAndAnalytics() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      const { data, error } = await getPostAnalytics(currentUser.id)
      if (error) {
        console.error("Error fetching analytics:", error)
      } else {
        setAnalytics(data || [])
      }
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <>
      <Head title="Author Dashboard" description="View your post analytics" />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Author Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics.reduce((sum, post) => sum + post.views, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Likes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{analytics.reduce((sum, post) => sum + post.likes, 0)}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Post Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={600} height={300} data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#8884d8" />
              <Bar dataKey="likes" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

