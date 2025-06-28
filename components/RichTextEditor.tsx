'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import CodeBlock from '@tiptap/extension-code-block'
import Placeholder from '@tiptap/extension-placeholder'
import { useState } from 'react'
import type { Editor } from '@tiptap/react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)

  if (!editor) {
    return null
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageInput(false)
    }
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-4 rounded-t-xl">
      <div className="flex flex-wrap gap-1 items-center">
        {/* Text Formatting */}
        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('bold') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Bold (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('italic') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Italic (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('underline') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Underline (Ctrl+U)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('highlight') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Highlight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300 mx-2"></div>

        {/* Headings */}
        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-2 rounded-md transition-all duration-200 font-semibold ${
              editor.isActive('heading', { level: 1 }) 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-2 rounded-md transition-all duration-200 font-semibold ${
              editor.isActive('heading', { level: 2 }) 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Heading 2"
          >
            H2
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-2 rounded-md transition-all duration-200 font-semibold ${
              editor.isActive('heading', { level: 3 }) 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300 mx-2"></div>

        {/* Lists */}
        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('bulletList') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('orderedList') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Ordered List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300 mx-2"></div>

        {/* Alignment */}
        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive({ textAlign: 'left' }) 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive({ textAlign: 'center' }) 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h12M4 18h8" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive({ textAlign: 'right' }) 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h8M4 14h12M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300 mx-2"></div>

        {/* Code */}
        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('code') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Inline Code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('codeBlock') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Code Block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300 mx-2"></div>

        {/* Links and Images */}
        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setShowLinkInput(true)}
            className={`p-2 rounded-md transition-all duration-200 ${
              editor.isActive('link') 
                ? 'bg-blue-100 text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Add Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          <button
            onClick={() => setShowImageInput(true)}
            className="p-2 rounded-md transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            title="Add Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-300 mx-2"></div>

        {/* Clear Formatting */}
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded-md transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 bg-white/80 backdrop-blur-sm shadow-sm"
          title="Clear Formatting"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image Input Modal */}
      {showImageInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 w-96 shadow-2xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Add Image</h3>
              <button
                onClick={() => setShowImageInput(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="url"
              placeholder="Enter image URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-md shadow-sm transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && addImage()}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowImageInput(false)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addImage}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 w-96 shadow-2xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Add Link</h3>
              <button
                onClick={() => setShowLinkInput(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="url"
              placeholder="Enter URL (https://...)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-md shadow-sm transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && setLink()}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLinkInput(false)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={setLink}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RichTextEditor({ content, onChange, placeholder = "Start writing your content..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 px-1 rounded',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-slate-100 rounded-lg p-4 font-mono text-sm',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose prose-slate max-w-none p-6 min-h-[400px] focus:outline-none
          prose-headings:text-slate-900 prose-headings:font-semibold
          prose-p:text-slate-700 prose-p:leading-relaxed
          prose-strong:text-slate-900 prose-strong:font-semibold
          prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-slate-100 prose-pre:border prose-pre:border-slate-200
          prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:italic
          prose-ul:list-disc prose-ol:list-decimal
          prose-li:text-slate-700
          prose-a:text-blue-600 prose-a:no-underline prose-a:font-medium
          prose-img:rounded-lg prose-img:shadow-md
          [&_.is-editor-empty]:text-slate-400 [&_.is-editor-empty]:italic"
      />
    </div>
  )
} 