import { NextResponse } from 'next/server';

// Admin routes are protected client-side via AuthContext.
// Keep a valid middleware export so Next.js can compile the file cleanly.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
