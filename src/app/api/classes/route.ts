import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getCurrentTenant } from '@/lib/tenant'
import { supabaseServer } from '@/lib/supabase/server'
import { ClassWithDetails, ClassInsert, ClassUpdate } from '@/types/class'

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/classes',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const searchParams = request.nextUrl.searchParams
        const academicYear = searchParams.get('academic_year')
        const isActive = searchParams.get('is_active')
        const gradeLevel = searchParams.get('grade_level')

        let query = supabaseServer
          .from('classes')
          .select(`
            *,
            class_students (
              count
            ),
            class_teachers!class_teachers_class_id_fkey (
              count,
              role,
              teacher:teachers (
                id,
                first_name,
                last_name
              )
            )
          `)
          .eq('tenant_id', tenant.id)
          .order('grade_level', { ascending: true })
          .order('name', { ascending: true })

        if (academicYear) {
          query = query.eq('academic_year', academicYear)
        }

        if (isActive !== null) {
          query = query.eq('is_active', isActive === 'true')
        }

        if (gradeLevel) {
          query = query.eq('grade_level', parseInt(gradeLevel))
        }

        const { data: classes, error } = await query

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Sınıflar yüklenirken bir hata oluştu' }, { status: 500 })
        }

        // Format response
        const formattedClasses = classes.map((classItem: ClassWithDetails) => ({
          ...classItem,
          student_count: classItem.class_students?.[0]?.count || 0,
          teacher_count: classItem.class_teachers?.[0]?.count || 0,
          homeroom_teacher: classItem.class_teachers?.find(
            (t) => t.teacher && t.role === 'homeroom_teacher'
          )?.teacher,
        }))

        return NextResponse.json(formattedClasses)
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
      name: 'POST /api/classes',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const body = await request.json()

        const classData: ClassInsert = {
          ...body,
          tenant_id: tenant.id,
        }

        const { data: newClass, error } = await supabaseServer
          .from('classes')
          .insert(classData)
          .select()
          .single()

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Sınıf oluşturulurken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(newClass)
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
      name: 'PUT /api/classes',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const body = await request.json()
        const { id, ...updateData } = body

        const classData: ClassUpdate = {
          ...updateData,
        }

        const { data: updatedClass, error } = await supabaseServer
          .from('classes')
          .update(classData)
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .select()
          .single()

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Sınıf güncellenirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(updatedClass)
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
      name: 'DELETE /api/classes',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
          return NextResponse.json({ error: 'Sınıf ID\'si gerekli' }, { status: 400 })
        }

        const { error } = await supabaseServer
          .from('classes')
          .delete()
          .eq('id', id)
          .eq('tenant_id', tenant.id)

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Sınıf silinirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
      }
    }
  )
} 