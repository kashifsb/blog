'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

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
  slug: string
  accessLevel: string
  featured: boolean
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    comments: number
    likes: number
  }
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }
  }, [])

  const fetchPosts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        if (reset || pageNum === 1) {
          setPosts(data.posts)
        } else {
          setPosts(prev => [...prev, ...data.posts])
        }
        setHasMore(data.pagination.page < data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (!initialized) {
      checkAuth()
      fetchPosts(1, true)
      setInitialized(true)
    }
  }, [initialized, checkAuth, fetchPosts])

  // Handle page changes
  useEffect(() => {
    if (initialized && page > 1) {
      fetchPosts(page, false)
    }
  }, [page, initialized, fetchPosts])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    fetchPosts(1, true)
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchPosts(1, true)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error searching posts:', error)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-professional rounded-3xl p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Professional Header */}
      <header className="glass-professional sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-10">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-900">
                  EnterpriseBlog
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                <Link href="/" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                  Home
                </Link>
                {user && (
                  <>
                    <Link href="/dashboard" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                      Dashboard
                    </Link>
                    <Link href="/notes" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                      Notes
                    </Link>
                    <Link href="/create" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                      Create
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-all duration-200">
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>

            {/* Search and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block w-80">
                <SearchBar onSearch={handleSearch} />
              </div>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-sm text-slate-600">
                    Welcome, <span className="font-medium text-slate-900">{user.name || user.email.split('@')[0]}</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 glass-professional rounded-xl shadow-lg py-2 z-50">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/notes"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Notes
                        </Link>
                        <hr className="my-2 border-slate-200" />
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsMenuOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-professional px-6 py-2 text-white rounded-xl font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                  Home
                </Link>
                {user && (
                  <>
                    <Link href="/dashboard" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                      Dashboard
                    </Link>
                    <Link href="/notes" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                      Notes
                    </Link>
                    <Link href="/create" className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                      Create
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-all duration-200">
                        Admin
                      </Link>
                    )}
                  </>
                )}
                {!user && (
                  <>
                    <Link href="/login" className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors">
                      Sign In
                    </Link>
                    <Link href="/register" className="btn-professional px-4 py-2 text-white rounded-xl font-medium">
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Welcome to EnterpriseBlog
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Discover insights, share knowledge, and connect with professionals in our enterprise-grade blogging platform.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-professional px-8 py-4 text-white rounded-xl font-semibold text-lg"
              >
                Start Writing Today
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-semibold text-lg"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Featured Posts */}
        {posts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Featured Posts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {posts.filter(post => post.featured).slice(0, 2).map(post => (
                <FeaturedPostCard key={post.id} post={post} user={user} />
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Latest Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <PostCard key={post.id} post={post} user={user} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-professional px-8 py-4 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}

          {/* No Posts Message */}
          {posts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="glass-professional rounded-3xl p-8 inline-block">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No posts yet</h3>
                <p className="text-slate-600 mb-6">Be the first to share your insights!</p>
                {user && (
                  <Link
                    href="/create"
                    className="btn-professional px-6 py-3 text-white rounded-xl font-medium"
                  >
                    Create Your First Post
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function PostCard({ post, user }: { post: Post; user: User | null }) {
  return (
    <article className="card-professional rounded-2xl overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              <Link href={`/posts/${post.slug}`}>
                {post.title}
              </Link>
            </h3>
            {post.excerpt && (
              <p className="text-slate-600 line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
            )}
          </div>
          {post.featured && (
            <div className="ml-4">
              <span className="badge-warning inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {(post.author.name || post.author.email)[0].toUpperCase()}
            </div>
            <span className="font-medium text-slate-700">{post.author.name || post.author.email.split('@')[0]}</span>
          </div>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post._count.likes}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post._count.comments}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            post.accessLevel === 'PUBLIC' ? 'badge-success' :
            post.accessLevel === 'INTERNAL' ? 'badge-warning' :
            'badge-danger'
          }`}>
            {post.accessLevel}
          </span>
        </div>

        {/* Action buttons for post owner */}
        {user && post.author.email === user.email && (
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-slate-100">
            <Link
              href={`/posts/${post.slug}/edit`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete this post?')) {
                  try {
                    const token = localStorage.getItem('token')
                    const response = await fetch(`/api/posts/${post.slug}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                    })
                    if (response.ok) {
                      window.location.reload()
                    }
                  } catch (error) {
                    console.error('Error deleting post:', error)
                  }
                }
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function FeaturedPostCard({ post, user: _user }: { post: Post; user: User | null }) {
  return (
    <article className="card-professional rounded-2xl overflow-hidden group border-2 border-yellow-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              <Link href={`/posts/${post.slug}`}>
                {post.title}
              </Link>
            </h3>
            {post.excerpt && (
              <p className="text-slate-600 line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
            )}
          </div>
          <div className="ml-4">
            <span className="badge-warning inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {(post.author.name || post.author.email)[0].toUpperCase()}
            </div>
            <span className="font-medium text-slate-700">{post.author.name || post.author.email.split('@')[0]}</span>
          </div>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post._count.likes}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post._count.comments}
            </span>
          </div>

          <span className="badge-warning px-2.5 py-0.5 rounded-full text-xs font-medium">
            FEATURED
          </span>
        </div>
      </div>
    </article>
  )
}
