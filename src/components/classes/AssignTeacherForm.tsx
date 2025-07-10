"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Sentry from "@sentry/nextjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const formSchema = z.object({
  teacher_id: z.string({
    required_error: "Öğretmen seçiniz",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignTeacherFormProps {
  classId: string;
  onSuccess: () => void;
}

export function AssignTeacherForm({ classId, onSuccess }: AssignTeacherFormProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fetchAvailableTeachers = async () => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: "GET /api/teachers/available",
      },
      async () => {
        try {
          const response = await fetch(
            `/api/teachers/available?classId=${classId}`
          );
          if (!response.ok) {
            throw new Error("Öğretmen listesi alınamadı");
          }
          const data = await response.json();
          setTeachers(data);
        } catch (error) {
          console.error("Error fetching available teachers:", error);
          Sentry.captureException(error);
          form.setError("root", {
            type: "manual",
            message: "Öğretmen listesi yüklenirken bir hata oluştu",
          });
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const onSubmit = async (values: FormValues) => {
    return Sentry.startSpan(
      {
        op: "ui.submit",
        name: "Assign Teacher Form Submit",
      },
      async () => {
        try {
          setIsSubmitting(true);

          const response = await fetch(`/api/class-teachers/${classId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teacher_id: values.teacher_id,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Bir hata oluştu");
          }

          onSuccess();
        } catch (error) {
          console.error("Error assigning teacher:", error);
          Sentry.captureException(error);
          form.setError("root", {
            type: "manual",
            message: "Öğretmen eklenirken bir hata oluştu",
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  useEffect(() => {
    fetchAvailableTeachers();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="teacher_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Öğretmen</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={teachers.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Öğretmen seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} - {teacher.email}
                    </SelectItem>
                  ))}
                  {teachers.length === 0 && (
                    <SelectItem value="empty" disabled>
                      Eklenebilecek öğretmen yok
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || teachers.length === 0}
        >
          {isSubmitting ? "Ekleniyor..." : "Ekle"}
        </Button>

        {form.formState.errors.root && (
          <div className="text-sm text-destructive text-center">
            {form.formState.errors.root.message}
          </div>
        )}
      </form>
    </Form>
  );
} 