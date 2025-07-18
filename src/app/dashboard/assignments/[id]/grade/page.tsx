/**
 * Assignment Grading Interface
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Notlandırma
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { AssignmentGradingInterface } from '@/components/assignments/assignment-grading-interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface GradeAssignmentPageProps {
  params: {
    id: string;
  };
}

export default async function GradeAssignmentPage({ params }: GradeAssignmentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/giris');
  }

  // Mock data - gerçek uygulamada repository'den gelecek
  const assignment = {
    id: params.id,
    title: 'Matematik Problemleri',
    type: 'homework',
    subject: 'Matematik',
    class: '5-A',
    maxScore: 100,
    rubric: [
      {
        criteria: 'Problem Çözme',
        points: 40,
        description: 'Problemleri doğru şekilde çözme',
      },
      {
        criteria: 'Gösterim',
        points: 30,
        description: 'Çözüm adımlarını net gösterme',
      },
      {
        criteria: 'Sunum',
        points: 30,
        description: 'Düzenli ve temiz sunum',
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/dashboard/assignments/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ödev Notlandırma</h1>
          <p className="mt-2 text-gray-600">
            {assignment.title} - {assignment.class}
          </p>
        </div>
      </div>

      {/* Grading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Teslimlerini Notlandır</CardTitle>
          <CardDescription>Her öğrencinin teslimini inceleyin ve notlandırın</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentGradingInterface assignment={assignment} />
        </CardContent>
      </Card>
    </div>
  );
}
