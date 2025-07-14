/**
 * Class Schedule Generator Component
 * Sprint 8: Class Scheduling System Development
 * İ-EP.APP - Sınıf Ders Programı Oluşturucu
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  User, 
  School,
  FileText,
  Download,
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
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  Copy,
  Eye,
  Target,
  Zap,
  Layers,
  Grid,
  List,
  Home,
  MapPin,
  Navigation,
  Compass,
  Route,
  Timer,
  Stopwatch,
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Move,
  Resize,
  Shuffle,
  Repeat,
  RepeatOne,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Pulse,
  Signal,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  Power,
  PowerOff,
  Plug,
  PlugZap,
  Cable,
  Usb,
  HardDrive,
  Cpu,
  Memory,
  Monitor,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Camera,
  Webcam,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  SpeakerOff,
  Volume,
  VolumeDown,
  VolumeUp,
  Mute,
  Unmute
} from 'lucide-react';
import { ScheduleRepository, ClassSchedule, ScheduleConflict } from '@/lib/repository/schedule-repository';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ClassScheduleGeneratorProps {
  classId?: string;
  academicYear?: string;
  semester?: 1 | 2;
}

export function ClassScheduleGenerator({ 
  classId, 
  academicYear = '2024-2025',
  semester = 1
}: ClassScheduleGeneratorProps) {
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(classId || '');
  const [selectedYear, setSelectedYear] = useState<string>(academicYear);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(semester);
  const [generationMode, setGenerationMode] = useState<'automatic' | 'manual' | 'template'>('automatic');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'weekly' | 'daily' | 'conflicts'>('weekly');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']));

  const scheduleRepository = new ScheduleRepository();

  // Mock data
  const mockClasses = [
    { id: '1', name: '5-A', teacher: 'Ahmet Öğretmen', studentCount: 28, gradeLevel: 5 },
    { id: '2', name: '5-B', teacher: 'Ayşe Öğretmen', studentCount: 26, gradeLevel: 5 },
    { id: '3', name: '6-A', teacher: 'Mehmet Öğretmen', studentCount: 30, gradeLevel: 6 },
    { id: '4', name: '6-B', teacher: 'Fatma Öğretmen', studentCount: 29, gradeLevel: 6 }
  ];

  const mockTemplates = [
    { id: '1', name: 'Standart İlkokul Programı', type: 'class', gradeLevel: 5 },
    { id: '2', name: 'Yoğun Matematik Programı', type: 'class', gradeLevel: 5 },
    { id: '3', name: 'Sanat Ağırlıklı Program', type: 'class', gradeLevel: 6 },
    { id: '4', name: 'Spor Ağırlıklı Program', type: 'class', gradeLevel: 6 }
  ];

  const academicYears = ['2024-2025', '2023-2024', '2022-2023'];
  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  };

  const generateSchedule = async () => {
    if (!selectedClass) {
      setError('Lütfen bir sınıf seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedSchedule = await scheduleRepository.generateClassSchedule(
        selectedClass,
        selectedYear,
        selectedSemester,
        generationMode === 'template' ? selectedTemplate : undefined
      );
      
      setSchedule(generatedSchedule);
      
      // Detect conflicts
      const detectedConflicts = await scheduleRepository.detectScheduleConflicts(
        generatedSchedule.id,
        'class'
      );
      setConflicts(detectedConflicts);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Program oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const exportSchedule = async (format: 'pdf' | 'excel' | 'ical') => {
    if (!schedule) return;

    setLoading(true);
    try {
      const exportData = await scheduleRepository.exportSchedule(schedule.id, format);
      
      const blob = new Blob([exportData], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'text/calendar'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ders_programi_${schedule.schedule_data.class_info.name}_${selectedYear}_${selectedSemester}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Program dışa aktarılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'teacher_overlap': return <User className="h-4 w-4" />;
      case 'classroom_overlap': return <School className="h-4 w-4" />;
      case 'student_overlap': return <Users className="h-4 w-4" />;
      case 'resource_conflict': return <BookOpen className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const renderWeeklyView = () => {
    if (!schedule) return null;

    return (
      <div className="space-y-6">
        {schedule.schedule_data.weekly_schedule.map((day, dayIndex) => (
          <Card key={dayIndex}>
            <CardHeader className="cursor-pointer" onClick={() => toggleDay(day.day)}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {dayNames[day.day]}
                  <Badge variant="outline" className="ml-2">
                    {day.periods.length} Ders
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {day.periods.length > 0 ? 
                      `${day.periods[0].start_time} - ${day.periods[day.periods.length - 1].end_time}` : 
                      'Boş'
                    }
                  </span>
                  {expandedDays.has(day.day) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </div>
            </CardHeader>
            {expandedDays.has(day.day) && (
              <CardContent>
                <div className="space-y-3">
                  {day.periods.map((period, periodIndex) => (
                    <div key={periodIndex} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{period.period_number}</div>
                          <div className="text-xs text-gray-600">Saat</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {period.start_time} - {period.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{period.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{period.teacher_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{period.classroom}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {period.notes && (
                          <Badge variant="outline" className="text-xs">
                            {period.notes}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderConflictsView = () => {
    if (conflicts.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Çakışma Bulunamadı</h3>
              <p className="text-gray-600">Ders programında herhangi bir çakışma tespit edilmedi.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {conflicts.map((conflict, index) => (
          <Card key={index} className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getConflictIcon(conflict.conflict_type)}
                  {conflict.conflict_details.description}
                </CardTitle>
                <Badge variant="outline" className={getConflictColor(conflict.severity)}>
                  {conflict.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Çakışma Zamanı</h4>
                    <div className="text-sm text-gray-600">
                      <div>{dayNames[conflict.conflict_details.time_slot.day as keyof typeof dayNames]}</div>
                      <div>{conflict.conflict_details.time_slot.period}. Saat</div>
                      <div>{conflict.conflict_details.time_slot.start_time} - {conflict.conflict_details.time_slot.end_time}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Etkilenen Programlar</h4>
                    <div className="space-y-1">
                      {conflict.conflict_details.conflicting_schedules.map((schedule, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          {schedule.entity_name} ({schedule.schedule_type})
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Durum</h4>
                    <Badge variant={conflict.status === 'resolved' ? 'default' : 'secondary'}>
                      {conflict.status === 'pending' ? 'Beklemede' : 
                       conflict.status === 'resolved' ? 'Çözüldü' : 'Göz Ardı Edildi'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Çözüm Önerileri</h4>
                  <div className="space-y-2">
                    {conflict.resolution_options.map((option, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{option.description}</span>
                          <Badge variant="outline" className={
                            option.impact_level === 'high' ? 'border-red-300 text-red-700' :
                            option.impact_level === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }>
                            {option.impact_level} etki
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Tahmini süre: {option.estimated_time} dakika
                        </div>
                        <div className="space-y-1">
                          {option.steps.map((step, stepIdx) => (
                            <div key={stepIdx} className="text-sm text-gray-600">
                              {stepIdx + 1}. {step}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <Button size="sm" variant="outline">
                            Bu Çözümü Uygula
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ders Programı Oluşturucu</h2>
          <p className="text-gray-600 mt-1">Otomatik ders programı oluşturma ve yönetimi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Program Oluşturma Ayarları
          </CardTitle>
          <CardDescription>
            Ders programı oluşturmak için gerekli parametreleri belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Select value={selectedSemester.toString()} onValueChange={(value) => setSelectedSemester(parseInt(value) as 1 | 2)}>
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
                <Label htmlFor="mode">Oluşturma Modu</Label>
                <Select value={generationMode} onValueChange={(value) => setGenerationMode(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Otomatik</SelectItem>
                    <SelectItem value="manual">Manuel</SelectItem>
                    <SelectItem value="template">Şablon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {generationMode === 'template' && (
              <div className="space-y-2">
                <Label htmlFor="template">Program Şablonu</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şablon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button 
                onClick={generateSchedule} 
                disabled={loading || !selectedClass}
                className="w-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Program Oluştur
                  </>
                )}
              </Button>

              {schedule && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportSchedule('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportSchedule('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportSchedule('ical')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    iCal
                  </Button>
                  <Button variant="outline" size="sm">
                    <Print className="h-4 w-4 mr-2" />
                    Yazdır
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
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

      {/* Schedule Display */}
      {schedule && (
        <div className="space-y-6">
          {/* Schedule Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Program Özeti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {schedule.schedule_data.class_info.name}
                  </div>
                  <div className="text-sm text-gray-600">Sınıf</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {schedule.schedule_data.schedule_metadata.total_periods_per_week}
                  </div>
                  <div className="text-sm text-gray-600">Haftalık Ders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {schedule.schedule_data.schedule_metadata.subjects_count}
                  </div>
                  <div className="text-sm text-gray-600">Ders Sayısı</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {schedule.schedule_data.schedule_metadata.teachers_count}
                  </div>
                  <div className="text-sm text-gray-600">Öğretmen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Haftalık Görünüm</TabsTrigger>
              <TabsTrigger value="daily">Günlük Görünüm</TabsTrigger>
              <TabsTrigger value="conflicts">
                Çakışmalar
                {conflicts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {conflicts.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="mt-6">
              {renderWeeklyView()}
            </TabsContent>
            
            <TabsContent value="daily" className="mt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Günlük Görünüm</h3>
                <p className="text-gray-600">Günlük görünüm yakında eklenecek.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="conflicts" className="mt-6">
              {renderConflictsView()}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}