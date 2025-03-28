import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/chat',
  '/history',
  '/connections',
  '/settings'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute) {
    // Get token from localStorage (Note: localStorage is not available in middleware)
    // We'll need to pass it in a cookie instead
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      // No token found, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Validate token with server
      const response = await fetch('http://localhost:3001/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // Token is invalid or expired, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Token is valid, allow access
      return NextResponse.next()
    } catch (error) {
      // Network error or other issues, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // For non-protected routes, allow access
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/history/:path*',
    '/connections/:path*',
    '/settings/:path*'
  ]
} 