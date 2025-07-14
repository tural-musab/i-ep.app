/**
 * Request ID Generator
 * Sprint 2 PF-001: Performance monitoring utilities
 */

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function parseRequestId(requestId: string): { timestamp: number; id: string } | null {
  const match = requestId.match(/^req_(\d+)_(.+)$/);
  if (!match) return null;
  
  return {
    timestamp: parseInt(match[1]),
    id: match[2]
  };
}