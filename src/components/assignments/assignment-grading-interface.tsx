/**
 * Assignment Grading Interface Component
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Notlandırma Arayüzü
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Save, 
  Send, 
  Star,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Calendar
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  type: string;
  subject: string;
  class: string;
  maxScore: number;
  rubric: {
    criteria: string;
    points: number;
    description: string;
  }[];
}

interface AssignmentGradingInterfaceProps {
  assignment: Assignment;
}

export function AssignmentGradingInterface({ assignment }: AssignmentGradingInterfaceProps) {
  // Mock submissions - gerçek uygulamada API'den gelecek
  const [submissions] = useState([
    {
      id: '1',
      student: {
        id: '1',
        name: 'Ali Veli',
        number: '2025001',
        email: 'ali.veli@ogrenci.com'
      },
      submissionDate: '2025-01-18T10:30:00',
      files: [
        { name: 'matematik_odev.pdf', size: '2.5 MB', type: 'pdf' },
        { name: 'cevaplar.docx', size: '1.2 MB', type: 'docx' }
      ],
      status: 'submitted',
      score: null,
      feedback: '',
      rubricScores: assignment.rubric.map(r => ({ criteria: r.criteria, score: 0 }))
    },
    {
      id: '2',
      student: {
        id: '2',
        name: 'Ayşe Yılmaz',
        number: '2025002',
        email: 'ayse.yilmaz@ogrenci.com'
      },
      submissionDate: '2025-01-19T14:15:00',
      files: [
        { name: 'matematik_cevaplar.pdf', size: '3.1 MB', type: 'pdf' }
      ],
      status: 'submitted',
      score: null,
      feedback: '',
      rubricScores: assignment.rubric.map(r => ({ criteria: r.criteria, score: 0 }))
    },
    {
      id: '3',
      student: {
        id: '3',
        name: 'Mehmet Kaya',
        number: '2025003',
        email: 'mehmet.kaya@ogrenci.com'
      },
      submissionDate: '2025-01-17T16:45:00',
      files: [
        { name: 'odev_1.pdf', size: '1.8 MB', type: 'pdf' }
      ],
      status: 'graded',
      score: 85,
      feedback: 'Güzel bir çalışma! Çoğu problem doğru çözülmüş. Sadece 5. soruda küçük bir hata var.',
      rubricScores: assignment.rubric.map((r, i) => ({ 
        criteria: r.criteria, 
        score: i === 0 ? 35 : i === 1 ? 25 : 25 
      }))
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSubmission, setCurrentSubmission] = useState(submissions[0]);
  const [isGrading, setIsGrading] = useState(false);

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  const handleNext = () => {
    if (currentIndex < submissions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSubmission(submissions[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSubmission(submissions[prevIndex]);
    }
  };

  const handleRubricScoreChange = (criteria: string, score: number) => {
    setCurrentSubmission({
      ...currentSubmission,
      rubricScores: currentSubmission.rubricScores.map(rs => 
        rs.criteria === criteria ? { ...rs, score } : rs
      )
    });
  };

  const handleFeedbackChange = (feedback: string) => {
    setCurrentSubmission({
      ...currentSubmission,
      feedback
    });
  };

  const calculateTotalScore = () => {
    return currentSubmission.rubricScores.reduce((total, rs) => total + rs.score, 0);
  };

  const saveGrade = async () => {
    setIsGrading(true);
    
    try {
      const totalScore = calculateTotalScore();
      
      // API call will be implemented here
      console.log('Saving grade:', {
        submissionId: currentSubmission.id,
        score: totalScore,
        feedback: currentSubmission.feedback,
        rubricScores: currentSubmission.rubricScores
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setCurrentSubmission({
        ...currentSubmission,
        score: totalScore,
        status: 'graded'
      });
      
    } catch (error) {
      console.error('Error saving grade:', error);
    } finally {
      setIsGrading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress and Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {currentSubmission.student.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {currentIndex + 1} / {submissions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === submissions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            <div className="flex items-center gap-4 text-sm">
              <span>#{currentSubmission.student.number}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(currentSubmission.submissionDate).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <Badge variant={currentSubmission.status === 'graded' ? 'secondary' : 'outline'}>
                {currentSubmission.status === 'graded' ? 'Notlandırıldı' : 'Bekliyor'}
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Progress 
                value={((gradedSubmissions.length) / submissions.length) * 100} 
                className="w-64 h-2"
              />
              <p className="text-sm text-gray-600 mt-1">
                {gradedSubmissions.length} / {submissions.length} tamamlandı
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Bekleyen: {pendingSubmissions.length}</p>
              <p className="text-sm text-gray-600">Tamamlanan: {gradedSubmissions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Submission Content */}
        <div className="space-y-4">
          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Teslim Edilen Dosyalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentSubmission.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">{file.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      İndir
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Area */}
          <Card>
            <CardHeader>
              <CardTitle>Dosya Önizleme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Dosya önizlemesi burada görüntülenecek</p>
                  <p className="text-sm text-gray-500 mt-2">PDF, Word, resim dosyaları desteklenir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Grading */}
        <div className="space-y-4">
          {/* Rubric Grading */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Rubrik Değerlendirmesi
              </CardTitle>
              <CardDescription>
                Her kriter için puan verin (Toplam: {assignment.maxScore} puan)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignment.rubric.map((criterion, index) => {
                  const currentScore = currentSubmission.rubricScores.find(rs => rs.criteria === criterion.criteria)?.score || 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-medium">{criterion.criteria}</Label>
                        <span className="text-sm text-gray-600">{criterion.points} puan</span>
                      </div>
                      <p className="text-sm text-gray-600">{criterion.description}</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={criterion.points}
                          value={currentScore}
                          onChange={(e) => handleRubricScoreChange(criterion.criteria, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm">/ {criterion.points}</span>
                        <div className="flex-1 ml-4">
                          <Progress value={(currentScore / criterion.points) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Toplam Puan:</span>
                  <span className="text-2xl font-bold">{calculateTotalScore()} / {assignment.maxScore}</span>
                </div>
                <Progress value={(calculateTotalScore() / assignment.maxScore) * 100} className="h-3 mt-2" />
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Geri Bildirim
              </CardTitle>
              <CardDescription>
                Öğrenciye yönelik geri bildirim yazın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Öğrenciye yönelik geri bildirim yazın..."
                value={currentSubmission.feedback}
                onChange={(e) => handleFeedbackChange(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={saveGrade}
                  disabled={isGrading}
                  className="flex-1"
                >
                  {isGrading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
                <Button
                  onClick={saveGrade}
                  disabled={isGrading}
                  className="flex-1"
                >
                  {isGrading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Notla & Gönder
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Geçiş</CardTitle>
          <CardDescription>
            Diğer öğrenci teslimlerine hızlıca geçiş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {submissions.map((submission, index) => (
              <Button
                key={submission.id}
                variant={index === currentIndex ? "default" : "outline"}
                onClick={() => {
                  setCurrentIndex(index);
                  setCurrentSubmission(submission);
                }}
                className="justify-start"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{submission.student.name}</span>
                  {submission.status === 'graded' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}