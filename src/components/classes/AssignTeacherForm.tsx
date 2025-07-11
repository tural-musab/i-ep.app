"use client";

import * as React from "react";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

const formSchema = z.object({
  teacher_id: z.string({
    required_error: "Öğretmen seçiniz",
  }),
  role: z.enum(["subject", "homeroom"], {
    required_error: "Öğretmen rolü seçiniz",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignTeacherFormProps {
  classId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssignTeacherForm({ classId, onSuccess, onCancel }: AssignTeacherFormProps) {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = React.useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

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
          setFilteredTeachers(data);
          setError(null);
        } catch (error) {
          console.error("Error fetching available teachers:", error);
          Sentry.captureException(error);
          setError("Öğretmen listesi alınamadı");
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
          setError(null);

          const response = await fetch(`/api/class-teachers/${classId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teacher_id: values.teacher_id,
              role: values.role,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Öğretmen eklenemedi");
          }

          onSuccess();
        } catch (error) {
          console.error("Error assigning teacher:", error);
          Sentry.captureException(error);
          setError("Öğretmen eklenemedi");
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  React.useEffect(() => {
    fetchAvailableTeachers();
  }, [classId]);

  React.useEffect(() => {
    const filtered = teachers.filter((teacher: Teacher) => {
      const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
      const email = teacher.email.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg text-muted-foreground">Öğretmenler yükleniyor...</div>
      </div>
    );
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="text"
          placeholder="Öğretmen ara..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4"
        />

        <FormField
          control={form.control}
          name="teacher_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Öğretmen</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={filteredTeachers.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Öğretmen seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredTeachers.map((teacher: Teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} - {teacher.email}
                    </SelectItem>
                  ))}
                  {filteredTeachers.length === 0 && (
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

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Öğretmen Rolü</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="subject" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Branş Öğretmeni
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="homeroom" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Sınıf Öğretmeni
                  </FormLabel>
                </FormItem>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || filteredTeachers.length === 0}
          >
            {isSubmitting ? "Ekleniyor..." : "Ekle"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            İptal
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive text-center">
            {error}
          </div>
        )}
      </form>
    </Form>
  );
} 