/**
 * Student Performance Report Generator Component
 * Sprint 7: Report Generation System Development
 * İ-EP.APP - Öğrenci Performans Raporu Bileşeni
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  User,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Calendar,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  FileText,
  Download,
  Eye,
  Print,
  Share2,
  Filter,
  Search,
  RefreshCw,
  Star,
  Users,
  Activity,
  Zap,
  Heart,
  Lightbulb,
  Flag,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  Settings,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Info,
  AlertCircle,
  XCircle,
  Home,
  School,
  Calculator,
  Clipboard,
  PieChart,
  LineChart,
  BarChart,
  Percent,
  Hash,
  Calendar as CalendarIcon,
  FileBarChart,
  Presentation,
  Database,
  Upload,
  FileSpreadsheet,
  FilePdf,
  FileImage,
  Copy,
  CheckCheck,
  X,
  Save,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ReportRepository, StudentPerformanceReport } from '@/lib/repository/report-repository';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface StudentPerformanceReportProps {
  studentId?: string;
  academicYear?: string;
  semester?: 1 | 2;
  reportType?: 'academic' | 'behavioral' | 'attendance' | 'comprehensive';
}

export function StudentPerformanceReportGenerator({
  studentId,
  academicYear = '2024-2025',
  semester = 1,
  reportType = 'comprehensive',
}: StudentPerformanceReportProps) {
  const [report, setReport] = useState<StudentPerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>(studentId || '');
  const [selectedYear, setSelectedYear] = useState<string>(academicYear);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(semester);
  const [selectedType, setSelectedType] = useState<
    'academic' | 'behavioral' | 'attendance' | 'comprehensive'
  >(reportType);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'academic'])
  );

  const reportRepository = new ReportRepository();

  // Mock data for demonstration
  const mockStudents = [
    { id: '1', name: 'Ali Veli', class: '5-A', number: '12' },
    { id: '2', name: 'Ayşe Kaya', class: '5-A', number: '8' },
    { id: '3', name: 'Mehmet Demir', class: '5-B', number: '15' },
    { id: '4', name: 'Fatma Yılmaz', class: '5-B', number: '9' },
  ];

  const academicYears = ['2024-2025', '2023-2024', '2022-2023'];

  const generateReport = async () => {
    if (!selectedStudent) {
      setError('Lütfen bir öğrenci seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedReport = await reportRepository.generateStudentPerformanceReport(
        selectedStudent,
        selectedYear,
        selectedSemester,
        selectedType
      );
      setReport(generatedReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rapor oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    if (!report) return;

    setLoading(true);
    try {
      const exportData = await reportRepository.exportStudentPerformanceReport(report.id, format);

      // Create download link
      const blob = new Blob([exportData], {
        type:
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ogrenci_performans_raporu_${report.report_data.student_info.name}_${selectedYear}_${selectedSemester}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rapor dışa aktarılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-blue-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBehaviorColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Öğrenci Performans Raporu</h2>
          <p className="mt-1 text-gray-600">Detaylı akademik ve davranışsal performans analizi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Ayarlar
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Rapor Parametreleri
          </CardTitle>
          <CardDescription>Rapor oluşturmak için gerekli parametreleri belirleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="student">Öğrenci</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Öğrenci seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Akademik Yıl</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Dönem</Label>
              <Select
                value={selectedSemester.toString()}
                onValueChange={(value) => setSelectedSemester(parseInt(value) as 1 | 2)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1. Dönem</SelectItem>
                  <SelectItem value="2">2. Dönem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Rapor Türü</Label>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Kapsamlı</SelectItem>
                  <SelectItem value="academic">Akademik</SelectItem>
                  <SelectItem value="behavioral">Davranışsal</SelectItem>
                  <SelectItem value="attendance">Devam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={generateReport}
                disabled={loading || !selectedStudent}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Rapor Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="comparison"
                checked={showComparison}
                onCheckedChange={setShowComparison}
              />
              <Label htmlFor="comparison">Karşılaştırmalı Analiz</Label>
            </div>
            {report && (
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button variant="outline" size="sm">
                  <Print className="mr-2 h-4 w-4" />
                  Yazdır
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Paylaş
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Display */}
      {report && (
        <div className="space-y-6">
          {/* Student Overview */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('overview')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Öğrenci Bilgileri
                </CardTitle>
                {expandedSections.has('overview') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('overview') && (
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={report.report_data.student_info.photo_url} />
                    <AvatarFallback>
                      {report.report_data.student_info.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{report.report_data.student_info.name}</h3>
                    <div className="mt-2 flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <School className="h-4 w-4" />
                        <span>Sınıf: {report.report_data.student_info.class}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        <span>Numara: {report.report_data.student_info.number}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {selectedYear} - {selectedSemester}. Dönem
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Genel Ortalama</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {report.report_data.academic_performance.overall_gpa.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Sınıf Sıralaması: {report.report_data.academic_performance.class_rank}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Academic Performance */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('academic')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Akademik Performans
                  <Badge variant="outline" className="ml-2">
                    {report.report_data.academic_performance.subjects.length} Ders
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getTrendIcon(report.report_data.academic_performance.grade_trend)}
                  {expandedSections.has('academic') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
            {expandedSections.has('academic') && (
              <CardContent>
                <div className="space-y-4">
                  {report.report_data.academic_performance.subjects.map((subject, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-semibold">{subject.subject}</h4>
                            <p className="text-sm text-gray-600">{subject.teacher}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getGradeColor(subject.letter_grade)}>
                            {subject.letter_grade}
                          </Badge>
                          <div className="mt-1 text-sm text-gray-600">
                            {subject.average.toFixed(1)}/100
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Sınıf Sırası</div>
                          <div className="text-lg font-semibold">{subject.rank_in_class}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Devam Oranı</div>
                          <div
                            className={`text-lg font-semibold ${getAttendanceColor(subject.attendance_rate)}`}
                          >
                            %{subject.attendance_rate}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Davranış Puanı</div>
                          <div
                            className={`text-lg font-semibold ${getBehaviorColor(subject.behavior_score)}`}
                          >
                            {subject.behavior_score}/100
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Sınav Sayısı</div>
                          <div className="text-lg font-semibold">{subject.grades.length}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Performans</span>
                          <span className="text-sm font-medium">
                            {subject.average.toFixed(1)}/100
                          </span>
                        </div>
                        <Progress value={subject.average} className="h-2" />
                      </div>

                      {subject.comments && (
                        <div className="mt-3 rounded bg-blue-50 p-3">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="mt-0.5 h-4 w-4 text-blue-500" />
                            <div>
                              <div className="text-sm font-medium text-blue-800">
                                Öğretmen Yorumu
                              </div>
                              <div className="text-sm text-blue-700">{subject.comments}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('attendance')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Devam Durumu
                </CardTitle>
                {expandedSections.has('attendance') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('attendance') && (
              <CardContent>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.report_data.attendance_summary.total_days}
                    </div>
                    <div className="text-sm text-gray-600">Toplam Gün</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {report.report_data.attendance_summary.present_days}
                    </div>
                    <div className="text-sm text-gray-600">Geldiği Gün</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {report.report_data.attendance_summary.absent_days}
                    </div>
                    <div className="text-sm text-gray-600">Gelmediği Gün</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {report.report_data.attendance_summary.late_days}
                    </div>
                    <div className="text-sm text-gray-600">Geç Kaldığı Gün</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getAttendanceColor(report.report_data.attendance_summary.attendance_rate)}`}
                    >
                      %{report.report_data.attendance_summary.attendance_rate}
                    </div>
                    <div className="text-sm text-gray-600">Devam Oranı</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Aylık Devam Oranı</h4>
                  {report.report_data.attendance_summary.monthly_breakdown.map((month, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-3"
                    >
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32">
                          <Progress value={month.rate} className="h-2" />
                        </div>
                        <span className={`font-semibold ${getAttendanceColor(month.rate)}`}>
                          %{month.rate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Behavioral Assessment */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('behavior')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Davranışsal Değerlendirme
                </CardTitle>
                {expandedSections.has('behavior') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('behavior') && (
              <CardContent>
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Genel Davranış Puanı</span>
                    <span
                      className={`text-lg font-bold ${getBehaviorColor(report.report_data.behavioral_assessment.overall_score)}`}
                    >
                      {report.report_data.behavioral_assessment.overall_score}/100
                    </span>
                  </div>
                  <Progress
                    value={report.report_data.behavioral_assessment.overall_score}
                    className="h-3"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-semibold">Davranış Kategorileri</h4>
                    <div className="space-y-3">
                      {report.report_data.behavioral_assessment.categories.map(
                        (category, index) => (
                          <div key={index} className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="font-medium">{category.category}</span>
                              <span className={`font-semibold ${getBehaviorColor(category.score)}`}>
                                {category.score}/100
                              </span>
                            </div>
                            <Progress value={category.score} className="mb-2 h-2" />
                            {category.comments && (
                              <p className="text-sm text-gray-600">{category.comments}</p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-semibold">Disiplin Olayları</h4>
                    <div className="space-y-3">
                      {report.report_data.behavioral_assessment.incidents.map((incident, index) => (
                        <div key={index} className="rounded-lg border bg-red-50 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{incident.type}</span>
                            <span className="text-sm text-gray-600">
                              {format(new Date(incident.date), 'dd MMMM yyyy', { locale: tr })}
                            </span>
                          </div>
                          <p className="mb-1 text-sm text-gray-700">{incident.description}</p>
                          <p className="text-sm text-green-700">
                            <strong>Çözüm:</strong> {incident.resolution}
                          </p>
                        </div>
                      ))}
                    </div>

                    <h4 className="mt-6 mb-3 font-semibold">Başarılar</h4>
                    <div className="space-y-3">
                      {report.report_data.behavioral_assessment.achievements.map(
                        (achievement, index) => (
                          <div key={index} className="rounded-lg border bg-green-50 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <Award className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{achievement.title}</span>
                              <span className="text-sm text-gray-600">
                                {format(new Date(achievement.date), 'dd MMMM yyyy', { locale: tr })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{achievement.description}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('recommendations')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Öneriler ve Aksiyon Planı
                </CardTitle>
                {expandedSections.has('recommendations') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('recommendations') && (
              <CardContent>
                <div className="space-y-4">
                  {report.report_data.recommendations.map((recommendation, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-semibold">{recommendation.area}</h4>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(recommendation.priority)}
                        >
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="mb-3 text-gray-700">{recommendation.recommendation}</p>
                      <div>
                        <h5 className="mb-2 font-medium">Aksiyon Öğeleri:</h5>
                        <ul className="list-inside list-disc space-y-1">
                          {recommendation.action_items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm text-gray-600">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Report Footer */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <div>
                    Rapor Tarihi:{' '}
                    {format(new Date(report.generated_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </div>
                  <div>Rapor No: {report.id}</div>
                </div>
                <div className="text-right">
                  <div>Rapor Türü: {selectedType}</div>
                  <div>Sistem: İ-EP.APP</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
