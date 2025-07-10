import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ClassTeacher {
  teacher: Teacher;
  role: string;
}

export async function GET() {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/classes",
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Kullanıcının tenant_id'sini al
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: "Oturum açmanız gerekiyor" },
            { status: 401 }
          );
        }

        const { data: classes, error } = await supabase
          .from("classes")
          .select(`
            *,
            class_students (count),
            class_teachers (
              count,
              role,
              teacher:teachers (
                id,
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq("tenant_id", user.id)
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching classes:", error);
          return NextResponse.json(
            { error: "Sınıflar getirilirken bir hata oluştu" },
            { status: 500 }
          );
        }

        // Format response
        const formattedClasses = classes.map((classItem) => ({
          ...classItem,
          student_count: classItem.class_students?.[0]?.count || 0,
          teacher_count: classItem.class_teachers?.[0]?.count || 0,
          homeroom_teacher: classItem.class_teachers?.find(
            (t: ClassTeacher) => t.teacher && t.role === "homeroom_teacher"
          )?.teacher,
        }));

        return NextResponse.json(formattedClasses);
      } catch (error) {
        console.error("Error in GET /api/classes:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/classes",
    },
    async () => {
      try {
        const body = await request.json();
        const { name, grade_level, capacity, academic_year } = body;

        // Validasyon
        if (!name || !grade_level || !academic_year) {
          return NextResponse.json(
            { error: "Gerekli alanlar eksik" },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Kullanıcının tenant_id'sini al
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: "Oturum açmanız gerekiyor" },
            { status: 401 }
          );
        }

        const { data: newClass, error } = await supabase
          .from("classes")
          .insert({
            name,
            grade_level,
            capacity: capacity || 30, // Varsayılan kapasite
            academic_year,
            is_active: true,
            tenant_id: user.id,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating class:", error);
          return NextResponse.json(
            { error: "Sınıf oluşturulurken bir hata oluştu" },
            { status: 500 }
          );
        }

        return NextResponse.json(newClass, { status: 201 });
      } catch (error) {
        console.error("Error in POST /api/classes:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "PUT /api/classes",
    },
    async () => {
      try {
        const body = await request.json();
        const { id, name, grade_level, capacity, academic_year, is_active } = body;

        if (!id) {
          return NextResponse.json(
            { error: "Sınıf ID'si gerekli" },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Kullanıcının tenant_id'sini al
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: "Oturum açmanız gerekiyor" },
            { status: 401 }
          );
        }

        const { data: updatedClass, error } = await supabase
          .from("classes")
          .update({
            name,
            grade_level,
            capacity,
            academic_year,
            is_active,
          })
          .eq("id", id)
          .eq("tenant_id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating class:", error);
          return NextResponse.json(
            { error: "Sınıf güncellenirken bir hata oluştu" },
            { status: 500 }
          );
        }

        return NextResponse.json(updatedClass);
      } catch (error) {
        console.error("Error in PUT /api/classes:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "DELETE /api/classes",
    },
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
          return NextResponse.json(
            { error: "Sınıf ID'si gerekli" },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Kullanıcının tenant_id'sini al
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: "Oturum açmanız gerekiyor" },
            { status: 401 }
          );
        }

        const { error } = await supabase
          .from("classes")
          .delete()
          .eq("id", id)
          .eq("tenant_id", user.id);

        if (error) {
          console.error("Error deleting class:", error);
          return NextResponse.json(
            { error: "Sınıf silinirken bir hata oluştu" },
            { status: 500 }
          );
        }

        return NextResponse.json({ message: "Sınıf başarıyla silindi" });
      } catch (error) {
        console.error("Error in DELETE /api/classes:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
} 