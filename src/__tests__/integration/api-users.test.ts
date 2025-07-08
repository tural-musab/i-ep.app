import { describe, it, expect, beforeEach } from '@jest/globals';
import { fetchUsers, createUser } from '@/lib/api/users';

// fetch API'sini mock'la
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('User API Entegrasyon Testleri', () => {
  beforeEach(() => {
    mockFetch.mockClear(); // Her testten önce mock'u temizle
  });

  it('kullanıcıları başarıyla getirmelidir', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [
          { id: 1, name: 'Test User 1', email: 'test1@example.com' },
          { id: 2, name: 'Test User 2', email: 'test2@example.com' }
        ]
      })
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const users = await fetchUsers();

    expect(users).toHaveLength(2);
    expect(users[0]).toMatchObject({
      id: 1,
      name: 'Test User 1',
      email: 'test1@example.com'
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('kullanıcı oluşturma hatasını işlemeli', async () => {
    const mockErrorResponse = {
      ok: false,
      status: 400,
      json: async () => ({ error: 'Validation failed' })
    };

    mockFetch.mockResolvedValueOnce(mockErrorResponse);

    const newUser = {
      name: '',
      email: 'invalid-email'
    };

    await expect(createUser(newUser)).rejects.toThrow('Validation failed');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle response with different structure', async () => {
    const mockData: Record<string, unknown> = {
      users: [
        { id: 1, username: 'testuser' }
      ],
      total: 1
    };

    const mockResponse = {
      ok: true,
      json: async () => mockData
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await fetchUsers();
    expect(result).toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});