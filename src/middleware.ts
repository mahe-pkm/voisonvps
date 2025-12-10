import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // Custom logic if needed
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/auth/login",
        }
    }
)

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/invoices/:path*",
        // Exclude public routes like /bill/:path*, /api/auth/:path*
        // Matcher is whitelist or blacklist logic. 
        // Here we explicitly match protected routes.
        // Public routes are implicitly allowed because they don't match.
    ],
}
