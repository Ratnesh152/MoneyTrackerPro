import { login } from '@/services/auth.service';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            MoneyTracker Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your enterprise finances securely.
          </p>
        </div>
        
        <form action={login} className="mt-8 space-y-6">
          <Button type="submit" className="w-full h-12 text-lg">
            Sign in with Microsoft
          </Button>
        </form>
      </div>
    </div>
  );
}
