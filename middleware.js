// Admin routes are protected client-side via AuthContext
// This middleware is intentionally minimal
export const config = {
  matcher: ['/admin/:path*'],
};
