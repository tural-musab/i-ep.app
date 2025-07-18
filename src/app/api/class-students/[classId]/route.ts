import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const assignStudentSchema = z.object({
  student_id: z.string({
    required_error: "Öğrenci ID'si gerekli",
  }),
});

export async function GET(request: NextRequest, { params }: { params: { classId: string } }) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/class-students/[classId]',
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: students, error } = await supabase
          .from('class_students')
          .select(
            `
            students (
              id,
              first_name,
              last_name,
              email,
              student_number,
              is_active
            )
          `
          )
          .eq('class_id', params.classId);

        if (error) {
          throw error;
        }

        // Öğrenci bilgilerini düzenle
        const formattedStudents = students.map((item) => ({
          ...item.students,
        }));

        return Response.json(formattedStudents);
      } catch (error) {
        console.error('Error fetching class students:', error);
        Sentry.captureException(error);
        return Response.json({ error: 'Sınıf öğrencileri alınamadı' }, { status: 500 });
      }
    }
  );
}

export async function POST(request: NextRequest, { params }: { params: { classId: string } }) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/class-students/[classId]',
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });
        const body = await request.json();

        const validatedData = assignStudentSchema.parse(body);

        // Sınıfın kapasitesini ve mevcut öğrenci sayısını kontrol et
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select(
            `
            capacity,
            student_count:class_students (count)
          `
          )
          .eq('id', params.classId)
          .single();

        if (classError || !classData) {
          return Response.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
        }

        const currentStudentCount = classData.student_count?.[0]?.count || 0;

        if (currentStudentCount >= classData.capacity) {
          return Response.json({ error: 'Sınıf kapasitesi dolu' }, { status: 400 });
        }

        // Öğrencinin başka bir sınıfa kayıtlı olup olmadığını kontrol et
        const { data: existingAssignment, error: assignmentError } = await supabase
          .from('class_students')
          .select('id')
          .eq('student_id', validatedData.student_id);

        if (assignmentError) {
          throw assignmentError;
        }

        if (existingAssignment && existingAssignment.length > 0) {
          return Response.json({ error: 'Öğrenci zaten bir sınıfa kayıtlı' }, { status: 400 });
        }

        // Öğrenciyi sınıfa ekle
        const { error: insertError } = await supabase.from('class_students').insert({
          class_id: params.classId,
          student_id: validatedData.student_id,
        });

        if (insertError) {
          throw insertError;
        }

        return Response.json({ message: 'Öğrenci başarıyla eklendi' });
      } catch (error) {
        console.error('Error assigning student:', error);
        Sentry.captureException(error);

        if (error instanceof z.ZodError) {
          return Response.json(
            { error: 'Geçersiz öğrenci bilgileri', details: error.errors },
            { status: 400 }
          );
        }

        return Response.json({ error: 'Öğrenci eklenemedi' }, { status: 500 });
      }
    }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string; studentId: string } }
) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'DELETE /api/class-students/[classId]/[studentId]',
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });

        const { error } = await supabase
          .from('class_students')
          .delete()
          .eq('class_id', params.classId)
          .eq('student_id', params.studentId);

        if (error) {
          throw error;
        }

        return Response.json({ message: 'Öğrenci başarıyla çıkarıldı' });
      } catch (error) {
        console.error('Error removing student:', error);
        Sentry.captureException(error);
        return Response.json({ error: 'Öğrenci çıkarılamadı' }, { status: 500 });
      }
    }
  );
}
