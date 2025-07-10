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
import { AssignStudentForm } from "./AssignStudentForm";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
  is_active: boolean;
}

interface ClassStudentListProps {
  classId: string;
  capacity: number;
}

export function ClassStudentList({ classId, capacity }: ClassStudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const fetchStudents = async () => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `GET /api/class-students/${classId}`,
      },
      async () => {
        try {
          const response = await fetch(`/api/class-students/${classId}`);
          if (!response.ok) {
            throw new Error("Öğrenci listesi alınamadı");
          }
          const data = await response.json();
          setStudents(data);
          setError(null);
        } catch (error) {
          console.error("Error fetching students:", error);
          Sentry.captureException(error);
          setError("Öğrenci listesi yüklenirken bir hata oluştu");
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const handleRemoveStudent = async (studentId: string) => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `DELETE /api/class-students/${classId}/${studentId}`,
      },
      async () => {
        try {
          const response = await fetch(
            `/api/class-students/${classId}/${studentId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Öğrenci sınıftan çıkarılamadı");
          }

          await fetchStudents();
        } catch (error) {
          console.error("Error removing student:", error);
          Sentry.captureException(error);
          // TODO: Show error toast
        }
      }
    );
  };

  useEffect(() => {
    fetchStudents();
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
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {students.length} / {capacity} öğrenci
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={students.length >= capacity}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Öğrenci Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Öğrenci Ekle</DialogTitle>
            </DialogHeader>
            <AssignStudentForm
              classId={classId}
              onSuccess={() => {
                setIsAssignDialogOpen(false);
                fetchStudents();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Öğrenci No</TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  {student.student_number}
                </TableCell>
                <TableCell>
                  {student.first_name} {student.last_name}
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={student.is_active ? "default" : "secondary"}>
                    {student.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveStudent(student.id)}
                  >
                    Çıkar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <div className="text-muted-foreground">
                    Bu sınıfta henüz öğrenci yok
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