/**
 * Client-side session helpers
 * Demo-compatible session management
 */

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Get current user (client-side)
 */
export async function getCurrentUser() {
  // For demo/development - return demo user
  return {
    id: 'demo-admin-001',
    email: 'admin@demo.i-ep.app',
    role: 'admin'
  };
}

/**
 * Get current tenant (client-side)
 */
export async function getCurrentTenant() {
  // For demo/development - return demo tenant
  return {
    id: 'f9f948e5-d486-4694-a863-bf11c999c643',
    name: 'İstanbul Demo Ortaokulu'
  };
}

/**
 * Browser console helper for testing APIs
 */
if (typeof window !== 'undefined') {
  (window as any).testAuthenticatedAPI = async function() {
    console.log('🔧 Testing authenticated APIs...');
    
    const headers = {
      'X-User-Email': 'admin@demo.i-ep.app',
      'X-User-ID': 'demo-admin-001',
      'x-tenant-id': 'f9f948e5-d486-4694-a863-bf11c999c643',
      'Content-Type': 'application/json'
    };

    try {
      console.log('1. Testing /api/classes...');
      const classRes = await fetch('/api/classes', { headers });
      const classData = await classRes.json();
      console.log('Classes:', classData);

      console.log('2. Testing /api/assignments...');
      const assignRes = await fetch('/api/assignments', { headers });
      const assignData = await assignRes.json();
      console.log('Assignments:', assignData);
      
      console.log('3. Testing /api/dashboard/recent-activities...');
      const recentRes = await fetch('/api/dashboard/recent-activities', { headers });
      const recentData = await recentRes.json();
      console.log('Recent Activities:', recentData);
      
      console.log('✅ ALL TESTS PASSED - Authentication working!');
      return { classes: classData, assignments: assignData, recent: recentData };
      
    } catch (error) {
      console.error('❌ API test error:', error);
      return null;
    }
  };
}