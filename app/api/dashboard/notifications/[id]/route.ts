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

    const { isRead } = await request.json()

    await prisma.notification.update({
      where: {
        id,
        userId: user.userId // Ensure user can only update their own notifications
      },
      data: {
        isRead
      }
    })

    return NextResponse.json({ message: 'Notification updated successfully' })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 