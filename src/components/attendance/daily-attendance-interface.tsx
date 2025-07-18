/**
 * Daily Attendance Interface Component
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Günlük Yoklama Arayüzü
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  // Filter,
  Save,
  Send,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Phone,
  // Mail,
  // Calendar,
  // Users,
  // Timer
} from 'lucide-react';

interface AttendanceStatus {
  status: 'present' | 'absent' | 'late' | 'excused' | 'sick';
  notes?: string;
  timeIn?: string;
  timeOut?: string;
}

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  class: string;
  parentPhone?: string;
  parentEmail?: string;
  profileImage?: string;
  previousAttendance?: AttendanceStatus;
}

interface DailyAttendanceInterfaceProps {
  date: string;
}

export function DailyAttendanceInterface({ date }: DailyAttendanceInterfaceProps) {
  // Mock data - gerçek uygulamada API'den gelecek
  const [students] = useState<Student[]>([
    {
      id: '1',
      studentNumber: '2025001',
      firstName: 'Ali',
      lastName: 'Veli',
      class: '5-A',
      parentPhone: '+90 555 123 4567',
      parentEmail: 'ali.veli@parent.com',
      previousAttendance: { status: 'present', timeIn: '08:00' },
    },
    {
      id: '2',
      studentNumber: '2025002',
      firstName: 'Ayşe',
      lastName: 'Yılmaz',
      class: '5-A',
      parentPhone: '+90 555 234 5678',
      parentEmail: 'ayse.yilmaz@parent.com',
      previousAttendance: { status: 'absent', notes: 'Hastalık' },
    },
    {
      id: '3',
      studentNumber: '2025003',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      class: '5-A',
      parentPhone: '+90 555 345 6789',
      parentEmail: 'mehmet.kaya@parent.com',
      previousAttendance: { status: 'late', timeIn: '08:15' },
    },
    {
      id: '4',
      studentNumber: '2025004',
      firstName: 'Fatma',
      lastName: 'Demir',
      class: '5-A',
      parentPhone: '+90 555 456 7890',
      parentEmail: 'fatma.demir@parent.com',
      previousAttendance: { status: 'present', timeIn: '07:55' },
    },
    {
      id: '5',
      studentNumber: '2025005',
      firstName: 'Ahmet',
      lastName: 'Çelik',
      class: '5-A',
      parentPhone: '+90 555 567 8901',
      parentEmail: 'ahmet.celik@parent.com',
      previousAttendance: { status: 'excused', notes: 'Doktor raporu' },
    },
  ]);

  const [selectedClass, setSelectedClass] = useState('5-a');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumber.includes(searchTerm)
  );

  const handleAttendanceChange = (
    studentId: string,
    field: keyof AttendanceStatus,
    value: string
  ) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedStudents.length > 0) {
      const bulkStatus = bulkAction as AttendanceStatus['status'];
      const updates: Record<string, AttendanceStatus> = {};

      selectedStudents.forEach((studentId) => {
        updates[studentId] = {
          ...attendanceData[studentId],
          status: bulkStatus,
        };
      });

      setAttendanceData((prev) => ({ ...prev, ...updates }));
      setSelectedStudents([]);
      setBulkAction('');
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId]);
    } else {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const getStatusColor = (status: AttendanceStatus['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: AttendanceStatus['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'excused':
        return <FileText className="h-4 w-4" />;
      case 'sick':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: AttendanceStatus['status']) => {
    const labels = {
      present: 'Mevcut',
      absent: 'Devamsız',
      late: 'Geç',
      excused: 'Mazeret',
      sick: 'Hasta',
    };
    return labels[status] || status;
  };

  const calculateStats = () => {
    const total = filteredStudents.length;
    const marked = Object.keys(attendanceData).length;
    const present = Object.values(attendanceData).filter((a) => a.status === 'present').length;
    const absent = Object.values(attendanceData).filter((a) => a.status === 'absent').length;
    const late = Object.values(attendanceData).filter((a) => a.status === 'late').length;

    return {
      total,
      marked,
      present,
      absent,
      late,
      completion: (marked / total) * 100,
    };
  };

  const stats = calculateStats();

  const saveAttendance = async () => {
    setIsSubmitting(true);

    try {
      // API call will be implemented here
      console.log('Saving attendance:', { date, attendanceData });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert('Yoklama kaydedildi!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Yoklama kaydedilirken hata oluştu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[200px] flex-1">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Öğrenci ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sınıf seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5-a">5-A</SelectItem>
            <SelectItem value="5-b">5-B</SelectItem>
            <SelectItem value="6-a">6-A</SelectItem>
            <SelectItem value="6-b">6-B</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Toplu işlem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Hepsini Mevcut</SelectItem>
              <SelectItem value="absent">Hepsini Devamsız</SelectItem>
              <SelectItem value="late">Hepsini Geç</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleBulkAction}
            disabled={!bulkAction || selectedStudents.length === 0}
          >
            Uygula ({selectedStudents.length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Öğrenci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">İşaretlenen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.marked}</div>
            <Progress value={stats.completion} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mevcut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Devamsız</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Geç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Öğrenci Listesi</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedStudents.length === filteredStudents.length}
                onCheckedChange={handleSelectAll}
              />
              <Label>Hepsini Seç</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => {
              const currentAttendance = attendanceData[student.id];
              const isSelected = selectedStudents.includes(student.id);

              return (
                <div
                  key={student.id}
                  className={`rounded-lg border p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleStudentSelection(student.id, checked as boolean)
                        }
                      />

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">#{student.studentNumber}</p>
                        </div>
                      </div>

                      {student.previousAttendance && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Dün:</span>
                          <Badge
                            variant="outline"
                            className={getStatusColor(student.previousAttendance.status)}
                          >
                            {getStatusIcon(student.previousAttendance.status)}
                            <span className="ml-1">
                              {getStatusLabel(student.previousAttendance.status)}
                            </span>
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{student.parentPhone}</span>
                      </div>

                      <Select
                        value={currentAttendance?.status || ''}
                        onValueChange={(value) =>
                          handleAttendanceChange(student.id, 'status', value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Durum seç" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Mevcut</SelectItem>
                          <SelectItem value="absent">Devamsız</SelectItem>
                          <SelectItem value="late">Geç</SelectItem>
                          <SelectItem value="excused">Mazeret</SelectItem>
                          <SelectItem value="sick">Hasta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {currentAttendance?.status && (
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {(currentAttendance.status === 'present' ||
                        currentAttendance.status === 'late') && (
                        <div>
                          <Label className="text-sm">Giriş Saati</Label>
                          <Input
                            type="time"
                            value={currentAttendance.timeIn || ''}
                            onChange={(e) =>
                              handleAttendanceChange(student.id, 'timeIn', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-sm">Notlar</Label>
                        <Textarea
                          placeholder="Ek notlar..."
                          value={currentAttendance.notes || ''}
                          onChange={(e) =>
                            handleAttendanceChange(student.id, 'notes', e.target.value)
                          }
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {stats.marked} / {stats.total} öğrenci işaretlendi (%{Math.round(stats.completion)})
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={saveAttendance} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>

          <Button onClick={saveAttendance} disabled={isSubmitting || stats.marked === 0}>
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Tamamlanıyor...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Yoklamayı Tamamla
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
