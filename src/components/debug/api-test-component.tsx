'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiGet } from '@/lib/api/api-client';

export function APITestComponent(): JSX.Element {
  const { data: session, status } = useSession();
  const [apiResult, setApiResult] = useState<any>(null);
  const [testStatus, setTestStatus] = useState('idle');

  useEffect(() => {
    console.log('=== API TEST COMPONENT MOUNTED ===');
    console.log('=== SESSION STATUS ===', status);
    console.log('=== SESSION DATA ===', session);
  }, [session, status]);

  const testAPIWithoutAuth = async () => {
    console.log('=== TESTING API WITHOUT AUTH ===');
    setTestStatus('testing-no-auth');
    try {
      const result = await apiGet('/api/assignments/statistics');
      console.log('=== API RESULT (NO AUTH) ===', result);
      setApiResult(result);
    } catch (error) {
      console.log('=== API ERROR (NO AUTH) ===', error);
      setApiResult({ error: error });
    }
    setTestStatus('completed-no-auth');
  };

  const testAPIWithAuth = async () => {
    console.log('=== TESTING API WITH AUTH ===');
    setTestStatus('testing-with-auth');
    try {
      const result = await apiGet('/api/assignments/statistics');
      console.log('=== API RESULT (WITH AUTH) ===', result);
      setApiResult(result);
    } catch (error) {
      console.log('=== API ERROR (WITH AUTH) ===', error);
      setApiResult({ error: error });
    }
    setTestStatus('completed-with-auth');
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <h3 className="mb-4 text-lg font-semibold">API Client Debug Test</h3>

      <div className="space-y-4">
        <div>
          <strong>Session Status:</strong> {status}
        </div>
        <div>
          <strong>User Email:</strong> {session?.user?.email || 'None'}
        </div>
        <div>
          <strong>User ID:</strong> {session?.user?.id || 'None'}
        </div>

        <div className="flex gap-2">
          <button
            onClick={testAPIWithoutAuth}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            disabled={testStatus.includes('testing')}
          >
            Test API (No Auth)
          </button>

          <button
            onClick={testAPIWithAuth}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            disabled={testStatus.includes('testing') || !session}
          >
            Test API (With Auth)
          </button>
        </div>

        <div>
          <strong>Test Status:</strong> {testStatus}
        </div>

        {apiResult && (
          <div>
            <strong>API Result:</strong>
            <pre className="mt-2 overflow-auto rounded border bg-white p-2 text-xs">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
