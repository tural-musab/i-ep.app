"use client";

import { useState } from "react";
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
import { ClassForm } from "./ClassForm";

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

interface ClassListProps {
  classes: Class[];
  onClassCreated: () => void;
}

export function ClassList({ classes, onClassCreated }: ClassListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sınıflar</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Yeni Sınıf
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Sınıf Oluştur</DialogTitle>
            </DialogHeader>
            <ClassForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                onClassCreated();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sınıf Adı</TableHead>
              <TableHead>Sınıf Öğretmeni</TableHead>
              <TableHead className="text-center">Sınıf Seviyesi</TableHead>
              <TableHead className="text-center">Öğrenci Sayısı</TableHead>
              <TableHead className="text-center">Öğretmen Sayısı</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{classItem.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {classItem.academic_year}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {classItem.homeroom_teacher ? (
                    <div>
                      <div>
                        {classItem.homeroom_teacher.first_name}{" "}
                        {classItem.homeroom_teacher.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {classItem.homeroom_teacher.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Sınıf öğretmeni atanmamış
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {classItem.grade_level}. Sınıf
                </TableCell>
                <TableCell className="text-center">
                  <div>
                    <div>{classItem.student_count}</div>
                    <div className="text-sm text-muted-foreground">
                      / {classItem.capacity}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {classItem.teacher_count}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={classItem.is_active ? "default" : "secondary"}>
                    {classItem.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" asChild>
                    <a href={`/dashboard/classes/${classItem.id}`}>Detay</a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  <div className="text-muted-foreground">
                    Henüz sınıf oluşturulmamış
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