/**
 * NextAuth Mock for Jest Tests
 * Sprint 7: Test environment için NextAuth mock'u
 */

module.exports = {
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'super_admin'
    },
    expires: '2025-01-01T00:00:00.000Z'
  })),
  
  authOptions: {
    providers: [],
    callbacks: {
      session: jest.fn(),
      jwt: jest.fn()
    }
  },

  // NextAuth.js default exports
  default: jest.fn(),
  
  // JWT token functions
  getToken: jest.fn(() => Promise.resolve({
    sub: 'test-user-id',
    email: 'test@example.com',
    role: 'super_admin'
  })),

  // Session functions
  unstable_getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'super_admin'
    }
  }))
}; 