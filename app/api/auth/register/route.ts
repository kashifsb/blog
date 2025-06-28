import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Registration request received')
    
    // Check for required environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is missing')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is missing')
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    console.log('Environment variables check passed')

    const { email, password, name } = await request.json()
    console.log('Request data parsed:', { email, name, passwordLength: password?.length })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    console.log('Validation passed, checking for existing user')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    console.log('No existing user found, hashing password')

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    console.log('Password hashed successfully')

    console.log('Creating user in database')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    console.log('User created successfully:', user.id)
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Registration error details:', {
      name: error?.constructor?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack
    })
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please check your database configuration.' },
          { status: 500 }
        )
      }
      if (error.message.includes('bcrypt')) {
        return NextResponse.json(
          { error: 'Password encryption failed' },
          { status: 500 }
        )
      }
      if (error.message.includes('prisma')) {
        return NextResponse.json(
          { error: 'Database operation failed. Please check your database schema.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
} 