import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { verifyToken } from '../../../../../lib/auth'

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

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action } = await request.json()

    let updateData: any = {}

    switch (action) {
      case 'feature':
        updateData = { featured: true }
        break
      case 'unfeature':
        updateData = { featured: false }
        break
      case 'delete':
        // Delete post and all related content
        await prisma.post.delete({
          where: { id }
        })
        return NextResponse.json({ message: 'Post deleted successfully' })
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await prisma.post.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ message: 'Post updated successfully' })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 