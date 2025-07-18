'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Sentry from '@sentry/nextjs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
}

const formSchema = z.object({
  student_id: z.string({
    required_error: 'Öğrenci seçiniz',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignStudentFormProps {
  classId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssignStudentForm({ classId, onSuccess, onCancel }: AssignStudentFormProps) {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fetchAvailableStudents = async () => {
    return Sentry.startSpan(
      {
        op: 'http.client',
        name: 'GET /api/students/available',
      },
      async () => {
        try {
          const response = await fetch(`/api/students?available=true&classId=${classId}`);
          if (!response.ok) {
            throw new Error('Öğrenci listesi alınamadı');
          }
          const data = await response.json();
          setStudents(data);
          setFilteredStudents(data);
          setError(null);
        } catch (error) {
          console.error('Error fetching available students:', error);
          Sentry.captureException(error);
          setError('Öğrenci listesi alınamadı');
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const onSubmit = async (values: FormValues) => {
    return Sentry.startSpan(
      {
        op: 'ui.submit',
        name: 'Assign Student Form Submit',
      },
      async () => {
        try {
          setIsSubmitting(true);
          setError(null);

          const response = await fetch(`/api/class-students/${classId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              student_id: values.student_id,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Öğrenci eklenemedi');
          }

          onSuccess();
        } catch (error) {
          console.error('Error assigning student:', error);
          Sentry.captureException(error);
          setError('Öğrenci eklenemedi');
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  React.useEffect(() => {
    fetchAvailableStudents();
  }, [classId]);

  React.useEffect(() => {
    const filtered = students.filter((student: Student) => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      const studentNumber = student.student_number.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        studentNumber.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-muted-foreground text-lg">Öğrenciler yükleniyor...</div>
      </div>
    );
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="text"
          placeholder="Öğrenci ara..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4"
        />

        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Öğrenci</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={filteredStudents.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredStudents.map((student: Student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_number} - {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                  {filteredStudents.length === 0 && (
                    <SelectItem value="empty" disabled>
                      Eklenebilecek öğrenci yok
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || filteredStudents.length === 0}
          >
            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            İptal
          </Button>
        </div>

        {error && <div className="text-destructive text-center text-sm">{error}</div>}
      </form>
    </Form>
  );
}
