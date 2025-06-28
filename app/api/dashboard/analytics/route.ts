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

    // Get user's analytics data
    const [
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      followers,
      following
    ] = await Promise.all([
      prisma.post.count({
        where: { authorId: user.userId }
      }),
      prisma.postAnalytics.aggregate({
        where: { userId: user.userId },
        _sum: { views: true }
      }),
      prisma.like.count({
        where: {
          post: {
            authorId: user.userId
          }
        }
      }),
      prisma.comment.count({
        where: {
          post: {
            authorId: user.userId
          }
        }
      }),
      prisma.follow.count({
        where: { followingId: user.userId }
      }),
      prisma.follow.count({
        where: { followerId: user.userId }
      })
    ])

    return NextResponse.json({
      totalPosts,
      totalViews: totalViews._sum.views || 0,
      totalLikes,
      totalComments,
      followers,
      following
    })
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 