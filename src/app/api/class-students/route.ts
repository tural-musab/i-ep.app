import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Bir sınıftaki öğrencileri listele
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/class-students',
    },
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('class_id');

        if (!classId) {
          return NextResponse.json({ error: "Sınıf ID'si gerekli" }, { status: 400 });
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from('classes')
          .select('tenant_id')
          .eq('id', classId)
          .single();

        if (!classData) {
          return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
        }

        const { data: students, error } = await supabase
          .from('class_students')
          .select(
            `
            *,
            student:students (
              id,
              first_name,
              last_name,
              student_number
            )
          `
          )
          .eq('class_id', classId)
          .eq('tenant_id', classData.tenant_id)
          .order('enrollment_date', { ascending: false });

        if (error) {
          console.error('Error fetching class students:', error);
          return NextResponse.json(
            { error: 'Sınıf öğrencileri getirilirken bir hata oluştu' },
            { status: 500 }
          );
        }

        return NextResponse.json(students);
      } catch (error) {
        console.error('Error in GET /api/class-students:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu' }, { status: 500 });
      }
    }
  );
}

// Öğrenciyi sınıfa ekle
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/class-students',
    },
    async () => {
      try {
        const body = await request.json();
        const { class_id, student_id, status = 'active' } = body;

        if (!class_id || !student_id) {
          return NextResponse.json({ error: 'Sınıf ID ve Öğrenci ID gerekli' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from('classes')
          .select('tenant_id')
          .eq('id', class_id)
          .single();

        if (!classData) {
          return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
        }

        // Önce sınıfın kapasitesini ve mevcut öğrenci sayısını kontrol et
        const { data: classInfo } = await supabase
          .from('classes')
          .select('capacity')
          .eq('id', class_id)
          .single();

        const { count: currentStudentCount } = await supabase
          .from('class_students')
          .select('*', { count: 'exact' })
          .eq('class_id', class_id)
          .eq('status', 'active');

        if (
          classInfo &&
          currentStudentCount !== null &&
          currentStudentCount >= classInfo.capacity
        ) {
          return NextResponse.json({ error: 'Sınıf kapasitesi dolu' }, { status: 400 });
        }

        // Öğrenciyi sınıfa ekle
        const { data: assignment, error } = await supabase
          .from('class_students')
          .insert({
            class_id,
            student_id,
            tenant_id: classData.tenant_id,
            status,
            enrollment_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error assigning student to class:', error);
          return NextResponse.json(
            { error: 'Öğrenci sınıfa eklenirken bir hata oluştu' },
            { status: 500 }
          );
        }

        return NextResponse.json(assignment, { status: 201 });
      } catch (error) {
        console.error('Error in POST /api/class-students:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu' }, { status: 500 });
      }
    }
  );
}

// Öğrencinin sınıf durumunu güncelle
export async function PUT(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'PUT /api/class-students',
    },
    async () => {
      try {
        const body = await request.json();
        const { class_id, student_id, status } = body;

        if (!class_id || !student_id || !status) {
          return NextResponse.json(
            { error: 'Sınıf ID, Öğrenci ID ve durum gerekli' },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from('classes')
          .select('tenant_id')
          .eq('id', class_id)
          .single();

        if (!classData) {
          return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
        }

        const { data: updatedAssignment, error } = await supabase
          .from('class_students')
          .update({ status })
          .eq('class_id', class_id)
          .eq('student_id', student_id)
          .eq('tenant_id', classData.tenant_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating class student status:', error);
          return NextResponse.json(
            { error: 'Öğrenci durumu güncellenirken bir hata oluştu' },
            { status: 500 }
          );
        }

        return NextResponse.json(updatedAssignment);
      } catch (error) {
        console.error('Error in PUT /api/class-students:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu' }, { status: 500 });
      }
    }
  );
}

// Öğrenciyi sınıftan çıkar
export async function DELETE(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'DELETE /api/class-students',
    },
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('class_id');
        const studentId = searchParams.get('student_id');

        if (!classId || !studentId) {
          return NextResponse.json({ error: 'Sınıf ID ve Öğrenci ID gerekli' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from('classes')
          .select('tenant_id')
          .eq('id', classId)
          .single();

        if (!classData) {
          return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
        }

        const { error } = await supabase
          .from('class_students')
          .delete()
          .eq('class_id', classId)
          .eq('student_id', studentId)
          .eq('tenant_id', classData.tenant_id);

        if (error) {
          console.error('Error removing student from class:', error);
          return NextResponse.json(
            { error: 'Öğrenci sınıftan çıkarılırken bir hata oluştu' },
            { status: 500 }
          );
        }

        return NextResponse.json({ message: 'Öğrenci sınıftan çıkarıldı' });
      } catch (error) {
        console.error('Error in DELETE /api/class-students:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu' }, { status: 500 });
      }
    }
  );
}
