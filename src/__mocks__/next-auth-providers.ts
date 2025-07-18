/**
 * NextAuth Providers Mock for Jest Tests
 * Sprint 7: Test environment için NextAuth providers mock'u
 */

module.exports = {
  default: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    credentials: {},
    authorize: jest.fn(() =>
      Promise.resolve({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'super_admin',
      })
    ),
  })),

  // Named export compatibility
  CredentialsProvider: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    credentials: {},
    authorize: jest.fn(() =>
      Promise.resolve({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'super_admin',
      })
    ),
  })),
};
