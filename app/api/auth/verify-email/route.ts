import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { sendOTPEmail } from '../../../../lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with verification token
    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: otp,
        emailVerificationExpires: expiresAt
      }
    })

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.name ?? undefined)

    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Verification email sent successfully',
      expiresIn: '10 minutes'
    })
  } catch (error) {
    console.error('Error sending verification email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })
    }

    // Check if OTP is valid and not expired
    if (user.emailVerificationToken !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // Verify email
    await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 