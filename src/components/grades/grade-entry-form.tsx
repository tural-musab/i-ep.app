/**
 * Grade Entry Form Component
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Not Giriş Formu
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Calculator,
  Users,
  BookOpen,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  number: string;
  class: string;
  currentGrade?: number;
  status: 'present' | 'absent' | 'excused';
}

interface GradeEntry {
  studentId: string;
  grade: number;
  maxGrade: number;
  notes?: string;
}

export function GradeEntryForm() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGradeType, setSelectedGradeType] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [maxGrade, setMaxGrade] = useState('100');
  const [weight, setWeight] = useState('1');
  const [description, setDescription] = useState('');
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [entryMode, setEntryMode] = useState<'individual' | 'bulk'>('individual');

  // Mock data - gerçek uygulamada API'den gelecek
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'Ali Veli',
      number: '2025001',
      class: '5-A',
      status: 'present'
    },
    {
      id: '2',
      name: 'Ayşe Yılmaz',
      number: '2025002',
      class: '5-A',
      status: 'present'
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      number: '2025003',
      class: '5-A',
      status: 'absent'
    },
    {
      id: '4',
      name: 'Fatma Demir',
      number: '2025004',
      class: '5-A',
      status: 'present'
    },
    {
      id: '5',
      name: 'Ahmet Çelik',
      number: '2025005',
      class: '5-A',
      status: 'excused'
    }
  ]);

  const classes = [
    { value: '5-a', label: '5-A' },
    { value: '5-b', label: '5-B' },
    { value: '6-a', label: '6-A' },
    { value: '6-b', label: '6-B' }
  ];

  const subjects = [
    { value: 'matematik', label: 'Matematik' },
    { value: 'turkce', label: 'Türkçe' },
    { value: 'fen', label: 'Fen Bilgisi' },
    { value: 'sosyal', label: 'Sosyal Bilgiler' },
    { value: 'ingilizce', label: 'İngilizce' }
  ];

  const gradeTypes = [
    { value: 'exam', label: 'Sınav' },
    { value: 'homework', label: 'Ödev' },
    { value: 'project', label: 'Proje' },
    { value: 'quiz', label: 'Kısa Sınav' },
    { value: 'participation', label: 'Katılım' }
  ];

  const handleGradeChange = (studentId: string, grade: string) => {
    const gradeValue = parseFloat(grade) || 0;
    const maxGradeValue = parseFloat(maxGrade) || 100;
    
    setGradeEntries(prev => {
      const existing = prev.find(entry => entry.studentId === studentId);
      if (existing) {
        return prev.map(entry => 
          entry.studentId === studentId 
            ? { ...entry, grade: gradeValue, maxGrade: maxGradeValue }
            : entry
        );
      } else {
        return [...prev, { studentId, grade: gradeValue, maxGrade: maxGradeValue }];
      }
    });
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setGradeEntries(prev => {
      const existing = prev.find(entry => entry.studentId === studentId);
      if (existing) {
        return prev.map(entry => 
          entry.studentId === studentId 
            ? { ...entry, notes }
            : entry
        );
      } else {
        return [...prev, { studentId, grade: 0, maxGrade: parseFloat(maxGrade) || 100, notes }];
      }
    });
  };

  const handleBulkGradeApplication = (grade: string) => {
    const gradeValue = parseFloat(grade) || 0;
    const maxGradeValue = parseFloat(maxGrade) || 100;
    
    const newEntries = students
      .filter(student => student.status === 'present')
      .map(student => ({
        studentId: student.id,
        grade: gradeValue,
        maxGrade: maxGradeValue
      }));
    
    setGradeEntries(newEntries);
  };

  const calculateStatistics = () => {
    const grades = gradeEntries.map(entry => (entry.grade / entry.maxGrade) * 100);
    if (grades.length === 0) return null;

    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    const average = sum / grades.length;
    const highest = Math.max(...grades);
    const lowest = Math.min(...grades);
    const passingGrades = grades.filter(grade => grade >= 60);
    const passingRate = (passingGrades.length / grades.length) * 100;

    return {
      average: average.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      passingRate: passingRate.toFixed(1),
      totalGraded: grades.length,
      totalStudents: students.length
    };
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !selectedGradeType || !examName) {
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    setIsSaving(true);
    try {
      // API call will be implemented here
      console.log('Saving grades:', {
        class: selectedClass,
        subject: selectedSubject,
        gradeType: selectedGradeType,
        examName,
        examDate,
        maxGrade,
        weight,
        description,
        grades: gradeEntries
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Notlar başarıyla kaydedildi!');
      
      // Reset form
      setGradeEntries([]);
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Notlar kaydedilirken hata oluştu!');
    } finally {
      setIsSaving(false);
    }
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'excused':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Mevcut';
      case 'absent': return 'Devamsız';
      case 'excused': return 'Mazeretli';
      default: return status;
    }
  };

  const statistics = calculateStatistics();

  return (
    <div className="space-y-6">
      {/* Grade Entry Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Not Giriş Ayarları
          </CardTitle>
          <CardDescription>
            Not girişi için sınıf, ders ve sınav bilgilerini seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sınıf</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Sınıf seçin" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ders</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Ders seçin" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Not Türü</Label>
              <Select value={selectedGradeType} onValueChange={setSelectedGradeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Not türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {gradeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sınav/Ödev Adı</Label>
              <Input
                placeholder="Örn: 1. Dönem Sınavı"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tarih</Label>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Maksimum Puan</Label>
              <Input
                type="number"
                placeholder="100"
                value={maxGrade}
                onChange={(e) => setMaxGrade(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Ağırlık</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="1.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Açıklama</Label>
              <Textarea
                placeholder="Sınav/ödev hakkında açıklama (isteğe bağlı)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Entry Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Not Giriş Modu
          </CardTitle>
          <CardDescription>
            Tek tek veya toplu not girişi yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={entryMode} onValueChange={(value) => setEntryMode(value as 'individual' | 'bulk')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Tek Tek Giriş</TabsTrigger>
              <TabsTrigger value="bulk">Toplu İşlem</TabsTrigger>
            </TabsList>

            {/* Individual Entry */}
            <TabsContent value="individual" className="space-y-4">
              <div className="space-y-4">
                {students.map((student) => {
                  const entry = gradeEntries.find(e => e.studentId === student.id);
                  return (
                    <div key={student.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(student.status)}
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-600">
                            #{student.number} • {getStatusLabel(student.status)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Puan</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={entry?.grade || ''}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                            disabled={student.status !== 'present'}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Yüzde</Label>
                          <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                            <span className={`font-medium ${entry ? getGradeColor(entry.grade, entry.maxGrade) : 'text-gray-400'}`}>
                              {entry ? ((entry.grade / entry.maxGrade) * 100).toFixed(1) : '0'}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Not</Label>
                          <Textarea
                            placeholder="Notlar (isteğe bağlı)"
                            value={entry?.notes || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            className="min-h-[40px]"
                            disabled={student.status !== 'present'}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Bulk Entry */}
            <TabsContent value="bulk" className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-medium mb-4">Toplu Not Uygulama</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Tüm öğrencilere uygulanacak puan"
                      id="bulkGrade"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const input = document.getElementById('bulkGrade') as HTMLInputElement;
                      if (input.value) {
                        handleBulkGradeApplication(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Uygula
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Bu işlem sadece mevcut öğrencilere uygulanacak
                </p>
              </div>

              <div className="space-y-2">
                {students.map((student) => {
                  const entry = gradeEntries.find(e => e.studentId === student.id);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(student.status)}
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-600">#{student.number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-medium ${entry ? getGradeColor(entry.grade, entry.maxGrade) : 'text-gray-400'}`}>
                            {entry ? entry.grade : '-'} / {maxGrade}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry ? `${((entry.grade / entry.maxGrade) * 100).toFixed(1)}%` : '-%'}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className={
                          student.status === 'present' ? 'bg-green-100 text-green-800' :
                          student.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {getStatusLabel(student.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Statistics */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              İstatistikler
            </CardTitle>
            <CardDescription>
              Girilen notların anlık analizi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{statistics.average}</div>
                <div className="text-sm text-blue-800">Sınıf Ortalaması</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{statistics.highest}</div>
                <div className="text-sm text-green-800">En Yüksek Not</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{statistics.lowest}</div>
                <div className="text-sm text-red-800">En Düşük Not</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{statistics.passingRate}%</div>
                <div className="text-sm text-yellow-800">Başarı Oranı</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              {statistics.totalGraded} / {statistics.totalStudents} öğrenci notlandırıldı
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Excel'den İçe Aktar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Şablon İndir
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGradeEntries([])}>
            Temizle
          </Button>
          <Button onClick={handleSave} disabled={isSaving || gradeEntries.length === 0}>
            {isSaving ? (
              <>
                <Calculator className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet ({gradeEntries.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}