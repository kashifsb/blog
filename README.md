# Blog App - Complete Blogging Platform

A modern, full-featured blogging application built with Next.js 15, Prisma, and MySQL. Features include user authentication, flexible access control for blog posts, comments, and a beautiful neomorphic UI design.

## Features

### 🔐 Authentication & User Management
- User registration and login with JWT tokens
- Secure password hashing with bcrypt
- User roles (Admin/User)

### 📝 Blog Post Management
- **Public Posts**: Accessible to anyone on the internet
- **Internal Posts**: Only visible to registered users
- **Private Posts**: Only accessible to specific users granted permission
- Rich text editor for creating posts
- Draft and published post states
- Automatic slug generation

### 💬 Interactive Features
- Comment system on published posts
- Real-time comment updates
- User avatars and profiles

### 🎨 Beautiful UI/UX
- Modern neomorphic design
- Responsive layout for all devices
- Smooth animations and transitions
- Gradient backgrounds and glass morphism effects
- Intuitive navigation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MySQL (via Prisma ORM)
- **Authentication**: JWT tokens with bcrypt
- **Deployment**: Ready for Vercel, Netlify, or any hosting platform

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd blog
npm install
```

### 2. Database Setup

#### Option A: Using Hostinger MySQL (Recommended)

1. **Get your Hostinger database credentials:**
   - Hostname: `your-domain.com` or `your-server-ip`
   - Port: `3306` (default)
   - Database name: `your_database_name`
   - Username: `your_username`
   - Password: `your_password`

2. **Create `.env` file in the root directory:**

```env
# Database Configuration
DATABASE_URL="mysql://your_username:your_password@your-domain.com:3306/your_database_name"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# NextAuth (optional, for future enhancements)
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

#### Option B: Using Local MySQL

1. Install MySQL locally
2. Create a database
3. Update the DATABASE_URL in `.env`

### 3. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) View your database in Prisma Studio
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your blog!

## Database Schema

The application uses the following database structure:

### Users Table
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: Full name
- `password`: Hashed password
- `role`: User role (ADMIN/USER)
- `createdAt`, `updatedAt`: Timestamps

### Posts Table
- `id`: Unique identifier
- `title`: Post title
- `content`: Post content
- `excerpt`: Optional excerpt
- `slug`: URL-friendly title
- `status`: DRAFT/PUBLISHED/ARCHIVED
- `accessLevel`: PUBLIC/INTERNAL/PRIVATE
- `authorId`: Reference to user
- `publishedAt`: Publication date
- `createdAt`, `updatedAt`: Timestamps

### Comments Table
- `id`: Unique identifier
- `content`: Comment text
- `postId`: Reference to post
- `authorId`: Reference to user
- `createdAt`, `updatedAt`: Timestamps

### PostAccess Table (for private posts)
- `id`: Unique identifier
- `postId`: Reference to post
- `userId`: Reference to user

## Access Control System

### Public Posts
- Visible to everyone on the internet
- No authentication required
- Can be read by anyone

### Internal Posts
- Only visible to registered users
- Requires login
- Perfect for company blogs or member-only content

### Private Posts
- Only visible to specific users
- Author can grant access to individual users
- Perfect for personal notes or confidential content

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - List posts (with access control)
- `POST /api/posts` - Create new post
- `GET /api/posts/[slug]` - Get specific post
- `PUT /api/posts/[slug]` - Update post
- `DELETE /api/posts/[slug]` - Delete post

### Comments
- `POST /api/posts/[slug]/comments` - Add comment to post

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app is compatible with any hosting platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

Make sure to set these in your production environment:

```env
DATABASE_URL="mysql://username:password@hostname:port/database"
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your database connection
3. Ensure all environment variables are set
4. Check that Prisma migrations have been run

For database connection issues, make sure:
- Your MySQL server is running
- The database exists
- Your credentials are correct
- The database user has proper permissions

---

**Built with ❤️ using Next.js, Prisma, and Tailwind CSS**
