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
      case 'activate':
        updateData = { isActive: true }
        break
      case 'deactivate':
        updateData = { isActive: false }
        break
      case 'delete':
        // Delete user and all their content
        await prisma.user.delete({
          where: { id }
        })
        return NextResponse.json({ message: 'User deleted successfully' })
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 