# İ-EP.APP API Entegrasyon Rehberi

> **Kapsamlı Entegrasyon Rehberi**
>
> İ-EP.APP API'leri ile entegrasyon için adım adım rehber
>
> **Hedef Kitle**: Frontend ve Backend geliştiricileri  
> **Güncelleme**: 24 Temmuz 2025

## 📋 İçindekiler

1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Kimlik Doğrulama Kurulumu](#kimlik-doğrulama-kurulumu)
3. [API İstemci Oluşturma](#api-istemci-oluşturma)
4. [Ödev Sistemine Entegrasyon](#ödev-sistemine-entegrasyon)
5. [Devam Takibi Entegrasyonu](#devam-takibi-entegrasyonu)
6. [Not Yönetimi Entegrasyonu](#not-yönetimi-entegrasyonu)
7. [Dosya Yönetimi Entegrasyonu](#dosya-yönetimi-entegrasyonu)
8. [Hata Yönetimi](#hata-yönetimi)
9. [Test Stratejileri](#test-stratejileri)
10. [Production Dağıtımı](#production-dağıtımı)

---

## 🚀 Hızlı Başlangıç

### 1. Temel Gereksinimler

```bash
# Node.js tabanlı projeler için
npm install axios zod
# veya
yarn add axios zod

# Python projeleri için
pip install requests pydantic

# PHP projeleri için
composer require guzzlehttp/guzzle
```

### 2. Temel Yapılandırma

```typescript
// config/api.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID || 'localhost-tenant',
  timeout: 30000,
  retries: 3,
};

export const API_ENDPOINTS = {
  assignments: '/assignments',
  attendance: '/attendance',
  grades: '/grades',
  classes: '/classes',
  storage: '/storage',
  dashboard: '/dashboard',
  health: '/health',
} as const;
```

### 3. İlk API Çağrısı

```typescript
// Basit API çağrısı örneği
async function testConnection() {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      headers: {
        'x-tenant-id': 'localhost-tenant',
        'X-User-Email': 'admin@demo.local',
        'X-User-ID': 'demo-admin-001',
      },
    });

    const data = await response.json();
    console.log('API Connection:', data.status); // "healthy"
    return data;
  } catch (error) {
    console.error('API Connection failed:', error);
    throw error;
  }
}
```

---

## 🔐 Kimlik Doğrulama Kurulumu

### NextAuth.js ile Kimlik Doğrulama

```typescript
// lib/auth/api-client.ts
import { getSession } from 'next-auth/react';

export class AuthenticatedApiClient {
  private baseURL: string;
  private tenantId: string;

  constructor(baseURL: string, tenantId: string) {
    this.baseURL = baseURL;
    this.tenantId = tenantId;
  }

  private async getAuthHeaders() {
    const session = await getSession();

    if (!session?.user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    return {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
      'X-User-Email': session.user.email!,
      'X-User-ID': session.user.id,
      // Authorization header'ı gelecekte token tabanlı auth için
      ...(session.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error, response.status, error.details);
    }

    return response.json();
  }
}

// Hata sınıfı
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Token Tabanlı Kimlik Doğrulama

```typescript
// Token yönetimi
export class TokenManager {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = Date.now() + expiresIn * 1000;

    // LocalStorage'a kaydet
    localStorage.setItem('iep_access_token', accessToken);
    localStorage.setItem('iep_refresh_token', refreshToken);
    localStorage.setItem('iep_expires_at', this.expiresAt.toString());
  }

  async getValidToken(): Promise<string | null> {
    // Token süresi dolmuş mu kontrol et
    if (this.expiresAt && Date.now() > this.expiresAt) {
      await this.refreshAccessToken();
    }

    return this.token;
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('Refresh token bulunamadı');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken, data.expiresIn);
    } catch (error) {
      // Refresh başarısız, kullanıcıyı login sayfasına yönlendir
      this.clearTokens();
      window.location.href = '/auth/giris';
      throw error;
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;
    localStorage.removeItem('iep_access_token');
    localStorage.removeItem('iep_refresh_token');
    localStorage.removeItem('iep_expires_at');
  }
}
```

---

## 🏗️ API İstemci Oluşturma

### TypeScript ile Güçlü Tip Desteği

```typescript
// types/api.ts
import { z } from 'zod';

// API yanıt tipleri
export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']),
  subject: z.string(),
  class_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  due_date: z.string().datetime(),
  max_score: z.number(),
  status: z.enum(['draft', 'published', 'completed', 'archived']),
  tenant_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const AssignmentListResponseSchema = z.object({
  data: z.array(AssignmentSchema),
  pagination: PaginationSchema,
});

// Tip çıkarımları
export type Assignment = z.infer<typeof AssignmentSchema>;
export type AssignmentListResponse = z.infer<typeof AssignmentListResponseSchema>;
export type CreateAssignmentData = Omit<
  Assignment,
  'id' | 'tenant_id' | 'created_at' | 'updated_at'
>;
```

### Ana API İstemci Sınıfı

```typescript
// lib/api/client.ts
import { AuthenticatedApiClient, ApiError } from './auth-client';
import {
  Assignment,
  AssignmentListResponse,
  CreateAssignmentData,
  AssignmentListResponseSchema,
  AssignmentSchema,
} from '../types/api';

export class IEpApiClient extends AuthenticatedApiClient {
  // ========================================
  // ASSIGNMENTS (ÖDEVLER)
  // ========================================

  async getAssignments(
    params: {
      page?: number;
      limit?: number;
      class_id?: string;
      teacher_id?: string;
      type?: string;
      status?: string;
      subject?: string;
      search?: string;
    } = {}
  ): Promise<AssignmentListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await this.request<unknown>(`/assignments?${searchParams.toString()}`);

    // Runtime validation
    return AssignmentListResponseSchema.parse(response);
  }

  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    const response = await this.request<unknown>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return AssignmentSchema.parse(response);
  }

  async getAssignment(id: string): Promise<Assignment> {
    const response = await this.request<unknown>(`/assignments/${id}`);
    return AssignmentSchema.parse(response);
  }

  async updateAssignment(id: string, data: Partial<CreateAssignmentData>): Promise<Assignment> {
    const response = await this.request<unknown>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return AssignmentSchema.parse(response);
  }

  async deleteAssignment(id: string): Promise<void> {
    await this.request(`/assignments/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // ATTENDANCE (DEVAMSIZLIK)
  // ========================================

  async getAttendance(
    params: {
      studentId?: string;
      classId?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/attendance?${searchParams.toString()}`);
  }

  async createAttendance(data: {
    studentId: string;
    classId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'sick';
    timeIn?: string;
    timeOut?: string;
    notes?: string;
    excuseReason?: string;
  }) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createBulkAttendance(data: {
    classId: string;
    date: string;
    attendance: Array<{
      studentId: string;
      status: 'present' | 'absent' | 'late' | 'excused' | 'sick';
      timeIn?: string;
      notes?: string;
      excuseReason?: string;
    }>;
  }) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========================================
  // GRADES (NOTLAR)
  // ========================================

  async getGrades(
    params: {
      studentId?: string;
      classId?: string;
      subjectId?: string;
      gradeType?: string;
      semester?: number;
      academicYear?: string;
      includeCalculations?: boolean;
      includeComments?: boolean;
    } = {}
  ) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/grades?${searchParams.toString()}`);
  }

  async createGrade(data: {
    studentId: string;
    classId: string;
    subjectId: string;
    gradeType: 'exam' | 'homework' | 'project' | 'participation' | 'quiz' | 'midterm' | 'final';
    gradeValue: number;
    maxGrade: number;
    semester: 1 | 2;
    academicYear: string;
    examName?: string;
    description?: string;
  }) {
    return this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========================================
  // STORAGE (DOSYA YÖNETİMİ)
  // ========================================

  async uploadFile(
    file: File,
    type: 'assignment' | 'profile' | 'document' | 'image',
    options: {
      assignmentId?: string;
      isPublic?: boolean;
    } = {}
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    if (options.assignmentId) {
      formData.append('assignment_id', options.assignmentId);
    }

    if (options.isPublic !== undefined) {
      formData.append('public', options.isPublic.toString());
    }

    const headers = await this.getAuthHeaders();
    delete headers['Content-Type']; // FormData için otomatik ayarlanır

    const response = await fetch(`${this.baseURL}/storage/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error, response.status, error.details);
    }

    return response.json();
  }

  async getUploadConfig() {
    return this.request('/storage/upload');
  }

  // ========================================
  // DASHBOARD
  // ========================================

  async getRecentActivities(limit: number = 10) {
    return this.request(`/dashboard/recent-activities?limit=${limit}`);
  }

  // ========================================
  // SYSTEM
  // ========================================

  async getHealthStatus() {
    return this.request('/health');
  }
}

// Singleton instance
let apiClientInstance: IEpApiClient | null = null;

export function getApiClient(): IEpApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new IEpApiClient(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      process.env.NEXT_PUBLIC_TENANT_ID || 'localhost-tenant'
    );
  }
  return apiClientInstance;
}
```

---

## 📚 Ödev Sistemine Entegrasyon

### React Hook'ları ile Ödev Yönetimi

```typescript
// hooks/useAssignments.ts
import { useState, useEffect, useCallback } from 'react';
import { getApiClient } from '../lib/api/client';
import type { Assignment, AssignmentListResponse } from '../types/api';

interface UseAssignmentsProps {
  classId?: string;
  teacherId?: string;
  status?: string;
  autoRefresh?: boolean;
}

export function useAssignments({
  classId,
  teacherId,
  status,
  autoRefresh = false,
}: UseAssignmentsProps = {}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const api = getApiClient();

  const fetchAssignments = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.getAssignments({
          page,
          limit: pagination.limit,
          class_id: classId,
          teacher_id: teacherId,
          status,
        });

        setAssignments(response.data);
        setPagination(response.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ödevler yüklenemedi';
        setError(errorMessage);
        console.error('Assignment fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [classId, teacherId, status, pagination.limit]
  );

  // İlk yükleme
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Otomatik yenileme
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAssignments(pagination.page);
    }, 30000); // 30 saniyede bir

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAssignments, pagination.page]);

  const createAssignment = async (data: CreateAssignmentData) => {
    try {
      const newAssignment = await api.createAssignment(data);
      setAssignments((prev) => [newAssignment, ...prev]);
      return { success: true, data: newAssignment };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ödev oluşturulamadı';
      return { success: false, error: errorMessage };
    }
  };

  const updateAssignment = async (id: string, data: Partial<CreateAssignmentData>) => {
    try {
      const updatedAssignment = await api.updateAssignment(id, data);
      setAssignments((prev) =>
        prev.map((assignment) => (assignment.id === id ? updatedAssignment : assignment))
      );
      return { success: true, data: updatedAssignment };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ödev güncellenemedi';
      return { success: false, error: errorMessage };
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await api.deleteAssignment(id);
      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ödev silinemedi';
      return { success: false, error: errorMessage };
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchAssignments(page);
    }
  };

  const refresh = () => {
    fetchAssignments(pagination.page);
  };

  return {
    assignments,
    loading,
    error,
    pagination,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    goToPage,
    refresh,
  };
}
```

### Ödev Oluşturma Komponenti

```typescript
// components/assignments/CreateAssignmentForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAssignments } from '../../hooks/useAssignments';

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Ödev başlığı gerekli').max(255, 'Başlık çok uzun'),
  description: z.string().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']),
  subject: z.string().min(1, 'Ders adı gerekli'),
  class_id: z.string().uuid('Geçersiz sınıf seçimi'),
  due_date: z.string().min(1, 'Teslim tarihi gerekli'),
  max_score: z.number().min(1, 'Maksimum puan en az 1 olmalı').max(1000, 'Maksimum puan çok yüksek'),
  instructions: z.string().optional()
});

type FormData = z.infer<typeof CreateAssignmentSchema>;

export function CreateAssignmentForm({
  onSuccess,
  onCancel
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const { createAssignment } = useAssignments();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(CreateAssignmentSchema)
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      const result = await createAssignment({
        ...data,
        teacher_id: 'current-user-id', // Mevcut kullanıcı ID'si
        due_date: new Date(data.due_date).toISOString()
      });

      if (result.success) {
        reset();
        onSuccess?.();
        alert('Ödev başarıyla oluşturuldu!');
      } else {
        alert(`Hata: ${result.error}`);
      }
    } catch (error) {
      alert('Beklenmeyen bir hata oluştu');
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Ödev Başlığı */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ödev Başlığı *
        </label>
        <input
          type="text"
          {...register('title')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Örn: Matematik - Kesirler Konusu"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Açıklama
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Ödev hakkında detaylı bilgi..."
        />
      </div>

      {/* Ödev Türü */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ödev Türü *
        </label>
        <select
          {...register('type')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Seçiniz</option>
          <option value="homework">Ev Ödevi</option>
          <option value="exam">Sınav</option>
          <option value="project">Proje</option>
          <option value="quiz">Quiz</option>
          <option value="presentation">Sunum</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Ders */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ders *
        </label>
        <input
          type="text"
          {...register('subject')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Örn: Matematik, Türkçe, Fen Bilgisi"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Sınıf Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sınıf *
        </label>
        <select
          {...register('class_id')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Sınıf seçiniz</option>
          <option value="class-5a">5/A</option>
          <option value="class-5b">5/B</option>
          {/* Dinamik sınıf listesi için API'den çekilebilir */}
        </select>
        {errors.class_id && (
          <p className="mt-1 text-sm text-red-600">{errors.class_id.message}</p>
        )}
      </div>

      {/* Teslim Tarihi */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Teslim Tarihi *
        </label>
        <input
          type="datetime-local"
          {...register('due_date')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
        {errors.due_date && (
          <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
        )}
      </div>

      {/* Maksimum Puan */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Maksimum Puan *
        </label>
        <input
          type="number"
          {...register('max_score', { valueAsNumber: true })}
          min="1"
          max="1000"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="100"
        />
        {errors.max_score && (
          <p className="mt-1 text-sm text-red-600">{errors.max_score.message}</p>
        )}
      </div>

      {/* Talimatlar */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ödev Talimatları
        </label>
        <textarea
          {...register('instructions')}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Öğrenciler için detaylı talimatlar..."
        />
      </div>

      {/* Butonlar */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={submitting}
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Oluşturuluyor...' : 'Ödev Oluştur'}
        </button>
      </div>
    </form>
  );
}
```

### Ödev Listesi Komponenti

```typescript
// components/assignments/AssignmentList.tsx
import React from 'react';
import { useAssignments } from '../../hooks/useAssignments';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export function AssignmentList({
  classId,
  teacherId,
  status = 'published'
}: {
  classId?: string;
  teacherId?: string;
  status?: string;
}) {
  const {
    assignments,
    loading,
    error,
    pagination,
    goToPage,
    refresh
  } = useAssignments({ classId, teacherId, status });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Ödevler yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Ödevler yüklenemedi
            </h3>
            <div className="text-sm text-red-700 mt-1">
              {error}
            </div>
            <button
              onClick={refresh}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Tekrar dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Ödev bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500">Bu kriterlere uygun ödev bulunmuyor.</p>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      homework: 'Ev Ödevi',
      exam: 'Sınav',
      project: 'Proje',
      quiz: 'Quiz',
      presentation: 'Sunum'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800'
    };

    const labels = {
      draft: 'Taslak',
      published: 'Yayınlandı',
      completed: 'Tamamlandı',
      archived: 'Arşivlendi'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Liste */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {assignments.map((assignment) => (
            <li key={assignment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {assignment.title}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="mr-2">{assignment.subject}</span>
                      <span className="mr-2">•</span>
                      <span className="mr-2">{getTypeLabel(assignment.type)}</span>
                      <span className="mr-2">•</span>
                      <span>Puan: {assignment.max_score}</span>
                    </div>
                    {assignment.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Teslim: {formatDistanceToNow(new Date(assignment.due_date), {
                      addSuffix: true,
                      locale: tr
                    })}
                  </div>
                  <div>
                    Oluşturulma: {formatDistanceToNow(new Date(assignment.created_at), {
                      addSuffix: true,
                      locale: tr
                    })}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Sayfalama */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}arası, toplam{' '}
                <span className="font-medium">{pagination.total}</span> ödev
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Önceki
                </button>

                {/* Sayfa numaraları */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 👥 Devam Takibi Entegrasyonu

### Devam Kaydı Hook'u

```typescript
// hooks/useAttendance.ts
import { useState, useCallback } from 'react';
import { getApiClient } from '../lib/api/client';

export function useAttendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = getApiClient();

  const getAttendanceRecords = useCallback(
    async (params: {
      studentId?: string;
      classId?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getAttendance(params);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Devam kayıtları alınamadı';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const markSingleAttendance = async (data: {
    studentId: string;
    classId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'sick';
    timeIn?: string;
    notes?: string;
    excuseReason?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createAttendance(data);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Devam kaydı oluşturulamadı';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const markBulkAttendance = async (data: {
    classId: string;
    date: string;
    attendance: Array<{
      studentId: string;
      status: 'present' | 'absent' | 'late' | 'excused' | 'sick';
      timeIn?: string;
      notes?: string;
      excuseReason?: string;
    }>;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createBulkAttendance(data);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Toplu devam kaydı oluşturulamadı';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAttendanceRecords,
    markSingleAttendance,
    markBulkAttendance,
  };
}
```

### Toplu Devam Kaydı Komponenti

```typescript
// components/attendance/BulkAttendanceForm.tsx
import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../hooks/useAttendance';

interface Student {
  id: string;
  name: string;
  studentNumber: string;
}

interface AttendanceFormData {
  [studentId: string]: {
    status: 'present' | 'absent' | 'late' | 'excused' | 'sick';
    timeIn?: string;
    notes?: string;
    excuseReason?: string;
  };
}

export function BulkAttendanceForm({
  classId,
  date,
  students,
  onSuccess
}: {
  classId: string;
  date: string;
  students: Student[];
  onSuccess?: () => void;
}) {
  const { markBulkAttendance, loading } = useAttendance();
  const [formData, setFormData] = useState<AttendanceFormData>({});

  // Varsayılan olarak tüm öğrencileri "present" olarak işaretle
  useEffect(() => {
    const initialData: AttendanceFormData = {};
    students.forEach(student => {
      initialData[student.id] = {
        status: 'present',
        timeIn: '08:30'
      };
    });
    setFormData(initialData);
  }, [students]);

  const updateStudentAttendance = (
    studentId: string,
    field: keyof AttendanceFormData[string],
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const attendanceData = Object.entries(formData).map(([studentId, data]) => ({
      studentId,
      ...data
    }));

    const result = await markBulkAttendance({
      classId,
      date,
      attendance: attendanceData
    });

    if (result.success) {
      alert(`${attendanceData.length} öğrenci için devam kaydı oluşturuldu!`);
      onSuccess?.();
    } else {
      alert(`Hata: ${result.error}`);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      present: 'Mevcut',
      absent: 'Devamsız',
      late: 'Geç',
      excused: 'Mazeretli',
      sick: 'Hasta'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      present: 'text-green-600 bg-green-50',
      absent: 'text-red-600 bg-red-50',
      late: 'text-yellow-600 bg-yellow-50',
      excused: 'text-blue-600 bg-blue-50',
      sick: 'text-purple-600 bg-purple-50'
    };
    return colors[status as keyof typeof colors] || colors.present;
  };

  // Hızlı işlemler
  const markAllAs = (status: 'present' | 'absent' | 'late' | 'excused' | 'sick') => {
    const updatedData: AttendanceFormData = {};
    students.forEach(student => {
      updatedData[student.id] = {
        ...formData[student.id],
        status,
        timeIn: status === 'present' ? '08:30' : '',
        notes: '',
        excuseReason: status === 'excused' || status === 'sick' ? '' : undefined
      };
    });
    setFormData(updatedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Başlık ve hızlı işlemler */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Devam Kaydı - {new Date(date).toLocaleDateString('tr-TR')}
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => markAllAs('present')}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            Hepsini Mevcut Yap
          </button>
          <button
            type="button"
            onClick={() => markAllAs('absent')}
            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Hepsini Devamsız Yap
          </button>
        </div>
      </div>

      {/* Öğrenci listesi */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {students.map((student) => (
            <li key={student.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Öğrenci bilgisi */}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {student.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    No: {student.studentNumber}
                  </p>
                </div>

                {/* Devam durumu */}
                <div className="flex items-center space-x-4">
                  <select
                    value={formData[student.id]?.status || 'present'}
                    onChange={(e) => updateStudentAttendance(
                      student.id,
                      'status',
                      e.target.value
                    )}
                    className={`text-sm border-0 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 ${
                      getStatusColor(formData[student.id]?.status || 'present')
                    }`}
                  >
                    <option value="present">Mevcut</option>
                    <option value="absent">Devamsız</option>
                    <option value="late">Geç</option>
                    <option value="excused">Mazeretli</option>
                    <option value="sick">Hasta</option>
                  </select>

                  {/* Giriş saati (mevcut/geç için) */}
                  {(['present', 'late'].includes(formData[student.id]?.status)) && (
                    <input
                      type="time"
                      value={formData[student.id]?.timeIn || '08:30'}
                      onChange={(e) => updateStudentAttendance(
                        student.id,
                        'timeIn',
                        e.target.value
                      )}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  )}

                  {/* Mazeret nedeni (mazeretli/hasta için) */}
                  {(['excused', 'sick'].includes(formData[student.id]?.status)) && (
                    <input
                      type="text"
                      placeholder="Mazeret nedeni"
                      value={formData[student.id]?.excuseReason || ''}
                      onChange={(e) => updateStudentAttendance(
                        student.id,
                        'excuseReason',
                        e.target.value
                      )}
                      className="text-sm border border-gray-300 rounded px-2 py-1 w-32"
                    />
                  )}

                  {/* Notlar */}
                  <input
                    type="text"
                    placeholder="Not"
                    value={formData[student.id]?.notes || ''}
                    onChange={(e) => updateStudentAttendance(
                      student.id,
                      'notes',
                      e.target.value
                    )}
                    className="text-sm border border-gray-300 rounded px-2 py-1 w-24"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Kaydet butonu */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Devam Kaydını Kaydet'}
        </button>
      </div>
    </form>
  );
}
```

---

## 📊 Not Yönetimi Entegrasyonu

### Not Girişi Hook'u

```typescript
// hooks/useGrades.ts
import { useState, useCallback } from 'react';
import { getApiClient } from '../lib/api/client';

export function useGrades() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = getApiClient();

  const getGrades = useCallback(
    async (params: {
      studentId?: string;
      classId?: string;
      subjectId?: string;
      gradeType?: string;
      semester?: number;
      academicYear?: string;
      includeCalculations?: boolean;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getGrades(params);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Notlar alınamadı';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const createGrade = async (data: {
    studentId: string;
    classId: string;
    subjectId: string;
    gradeType: 'exam' | 'homework' | 'project' | 'participation' | 'quiz' | 'midterm' | 'final';
    gradeValue: number;
    maxGrade: number;
    semester: 1 | 2;
    academicYear: string;
    examName?: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createGrade(data);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Not girişi yapılamadı';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Türk eğitim sistemi not hesaplamaları
  const calculateLetterGrade = (percentage: number): string => {
    if (percentage >= 85) return 'AA';
    if (percentage >= 70) return 'BA';
    if (percentage >= 60) return 'BB';
    if (percentage >= 50) return 'CB';
    if (percentage >= 40) return 'CC';
    if (percentage >= 30) return 'DC';
    if (percentage >= 20) return 'DD';
    return 'FF';
  };

  const calculateGPA = (
    grades: Array<{ gradeValue: number; maxGrade: number; weight: number }>
  ): number => {
    const weightedSum = grades.reduce((sum, grade) => {
      const percentage = (grade.gradeValue / grade.maxGrade) * 100;
      const points = getGradePoints(percentage);
      return sum + points * grade.weight;
    }, 0);

    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const getGradePoints = (percentage: number): number => {
    if (percentage >= 85) return 4.0;
    if (percentage >= 70) return 3.5;
    if (percentage >= 60) return 3.0;
    if (percentage >= 50) return 2.5;
    if (percentage >= 40) return 2.0;
    if (percentage >= 30) return 1.5;
    if (percentage >= 20) return 1.0;
    return 0.0;
  };

  return {
    loading,
    error,
    getGrades,
    createGrade,
    calculateLetterGrade,
    calculateGPA,
    getGradePoints,
  };
}
```

### Not Girişi Formu

```typescript
// components/grades/GradeEntryForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGrades } from '../../hooks/useGrades';

const GradeEntrySchema = z.object({
  studentId: z.string().uuid('Geçersiz öğrenci seçimi'),
  classId: z.string().uuid('Geçersiz sınıf seçimi'),
  subjectId: z.string().uuid('Geçersiz ders seçimi'),
  gradeType: z.enum(['exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final']),
  gradeValue: z.number().min(0, 'Not 0\'dan küçük olamaz'),
  maxGrade: z.number().min(1, 'Maksimum not en az 1 olmalı'),
  semester: z.number().int().min(1).max(2),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Akademik yıl YYYY-YYYY formatında olmalı'),
  examName: z.string().optional(),
  description: z.string().optional()
});

type FormData = z.infer<typeof GradeEntrySchema>;

export function GradeEntryForm({
  onSuccess,
  onCancel,
  defaultValues
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: Partial<FormData>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const { createGrade, calculateLetterGrade, getGradePoints } = useGrades();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(GradeEntrySchema),
    defaultValues: {
      maxGrade: 100,
      semester: 1,
      academicYear: '2024-2025',
      ...defaultValues
    }
  });

  const gradeValue = watch('gradeValue');
  const maxGrade = watch('maxGrade') || 100;

  // Hesaplamalar
  const percentage = gradeValue ? (gradeValue / maxGrade) * 100 : 0;
  const letterGrade = calculateLetterGrade(percentage);
  const gradePoints = getGradePoints(percentage);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      const result = await createGrade(data);

      if (result.success) {
        reset();
        onSuccess?.();
        alert('Not başarıyla girildi!');
      } else {
        alert(`Hata: ${result.error}`);
      }
    } catch (error) {
      alert('Beklenmeyen bir hata oluştu');
      console.error('Grade entry error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const gradeTypeLabels = {
    exam: 'Sınav',
    homework: 'Ödev',
    project: 'Proje',
    participation: 'Katılım',
    quiz: 'Quiz',
    midterm: 'Ara Sınav',
    final: 'Final'
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Başlık */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Not Girişi</h3>
        <p className="text-sm text-gray-600">Öğrenci için yeni not girişi yapın</p>
      </div>

      {/* Öğrenci Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Öğrenci *
        </label>
        <select
          {...register('studentId')}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Öğrenci seçiniz</option>
          {/* Dinamik öğrenci listesi */}
          <option value="student-001">Ahmet YILMAZ</option>
          <option value="student-002">Ayşe KAYA</option>
        </select>
        {errors.studentId && (
          <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
        )}
      </div>

      {/* Sınıf ve Ders */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sınıf *
          </label>
          <select
            {...register('classId')}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Sınıf seçiniz</option>
            <option value="class-5a">5/A</option>
            <option value="class-5b">5/B</option>
          </select>
          {errors.classId && (
            <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ders *
          </label>
          <select
            {...register('subjectId')}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Ders seçiniz</option>
            <option value="subject-turkish">Türkçe</option>
            <option value="subject-math">Matematik</option>
            <option value="subject-science">Fen Bilgisi</option>
          </select>
          {errors.subjectId && (
            <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
          )}
        </div>
      </div>

      {/* Not Türü ve Sınav Adı */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Not Türü *
          </label>
          <select
            {...register('gradeType')}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Not türü seçiniz</option>
            {Object.entries(gradeTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.gradeType && (
            <p className="mt-1 text-sm text-red-600">{errors.gradeType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sınav/Ödev Adı
          </label>
          <input
            type="text"
            {...register('examName')}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Örn: 1. Yazılı, Proje Ödevi"
          />
        </div>
      </div>

      {/* Not Değeri ve Maksimum Not */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Alınan Not *
          </label>
          <input
            type="number"
            {...register('gradeValue', { valueAsNumber: true })}
            min="0"
            step="0.5"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="85"
          />
          {errors.gradeValue && (
            <p className="mt-1 text-sm text-red-600">{errors.gradeValue.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maksimum Not *
          </label>
          <input
            type="number"
            {...register('maxGrade', { valueAsNumber: true })}
            min="1"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="100"
          />
          {errors.maxGrade && (
            <p className="mt-1 text-sm text-red-600">{errors.maxGrade.message}</p>
          )}
        </div>
      </div>

      {/* Dönem ve Akademik Yıl */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dönem *
          </label>
          <select
            {...register('semester', { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value={1}>1. Dönem</option>
            <option value={2}>2. Dönem</option>
          </select>
          {errors.semester && (
            <p className="mt-1 text-sm text-red-600">{errors.semester.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Akademik Yıl *
          </label>
          <input
            type="text"
            {...register('academicYear')}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="2024-2025"
          />
          {errors.academicYear && (
            <p className="mt-1 text-sm text-red-600">{errors.academicYear.message}</p>
          )}
        </div>
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Açıklama
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Not hakkında ek bilgiler..."
        />
      </div>

      {/* Not Hesaplamaları */}
      {gradeValue && maxGrade && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Not Hesaplamaları</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Yüzde:</span>
              <span className="ml-2 font-medium">{percentage.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Harf Notu:</span>
              <span className={`ml-2 font-medium ${
                letterGrade === 'FF' ? 'text-red-600' :
                letterGrade.startsWith('A') ? 'text-green-600' :
                'text-blue-600'
              }`}>
                {letterGrade}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Not Puanı:</span>
              <span className="ml-2 font-medium">{gradePoints.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={submitting}
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Kaydediliyor...' : 'Notu Kaydet'}
        </button>
      </div>
    </form>
  );
}
```

---

## 📁 Dosya Yönetimi Entegrasyonu

### Dosya Yükleme Hook'u

```typescript
// hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { getApiClient } from '../lib/api/client';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const api = getApiClient();

  const uploadFile = useCallback(
    async (
      file: File,
      type: 'assignment' | 'profile' | 'document' | 'image',
      options: {
        assignmentId?: string;
        isPublic?: boolean;
        onProgress?: (progress: number) => void;
      } = {}
    ) => {
      try {
        setUploading(true);
        setError(null);
        setUploadProgress(0);

        // Dosya boyutu kontrolü
        const maxSizes = {
          assignment: 50 * 1024 * 1024, // 50MB
          profile: 5 * 1024 * 1024, // 5MB
          document: 100 * 1024 * 1024, // 100MB
          image: 10 * 1024 * 1024, // 10MB
        };

        if (file.size > maxSizes[type]) {
          throw new Error(`Dosya boyutu ${type} için izin verilen maksimum boyutu aşıyor`);
        }

        // MIME type kontrolü
        const allowedTypes = {
          assignment: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
          ],
          profile: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          document: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
          ],
          image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        };

        if (!allowedTypes[type].includes(file.type)) {
          throw new Error(`${file.type} dosya türü ${type} için desteklenmiyor`);
        }

        // Progress simulation (gerçek XMLHttpRequest ile progress tracking)
        const simulateProgress = () => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 90) progress = 90;
            setUploadProgress(progress);
            options.onProgress?.(progress);
          }, 200);

          return interval;
        };

        const progressInterval = simulateProgress();

        try {
          const response = await api.uploadFile(file, type, {
            assignmentId: options.assignmentId,
            isPublic: options.isPublic,
          });

          setUploadProgress(100);
          options.onProgress?.(100);
          clearInterval(progressInterval);

          return { success: true, data: response.file };
        } catch (uploadError) {
          clearInterval(progressInterval);
          throw uploadError;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Dosya yüklenemedi';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setUploading(false);
      }
    },
    [api]
  );

  const getUploadConfig = useCallback(async () => {
    try {
      const config = await api.getUploadConfig();
      return config;
    } catch (err) {
      console.error('Upload config fetch error:', err);
      return null;
    }
  }, [api]);

  return {
    uploading,
    uploadProgress,
    error,
    uploadFile,
    getUploadConfig,
  };
}
```

### Drag & Drop Dosya Yükleme Komponenti

```typescript
// components/files/FileUploadDropzone.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from '../../hooks/useFileUpload';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  mimeType: string;
}

export function FileUploadDropzone({
  type = 'assignment',
  assignmentId,
  multiple = true,
  onUploadSuccess,
  onUploadError
}: {
  type?: 'assignment' | 'profile' | 'document' | 'image';
  assignmentId?: string;
  multiple?: boolean;
  onUploadSuccess?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
}) {
  const { uploadFile, uploading, uploadProgress, error } = useFileUpload();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentUploads, setCurrentUploads] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadPromises = acceptedFiles.map(async (file) => {
      // Upload durumunu güncelle
      setCurrentUploads(prev => [...prev, file.name]);

      try {
        const result = await uploadFile(file, type, {
          assignmentId,
          onProgress: (progress) => {
            // İndividüel dosya progress'i burada handle edilebilir
          }
        });

        if (result.success) {
          const uploadedFile: UploadedFile = {
            id: result.data.id,
            name: result.data.name,
            size: result.data.size,
            url: result.data.url,
            mimeType: result.data.mimeType
          };

          setUploadedFiles(prev => [...prev, uploadedFile]);
          return uploadedFile;
        } else {
          onUploadError?.(result.error || 'Dosya yüklenemedi');
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Dosya yüklenemedi';
        onUploadError?.(errorMessage);
        return null;
      } finally {
        // Upload durumunu temizle
        setCurrentUploads(prev => prev.filter(name => name !== file.name));
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as UploadedFile[];

    if (successfulUploads.length > 0) {
      onUploadSuccess?.(successfulUploads);
    }
  }, [uploadFile, type, assignmentId, onUploadSuccess, onUploadError]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    rejectedFiles
  } = useDropzone({
    onDrop,
    multiple,
    accept: getAcceptedFileTypes(type),
    maxSize: getMaxFileSize(type)
  });

  const getAcceptedFileTypes = (fileType: string) => {
    const types = {
      assignment: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      },
      profile: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp']
      },
      document: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt']
      },
      image: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp']
      }
    };
    return types[fileType as keyof typeof types] || types.assignment;
  };

  const getMaxFileSize = (fileType: string) => {
    const sizes = {
      assignment: 50 * 1024 * 1024, // 50MB
      profile: 5 * 1024 * 1024,     // 5MB
      document: 100 * 1024 * 1024,  // 100MB
      image: 10 * 1024 * 1024       // 10MB
    };
    return sizes[fileType as keyof typeof sizes] || sizes.assignment;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📈';
    return '📁';
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragAccept ? 'border-green-400 bg-green-50' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${isDragActive && !isDragAccept && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
          ${!isDragActive ? 'border-gray-300 hover:border-gray-400' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-2">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
          </svg>

          {isDragActive ? (
            <p className="text-sm text-gray-600">
              Dosyaları buraya bırakın...
            </p>
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                Dosyaları buraya sürükleyin veya{' '}
                <span className="text-blue-600 underline">seçmek için tıklayın</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maksimum: {formatFileSize(getMaxFileSize(type))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Yükleme durumu */}
      {currentUploads.length > 0 && (
        <div className="space-y-2">
          {currentUploads.map((fileName) => (
            <div key={fileName} className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">{fileName}</span>
                <span className="text-sm text-blue-600">{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yüklenen dosyalar */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Yüklenen Dosyalar</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                  <div>
                    <p className="text-sm font-medium text-green-900">{file.name}</p>
                    <p className="text-xs text-green-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Görüntüle
                  </a>
                  <button
                    onClick={() => {
                      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reddedilen dosyalar */}
      {rejectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-900 mb-2">Reddedilen Dosyalar</h4>
          <div className="space-y-2">
            {rejectedFiles.map((file) => (
              <div key={file.file.name} className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm font-medium text-red-900">{file.file.name}</p>
                <ul className="text-xs text-red-600 mt-1">
                  {file.errors.map((error) => (
                    <li key={error.code}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genel hata */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ Hata Yönetimi

### Merkezi Hata Yönetimi

```typescript
// lib/error-handler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: any, statusCode: number): ApiError {
    return new ApiError(
      response.error || 'Bilinmeyen hata',
      statusCode,
      response.code,
      response.details
    );
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Ağ bağlantısı hatası') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public validationCode?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Hata tiplerini kontrol eden yardımcı fonksiyonlar
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

// Hata mesajlarını kullanıcı dostu hale getir
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    switch (error.statusCode) {
      case 400:
        return 'Gönderilen veriler geçersiz. Lütfen kontrol ediniz.';
      case 401:
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapınız.';
      case 403:
        return 'Bu işlem için yetkiniz bulunmuyor.';
      case 404:
        return 'Aranan kayıt bulunamadı.';
      case 409:
        return 'Bu kayıt zaten mevcut.';
      case 422:
        return 'Gönderilen veriler doğrulama kurallarını karşılamıyor.';
      case 500:
        return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.';
      default:
        return error.message;
    }
  }

  if (isNetworkError(error)) {
    return 'İnternet bağlantınızı kontrol ediniz.';
  }

  if (isValidationError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Beklenmeyen bir hata oluştu.';
};

// Hata loglama
export const logError = (error: unknown, context?: string) => {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // Development ortamında console'a yaz
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorInfo);
  }

  // Production'da error tracking servisi (Sentry, LogRocket, vb.) kullan
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: errorInfo });
  }
};
```

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, `ErrorBoundary: ${errorInfo.componentStack}`);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Bir hata oluştu
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    Beklenmeyen bir hata ile karşılaştık. Sayfayı yenilemeyi deneyebilir
                    veya daha sonra tekrar ziyaret edebilirsiniz.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Tekrar Dene
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sayfayı Yenile
                  </button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-gray-500">
                      Hata detayları (sadece geliştirme ortamı)
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap bg-red-50 p-2 rounded">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Kullanım
export function App() {
  return (
    <ErrorBoundary>
      <div>
        {/* Uygulama içeriği */}
      </div>
    </ErrorBoundary>
  );
}
```

---

## 🧪 Test Stratejileri

### API Client Testleri

```typescript
// __tests__/api-client.test.ts
import { IEpApiClient } from '../lib/api/client';
import { ApiError } from '../lib/error-handler';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('IEpApiClient', () => {
  let client: IEpApiClient;

  beforeEach(() => {
    client = new IEpApiClient('http://localhost:3000/api', 'test-tenant');
    mockFetch.mockClear();
  });

  describe('getAssignments', () => {
    it('should fetch assignments successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 'assignment-1',
            title: 'Test Assignment',
            type: 'homework',
            subject: 'Math',
            class_id: 'class-1',
            teacher_id: 'teacher-1',
            due_date: '2025-07-30T23:59:59Z',
            max_score: 100,
            status: 'published',
            tenant_id: 'test-tenant',
            created_at: '2025-07-24T10:00:00Z',
            updated_at: '2025-07-24T10:00:00Z',
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.getAssignments();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/assignments?',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-tenant-id': 'test-tenant',
          }),
        })
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Assignment');
    });

    it('should handle API errors', async () => {
      const mockErrorResponse = {
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      } as Response);

      await expect(client.getAssignments()).rejects.toThrow(ApiError);
    });

    it('should filter assignments by parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], pagination: {} }),
      } as Response);

      await client.getAssignments({
        class_id: 'class-5a',
        status: 'published',
        type: 'homework',
      });

      const expectedUrl =
        'http://localhost:3000/api/assignments?class_id=class-5a&status=published&type=homework';
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
    });
  });

  describe('createAssignment', () => {
    it('should create assignment successfully', async () => {
      const assignmentData = {
        title: 'New Assignment',
        type: 'homework' as const,
        subject: 'Math',
        class_id: 'class-5a',
        teacher_id: 'teacher-1',
        due_date: '2025-07-30T23:59:59Z',
        max_score: 100,
      };

      const mockResponse = {
        id: 'assignment-new',
        ...assignmentData,
        status: 'draft',
        tenant_id: 'test-tenant',
        created_at: '2025-07-24T10:00:00Z',
        updated_at: '2025-07-24T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.createAssignment(assignmentData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/assignments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(assignmentData),
        })
      );

      expect(result.title).toBe('New Assignment');
      expect(result.status).toBe('draft');
    });
  });
});
```

### Hook Testleri

```typescript
// __tests__/useAssignments.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAssignments } from '../hooks/useAssignments';
import { getApiClient } from '../lib/api/client';

// Mock API client
jest.mock('../lib/api/client');
const mockApiClient = getApiClient as jest.MockedFunction<typeof getApiClient>;

describe('useAssignments', () => {
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      getAssignments: jest.fn(),
      createAssignment: jest.fn(),
      updateAssignment: jest.fn(),
      deleteAssignment: jest.fn(),
    };
    mockApiClient.mockReturnValue(mockApi);
  });

  it('should fetch assignments on mount', async () => {
    const mockAssignments = {
      data: [
        { id: '1', title: 'Assignment 1' },
        { id: '2', title: 'Assignment 2' },
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    mockApi.getAssignments.mockResolvedValue(mockAssignments);

    const { result } = renderHook(() => useAssignments());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.assignments).toHaveLength(2);
    expect(result.current.assignments[0].title).toBe('Assignment 1');
  });

  it('should handle create assignment', async () => {
    const newAssignment = {
      id: '3',
      title: 'New Assignment',
      type: 'homework',
      subject: 'Math',
      class_id: 'class-5a',
      teacher_id: 'teacher-1',
      due_date: '2025-07-30T23:59:59Z',
      max_score: 100,
      status: 'draft',
      tenant_id: 'test-tenant',
      created_at: '2025-07-24T10:00:00Z',
      updated_at: '2025-07-24T10:00:00Z',
    };

    mockApi.getAssignments.mockResolvedValue({ data: [], pagination: {} });
    mockApi.createAssignment.mockResolvedValue(newAssignment);

    const { result } = renderHook(() => useAssignments());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    let createResult: any;
    await act(async () => {
      createResult = await result.current.createAssignment({
        title: 'New Assignment',
        type: 'homework',
        subject: 'Math',
        class_id: 'class-5a',
        teacher_id: 'teacher-1',
        due_date: '2025-07-30T23:59:59Z',
        max_score: 100,
      });
    });

    expect(createResult.success).toBe(true);
    expect(result.current.assignments).toHaveLength(1);
    expect(result.current.assignments[0].title).toBe('New Assignment');
  });

  it('should handle API errors', async () => {
    mockApi.getAssignments.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAssignments());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.loading).toBe(false);
    expect(result.current.assignments).toHaveLength(0);
  });
});
```

### Integration Testleri

```typescript
// __tests__/integration/assignment-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssignmentList } from '../components/assignments/AssignmentList';
import { CreateAssignmentForm } from '../components/assignments/CreateAssignmentForm';

// Mock API
jest.mock('../lib/api/client');

describe('Assignment Flow Integration', () => {
  beforeEach(() => {
    // Setup API mocks
  });

  it('should complete full assignment creation flow', async () => {
    render(<CreateAssignmentForm onSuccess={jest.fn()} />);

    // Form doldurma
    fireEvent.change(screen.getByLabelText(/Ödev Başlığı/), {
      target: { value: 'Test Assignment' }
    });

    fireEvent.change(screen.getByLabelText(/Ders/), {
      target: { value: 'Mathematics' }
    });

    fireEvent.change(screen.getByLabelText(/Ödev Türü/), {
      target: { value: 'homework' }
    });

    // Form gönderme
    fireEvent.click(screen.getByText('Ödev Oluştur'));

    // Başarı mesajı bekleme
    await waitFor(() => {
      expect(screen.getByText(/başarıyla oluşturuldu/)).toBeInTheDocument();
    });
  });

  it('should display validation errors', async () => {
    render(<CreateAssignmentForm onSuccess={jest.fn()} />);

    // Boş form gönderme
    fireEvent.click(screen.getByText('Ödev Oluştur'));

    // Validation hatalarını bekleme
    await waitFor(() => {
      expect(screen.getByText(/Ödev başlığı gerekli/)).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Production Dağıtımı

### Environment Konfigürasyonu

```typescript
// config/environment.ts
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
  },

  // Authentication
  auth: {
    sessionTimeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '1800000'), // 30 min
    refreshTokenThreshold: parseInt(process.env.NEXT_PUBLIC_REFRESH_THRESHOLD || '300000'), // 5 min
    maxLoginAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || '5'),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '52428800'), // 50MB
    allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_TYPES?.split(',') || [
      'application/pdf',
      'application/msword',
      'image/jpeg',
      'image/png',
    ],
  },

  // Feature Flags
  features: {
    realTimeNotifications: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
    advancedAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    filePreview: process.env.NEXT_PUBLIC_ENABLE_FILE_PREVIEW === 'true',
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  },
};

// Environment validation
const requiredEnvVars = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_TENANT_ID'];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

### Production API Client

```typescript
// lib/api/production-client.ts
import { config } from '../config/environment';
import { IEpApiClient } from './client';

class ProductionApiClient extends IEpApiClient {
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  constructor() {
    super(config.api.baseUrl, config.api.tenantId!);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    for (let attempt = 0; attempt <= config.api.retries; attempt++) {
      try {
        // Circuit breaker pattern
        if (this.isCircuitOpen()) {
          throw new Error('Circuit breaker is open');
        }

        const response = await this.requestWithTimeout(endpoint, options);
        this.recordSuccess();
        return response;
      } catch (error) {
        this.recordFailure();

        if (attempt === config.api.retries) {
          throw error;
        }

        // Retry with exponential backoff
        await this.delay(this.retryDelays[attempt] || 4000);
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async requestWithTimeout<T>(endpoint: string, options: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
      const response = await super.request<T>(endpoint, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Circuit breaker implementation
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minute

  private isCircuitOpen(): boolean {
    if (this.failureCount >= this.failureThreshold) {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        return true;
      } else {
        // Reset circuit breaker
        this.failureCount = 0;
      }
    }
    return false;
  }

  private recordSuccess(): void {
    this.failureCount = 0;
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let productionClient: ProductionApiClient | null = null;

export function getProductionApiClient(): ProductionApiClient {
  if (!productionClient) {
    productionClient = new ProductionApiClient();
  }
  return productionClient;
}
```

### Monitoring ve Performance

```typescript
// lib/monitoring/performance.ts
import { config } from '../config/environment';

interface PerformanceMetrics {
  apiResponseTime: number;
  componentRenderTime: number;
  pageLoadTime: number;
  errorRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    apiResponseTime: 0,
    componentRenderTime: 0,
    pageLoadTime: 0,
    errorRate: 0
  };

  // API performance tracking
  trackApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();

    return apiCall()
      .then(result => {
        const duration = performance.now() - startTime;
        this.recordApiResponse(duration);
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        this.recordApiResponse(duration, true);
        throw error;
      });
  }

  // Component render tracking
  trackComponentRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const duration = performance.now() - startTime;

    this.recordComponentRender(componentName, duration);
  }

  // Page load tracking
  trackPageLoad(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        this.recordPageLoad(loadTime);
      });
    }
  }

  private recordApiResponse(duration: number, isError = false): void {
    this.metrics.apiResponseTime = (this.metrics.apiResponseTime + duration) / 2;

    if (isError) {
      this.metrics.errorRate = Math.min(this.metrics.errorRate + 0.1, 1);
    } else {
      this.metrics.errorRate = Math.max(this.metrics.errorRate - 0.01, 0);
    }

    // Send to monitoring service
    if (config.monitoring.enablePerformanceMonitoring) {
      this.sendMetrics({
        type: 'api_response',
        duration,
        isError,
        timestamp: Date.now()
      });
    }
  }

  private recordComponentRender(componentName: string, duration: number): void {
    this.metrics.componentRenderTime = (this.metrics.componentRenderTime + duration) / 2;

    // Log slow renders
    if (duration > 16) { // 60fps threshold
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }

  private recordPageLoad(duration: number): void {
    this.metrics.pageLoadTime = duration;

    if (config.monitoring.enablePerformanceMonitoring) {
      this.sendMetrics({
        type: 'page_load',
        duration,
        timestamp: Date.now()
      });
    }
  }

  private sendMetrics(data: any): void {
    // Send to your monitoring service (DataDog, New Relic, etc.)
    if (config.monitoring.sentryDsn) {
      // Sentry performance tracking
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// HOC for component performance tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const [renderTime, setRenderTime] = React.useState(0);

    React.useEffect(() => {
      const startTime = performance.now();
      return () => {
        const duration = performance.now() - startTime;
        setRenderTime(duration);
        performanceMonitor.trackComponentRender(componentName, () => {});
      };
    });

    return <Component {...props} />;
  };
}
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Builder
FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Build with production optimizations
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${API_URL}
      - NEXT_PUBLIC_TENANT_ID=${TENANT_ID}
      - NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
    restart: unless-stopped
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

---

## 📋 Özet

Bu entegrasyon rehberi, İ-EP.APP API'leri ile kapsamlı entegrasyon için gereken tüm bilgileri içermektedir:

### ✅ Tamamlanan Konular

1. **Hızlı Başlangıç** - Temel kurulum ve ilk API çağrısı
2. **Kimlik Doğrulama** - NextAuth.js ve token tabanlı auth
3. **API İstemci** - TypeScript ile güçlü tip desteği
4. **Ödev Sistemi** - CRUD işlemleri ve React hooks
5. **Devam Takibi** - Toplu kayıt ve durum yönetimi
6. **Not Yönetimi** - Türk eğitim sistemi desteği
7. **Dosya Yönetimi** - Drag & drop upload sistemi
8. **Hata Yönetimi** - Merkezi hata yönetimi ve Error Boundary
9. **Test Stratejileri** - Unit, integration ve E2E testler
10. **Production Dağıtımı** - Monitoring, performance, Docker

### 🎯 Pratik Örnekler

- ✅ Gerçek API endpoint'leri ile örnekler
- ✅ TypeScript tip güvenliği
- ✅ React hooks entegrasyonu
- ✅ Hata yönetimi ve fallback'ler
- ✅ Performance optimizasyonları
- ✅ Production-ready kod örnekleri

### 🚀 Sonraki Adımlar

1. **Gerçek Proje Entegrasyonu** - Bu rehberdeki örnekleri kendi projenize adapte edin
2. **Test Coverage** - Kapsamlı test suite oluşturun
3. **Monitoring Setup** - Production monitoring ve alerting kurun
4. **Performance Optimization** - Bundle size ve loading time optimizasyonu
5. **Security Hardening** - Güvenlik testleri ve OWASP compliance

---

**📞 Destek**

- **GitHub Issues**: Teknik sorular için
- **API Dokümantasyonu**: `/docs/api/API_DOCUMENTATION_TR.md`
- **OpenAPI Spec**: `/docs/api/openapi.yaml`

**Son Güncelleme**: 24 Temmuz 2025  
**Doküman Versiyonu**: 1.0.0  
**Dil**: Türkçe (TR)
