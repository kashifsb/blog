"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Analytics {
  totalUsers: number
  totalPosts: number
  totalComments: number
}

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'posts' | 'analytics'>('users')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const userData = await response.json()
        if (userData.user.role !== 'ADMIN') {
          window.location.href = '/'
          return
        }
        setUser(userData.user)
        fetchData()
      } else {
        window.location.href = '/login'
      }
    } catch (err) {
      setError('Failed to authenticate')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [usersRes, postsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/posts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      const usersData = await usersRes.json()
      const postsData = await postsRes.json()
      const analyticsData = await analyticsRes.json()
      setUsers(usersData.users || [])
      setPosts(postsData.posts || [])
      setAnalytics(analyticsData.analytics || null)
    } catch (err) {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-professional rounded-3xl p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-professional rounded-3xl p-8 text-red-600 font-semibold">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="glass-professional sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setTab('users')} 
            className={`btn-professional px-6 py-2 rounded-lg font-medium transition-all ${
              tab === 'users' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900'
            }`}
          >
            Users
          </button>
          <button 
            onClick={() => setTab('posts')} 
            className={`btn-professional px-6 py-2 rounded-lg font-medium transition-all ${
              tab === 'posts' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900'
            }`}
          >
            Posts
          </button>
          <button 
            onClick={() => setTab('analytics')} 
            className={`btn-professional px-6 py-2 rounded-lg font-medium transition-all ${
              tab === 'analytics' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
        </div>
        
        {tab === 'users' && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full card-professional">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">{u.name || u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          u.role === 'ADMIN' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        
        {tab === 'posts' && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Posts</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full card-professional">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {posts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">{p.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">{p.author?.name || p.author?.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          p.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800' 
                            : p.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          p.accessLevel === 'PUBLIC' 
                            ? 'bg-blue-100 text-blue-800' 
                            : p.accessLevel === 'INTERNAL'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {p.accessLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        
        {tab === 'analytics' && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Analytics</h2>
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-professional p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{analytics?.totalUsers || 0}</div>
                  <div className="text-slate-700 font-medium">Total Users</div>
                  <div className="text-slate-500 text-sm mt-1">Active registered users</div>
                </div>
                <div className="card-professional p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-green-600 mb-2">{analytics?.totalPosts || 0}</div>
                  <div className="text-slate-700 font-medium">Total Posts</div>
                  <div className="text-slate-500 text-sm mt-1">Published content</div>
                </div>
                <div className="card-professional p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{analytics?.totalComments || 0}</div>
                  <div className="text-slate-700 font-medium">Total Comments</div>
                  <div className="text-slate-500 text-sm mt-1">User engagement</div>
                </div>
              </div>
            ) : (
              <div className="card-professional p-8 text-center">
                <div className="text-slate-600 text-lg">No analytics data available.</div>
                <div className="text-slate-500 text-sm mt-2">Data will appear once users start creating content.</div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
} 