'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  
  useEffect(() => {
    const fetchDocs = async () => {
      const response = await fetch('/api/docs');
      const data = await response.json();
      setSpec(data);
    };
    
    fetchDocs();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Dokümantasyonu</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {spec ? (
          <SwaggerUI spec={spec} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
} 