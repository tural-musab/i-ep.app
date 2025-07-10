import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/classes/[id]",
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: classData, error } = await supabase
          .from("classes")
          .select(`
            *,
            homeroom_teacher:teachers!homeroom_teacher_id (
              id,
              first_name,
              last_name,
              email
            ),
            student_count:class_students (count),
            teacher_count:class_teachers (count)
          `)
          .eq("id", params.id)
          .single();

        if (error) {
          throw error;
        }

        if (!classData) {
          return Response.json(
            { error: "Sınıf bulunamadı" },
            { status: 404 }
          );
        }

        // Format the counts
        const formattedClass = {
          ...classData,
          student_count: classData.student_count?.[0]?.count || 0,
          teacher_count: classData.teacher_count?.[0]?.count || 0,
        };

        return Response.json(formattedClass);
      } catch (error) {
        console.error("Error fetching class:", error);
        Sentry.captureException(error);
        return Response.json(
          { error: "Sınıf detayları alınamadı" },
          { status: 500 }
        );
      }
    }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "DELETE /api/classes/[id]",
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });

        // Önce sınıfın mevcut olup olmadığını kontrol et
        const { data: existingClass, error: fetchError } = await supabase
          .from("classes")
          .select("id")
          .eq("id", params.id)
          .single();

        if (fetchError || !existingClass) {
          return Response.json(
            { error: "Sınıf bulunamadı" },
            { status: 404 }
          );
        }

        // Sınıfı sil
        const { error: deleteError } = await supabase
          .from("classes")
          .delete()
          .eq("id", params.id);

        if (deleteError) {
          throw deleteError;
        }

        return Response.json({ message: "Sınıf başarıyla silindi" });
      } catch (error) {
        console.error("Error deleting class:", error);
        Sentry.captureException(error);
        return Response.json(
          { error: "Sınıf silinemedi" },
          { status: 500 }
        );
      }
    }
  );
} 