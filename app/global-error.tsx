'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(_error);
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <h2 className="text-2xl font-bold">Fatal Application Error</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
