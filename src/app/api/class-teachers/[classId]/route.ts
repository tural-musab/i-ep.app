import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const assignTeacherSchema = z.object({
  teacher_id: z.string({
    required_error: "Öğretmen ID'si gerekli",
  }),
  role: z.enum(['homeroom_teacher', 'subject_teacher'], {
    required_error: 'Öğretmen rolü gerekli',
  }),
});

export async function GET(request: NextRequest, { params }: { params: { classId: string } }) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/class-teachers/[classId]',
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: teachers, error } = await supabase
          .from('class_teachers')
          .select(
            `
            role,
            teachers (
              id,
              first_name,
              last_name,
              email,
              is_active
            )
          `
          )
          .eq('class_id', params.classId);

        if (error) {
          throw error;
        }

        // Öğretmen bilgilerini düzenle
        const formattedTeachers = teachers.map((item) => ({
          ...item.teachers,
          role: item.role,
        }));

        return Response.json(formattedTeachers);
      } catch (error) {
        console.error('Error fetching class teachers:', error);
        Sentry.captureException(error);
        return Response.json({ error: 'Sınıf öğretmenleri alınamadı' }, { status: 500 });
      }
    }
  );
}

export async function POST(request: NextRequest, { params }: { params: { classId: string } }) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/class-teachers/[classId]',
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });
        const body = await request.json();

        const validatedData = assignTeacherSchema.parse(body);

        // Sınıfın mevcut olup olmadığını kontrol et
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, homeroom_teacher_id')
          .eq('id', params.classId)
          .single();

        if (classError || !classData) {
          return Response.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
        }

        // Eğer sınıf öğretmeni atanıyorsa, mevcut sınıf öğretmeni var mı kontrol et
        if (validatedData.role === 'homeroom_teacher') {
          if (classData.homeroom_teacher_id) {
            return Response.json(
              { error: 'Bu sınıfın zaten bir sınıf öğretmeni var' },
              { status: 400 }
            );
          }

          // Öğretmenin başka bir sınıfın sınıf öğretmeni olup olmadığını kontrol et
          const { data: existingHomeroom, error: homeroomError } = await supabase
            .from('classes')
            .select('id')
            .eq('homeroom_teacher_id', validatedData.teacher_id);

          if (homeroomError) {
            throw homeroomError;
          }

          if (existingHomeroom && existingHomeroom.length > 0) {
            return Response.json(
              { error: 'Bu öğretmen zaten başka bir sınıfın sınıf öğretmeni' },
              { status: 400 }
            );
          }

          // Sınıf öğretmenini güncelle
          const { error: updateError } = await supabase
            .from('classes')
            .update({ homeroom_teacher_id: validatedData.teacher_id })
            .eq('id', params.classId);

          if (updateError) {
            throw updateError;
          }
        }

        // Öğretmeni sınıfa ekle
        const { error: insertError } = await supabase.from('class_teachers').insert({
          class_id: params.classId,
          teacher_id: validatedData.teacher_id,
          role: validatedData.role,
        });

        if (insertError) {
          throw insertError;
        }

        return Response.json({ message: 'Öğretmen başarıyla eklendi' });
      } catch (error) {
        console.error('Error assigning teacher:', error);
        Sentry.captureException(error);

        if (error instanceof z.ZodError) {
          return Response.json(
            { error: 'Geçersiz öğretmen bilgileri', details: error.errors },
            { status: 400 }
          );
        }

        return Response.json({ error: 'Öğretmen eklenemedi' }, { status: 500 });
      }
    }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string; teacherId: string } }
) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'DELETE /api/class-teachers/[classId]/[teacherId]',
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });

        // Öğretmenin rolünü kontrol et
        const { data: teacherData, error: teacherError } = await supabase
          .from('class_teachers')
          .select('role')
          .eq('class_id', params.classId)
          .eq('teacher_id', params.teacherId)
          .single();

        if (teacherError || !teacherData) {
          return Response.json({ error: 'Öğretmen bulunamadı' }, { status: 404 });
        }

        // Eğer sınıf öğretmeni ise, sınıfın homeroom_teacher_id'sini null yap
        if (teacherData.role === 'homeroom_teacher') {
          const { error: updateError } = await supabase
            .from('classes')
            .update({ homeroom_teacher_id: null })
            .eq('id', params.classId);

          if (updateError) {
            throw updateError;
          }
        }

        // Öğretmeni sınıftan çıkar
        const { error: deleteError } = await supabase
          .from('class_teachers')
          .delete()
          .eq('class_id', params.classId)
          .eq('teacher_id', params.teacherId);

        if (deleteError) {
          throw deleteError;
        }

        return Response.json({ message: 'Öğretmen başarıyla çıkarıldı' });
      } catch (error) {
        console.error('Error removing teacher:', error);
        Sentry.captureException(error);
        return Response.json({ error: 'Öğretmen çıkarılamadı' }, { status: 500 });
      }
    }
  );
}
