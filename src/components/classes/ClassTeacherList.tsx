"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusIcon } from "@radix-ui/react-icons";
import { AssignTeacherForm } from "./AssignTeacherForm";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_homeroom_teacher: boolean;
}

interface ClassTeacherListProps {
  classId: string;
}

export function ClassTeacherList({ classId }: ClassTeacherListProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const fetchTeachers = async () => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `GET /api/class-teachers/${classId}`,
      },
      async () => {
        try {
          const response = await fetch(`/api/class-teachers/${classId}`);
          if (!response.ok) {
            throw new Error("Öğretmen listesi alınamadı");
          }
          const data = await response.json();
          setTeachers(data);
          setError(null);
        } catch (error) {
          console.error("Error fetching teachers:", error);
          Sentry.captureException(error);
          setError("Öğretmen listesi yüklenirken bir hata oluştu");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `DELETE /api/class-teachers/${classId}/${teacherId}`,
      },
      async () => {
        try {
          const response = await fetch(
            `/api/class-teachers/${classId}/${teacherId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Öğretmen sınıftan çıkarılamadı");
          }

          await fetchTeachers();
        } catch (error) {
          console.error("Error removing teacher:", error);
          Sentry.captureException(error);
          // TODO: Show error toast
        }
      }
    );
  };

  const handleSetHomeroom = async (teacherId: string) => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `PUT /api/class-teachers/${classId}/${teacherId}/homeroom`,
      },
      async () => {
        try {
          const response = await fetch(
            `/api/class-teachers/${classId}/${teacherId}/homeroom`,
            {
              method: "PUT",
            }
          );

          if (!response.ok) {
            throw new Error("Sınıf öğretmeni atanamadı");
          }

          await fetchTeachers();
        } catch (error) {
          console.error("Error setting homeroom teacher:", error);
          Sentry.captureException(error);
          // TODO: Show error toast
        }
      }
    );
  };

  useEffect(() => {
    fetchTeachers();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Öğretmen Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Öğretmen Ekle</DialogTitle>
            </DialogHeader>
            <AssignTeacherForm
              classId={classId}
              onSuccess={() => {
                setIsAssignDialogOpen(false);
                fetchTeachers();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="text-center">Sınıf Öğretmeni</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>
                  {teacher.first_name} {teacher.last_name}
                </TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={teacher.is_active ? "default" : "secondary"}>
                    {teacher.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={teacher.is_homeroom_teacher ? "default" : "outline"}
                  >
                    {teacher.is_homeroom_teacher ? "Evet" : "Hayır"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {!teacher.is_homeroom_teacher && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetHomeroom(teacher.id)}
                    >
                      Sınıf Öğretmeni Yap
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTeacher(teacher.id)}
                  >
                    Çıkar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <div className="text-muted-foreground">
                    Bu sınıfta henüz öğretmen yok
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 