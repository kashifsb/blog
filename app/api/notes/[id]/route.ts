import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { verifyToken } from '../../../../lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const note = await prisma.note.findFirst({
      where: {
        id,
        authorId: user.userId
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, color, isPinned, isArchived } = await request.json()

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        authorId: user.userId
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const updateData: {
      title?: string
      content?: string
      color?: string
      isPinned?: boolean
      isArchived?: boolean
    } = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (color !== undefined) updateData.color = color
    if (isPinned !== undefined) updateData.isPinned = isPinned
    if (isArchived !== undefined) updateData.isArchived = isArchived

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        authorId: user.userId
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    await prisma.note.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 