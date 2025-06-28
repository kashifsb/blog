import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { verifyToken } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
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

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get analytics data
    const [
      totalUsers,
      totalPosts,
      totalComments,
      activeUsers,
      newUsersToday,
      newPostsToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      prisma.post.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalPosts,
      totalComments,
      activeUsers,
      newUsersToday,
      newPostsToday
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 