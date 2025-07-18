/**
 * Daily Attendance Interface
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Günlük Yoklama Alma
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { DailyAttendanceInterface } from '@/components/attendance/daily-attendance-interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DailyAttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/giris');
  }

  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/attendance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Günlük Yoklama</h1>
          <p className="mt-2 flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            {todayFormatted}
          </p>
        </div>
      </div>

      {/* Daily Attendance Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Öğrenci Yoklama Listesi
          </CardTitle>
          <CardDescription>Bugün için öğrenci devamsızlığını işaretleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyAttendanceInterface date={today} />
        </CardContent>
      </Card>
    </div>
  );
}
