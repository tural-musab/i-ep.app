/**
 * Assignment Management Dashboard - Server Side Page
 * Phase 6.1 - Component-level API Integration  
 * İ-EP.APP - Server Authentication + Client Component Integration
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import AssignmentDashboard from '@/components/dashboard/assignments/AssignmentDashboard';

export default async function AssignmentsPage() {
  // Server-side authentication check
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/giris');
  }

  // Pass authenticated state to client component
  return <AssignmentDashboard />;
}
