'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
}

interface Post {
  id: string
  title: string
  excerpt: string | null
  content: string
  accessLevel: 'PUBLIC' | 'INTERNAL' | 'PRIVATE'
  status: 'DRAFT' | 'PUBLISHED'
  featured: boolean
  author: {
    id: string
    email: string
    name: string | null
  }
}

export default function EditPostPage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [accessLevel, setAccessLevel] = useState<'PUBLIC' | 'INTERNAL' | 'PRIVATE'>('PUBLIC')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [featured, setFeatured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    }
  }, [router])

  const fetchPost = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/posts/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const postData = data.post
        
        // Check if user owns this post
        if (postData.author.email !== user?.email && user?.role !== 'ADMIN') {
          alert('You do not have permission to edit this post')
          router.push(`/posts/${slug}`)
          return
        }

        setPost(postData)
        setTitle(postData.title)
        setExcerpt(postData.excerpt || '')
        setContent(postData.content)
        setAccessLevel(postData.accessLevel)
        setStatus(postData.status)
        setFeatured(postData.featured)
      } else {
        alert('Post not found')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      alert('Failed to fetch post')
      router.push('/')
    } finally {
      setFetching(false)
    }
  }, [slug, user, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user && slug) {
      fetchPost()
    }
  }, [user, slug, fetchPost])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          accessLevel,
          status,
          featured
        })
      })

      if (response.ok) {
        router.push(`/posts/${slug}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-professional rounded-3xl p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user || !post) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Professional Header */}
      <header className="glass-professional sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href={`/posts/${slug}`} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                ← Back to Post
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">
                Edit Post
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-600 hidden sm:block">
                {user.name || user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Section */}
          <div className="card-professional p-8">
            <label htmlFor="title" className="block text-lg font-semibold text-slate-900 mb-3">
              Post Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 text-xl input-professional rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your post title..."
              required
              aria-required="true"
            />
          </div>

          {/* Excerpt Section */}
          <div className="card-professional p-8">
            <label htmlFor="excerpt" className="block text-lg font-semibold text-slate-900 mb-3">
              Post Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-6 py-4 input-professional rounded-xl resize-none"
              placeholder="Write a brief summary of your post (optional)..."
            />
            <p className="text-sm text-slate-500 mt-2">
              This will appear as a preview in post listings
            </p>
          </div>

          {/* Content Section */}
          <div className="card-professional p-8">
            <label className="block text-lg font-semibold text-slate-900 mb-3">
              Post Content *
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your post content..."
            />
          </div>

          {/* Settings Section */}
          <div className="card-professional p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Post Settings</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Access Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Access Level
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as 'PUBLIC' | 'INTERNAL' | 'PRIVATE')}
                  className="w-full px-4 py-3 input-professional rounded-xl"
                  aria-label="Access Level"
                >
                  <option value="PUBLIC">Public - Anyone can view</option>
                  <option value="INTERNAL">Internal - Only registered users</option>
                  <option value="PRIVATE">Private - Only you</option>
                </select>
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                  className="w-full px-4 py-3 input-professional rounded-xl"
                  aria-label="Status"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
              {/* Featured */}
              <div className="flex items-center mt-4 md:mt-0">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm text-slate-700">
                  Mark as Featured
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-professional px-8 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 