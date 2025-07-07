import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { fetchUsers, createUser } from '@/lib/api/users';

// fetch API'sini mock'la
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('User API Entegrasyon Testleri', () => {
  beforeEach(() => {
    mockFetch.mockClear(); // Her testten önce mock'u temizle
  });

  it('fetchUsers kullanıcıları başarıyla getirmelidir', async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        {
          id: '1',
          full_name: 'Ahmet Yılmaz',
          email: 'ahmet@example.com',
          role: 'admin',
          avatar_url: null,
          last_login: '2023-03-15T10:30:00Z'
        },
        {
          id: '2',
          full_name: 'Ayşe Demir',
          email: 'ayse@example.com',
          role: 'teacher',
          avatar_url: null,
          last_login: '2023-03-14T15:45:00Z'
        }
      ]),
    });

    // Act
    const users = await fetchUsers();
    
    // Assert
    expect(users).toHaveLength(2);
    expect(users[0].full_name).toBe('Ahmet Yılmaz');
    expect(users[1].role).toBe('teacher');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost/api/v1/users');
  });
  
  it('createUser yeni bir kullanıcı oluşturmalıdır', async () => {
    // Arrange
    const newUser = {
      full_name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      role: 'parent'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '3',
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        created_at: new Date().toISOString()
      }),
      status: 201,
    });
    
    // Act
    const createdUser = await createUser(newUser);
    
    // Assert
    expect(createdUser).toHaveProperty('id', '3');
    expect(createdUser.full_name).toBe('Mehmet Kaya');
    expect(createdUser.role).toBe('parent');
    expect(createdUser).toHaveProperty('created_at');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
  });
  
  it('createUser eksik bilgilerle hata döndürmelidir', async () => {
    // Arrange
    const invalidUser = {
      full_name: 'Eksik Bilgi',
      // email eksik
      role: 'student'
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Eksik bilgiler. İsim, e-posta ve rol gereklidir' }),
      status: 400,
    });
    
    // Act & Assert
    await expect(createUser(invalidUser as any)).rejects.toThrow(
      'Eksik bilgiler. İsim, e-posta ve rol gereklidir'
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
  
  it('fetchUsers sunucu hatası durumunda hata fırlatmalıdır', async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Sunucu hatası' }),
      status: 500,
    });
    
    // Act & Assert
    await expect(fetchUsers()).rejects.toThrow('Sunucu hatası');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});