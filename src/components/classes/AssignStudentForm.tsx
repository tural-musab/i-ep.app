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

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
}

const formSchema = z.object({
  student_id: z.string({
    required_error: "Öğrenci seçiniz",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignStudentFormProps {
  classId: string;
  onSuccess: () => void;
}

export function AssignStudentForm({ classId, onSuccess }: AssignStudentFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fetchAvailableStudents = async () => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: "GET /api/students/available",
      },
      async () => {
        try {
          const response = await fetch(
            `/api/students/available?classId=${classId}`
          );
          if (!response.ok) {
            throw new Error("Öğrenci listesi alınamadı");
          }
          const data = await response.json();
          setStudents(data);
        } catch (error) {
          console.error("Error fetching available students:", error);
          Sentry.captureException(error);
          form.setError("root", {
            type: "manual",
            message: "Öğrenci listesi yüklenirken bir hata oluştu",
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
        name: "Assign Student Form Submit",
      },
      async () => {
        try {
          setIsSubmitting(true);

          const response = await fetch(`/api/class-students/${classId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_id: values.student_id,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Bir hata oluştu");
          }

          onSuccess();
        } catch (error) {
          console.error("Error assigning student:", error);
          Sentry.captureException(error);
          form.setError("root", {
            type: "manual",
            message: "Öğrenci eklenirken bir hata oluştu",
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  useEffect(() => {
    fetchAvailableStudents();
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
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Öğrenci</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={students.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_number} - {student.first_name}{" "}
                      {student.last_name}
                    </SelectItem>
                  ))}
                  {students.length === 0 && (
                    <SelectItem value="empty" disabled>
                      Eklenebilecek öğrenci yok
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
          disabled={isSubmitting || students.length === 0}
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