'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'pinned' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

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

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
    }
  }

  const handleTogglePin = async (noteId: string, isPinned: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPinned: !isPinned })
      })

      if (response.ok) {
        setNotes(notes.map(note => 
          note.id === noteId ? { ...note, isPinned: !isPinned } : note
        ))
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const handleToggleArchive = async (noteId: string, isArchived: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isArchived: !isArchived })
      })

      if (response.ok) {
        setNotes(notes.map(note => 
          note.id === noteId ? { ...note, isArchived: !isArchived } : note
        ))
      }
    } catch (error) {
      console.error('Error toggling archive:', error)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pinned' ? note.isPinned :
      filter === 'archived' ? note.isArchived : true

    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                ← Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">
                My Notes
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.[0] || user?.email[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-600 hidden sm:block">
                {user?.name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} className={`btn-professional px-4 py-2 rounded-lg font-medium ${viewMode === 'grid' ? '' : 'opacity-60'}`}>Grid</button>
            <button onClick={() => setViewMode('list')} className={`btn-professional px-4 py-2 rounded-lg font-medium ${viewMode === 'list' ? '' : 'opacity-60'}`}>List</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`btn-professional px-4 py-2 rounded-lg font-medium ${filter === 'all' ? '' : 'opacity-60'}`}>All</button>
            <button onClick={() => setFilter('pinned')} className={`btn-professional px-4 py-2 rounded-lg font-medium ${filter === 'pinned' ? '' : 'opacity-60'}`}>Pinned</button>
            <button onClick={() => setFilter('archived')} className={`btn-professional px-4 py-2 rounded-lg font-medium ${filter === 'archived' ? '' : 'opacity-60'}`}>Archived</button>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-professional px-4 py-2 rounded-lg text-slate-700"
            placeholder="Search notes..."
            aria-label="Search notes"
          />
          <Link href="/notes/create" className="btn-professional px-6 py-2 rounded-lg font-medium">+ New Note</Link>
        </div>
        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-professional rounded-3xl p-8 inline-block">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No notes yet</h3>
              <p className="text-slate-600 mb-6">Start by creating your first note!</p>
              <Link href="/notes/create" className="btn-professional px-6 py-3 text-white rounded-xl font-medium">
                Create Note
              </Link>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'flex flex-col gap-4'}>
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NoteCard({ 
  note, 
  viewMode, 
  onDelete, 
  onTogglePin, 
  onToggleArchive 
}: { 
  note: Note
  viewMode: 'grid' | 'list'
  onDelete: (id: string) => void
  onTogglePin: (id: string, isPinned: boolean) => void
  onToggleArchive: (id: string, isArchived: boolean) => void
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const contentPreview = stripHtml(note.content).substring(0, 100) + (stripHtml(note.content).length > 100 ? '...' : '')

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: note.color }}
              />
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {note.title}
              </h3>
              {note.isPinned && (
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              )}
            </div>
            <p className="text-slate-600 mb-3 line-clamp-2">{contentPreview}</p>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Updated {formatDate(note.updatedAt)}</span>
              {note.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  {note.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
                      {tag.tag.name}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-slate-400">+{note.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Link
              href={`/notes/${note.id}`}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Edit note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={() => onTogglePin(note.id, note.isPinned)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                note.isPinned 
                  ? 'text-yellow-600 bg-yellow-50' 
                  : 'text-slate-600 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
            <button
              onClick={() => onToggleArchive(note.id, note.isArchived)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                note.isArchived 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-slate-600 hover:text-green-600 hover:bg-green-50'
              }`}
              title={note.isArchived ? 'Unarchive note' : 'Archive note'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
    >
      {/* Color Bar */}
      <div 
        className="w-full h-2 rounded-t-xl mb-4"
        style={{ backgroundColor: note.color }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1">
          {note.title}
        </h3>
        <div className="flex items-center space-x-1 ml-2">
          {note.isPinned && (
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{contentPreview}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
              {tag.tag.name}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded-md text-xs">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Updated {formatDate(note.updatedAt)}</span>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            href={`/notes/${note.id}`}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
            title="Edit note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin(note.id, note.isPinned)
            }}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              note.isPinned 
                ? 'text-yellow-600 bg-yellow-50' 
                : 'text-slate-600 hover:text-yellow-600 hover:bg-yellow-50'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleArchive(note.id, note.isArchived)
            }}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              note.isArchived 
                ? 'text-green-600 bg-green-50' 
                : 'text-slate-600 hover:text-green-600 hover:bg-green-50'
            }`}
            title={note.isArchived ? 'Unarchive note' : 'Archive note'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
            }}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
            title="Delete note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 