/**
 * Class Analytics Report System Component
 * Sprint 7: Report Generation System Development
 * İ-EP.APP - Sınıf Analitik Raporu Bileşeni
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
  Users,
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
  User,
  Trophy,
  Layers,
  Grid,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Minus,
  UserCheck,
  UserX,
  UserClock,
  Users2,
  BookX,
  BookCheck,
  UserPlus,
  UserMinus,
  Gauge,
  Radar,
  Pie,
  DonutChart,
  AreaChart,
  ScatterChart,
  Timer,
  Stopwatch,
  Hourglass,
  Clock3,
  ClockIcon,
  Focus,
  Crosshair,
  Bullseye,
  MapPin,
  Navigation,
  Compass,
  Route,
  FileQuestion,
  HelpCircle,
  QuestionMarkCircle,
  Sparkles,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Medal,
  Crown,
  Gem,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  FileX,
  FileCheck,
  FileWarning,
  FilePlus,
  FileMinus,
} from 'lucide-react';
import { ReportRepository, ClassAnalyticsReport } from '@/lib/repository/report-repository';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ClassAnalyticsReportProps {
  classId?: string;
  academicYear?: string;
  semester?: 1 | 2;
  reportType?: 'academic' | 'behavioral' | 'attendance' | 'comprehensive';
}

export function ClassAnalyticsReportSystem({
  classId,
  academicYear = '2024-2025',
  semester = 1,
  reportType = 'comprehensive',
}: ClassAnalyticsReportProps) {
  const [report, setReport] = useState<ClassAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(classId || '');
  const [selectedYear, setSelectedYear] = useState<string>(academicYear);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(semester);
  const [selectedType, setSelectedType] = useState<
    'academic' | 'behavioral' | 'attendance' | 'comprehensive'
  >(reportType);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'performance'])
  );

  const reportRepository = new ReportRepository();

  // Mock data for demonstration
  const mockClasses = [
    { id: '1', name: '5-A', teacher: 'Ahmet Öğretmen', studentCount: 28, grade: 5 },
    { id: '2', name: '5-B', teacher: 'Ayşe Öğretmen', studentCount: 26, grade: 5 },
    { id: '3', name: '6-A', teacher: 'Mehmet Öğretmen', studentCount: 30, grade: 6 },
    { id: '4', name: '6-B', teacher: 'Fatma Öğretmen', studentCount: 29, grade: 6 },
  ];

  const academicYears = ['2024-2025', '2023-2024', '2022-2023'];

  const generateReport = async () => {
    if (!selectedClass) {
      setError('Lütfen bir sınıf seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedReport = await reportRepository.generateClassAnalyticsReport(
        selectedClass,
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
      const exportData = await reportRepository.exportClassAnalyticsReport(report.id, format);

      const blob = new Blob([exportData], {
        type:
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sinif_analitik_raporu_${report.report_data.class_info.name}_${selectedYear}_${selectedSemester}.${format}`;
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
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-orange-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 95) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (rate >= 90) return <Clock className="h-4 w-4 text-blue-500" />;
    if (rate >= 80) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getBehaviorIcon = (score: number) => {
    if (score >= 90) return <Smile className="h-4 w-4 text-green-500" />;
    if (score >= 80) return <Meh className="h-4 w-4 text-blue-500" />;
    if (score >= 70) return <Frown className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sınıf Analitik Raporu</h2>
          <p className="mt-1 text-gray-600">Sınıf performansı ve karşılaştırmalı analiz</p>
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
          <CardDescription>
            Sınıf analitik raporu oluşturmak için parametreleri belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <Label htmlFor="class">Sınıf</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Sınıf seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.teacher}
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
              <Label htmlFor="view">Görünüm</Label>
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Genel Bakış</SelectItem>
                  <SelectItem value="detailed">Detaylı</SelectItem>
                  <SelectItem value="comparison">Karşılaştırma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={generateReport}
                disabled={loading || !selectedClass}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Rapor Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>

          {report && (
            <div className="mt-4 flex gap-2">
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
          {/* Class Overview */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('overview')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Sınıf Genel Bilgileri
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">{report.report_data.class_info.name}</div>
                    <div className="text-sm text-gray-600">Sınıf</div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {report.report_data.class_info.teacher}
                    </div>
                    <div className="text-sm text-gray-600">Sınıf Öğretmeni</div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                      <Users2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {report.report_data.class_info.student_count}
                    </div>
                    <div className="text-sm text-gray-600">Öğrenci Sayısı</div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {report.report_data.overall_statistics.class_average.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Sınıf Ortalaması</div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Performance Statistics */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('performance')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performans İstatistikleri
                </CardTitle>
                {expandedSections.has('performance') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('performance') && (
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Akademik Performans</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">En Yüksek Not</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.highest_grade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">En Düşük Not</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.lowest_grade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Standart Sapma</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.standard_deviation.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Başarı Oranı</span>
                        <span
                          className={`font-semibold ${getPerformanceColor(report.report_data.overall_statistics.pass_rate)}`}
                        >
                          %{report.report_data.overall_statistics.pass_rate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Devam Durumu</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ortalama Devam</span>
                        <span
                          className={`font-semibold ${getPerformanceColor(report.report_data.overall_statistics.attendance_rate)}`}
                        >
                          %{report.report_data.overall_statistics.attendance_rate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Toplam Devamsızlık</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.total_absences}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Geç Kalma</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.late_arrivals}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Erken Çıkma</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.early_departures}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Davranış Değerlendirmesi</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ortalama Davranış</span>
                        <span
                          className={`font-semibold ${getPerformanceColor(report.report_data.overall_statistics.behavior_score)}`}
                        >
                          {report.report_data.overall_statistics.behavior_score}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Disiplin Olayı</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.discipline_incidents}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Başarı Belgesi</span>
                        <span className="font-semibold">
                          {report.report_data.overall_statistics.achievements}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Katılım Oranı</span>
                        <span
                          className={`font-semibold ${getPerformanceColor(report.report_data.overall_statistics.participation_rate)}`}
                        >
                          %{report.report_data.overall_statistics.participation_rate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('subjects')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Ders Performansı
                  <Badge variant="outline" className="ml-2">
                    {report.report_data.subject_performance.length} Ders
                  </Badge>
                </CardTitle>
                {expandedSections.has('subjects') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('subjects') && (
              <CardContent>
                <div className="space-y-4">
                  {report.report_data.subject_performance.map((subject, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-semibold">{subject.subject}</h4>
                            <p className="text-sm text-gray-600">{subject.teacher}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getGradeColor(subject.average_letter_grade)}
                          >
                            {subject.average_letter_grade}
                          </Badge>
                          {getTrendIcon(subject.trend)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {subject.class_average.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Sınıf Ortalaması</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {subject.highest_grade}
                          </div>
                          <div className="text-sm text-gray-600">En Yüksek</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {subject.lowest_grade}
                          </div>
                          <div className="text-sm text-gray-600">En Düşük</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            %{subject.pass_rate}
                          </div>
                          <div className="text-sm text-gray-600">Başarı Oranı</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Sınıf Performansı</span>
                          <span className="text-sm font-medium">
                            {subject.class_average.toFixed(1)}/100
                          </span>
                        </div>
                        <Progress value={subject.class_average} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Top Performing Students */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('students')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  En Başarılı Öğrenciler
                </CardTitle>
                {expandedSections.has('students') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('students') && (
              <CardContent>
                <div className="space-y-4">
                  {report.report_data.top_students.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(student.rank)}
                          <span className="text-lg font-bold">#{student.rank}</span>
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.photo_url} />
                          <AvatarFallback>
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-gray-600">Okul No: {student.student_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {student.gpa.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">GPA</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            {getAttendanceIcon(student.attendance_rate)}
                            <span
                              className={`text-sm font-medium ${getPerformanceColor(student.attendance_rate)}`}
                            >
                              %{student.attendance_rate}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">Devam</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            {getBehaviorIcon(student.behavior_score)}
                            <span
                              className={`text-sm font-medium ${getPerformanceColor(student.behavior_score)}`}
                            >
                              {student.behavior_score}/100
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">Davranış</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Comparison with Other Classes */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('comparison')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sınıf Karşılaştırması
                </CardTitle>
                {expandedSections.has('comparison') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('comparison') && (
              <CardContent>
                <div className="space-y-4">
                  {report.report_data.comparison_data.map((comparison, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <School className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-semibold">{comparison.class_name}</h4>
                            <p className="text-sm text-gray-600">{comparison.teacher}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              comparison.rank === 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {comparison.rank}. Sıra
                          </Badge>
                          {getTrendIcon(comparison.trend)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {comparison.average.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Ortalama</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            %{comparison.pass_rate}
                          </div>
                          <div className="text-sm text-gray-600">Başarı</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            %{comparison.attendance_rate}
                          </div>
                          <div className="text-sm text-gray-600">Devam</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {comparison.behavior_score}/100
                          </div>
                          <div className="text-sm text-gray-600">Davranış</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Progress value={comparison.average} className="h-2" />
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
