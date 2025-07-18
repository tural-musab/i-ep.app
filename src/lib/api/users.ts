/**
 * Kullanıcı tipi
 */
export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  last_login: string | null;
  created_at?: string;
}

/**
 * Yeni kullanıcı oluşturmak için tip
 */
export interface CreateUserInput {
  full_name: string;
  email: string;
  role: string;
  phone?: string;
}

/**
 * API hata sınıfı
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Tüm kullanıcıları getir
 */
export async function fetchUsers(role?: string): Promise<User[]> {
  try {
    const url = new URL('/api/v1/users', window.location.origin);

    if (role) {
      url.searchParams.append('role', role);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error || 'Kullanıcılar getirilirken bir hata oluştu',
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Kullanıcılar getirilirken bir hata oluştu');
  }
}

/**
 * Kullanıcı oluştur
 */
export async function createUser(userData: CreateUserInput): Promise<User> {
  try {
    const response = await fetch('/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error || 'Kullanıcı oluşturulurken bir hata oluştu',
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Kullanıcı oluşturulurken bir hata oluştu');
  }
}

/**
 * Kullanıcı bilgilerini güncelle
 */
export async function updateUser(id: string, userData: Partial<CreateUserInput>): Promise<User> {
  try {
    const response = await fetch(`/api/v1/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error || 'Kullanıcı güncellenirken bir hata oluştu',
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Kullanıcı güncellenirken bir hata oluştu');
  }
}

/**
 * Kullanıcı sil
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.error || 'Kullanıcı silinirken bir hata oluştu',
        response.status
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Kullanıcı silinirken bir hata oluştu');
  }
}
