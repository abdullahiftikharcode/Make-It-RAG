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
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      // No token found, redirect to login with return URL
      const url = new URL('/login', request.url)
      url.searchParams.set('returnUrl', path)
      return NextResponse.redirect(url)
    }

    try {
      // Add timeout to prevent hanging request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5-second timeout
      
      // Validate token with server
      const response = await fetch('http://localhost:3001/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        // Token is invalid or expired, redirect to login
        const url = new URL('/login', request.url)
        url.searchParams.set('returnUrl', path)
        return NextResponse.redirect(url)
      }

      // Token is valid, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Token validation error:', error)
      // Network error or other issues, redirect to login
      const url = new URL('/login', request.url)
      url.searchParams.set('returnUrl', path)
      return NextResponse.redirect(url)
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