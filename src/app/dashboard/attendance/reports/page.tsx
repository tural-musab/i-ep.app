/**
 * Attendance Reports Page
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Devamsızlık Raporları
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { AttendanceReports } from '@/components/attendance/attendance-reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AttendanceReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/giris');
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/attendance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Devamsızlık Raporları</h1>
          <p className="text-gray-600 mt-2">Detaylı devamsızlık raporlarını görüntüleyin ve indirin</p>
        </div>
      </div>

      {/* Reports Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapor Oluştur
          </CardTitle>
          <CardDescription>
            Farklı rapor türlerini oluşturun ve analiz edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceReports />
        </CardContent>
      </Card>
    </div>
  );
}