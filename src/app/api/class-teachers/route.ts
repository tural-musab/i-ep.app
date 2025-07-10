import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

// Bir sınıftaki öğretmenleri listele
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/class-teachers",
    },
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get("class_id");

        if (!classId) {
          return NextResponse.json(
            { error: "Sınıf ID'si gerekli" },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from("classes")
          .select("tenant_id")
          .eq("id", classId)
          .single();

        if (!classData) {
          return NextResponse.json(
            { error: "Sınıf bulunamadı" },
            { status: 404 }
          );
        }

        const { data: teachers, error } = await supabase
          .from("class_teachers")
          .select(`
            *,
            teacher:teachers (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .eq("class_id", classId)
          .eq("tenant_id", classData.tenant_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching class teachers:", error);
          return NextResponse.json(
            { error: "Sınıf öğretmenleri getirilirken bir hata oluştu" },
            { status: 500 }
          );
        }

        return NextResponse.json(teachers);
      } catch (error) {
        console.error("Error in GET /api/class-teachers:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
}

// Öğretmeni sınıfa ekle
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/class-teachers",
    },
    async () => {
      try {
        const body = await request.json();
        const { class_id, teacher_id, role = "subject_teacher", subject } = body;

        if (!class_id || !teacher_id) {
          return NextResponse.json(
            { error: "Sınıf ID ve Öğretmen ID gerekli" },
            { status: 400 }
          );
        }

        if (role === "subject_teacher" && !subject) {
          return NextResponse.json(
            { error: "Branş öğretmeni için ders adı gerekli" },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from("classes")
          .select("tenant_id")
          .eq("id", class_id)
          .single();

        if (!classData) {
          return NextResponse.json(
            { error: "Sınıf bulunamadı" },
            { status: 404 }
          );
        }

        // Sınıf başına sadece bir sınıf öğretmeni olabilir
        if (role === "homeroom_teacher") {
          const { data: existingHomeroom } = await supabase
            .from("class_teachers")
            .select("id")
            .eq("class_id", class_id)
            .eq("role", "homeroom_teacher")
            .eq("tenant_id", classData.tenant_id)
            .single();

          if (existingHomeroom) {
            return NextResponse.json(
              { error: "Bu sınıfın zaten bir sınıf öğretmeni var" },
              { status: 400 }
            );
          }
        }

        // Öğretmeni sınıfa ekle
        const { data: assignment, error } = await supabase
          .from("class_teachers")
          .insert({
            class_id,
            teacher_id,
            tenant_id: classData.tenant_id,
            role,
            subject: role === "subject_teacher" ? subject : null,
          })
          .select()
          .single();

        if (error) {
          console.error("Error assigning teacher to class:", error);
          return NextResponse.json(
            { error: "Öğretmen sınıfa eklenirken bir hata oluştu" },
            { status: 500 }
          );
        }

        return NextResponse.json(assignment, { status: 201 });
      } catch (error) {
        console.error("Error in POST /api/class-teachers:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
}

// Öğretmenin sınıf bilgilerini güncelle
export async function PUT(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "PUT /api/class-teachers",
    },
    async () => {
      try {
        const body = await request.json();
        const { class_id, teacher_id, role, subject } = body;

        if (!class_id || !teacher_id) {
          return NextResponse.json(
            { error: "Sınıf ID ve Öğretmen ID gerekli" },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from("classes")
          .select("tenant_id")
          .eq("id", class_id)
          .single();

        if (!classData) {
          return NextResponse.json(
            { error: "Sınıf bulunamadı" },
            { status: 404 }
          );
        }

        // Sınıf başına sadece bir sınıf öğretmeni olabilir
        if (role === "homeroom_teacher") {
          const { data: existingHomeroom } = await supabase
            .from("class_teachers")
            .select("id")
            .eq("class_id", class_id)
            .eq("role", "homeroom_teacher")
            .eq("tenant_id", classData.tenant_id)
            .neq("teacher_id", teacher_id)
            .single();

          if (existingHomeroom) {
            return NextResponse.json(
              { error: "Bu sınıfın zaten bir sınıf öğretmeni var" },
              { status: 400 }
            );
          }
        }

        const { data: updatedAssignment, error } = await supabase
          .from("class_teachers")
          .update({
            role,
            subject: role === "subject_teacher" ? subject : null,
          })
          .eq("class_id", class_id)
          .eq("teacher_id", teacher_id)
          .eq("tenant_id", classData.tenant_id)
          .select()
          .single();

        if (error) {
          console.error("Error updating class teacher:", error);
          return NextResponse.json(
            { error: "Öğretmen bilgileri güncellenirken bir hata oluştu" },
            { status: 500 }
          );
        }

        return NextResponse.json(updatedAssignment);
      } catch (error) {
        console.error("Error in PUT /api/class-teachers:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
}

// Öğretmeni sınıftan çıkar
export async function DELETE(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "DELETE /api/class-teachers",
    },
    async () => {
      try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get("class_id");
        const teacherId = searchParams.get("teacher_id");

        if (!classId || !teacherId) {
          return NextResponse.json(
            { error: "Sınıf ID ve Öğretmen ID gerekli" },
            { status: 400 }
          );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Önce sınıfın tenant_id'sini al
        const { data: classData } = await supabase
          .from("classes")
          .select("tenant_id")
          .eq("id", classId)
          .single();

        if (!classData) {
          return NextResponse.json(
            { error: "Sınıf bulunamadı" },
            { status: 404 }
          );
        }

        const { error } = await supabase
          .from("class_teachers")
          .delete()
          .eq("class_id", classId)
          .eq("teacher_id", teacherId)
          .eq("tenant_id", classData.tenant_id);

        if (error) {
          console.error("Error removing teacher from class:", error);
          return NextResponse.json(
            { error: "Öğretmen sınıftan çıkarılırken bir hata oluştu" },
            { status: 500 }
          );
        }

        return NextResponse.json({ message: "Öğretmen sınıftan çıkarıldı" });
      } catch (error) {
        console.error("Error in DELETE /api/class-teachers:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Beklenmeyen bir hata oluştu" },
          { status: 500 }
        );
      }
    }
  );
} 