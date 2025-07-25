/**
 * Assignment Error Boundary Component
 * Phase 6.1: Frontend-Backend Integration
 * Graceful error handling for Assignment Dashboard
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface AssignmentErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface AssignmentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDetails?: boolean;
}

export class AssignmentErrorBoundary extends React.Component<
  AssignmentErrorBoundaryProps,
  AssignmentErrorBoundaryState
> {
  constructor(props: AssignmentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AssignmentErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Assignment Dashboard Error:', error, errorInfo);
    this.setState({ 
      hasError: true, 
      error, 
      errorInfo 
    });

    // Log to monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          component: 'AssignmentDashboard',
          feature: 'frontend-backend-integration',
        },
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Ödev Sistemi Hatası
            </CardTitle>
            <CardDescription className="text-red-600">
              Ödev dashboard'u yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Error message for users */}
              <div className="rounded-lg bg-red-100 p-4">
                <p className="text-sm font-medium text-red-800">
                  {this.state.error?.message || 'Bilinmeyen bir hata oluştu'}
                </p>
              </div>

              {/* Technical details (development only) */}
              {this.props.showDetails && process.env.NODE_ENV === 'development' && (
                <details className="rounded-lg bg-gray-100 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Teknik Detaylar (Geliştirici Modu)
                  </summary>
                  <div className="mt-2 space-y-2 text-xs text-gray-600">
                    <div>
                      <strong>Hata:</strong> {this.state.error?.name}
                    </div>
                    <div>
                      <strong>Mesaj:</strong> {this.state.error?.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sayfayı Yenile
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'} 
                  variant="outline" 
                  size="sm"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export function AssignmentErrorBoundaryWrapper({ 
  children, 
  showDetails = false 
}: { 
  children: React.ReactNode; 
  showDetails?: boolean; 
}) {
  return (
    <AssignmentErrorBoundary showDetails={showDetails}>
      {children}
    </AssignmentErrorBoundary>
  );
}

// Hook for error recovery
export function useErrorRecovery() {
  const [retryCount, setRetryCount] = React.useState(0);

  const retry = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const reset = React.useCallback(() => {
    setRetryCount(0);
  }, []);

  return { retryCount, retry, reset };
}