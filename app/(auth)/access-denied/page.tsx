import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 text-center">
        <h2 className="text-3xl font-bold text-red-600 dark:text-red-400">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You do not have the required permissions to view this application. Please contact your administrator.
        </p>
        <div className="mt-6">
          <Link href="/login">
            <Button variant="outline" className="w-full">Return to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
