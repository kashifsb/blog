'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
}

interface Post {
  id: string
  title: string
  content: string
  slug: string
  accessLevel: 'PUBLIC' | 'INTERNAL' | 'PRIVATE'
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  comments: Comment[]
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Get user info from localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    fetchPost(token)
  }, [params.slug])

  const fetchPost = async (token?: string | null) => {
    setLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/posts/${params.slug}`, {
        headers
      })
      
      if (response.status === 403) {
        setError('Access denied. You do not have permission to view this post.')
        setLoading(false)
        return
      }
      
      if (response.status === 404) {
        setError('Post not found.')
        setLoading(false)
        return
      }

      const data = await response.json()
      
      if (response.ok) {
        // Handle the new API response structure
        setPost(data.post || data)
      } else {
        setError(data.error || 'Failed to load post')
      }
    } catch (error) {
      setError('An error occurred while loading the post.')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !user) return

    setSubmittingComment(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/posts/${params.slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment }),
      })

      const data = await response.json()

      if (response.ok) {
        setComment('')
        // Refresh the post to get the new comment
        fetchPost(token)
      } else {
        setError(data.error || 'Failed to post comment')
      }
    } catch (error) {
      setError('An error occurred while posting the comment.')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/posts/${params.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const getAccessLevelBadge = (level: string) => {
    const badges = {
      PUBLIC: 'bg-green-100 text-green-800 border-green-200',
      INTERNAL: 'bg-blue-100 text-blue-800 border-blue-200',
      PRIVATE: 'bg-red-100 text-red-800 border-red-200'
    }
    return badges[level as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/30">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-700 mb-4 font-medium">{error}</p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                ← Back to blog
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user && user.id === post.author.id && (
                <>
                  <Link
                    href={`/posts/${params.slug}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Post
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Post
                  </button>
                </>
              )}
              {user ? (
                <>
                  <span className="text-gray-800 font-medium">Welcome, {user.name || user.email}</span>
                  <Link
                    href="/create"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold"
                  >
                    Create Post
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token')
                      localStorage.removeItem('user')
                      setUser(null)
                      router.push('/')
                    }}
                    className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/30">
          <div className="p-8">
            {/* Post Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAccessLevelBadge(post.accessLevel)}`}>
                    {post.accessLevel}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user && (user.role === 'ADMIN' || post.author.id === user.id) && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/posts/${params.slug}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {(post.author.name || post.author.email)?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {post.author.name || post.author.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose max-w-none mb-8">
              <div 
                className="text-gray-800 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/30">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({post.comments.length})
            </h3>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-semibold text-gray-800 mb-2">
                    Add a comment
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 shadow-sm resize-none"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment || !comment.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold shadow-lg"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}

            {!user && (
              <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-700 font-medium">
                  Please{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                    log in
                  </Link>{' '}
                  to leave a comment.
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold">
                      {(comment.author.name || comment.author.email)?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {comment.author.name || comment.author.email}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {post.comments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-medium text-lg">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 