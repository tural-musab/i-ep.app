/**
 * Attendance Report Generator Component
 * Sprint 7: Report Generation System Development
 * İ-EP.APP - Devam Raporu Bileşeni
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
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  School,
  FileText,
  Download,
  Eye,
  Print,
  Share2,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Info,
  AlertTriangle,
  Home,
  Calculator,
  Clipboard,
  PieChart,
  LineChart,
  BarChart3,
  Percent,
  Hash,
  Calendar as CalendarIcon,
  FileBarChart,
  UserCheck,
  UserX,
  UserClock,
  Users2,
  Timer,
  Stopwatch,
  Hourglass,
  Clock3,
  ClockIcon,
  MapPin,
  Navigation,
  Compass,
  Route,
  Activity,
  Target,
  Flag,
  Award,
  Trophy,
  Medal,
  Crown,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  CheckCheck,
  X,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart,
  ScatterChart,
  RadarChart,
  DonutChart,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  CalendarRange,
  CalendarPlus,
  CalendarMinus,
  CalendarSearch,
  CalendarHeart,
  CalendarOff,
  ClockAlert,
  ClockCheck,
  ClockX,
  ClockPause,
  ClockPlay,
  ClockRewind,
  ClockForward,
  ClockArrowUp,
  ClockArrowDown,
  UserPlus,
  UserMinus,
  UserSearch,
  UserHeart,
  UserStar,
  UserShield,
  UserLock,
  UserUnlock,
  UserKey,
  UserCog,
  UserEdit,
  UserDelete,
  UserRefresh,
  UserSync,
  UserSave,
  UserCancel,
  UserAccept,
  UserDecline,
  UserPause,
  UserPlay,
  UserStop,
  UserRecord,
  UserFast,
  UserSlow,
  UserVolume,
  UserVolumeX,
  UserVoice,
  UserMute,
  UserMicrophone,
  UserHeadphones,
  UserEar,
  UserEye,
  UserEyeOff,
  UserFocus,
  UserBlur,
  UserZoom,
  UserShrink,
  UserExpand,
  UserContract,
  UserResize,
  UserMove,
  UserGrab,
  UserPoint,
  UserClick,
  UserTouch,
  UserSwipe,
  UserPinch,
  UserRotate,
  UserFlip,
  UserTilt,
  UserShake,
  UserWave,
  UserClap,
  UserSnap,
  UserTap,
  UserDrop,
  UserDrag,
  UserLift,
  UserPush,
  UserPull,
  UserSlide,
  UserScroll,
  UserFling,
  UserHover,
  UserPress,
  UserRelease,
  UserHold,
  UserDouble,
  UserTriple,
  UserLong,
  UserShort,
  UserQuick,
  UserSlow as UserSlowIcon,
  UserFast as UserFastIcon,
} from 'lucide-react';
import { ReportRepository, AttendanceReport } from '@/lib/repository/report-repository';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isWeekend,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface AttendanceReportProps {
  studentId?: string;
  classId?: string;
  dateRange?: DateRange;
  reportType?: 'student' | 'class' | 'school';
}

export function AttendanceReportGenerator({
  studentId,
  classId,
  dateRange,
  reportType = 'class',
}: AttendanceReportProps) {
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>(studentId || '');
  const [selectedClass, setSelectedClass] = useState<string>(classId || '');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(dateRange);
  const [selectedType, setSelectedType] = useState<'student' | 'class' | 'school'>(reportType);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'calendar'>('summary');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'statistics'])
  );

  const reportRepository = new ReportRepository();

  // Mock data for demonstration
  const mockStudents = [
    { id: '1', name: 'Ali Veli', class: '5-A', number: '12' },
    { id: '2', name: 'Ayşe Kaya', class: '5-A', number: '8' },
    { id: '3', name: 'Mehmet Demir', class: '5-B', number: '15' },
    { id: '4', name: 'Fatma Yılmaz', class: '5-B', number: '9' },
  ];

  const mockClasses = [
    { id: '1', name: '5-A', teacher: 'Ahmet Öğretmen', studentCount: 28 },
    { id: '2', name: '5-B', teacher: 'Ayşe Öğretmen', studentCount: 26 },
    { id: '3', name: '6-A', teacher: 'Mehmet Öğretmen', studentCount: 30 },
    { id: '4', name: '6-B', teacher: 'Fatma Öğretmen', studentCount: 29 },
  ];

  const generateReport = async () => {
    if (selectedType === 'student' && !selectedStudent) {
      setError('Lütfen bir öğrenci seçin');
      return;
    }
    if (selectedType === 'class' && !selectedClass) {
      setError('Lütfen bir sınıf seçin');
      return;
    }
    if (!selectedDateRange?.from || !selectedDateRange?.to) {
      setError('Lütfen tarih aralığı seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedReport = await reportRepository.generateAttendanceReport(
        selectedType,
        selectedStudent || selectedClass || 'all',
        selectedDateRange.from,
        selectedDateRange.to
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
      const exportData = await reportRepository.exportAttendanceReport(report.id, format);

      const blob = new Blob([exportData], {
        type:
          format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devam_raporu_${selectedType}_${format(new Date(), 'yyyy_MM_dd')}.${format}`;
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

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-blue-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
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

  const renderCalendarView = () => {
    if (!report || !selectedDateRange?.from || !selectedDateRange?.to) return null;

    const days = eachDayOfInterval({
      start: selectedDateRange.from,
      end: selectedDateRange.to,
    });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Calendar Header */}
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day) => {
          const dayData = report.report_data.daily_attendance.find((d) =>
            isSameDay(new Date(d.date), day)
          );
          const isWeekendDay = isWeekend(day);
          const isTodayDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`rounded border p-2 text-center text-sm ${isWeekendDay ? 'bg-gray-100' : 'bg-white'} ${isTodayDay ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} `}
            >
              <div className="font-medium">{format(day, 'd')}</div>
              {dayData && !isWeekendDay && (
                <div className="mt-1 space-y-1">
                  <div
                    className={`rounded px-1 py-0.5 text-xs ${getAttendanceColor(dayData.attendance_rate)}`}
                  >
                    %{dayData.attendance_rate}
                  </div>
                  <div className="text-xs text-gray-600">
                    {dayData.present}/{dayData.total}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Devam Raporu</h2>
          <p className="mt-1 text-gray-600">Öğrenci ve sınıf devam durumu analizi</p>
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
          <CardDescription>Devam raporu oluşturmak için parametreleri belirleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="type">Rapor Türü</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Öğrenci</SelectItem>
                    <SelectItem value="class">Sınıf</SelectItem>
                    <SelectItem value="school">Okul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedType === 'student' && (
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
              )}

              {selectedType === 'class' && (
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
              )}

              <div className="space-y-2">
                <Label htmlFor="view">Görünüm</Label>
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Özet</SelectItem>
                    <SelectItem value="detailed">Detaylı</SelectItem>
                    <SelectItem value="calendar">Takvim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tarih Aralığı</Label>
              <DatePickerWithRange
                value={selectedDateRange}
                onChange={setSelectedDateRange}
                placeholder="Tarih aralığı seçin"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button onClick={generateReport} disabled={loading} className="w-auto">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Rapor Oluştur
                  </>
                )}
              </Button>

              {report && (
                <div className="flex gap-2">
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
          {/* Report Overview */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('overview')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Rapor Özeti
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {report.report_data.summary.total_days}
                    </div>
                    <div className="text-sm text-gray-600">Toplam Gün</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {report.report_data.summary.present_days}
                    </div>
                    <div className="text-sm text-gray-600">Geldiği Gün</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {report.report_data.summary.absent_days}
                    </div>
                    <div className="text-sm text-gray-600">Gelmediği Gün</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${getAttendanceColor(report.report_data.summary.attendance_rate)}`}
                    >
                      %{report.report_data.summary.attendance_rate}
                    </div>
                    <div className="text-sm text-gray-600">Devam Oranı</div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Attendance Statistics */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('statistics')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Devam İstatistikleri
                </CardTitle>
                {expandedSections.has('statistics') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            {expandedSections.has('statistics') && (
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Devam Durumu</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Geldi</span>
                        </div>
                        <span className="font-semibold">
                          {report.report_data.summary.present_days}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Gelmedi</span>
                        </div>
                        <span className="font-semibold">
                          {report.report_data.summary.absent_days}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Geç Kaldı</span>
                        </div>
                        <span className="font-semibold">
                          {report.report_data.summary.late_days}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Mazeret</span>
                        </div>
                        <span className="font-semibold">
                          {report.report_data.summary.excused_days}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Haftalık Ortalama</h4>
                    <div className="space-y-2">
                      {report.report_data.weekly_breakdown.map((week, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{week.week}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress value={week.attendance_rate} className="h-2" />
                            </div>
                            <span
                              className={`font-semibold ${getAttendanceColor(week.attendance_rate)}`}
                            >
                              %{week.attendance_rate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Aylık Ortalama</h4>
                    <div className="space-y-2">
                      {report.report_data.monthly_breakdown.map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{month.month}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16">
                              <Progress value={month.attendance_rate} className="h-2" />
                            </div>
                            <span
                              className={`font-semibold ${getAttendanceColor(month.attendance_rate)}`}
                            >
                              %{month.attendance_rate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Trend Analizi</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Trend</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(report.report_data.trend_analysis.trend)}
                          <span className="text-sm font-medium">
                            {report.report_data.trend_analysis.trend}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Değişim</span>
                        <span
                          className={`font-semibold ${
                            report.report_data.trend_analysis.change_percentage > 0
                              ? 'text-green-600'
                              : report.report_data.trend_analysis.change_percentage < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {report.report_data.trend_analysis.change_percentage > 0 ? '+' : ''}
                          {report.report_data.trend_analysis.change_percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Takvim Görünümü
                </CardTitle>
                <CardDescription>Günlük devam durumu takvim görünümü</CardDescription>
              </CardHeader>
              <CardContent>{renderCalendarView()}</CardContent>
            </Card>
          )}

          {/* Daily Attendance Details */}
          {viewMode === 'detailed' && (
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection('daily')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Günlük Devam Detayları
                  </CardTitle>
                  {expandedSections.has('daily') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.has('daily') && (
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {report.report_data.daily_attendance.map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {format(new Date(day.date), 'dd')}
                              </div>
                              <div className="text-xs text-gray-600">
                                {format(new Date(day.date), 'MMM', { locale: tr })}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">
                                {format(new Date(day.date), 'EEEE', { locale: tr })}
                              </div>
                              <div className="text-sm text-gray-600">
                                {format(new Date(day.date), 'dd MMMM yyyy', { locale: tr })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">{day.present}</div>
                              <div className="text-xs text-gray-600">Geldi</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">{day.absent}</div>
                              <div className="text-xs text-gray-600">Gelmedi</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">{day.late}</div>
                              <div className="text-xs text-gray-600">Geç</div>
                            </div>
                            <div className="text-center">
                              <div
                                className={`text-sm font-medium ${getAttendanceColor(day.attendance_rate)}`}
                              >
                                %{day.attendance_rate}
                              </div>
                              <div className="text-xs text-gray-600">Oran</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          )}

          {/* Student List (for class reports) */}
          {selectedType === 'class' && (
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection('students')}>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Öğrenci Devam Listesi
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
                    {report.report_data.student_attendance?.map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
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
                            <p className="text-sm text-gray-600">No: {student.student_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm font-medium">{student.present_days}</div>
                            <div className="text-xs text-gray-600">Geldi</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{student.absent_days}</div>
                            <div className="text-xs text-gray-600">Gelmedi</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{student.late_days}</div>
                            <div className="text-xs text-gray-600">Geç</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm font-medium ${getAttendanceColor(student.attendance_rate)}`}
                            >
                              %{student.attendance_rate}
                            </div>
                            <div className="text-xs text-gray-600">Oran</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(student.trend)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

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
