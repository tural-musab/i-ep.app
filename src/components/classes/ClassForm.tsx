"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

interface ClassFormProps {
  initialData?: FormValues;
  onSuccess: () => void;
}

export function ClassForm({ initialData, onSuccess }: ClassFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      grade_level: 1,
      capacity: 30,
      academic_year: `${new Date().getFullYear()}-${
        new Date().getFullYear() + 1
      }`,
      is_active: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    return Sentry.startSpan(
      {
        op: "ui.submit",
        name: "Class Form Submit",
      },
      async () => {
        try {
          setIsSubmitting(true);

          const response = await fetch("/api/classes", {
            method: initialData ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Bir hata oluştu");
          }

          onSuccess();
        } catch (error) {
          console.error("Error submitting class form:", error);
          Sentry.captureException(error);
          form.setError("root", {
            type: "manual",
            message: "Sınıf kaydedilirken bir hata oluştu",
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sınıf Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örnek: 5-A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sınıf Seviyesi</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sınıf seviyesi seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}. Sınıf
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kapasite</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  placeholder="Örnek: 30"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="academic_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Akademik Yıl</FormLabel>
              <FormControl>
                <Input placeholder="Örnek: 2023-2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Aktif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Sınıfın aktif olup olmadığını belirler
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </form>
    </Form>
  );
} 