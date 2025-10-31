import NextAuth from 'next-auth';
import { authConfig } from './app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Match all paths except for API routes, static files, image optimization files, and the login page.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};

