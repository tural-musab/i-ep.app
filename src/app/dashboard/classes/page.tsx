'use client';

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ClassList } from '@/components/classes/ClassList';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
  capacity: number;
  academic_year: string;
  is_active: boolean;
  student_count: number;
  teacher_count: number;
  homeroom_teacher?: Teacher;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    return Sentry.startSpan(
      {
        op: 'http.client',
        name: 'GET /api/classes',
      },
      async () => {
        try {
          const response = await fetch('/api/classes');
          if (!response.ok) {
            throw new Error('Sınıf listesi alınamadı');
          }
          const data = await response.json();
          setClasses(data);
          setError(null);
        } catch (error) {
          console.error('Error fetching classes:', error);
          Sentry.captureException(error);
          setError('Sınıf listesi yüklenirken bir hata oluştu');
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-destructive text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <ClassList classes={classes} onClassCreated={fetchClasses} />
    </div>
  );
}
