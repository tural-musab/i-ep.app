import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const classSchema = z.object({
  name: z
    .string()
    .min(2, "Sınıf adı en az 2 karakter olmalıdır")
    .max(100, "Sınıf adı en fazla 100 karakter olabilir"),
  grade_level: z
    .number()
    .min(1, "Sınıf seviyesi en az 1 olmalıdır")
    .max(12, "Sınıf seviyesi en fazla 12 olabilir"),
  capacity: z
    .number()
    .min(1, "Kapasite en az 1 olmalıdır")
    .max(50, "Kapasite en fazla 50 olabilir"),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, "Örnek format: 2023-2024"),
  is_active: z.boolean().default(true),
});

export async function GET() {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/classes",
    },
    async () => {
      try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: classes, error } = await supabase
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
          `);

        if (error) {
          throw error;
        }

        // Format the counts
        const formattedClasses = classes.map((classItem) => ({
          ...classItem,
          student_count: classItem.student_count?.[0]?.count || 0,
          teacher_count: classItem.teacher_count?.[0]?.count || 0,
        }));

        return Response.json(formattedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
        Sentry.captureException(error);
        return Response.json(
          { error: "Sınıf listesi alınamadı" },
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
        const supabase = createRouteHandlerClient({ cookies });
        const body = await request.json();

        const validatedData = classSchema.parse(body);

        const { data: newClass, error } = await supabase
          .from("classes")
          .insert([validatedData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        return Response.json(newClass);
      } catch (error) {
        console.error("Error creating class:", error);
        Sentry.captureException(error);

        if (error instanceof z.ZodError) {
          return Response.json(
            { error: "Geçersiz sınıf bilgileri", details: error.errors },
            { status: 400 }
          );
        }

        return Response.json(
          { error: "Sınıf oluşturulamadı" },
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
        const supabase = createRouteHandlerClient({ cookies });
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
          return Response.json(
            { error: "Sınıf ID'si gerekli" },
            { status: 400 }
          );
        }

        const validatedData = classSchema.parse(updateData);

        const { data: updatedClass, error } = await supabase
          .from("classes")
          .update(validatedData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return Response.json(updatedClass);
      } catch (error) {
        console.error("Error updating class:", error);
        Sentry.captureException(error);

        if (error instanceof z.ZodError) {
          return Response.json(
            { error: "Geçersiz sınıf bilgileri", details: error.errors },
            { status: 400 }
          );
        }

        return Response.json(
          { error: "Sınıf güncellenemedi" },
          { status: 500 }
        );
      }
    }
  );
} 