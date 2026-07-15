import { auth } from '@/auth';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  // @ts-expect-error - Auth.js proxy signature mismatch with Next.js 16
  return auth(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
