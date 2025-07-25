'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { StudentGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Paperclip,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { AssignmentFileUpload } from '@/components/student/assignment-file-upload';

// Types
interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  subject: string;
  teacher: string;
  dueDate: string;
  points: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  attachments?: AssignmentFile[];
}

interface AssignmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface SubmissionFile {
  file: File;
  id: string;
  progress?: number;
  error?: string;
}

// Demo assignment data
const DEMO_ASSIGNMENT: Assignment = {
  id: '1',
  title: 'Fonksiyonlar ve Grafikler',
  description: 'İkinci dereceden fonksiyonların grafik çizimi ve analizi',
  instructions: `Bu ödevde aşağıdaki konuları içeren detaylı bir rapor hazırlamanız beklenmektedir:

1. İkinci dereceden fonksiyonların genel formunu açıklayınız
2. En az 3 farklı ikinci dereceden fonksiyon örneği verip grafiklerini çiziniz
3. Vertex (tepe noktası) kavramını açıklayınız ve örneklerle gösteriniz
4. Diskriminant kavramını açıklayıp kök durumlarını analiz ediniz
5. Grafik çizim tekniklerini step-by-step gösteriniz

Rapor formatı:
- Microsoft Word veya PDF formatında
- En az 5 sayfa
- Grafikler için GeoGebra veya benzeri araçlar kullanılabilir
- Kaynakça dahil edilmelidir`,
  subject: 'Matematik',
  teacher: 'Ahmet Yılmaz',
  dueDate: '2025-01-30T23:59:59Z',
  points: 100,
  allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 3,
  attachments: [
    {
      id: '1',
      name: 'Fonksiyonlar_Örnekleri.pdf',
      type: 'application/pdf',
      size: 245760,
      url: '/demo/files/fonksiyonlar_ornekleri.pdf'
    },
    {
      id: '2', 
      name: 'GeoGebra_Kullanım_Kılavuzu.pdf',
      type: 'application/pdf',
      size: 512000,
      url: '/demo/files/geogebra_kilavuzu.pdf'
    }
  ]
};

function AssignmentSubmissionContent() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>([]);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load assignment details
  useEffect(() => {
    async function fetchAssignment() {
      if (!assignmentId) return;
      
      setIsLoadingAssignment(true);
      setError(null);

      try {
        // TODO: Replace with real API call
        // const response = await fetch(`/api/assignments/${assignmentId}`);
        // const result = await response.json();
        
        // For demo, simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAssignment(DEMO_ASSIGNMENT);
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('Ödev detayları yüklenirken hata oluştu');
        setAssignment(DEMO_ASSIGNMENT);
      } finally {
        setIsLoadingAssignment(false);
      }
    }

    fetchAssignment();
  }, [assignmentId]);

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    const newFiles: SubmissionFile[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0
    }));

    setSubmissionFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload progress
    newFiles.forEach(submissionFile => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        
        setSubmissionFiles(prev => 
          prev.map(f => 
            f.id === submissionFile.id 
              ? { ...f, progress }
              : f
          )
        );
      }, 200);
    });
  };

  // Remove file
  const handleRemoveFile = (fileId: string) => {
    setSubmissionFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Submit assignment
  const handleSubmit = async () => {
    if (!user || !assignment) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Replace with real API call
      const submissionData = {
        student_id: user.id,
        content: submissionContent,
        attachments: submissionFiles.map(f => f.file.name), // In real implementation, upload files first
        metadata: {
          submitted_at: new Date().toISOString(),
          file_count: submissionFiles.length,
          content_length: submissionContent.length
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submissionData)
      // });

      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/ogrenci/odevler');
      }, 3000);

    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Ödev teslimi sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get time remaining info
  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffTime < 0) {
      return { text: 'Süre doldu', color: 'text-red-600', bgColor: 'bg-red-50', urgent: true };
    } else if (diffHours < 24) {
      return { text: `${diffHours} saat kaldı`, color: 'text-red-600', bgColor: 'bg-red-50', urgent: true };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} gün kaldı`, color: 'text-orange-600', bgColor: 'bg-orange-50', urgent: true };
    } else {
      return { text: `${diffDays} gün kaldı`, color: 'text-blue-600', bgColor: 'bg-blue-50', urgent: false };
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || isLoadingAssignment) {
    return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Giriş yapılmadı</div>;
  }

  if (!assignment) {
    return <div className="flex min-h-screen items-center justify-center">Ödev bulunamadı</div>;
  }

  const timeInfo = getTimeRemaining(assignment.dueDate);

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-green-900 mb-2">Ödev Başarıyla Teslim Edildi!</h1>
          <p className="text-gray-600 mb-4">Ödeviniz öğretmeninize iletildi. Ana sayfaya yönlendiriliyorsunuz...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/ogrenci/odevler">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ödevlere Dön
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="mt-2 text-gray-600">
              {assignment.subject} • {assignment.teacher} • {assignment.points} puan
            </p>
          </div>
          <div className={`rounded-lg px-4 py-2 ${timeInfo.bgColor}`}>
            <div className="flex items-center">
              <Clock className={`mr-2 h-4 w-4 ${timeInfo.color}`} />
              <span className={`text-sm font-medium ${timeInfo.color}`}>
                {timeInfo.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Ödev Açıklaması
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{assignment.instructions}</p>
            </CardContent>
          </Card>

          {/* Assignment Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Paperclip className="mr-2 h-5 w-5" />
                  Öğretmen Dosyaları
                </CardTitle>
                <CardDescription>
                  Öğretmeninizin paylaştığı ek dosyalar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center">
                        <FileText className="mr-3 h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-4 w-4" />
                        İndir
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Ödev Teslimi
              </CardTitle>
              <CardDescription>
                Çalışmanızı buraya yükleyin ve teslim edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (İsteğe bağlı)
                </label>
                <Textarea
                  placeholder="Çalışmanız hakkında açıklama yazabilirsiniz..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosya Yükleme
                </label>
                <AssignmentFileUpload
                  onFileUpload={handleFileUpload}
                  allowedTypes={assignment.allowedFileTypes}
                  maxFileSize={assignment.maxFileSize}
                  maxFiles={assignment.maxFiles}
                  currentFileCount={submissionFiles.length}
                />
              </div>

              {/* Uploaded Files */}
              {submissionFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yüklenen Dosyalar ({submissionFiles.length}/{assignment.maxFiles})
                  </label>
                  <div className="space-y-2">
                    {submissionFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex items-center flex-1">
                          <FileText className="mr-3 h-8 w-8 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
                            {file.progress !== undefined && file.progress < 100 && (
                              <div className="mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                                    style={{ width: `${file.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  asChild
                  disabled={isSubmitting}
                >
                  <Link href="/ogrenci/odevler">İptal</Link>
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || submissionFiles.length === 0}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Teslim Ediliyor...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Teslim Et
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ödev Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Son Teslim Tarihi</p>
                <p className="font-medium">{new Date(assignment.dueDate).toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Puan</p>
                <p className="font-medium">{assignment.points} puan</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kabul Edilen Dosya Türleri</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignment.allowedFileTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maksimum Dosya Boyutu</p>
                <p className="font-medium">{formatFileSize(assignment.maxFileSize)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maksimum Dosya Sayısı</p>
                <p className="font-medium">{assignment.maxFiles} dosya</p>
              </div>
            </CardContent>
          </Card>

          {/* Warning Card */}
          {timeInfo.urgent && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Dikkat!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  Teslim süresi yaklaşıyor. Ödevinizi en kısa sürede teslim etmeyi unutmayın.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssignmentSubmissionPage() {
  return (
    <StudentGuard
      fallback={
        <AccessDenied
          title="Öğrenci Girişi Gerekli"
          message="Bu sayfayı görüntülemek için öğrenci hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
        <AssignmentSubmissionContent />
      </Suspense>
    </StudentGuard>
  );
}