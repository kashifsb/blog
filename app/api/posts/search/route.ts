import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { verifyToken } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get user from token if available
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = token ? await verifyToken(token) : null

    if (!query.trim()) {
      return NextResponse.json({ posts: [], total: 0, page, limit })
    }

    // Build where clause based on user authentication
    let whereClause: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    }

    // Filter by access level based on user authentication
    if (user) {
      // Logged in users can see PUBLIC, INTERNAL, and their own PRIVATE posts
      whereClause.AND = [
        {
          OR: [
            { accessLevel: 'PUBLIC' },
            { accessLevel: 'INTERNAL' },
            { authorId: user.userId },
          ],
        },
      ]
    } else {
      // Non-logged in users can only see PUBLIC posts
      whereClause.AND = [{ accessLevel: 'PUBLIC' }]
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({
        where: whereClause,
      }),
    ])

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 