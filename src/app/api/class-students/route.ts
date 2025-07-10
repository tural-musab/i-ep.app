import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getCurrentTenant } from '@/lib/tenant'
import { supabaseServer } from '@/lib/supabase/server'
import { ClassStudentInsert, ClassStudentUpdate, StudentStatus } from '@/types/class'

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/class-students',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const searchParams = request.nextUrl.searchParams
        const classId = searchParams.get('class_id')
        const studentId = searchParams.get('student_id')
        const status = searchParams.get('status') as StudentStatus | null

        let query = supabaseServer
          .from('class_students')
          .select(`
            *,
            student:students (
              id,
              first_name,
              last_name,
              number
            )
          `)
          .eq('tenant_id', tenant.id)

        if (classId) {
          query = query.eq('class_id', classId)
        }

        if (studentId) {
          query = query.eq('student_id', studentId)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data: classStudents, error } = await query

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Sınıf öğrencileri yüklenirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(classStudents)
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
      name: 'POST /api/class-students',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const body = await request.json()

        // Sınıf kapasitesini kontrol et
        const { data: classData, error: classError } = await supabaseServer
          .from('classes')
          .select(`
            capacity,
            class_students (count)
          `)
          .eq('id', body.class_id)
          .eq('tenant_id', tenant.id)
          .single()

        if (classError) {
          Sentry.captureException(classError)
          return NextResponse.json({ error: 'Sınıf bilgisi alınırken bir hata oluştu' }, { status: 500 })
        }

        const currentStudentCount = classData.class_students?.[0]?.count || 0
        if (currentStudentCount >= classData.capacity) {
          return NextResponse.json({ error: 'Sınıf kapasitesi dolu' }, { status: 400 })
        }

        // Öğrencinin başka bir sınıfa kayıtlı olup olmadığını kontrol et
        const { data: existingAssignment, error: existingError } = await supabaseServer
          .from('class_students')
          .select('id')
          .eq('student_id', body.student_id)
          .eq('tenant_id', tenant.id)
          .eq('status', 'active')
          .maybeSingle()

        if (existingError) {
          Sentry.captureException(existingError)
          return NextResponse.json({ error: 'Öğrenci bilgisi kontrol edilirken bir hata oluştu' }, { status: 500 })
        }

        if (existingAssignment) {
          return NextResponse.json({ error: 'Öğrenci zaten başka bir sınıfa kayıtlı' }, { status: 400 })
        }

        const classStudentData: ClassStudentInsert = {
          ...body,
          tenant_id: tenant.id,
          status: 'active',
        }

        const { data: newClassStudent, error } = await supabaseServer
          .from('class_students')
          .insert(classStudentData)
          .select(`
            *,
            student:students (
              id,
              first_name,
              last_name,
              number
            )
          `)
          .single()

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Öğrenci sınıfa eklenirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(newClassStudent)
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
      name: 'PUT /api/class-students',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const body = await request.json()
        const { id, ...updateData } = body

        const classStudentData: ClassStudentUpdate = {
          ...updateData,
        }

        const { data: updatedClassStudent, error } = await supabaseServer
          .from('class_students')
          .update(classStudentData)
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .select(`
            *,
            student:students (
              id,
              first_name,
              last_name,
              number
            )
          `)
          .single()

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Öğrenci sınıf bilgisi güncellenirken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json(updatedClassStudent)
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
      name: 'DELETE /api/class-students',
    },
    async () => {
      try {
        const tenant = await getCurrentTenant()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
          return NextResponse.json({ error: 'Sınıf öğrenci ID\'si gerekli' }, { status: 400 })
        }

        const { error } = await supabaseServer
          .from('class_students')
          .delete()
          .eq('id', id)
          .eq('tenant_id', tenant.id)

        if (error) {
          Sentry.captureException(error)
          return NextResponse.json({ error: 'Öğrenci sınıftan çıkarılırken bir hata oluştu' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
      }
    }
  )
} 