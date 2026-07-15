'use server';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/auth';

export async function login() {
  await nextAuthSignIn('microsoft-entra-id', { redirectTo: '/dashboard' });
}

export async function logout() {
  await nextAuthSignOut({ redirectTo: '/login' });
}

