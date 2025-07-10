"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassDetails } from "@/components/classes/ClassDetails";
import { ClassStudentList } from "@/components/classes/ClassStudentList";
import { ClassTeacherList } from "@/components/classes/ClassTeacherList";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  grade_level: number;
  capacity: number;
  academic_year: string;
  is_active: boolean;
  student_count: number;
  teacher_count: number;
  homeroom_teacher?: Teacher;
}

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassDetails = async () => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `GET /api/classes/${classId}`,
      },
      async () => {
        try {
          const response = await fetch(`/api/classes/${classId}`);
          if (!response.ok) {
            throw new Error("Sınıf detayları alınamadı");
          }
          const data = await response.json();
          setClassData(data);
          setError(null);
        } catch (error) {
          console.error("Error fetching class details:", error);
          Sentry.captureException(error);
          setError("Sınıf detayları yüklenirken bir hata oluştu");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-lg text-destructive">{error || "Sınıf bulunamadı"}</div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/classes">Sınıf Listesine Dön</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{classData.name}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/classes">Sınıf Listesine Dön</Link>
        </Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Sınıf Bilgileri</TabsTrigger>
          <TabsTrigger value="students">Öğrenciler</TabsTrigger>
          <TabsTrigger value="teachers">Öğretmenler</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <ClassDetails
            classData={classData}
            onUpdate={fetchClassDetails}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <ClassStudentList
            classId={classId}
            capacity={classData.capacity}
          />
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          <ClassTeacherList
            classId={classId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 