'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function TestAuthPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status;
  const [apiResult, setApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assignments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setApiResult({
        status: response.status,
        data: result,
      });
    } catch (error) {
      setApiResult({
        status: 'error',
        data: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Authentication Test Page</h1>

      {!session ? (
        <div className="space-y-4">
          <p>You are not signed in</p>
          <button
            onClick={() => signIn()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded bg-green-50 p-4">
            <h2 className="mb-2 text-lg font-semibold">Session Info:</h2>
            <p>
              <strong>Email:</strong> {session.user?.email}
            </p>
            <p>
              <strong>Role:</strong> {(session.user as any)?.role}
            </p>
            <p>
              <strong>Tenant ID:</strong> {(session.user as any)?.tenantId}
            </p>
          </div>

          <div className="space-x-2">
            <button
              onClick={testApi}
              disabled={isLoading}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test API Call'}
            </button>

            <button
              onClick={() => signOut()}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Sign out
            </button>
          </div>

          {apiResult && (
            <div className="rounded bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold">API Result:</h3>
              <p>
                <strong>Status:</strong> {apiResult.status}
              </p>
              <pre className="mt-2 overflow-auto rounded bg-white p-2 text-sm">
                {JSON.stringify(apiResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
