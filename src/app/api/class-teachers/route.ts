import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getCurrentTenant } from '@/lib/tenant'
import { supabaseServer } from '@/lib/supabase/server'
import { ClassTeacherInsert, ClassTeacherUpdate, TeacherRole } from '@/types/class'

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/class-teachers',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const searchParams = request.nextUrl.searchParams
        const classId = searchParams.get('class_id')
        const teacherId = searchParams.get('teacher_id')
        const role = searchParams.get('role') as TeacherRole | null

        let query = supabaseServer
          .from('class_teachers')
          .select(`
            *,
            teacher:teachers (
              id,
              first_name,
              last_name,
              subjects
            )
          `)
          .eq('tenant_id', tenant.id)

        if (classId) {
          query = query.eq('class_id', classId)
        }

        if (teacherId) {
          query = query.eq('teacher_id', teacherId)
        }

        if (role) {
          query = query.eq('role', role)
        }

        const { data: classTeachers, error } = await query

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Sınıf öğretmenleri yüklenirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(classTeachers)
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
      }
    }
  )
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/class-teachers',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const body = await request.json()

        // Sınıfın zaten bir sınıf öğretmeni var mı kontrol et
        if (body.role === 'homeroom_teacher') {
          const { data: existingHomeroom, error: homeroomError } = await supabaseServer
            .from('class_teachers')
            .select('id')
            .eq('class_id', body.class_id)
            .eq('tenant_id', tenant.id)
            .eq('role', 'homeroom_teacher')
            .maybeSingle()

          if (homeroomError) {
            Sentry.captureException(homeroomError)
            return NextResponse.json({ error: 'Sınıf öğretmeni kontrolü yapılırken bir hata oluştu' }, { status: 500 })
          }

          if (existingHomeroom) {
            return NextResponse.json({ error: 'Bu sınıfın zaten bir sınıf öğretmeni var' }, { status: 400 })
          }
        }

        // Öğretmenin bu sınıfta aynı dersi verip vermediğini kontrol et
        if (body.subject) {
          const { data: existingSubject, error: subjectError } = await supabaseServer
            .from('class_teachers')
            .select('id')
            .eq('class_id', body.class_id)
            .eq('teacher_id', body.teacher_id)
            .eq('subject', body.subject)
            .eq('tenant_id', tenant.id)
            .maybeSingle()

          if (subjectError) {
            Sentry.captureException(subjectError)
            return NextResponse.json({ error: 'Öğretmen ders kontrolü yapılırken bir hata oluştu' }, { status: 500 })
          }

          if (existingSubject) {
            return NextResponse.json({ error: 'Bu öğretmen zaten bu sınıfta bu dersi veriyor' }, { status: 400 })
          }
        }

        const classTeacherData: ClassTeacherInsert = {
          ...body,
          tenant_id: tenant.id,
        }

        const { data: newClassTeacher, error } = await supabaseServer
          .from('class_teachers')
          .insert(classTeacherData)
          .select(`
            *,
            teacher:teachers (
              id,
              first_name,
              last_name,
              subjects
            )
          `)
          .single()

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Öğretmen sınıfa eklenirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(newClassTeacher)
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
      }
    }
  )
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'PUT /api/class-teachers',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const body = await request.json()
        const { id, ...updateData } = body

        // Eğer rol değişiyorsa ve yeni rol sınıf öğretmeni ise, kontrol et
        if (updateData.role === 'homeroom_teacher') {
          const { data: existingHomeroom, error: homeroomError } = await supabaseServer
            .from('class_teachers')
            .select('id')
            .eq('class_id', updateData.class_id)
            .eq('tenant_id', tenant.id)
            .eq('role', 'homeroom_teacher')
            .neq('id', id)
            .maybeSingle()

          if (homeroomError) {
            Sentry.captureException(homeroomError)
            return NextResponse.json({ error: 'Sınıf öğretmeni kontrolü yapılırken bir hata oluştu' }, { status: 500 })
          }

          if (existingHomeroom) {
            return NextResponse.json({ error: 'Bu sınıfın zaten bir sınıf öğretmeni var' }, { status: 400 })
          }
        }

        const classTeacherData: ClassTeacherUpdate = {
          ...updateData,
        }

        const { data: updatedClassTeacher, error } = await supabaseServer
          .from('class_teachers')
          .update(classTeacherData)
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .select(`
            *,
            teacher:teachers (
              id,
              first_name,
              last_name,
              subjects
            )
          `)
          .single()

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Öğretmen sınıf bilgisi güncellenirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(updatedClassTeacher)
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
      }
    }
  )
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'DELETE /api/class-teachers',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
          return NextResponse.json({ error: 'Sınıf öğretmen ID\'si gerekli' }, { status: 400 })
        }

        const { error } = await supabaseServer
          .from('class_teachers')
          .delete()
          .eq('id', id)
          .eq('tenant_id', tenant.id)

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Öğretmen sınıftan çıkarılırken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
      }
    }
  )
} 