'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Note {
  id: string
  title: string
  content: string
  color: string
  isPinned: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  tags: Array<{
    tag: {
      name: string
    }
  }>
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

export default function EditNotePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [isPinned, setIsPinned] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#EC4899', // Pink
  ]

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

  const fetchNote = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notes/${noteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const noteData = data.note
        
        setNote(noteData)
        setTitle(noteData.title)
        setContent(noteData.content)
        setColor(noteData.color)
        setIsPinned(noteData.isPinned)
        setIsArchived(noteData.isArchived)
      } else {
        setError('Failed to load note')
      }
    } catch (error) {
      setError('An error occurred while loading the note.')
    } finally {
      setLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user && noteId) {
      fetchNote()
    }
  }, [user, noteId, fetchNote])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          color,
          isPinned,
          isArchived
        })
      })

      if (response.ok) {
        router.push('/notes')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Failed to update note')
    } finally {
      setSaving(false)
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

  if (!user || !note) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Professional Header */}
      <header className="glass-professional sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/notes" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                ← Back to Notes
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">
                Edit Note
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
              Note Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 text-xl input-professional rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your note title..."
              required
              aria-required="true"
            />
          </div>

          {/* Color Picker Section */}
          <div className="card-professional p-8">
            <label className="block text-lg font-semibold text-slate-900 mb-4">
              Note Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                    color === colorOption 
                      ? 'border-slate-900 shadow-lg scale-110' 
                      : 'border-slate-200 hover:border-slate-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  title={`Color: ${colorOption}`}
                />
              ))}
            </div>
          </div>

          {/* Options Section */}
          <div className="card-professional p-8">
            <label className="block text-lg font-semibold text-slate-900 mb-4">
              Note Options
            </label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-slate-700 font-medium">Pin to top</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isArchived}
                  onChange={(e) => setIsArchived(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-slate-700 font-medium">Archive note</span>
              </label>
            </div>
          </div>

          {/* Content Section */}
          <div className="card-professional p-8">
            <label className="block text-lg font-semibold text-slate-900 mb-4">
              Note Content
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your note content..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-professional px-8 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 