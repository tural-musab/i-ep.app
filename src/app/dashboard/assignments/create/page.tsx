/**
 * Assignment Creation Form
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Oluşturma
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { AssignmentCreateForm } from '@/components/assignments/assignment-create-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CreateAssignmentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/giris');
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/assignments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ödev Oluştur</h1>
          <p className="text-gray-600 mt-2">Öğrencileriniz için yeni bir ödev oluşturun</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Ödev Detayları</CardTitle>
          <CardDescription>
            Ödevin temel bilgilerini girin ve ayarlarını yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}