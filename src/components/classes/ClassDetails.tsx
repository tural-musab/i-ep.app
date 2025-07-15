"use client";

import { useState } from "react";
// import * as Sentry from "@sentry/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface ClassDetailsProps {
  classData: Class;
  onUpdate: () => void;
}

export function ClassDetails({ classData, onUpdate }: ClassDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button>Sınıfı Düzenle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sınıf Bilgilerini Düzenle</DialogTitle>
            </DialogHeader>
            <ClassForm
              initialData={classData}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                onUpdate();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Sınıf Adı
              </div>
              <div className="mt-1">{classData.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Sınıf Seviyesi
              </div>
              <div className="mt-1">{classData.grade_level}. Sınıf</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Akademik Yıl
              </div>
              <div className="mt-1">{classData.academic_year}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Durum
              </div>
              <div className="mt-1">
                <Badge variant={classData.is_active ? "default" : "secondary"}>
                  {classData.is_active ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kapasite ve Katılım</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Kapasite
              </div>
              <div className="mt-1">{classData.capacity} Öğrenci</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Mevcut Öğrenci Sayısı
              </div>
              <div className="mt-1">{classData.student_count} Öğrenci</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Öğretmen Sayısı
              </div>
              <div className="mt-1">{classData.teacher_count} Öğretmen</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Sınıf Öğretmeni
              </div>
              <div className="mt-1">
                {classData.homeroom_teacher ? (
                  <div>
                    {classData.homeroom_teacher.first_name}{" "}
                    {classData.homeroom_teacher.last_name}
                    <div className="text-sm text-muted-foreground">
                      {classData.homeroom_teacher.email}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Sınıf öğretmeni atanmamış
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 