import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { fetchUsers, createUser } from '@/lib/api/users';

// Mock sunucu kurulumu
const server = setupServer(
  // GET /api/v1/users endpoint'i için mock
  rest.get('/api/v1/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
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
      ])
    );
  }),
  
  // POST /api/v1/users endpoint'i için mock
  rest.post('/api/v1/users', async (req, res, ctx) => {
    const body = await req.json();
    
    if (!body.full_name || !body.email || !body.role) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Eksik bilgiler. İsim, e-posta ve rol gereklidir' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: '3',
        full_name: body.full_name,
        email: body.email,
        role: body.role,
        created_at: new Date().toISOString()
      })
    );
  })
);

// Test başlamadan önce mock sunucuyu başlat
beforeEach(() => server.listen());

// Her testten sonra işleyicileri sıfırla
afterEach(() => server.resetHandlers());

// Tüm testler tamamlandıktan sonra sunucuyu kapat
afterEach(() => server.close());

describe('User API Entegrasyon Testleri', () => {
  it('fetchUsers kullanıcıları başarıyla getirmelidir', async () => {
    // Act
    const users = await fetchUsers();
    
    // Assert
    expect(users).toHaveLength(2);
    expect(users[0].full_name).toBe('Ahmet Yılmaz');
    expect(users[1].role).toBe('teacher');
  });
  
  it('createUser yeni bir kullanıcı oluşturmalıdır', async () => {
    // Arrange
    const newUser = {
      full_name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      role: 'parent'
    };
    
    // Act
    const createdUser = await createUser(newUser);
    
    // Assert
    expect(createdUser).toHaveProperty('id', '3');
    expect(createdUser.full_name).toBe('Mehmet Kaya');
    expect(createdUser.role).toBe('parent');
    expect(createdUser).toHaveProperty('created_at');
  });
  
  it('createUser eksik bilgilerle hata döndürmelidir', async () => {
    // Arrange
    const invalidUser = {
      full_name: 'Eksik Bilgi',
      // email eksik
      role: 'student'
    };
    
    // Act & Assert
    await expect(createUser(invalidUser as any)).rejects.toThrow(
      'Eksik bilgiler. İsim, e-posta ve rol gereklidir'
    );
  });
  
  it('fetchUsers sunucu hatası durumunda hata fırlatmalıdır', async () => {
    // Arrange - Sunucu hatasını simüle et
    server.use(
      rest.get('/api/v1/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Sunucu hatası' }));
      })
    );
    
    // Act & Assert
    await expect(fetchUsers()).rejects.toThrow('Kullanıcılar getirilirken bir hata oluştu');
  });
}); 