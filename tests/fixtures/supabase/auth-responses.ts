export const supabaseAuthFixtures = {
  // Başarılı giriş response'u
  signInSuccess: {
    user: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      aud: "authenticated",
      role: "authenticated",
      email: "test@example.com",
      email_confirmed_at: "2024-01-15T10:30:00.000Z",
      phone: "",
      confirmed_at: "2024-01-15T10:30:00.000Z",
      last_sign_in_at: "2024-01-15T10:30:00.000Z",
      app_metadata: {
        provider: "email",
        providers: ["email"]
      },
      user_metadata: {
        tenant_id: "tenant-123",
        role: "admin",
        name: "Test Kullanıcısı"
      },
      identities: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          user_id: "550e8400-e29b-41d4-a716-446655440000",
          identity_data: {
            email: "test@example.com",
            sub: "550e8400-e29b-41d4-a716-446655440000"
          },
          provider: "email",
          last_sign_in_at: "2024-01-15T10:30:00.000Z",
          created_at: "2024-01-15T10:30:00.000Z",
          updated_at: "2024-01-15T10:30:00.000Z"
        }
      ],
      created_at: "2024-01-15T10:30:00.000Z",
      updated_at: "2024-01-15T10:30:00.000Z"
    },
    session: {
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzA1MzE0NjAwLCJpYXQiOjE3MDUzMTEwMDAsImlzcyI6Imh0dHBzOi8vdGVzdC5zdXBhYmFzZS5jbyIsInN1YiI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwifSwidXNlcl9tZXRhZGF0YSI6eyJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtMTIzIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.test-jwt-signature",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: 1705314600,
      refresh_token: "test-refresh-token",
      user: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        aud: "authenticated",
        role: "authenticated",
        email: "test@example.com",
        email_confirmed_at: "2024-01-15T10:30:00.000Z",
        app_metadata: {
          provider: "email",
          providers: ["email"]
        },
        user_metadata: {
          tenant_id: "tenant-123",
          role: "admin",
          name: "Test Kullanıcısı"
        },
        created_at: "2024-01-15T10:30:00.000Z",
        updated_at: "2024-01-15T10:30:00.000Z"
      }
    }
  },

  // Giriş hatası response'u - yanlış şifre
  signInErrorInvalidCredentials: {
    user: null,
    session: null,
    error: {
      name: "AuthApiError",
      message: "Invalid login credentials",
      status: 400
    }
  },

  // Başarılı kayıt response'u
  signUpSuccess: {
    user: {
      id: "660e8400-e29b-41d4-a716-446655440001",
      aud: "authenticated",
      role: "authenticated",
      email: "newuser@example.com",
      email_confirmed_at: null,
      phone: "",
      confirmed_at: null,
      last_sign_in_at: null,
      app_metadata: {
        provider: "email",
        providers: ["email"]
      },
      user_metadata: {
        tenant_id: "tenant-123",
        role: "student",
        name: "Yeni Kullanıcı"
      },
      identities: [
        {
          id: "660e8400-e29b-41d4-a716-446655440001",
          user_id: "660e8400-e29b-41d4-a716-446655440001",
          identity_data: {
            email: "newuser@example.com",
            sub: "660e8400-e29b-41d4-a716-446655440001"
          },
          provider: "email",
          last_sign_in_at: null,
          created_at: "2024-01-15T10:35:00.000Z",
          updated_at: "2024-01-15T10:35:00.000Z"
        }
      ],
      created_at: "2024-01-15T10:35:00.000Z",
      updated_at: "2024-01-15T10:35:00.000Z"
    },
    session: null // E-posta onayı beklendiği için session null
  },

  // Kayıt hatası - e-posta zaten kullanımda
  signUpErrorEmailExists: {
    user: null,
    session: null,
    error: {
      name: "AuthApiError",
      message: "User already registered",
      status: 422
    }
  },

  // Şifre sıfırlama başarılı
  resetPasswordSuccess: {
    data: {},
    error: null
  },

  // Şifre sıfırlama hatası - e-posta bulunamadı
  resetPasswordErrorEmailNotFound: {
    data: {},
    error: {
      name: "AuthApiError",
      message: "User not found",
      status: 400
    }
  },

  // Mevcut oturum bilgisi alma başarılı
  getSessionSuccess: {
    data: {
      session: {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzA1MzE0NjAwLCJpYXQiOjE3MDUzMTEwMDAsImlzcyI6Imh0dHBzOi8vdGVzdC5zdXBhYmFzZS5jbyIsInN1YiI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwifSwidXNlcl9tZXRhZGF0YSI6eyJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtMTIzIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.test-jwt-signature",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: 1705314600,
        refresh_token: "test-refresh-token",
        user: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          aud: "authenticated",
          role: "authenticated",
          email: "test@example.com",
          email_confirmed_at: "2024-01-15T10:30:00.000Z",
          user_metadata: {
            tenant_id: "tenant-123",
            role: "admin",
            name: "Test Kullanıcısı"
          }
        }
      }
    },
    error: null
  },

  // Oturum yok
  getSessionEmpty: {
    data: {
      session: null
    },
    error: null
  },

  // Çıkış başarılı
  signOutSuccess: {
    error: null
  }
};

export const supabaseDbFixtures = {
  // Kullanıcı profil bilgisi alma başarılı
  getUserProfileSuccess: {
    data: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        auth_id: "550e8400-e29b-41d4-a716-446655440000",
        email: "test@example.com",
        first_name: "Test",
        last_name: "Kullanıcısı",
        name: "Test Kullanıcısı",
        role: "admin",
        status: "active",
        is_active: true,
        tenant_id: "tenant-123",
        avatar_url: null,
        created_at: "2024-01-15T10:30:00.000Z",
        updated_at: "2024-01-15T10:30:00.000Z",
        last_login_at: "2024-01-15T10:30:00.000Z"
      }
    ],
    error: null,
    count: 1,
    status: 200,
    statusText: "OK"
  },

  // Kullanıcı bulunamadı
  getUserProfileNotFound: {
    data: null,
    error: {
      message: "The result contains 0 rows",
      details: "",
      hint: "",
      code: "PGRST116"
    },
    count: null,
    status: 406,
    statusText: "Not Acceptable"
  },

  // Tenant bilgisi alma başarılı
  getTenantSuccess: {
    data: [
      {
        id: "tenant-123",
        name: "Test Okulu",
        subdomain: "test-okulu",
        domain: "test-okulu.i-ep.app",
        custom_domain: null,
        is_active: true,
        status: "active",
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-15T10:30:00.000Z"
      }
    ],
    error: null,
    count: 1,
    status: 200,
    statusText: "OK"
  },

  // Tenant bulunamadı
  getTenantNotFound: {
    data: [],
    error: null,
    count: 0,
    status: 200,
    statusText: "OK"
  }
};

export const supabaseApiEndpoints = {
  auth: {
    signIn: "https://test.supabase.co/auth/v1/token?grant_type=password",
    signUp: "https://test.supabase.co/auth/v1/signup",
    signOut: "https://test.supabase.co/auth/v1/logout",
    resetPassword: "https://test.supabase.co/auth/v1/recover",
    getSession: "https://test.supabase.co/auth/v1/user"
  },
  rest: {
    users: "https://test.supabase.co/rest/v1/users",
    tenants: "https://test.supabase.co/rest/v1/tenants"
  }
}; 