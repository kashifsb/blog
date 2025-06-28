import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '../../../../lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check access permissions
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? await verifyToken(token) : null

    if (post.accessLevel === 'PRIVATE' && (!user || user.userId !== post.authorId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (post.accessLevel === 'INTERNAL' && !user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { title, excerpt, content, accessLevel, status, featured } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.authorId !== user.userId) {
      return NextResponse.json({ error: 'You can only edit your own posts' }, { status: 403 })
    }

    // Generate new slug if title changed
    const newSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if new slug already exists (excluding current post)
    if (newSlug !== slug) {
      const existingSlug = await prisma.post.findUnique({
        where: { slug: newSlug },
      })
      if (existingSlug) {
        return NextResponse.json({ error: 'A post with this title already exists' }, { status: 400 })
      }
    }

    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title,
        excerpt,
        content,
        accessLevel,
        status,
        featured,
        slug: newSlug,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.authorId !== user.userId) {
      return NextResponse.json({ error: 'You can only delete your own posts' }, { status: 403 })
    }

    // Delete comments first
    await prisma.comment.deleteMany({
      where: { postId: slug },
    })

    // Delete the post
    await prisma.post.delete({
      where: { slug },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 