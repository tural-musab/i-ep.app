'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Search,
  Plus,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  classId: string;
  className: string;
  subjectId?: string;
  subjectName?: string;
  teacherId: string;
  teacherName: string;
  date: string;
  period?: number; // Hangi ders saati (1, 2, 3, vs.)
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string; // Geç gelme durumunda
  notes?: string;
  tenantId: string;
}

interface AttendanceSummary {
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

interface DailyAttendance {
  studentId: string;
  studentName: string;
  studentNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string;
  notes?: string;
}

const attendanceColumns = [
  {
    accessorKey: 'studentName',
    header: 'Öğrenci',
  },
  {
    accessorKey: 'studentNumber',
    header: 'Numara',
  },
  {
    accessorKey: 'className',
    header: 'Sınıf',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const className = row.getValue('className');
      return <Badge variant="outline">{className}</Badge>;
    },
  },
  {
    accessorKey: 'subjectName',
    header: 'Ders',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const subject = row.getValue('subjectName');
      return subject ? <Badge variant="secondary">{subject}</Badge> : '-';
    },
  },
  {
    accessorKey: 'date',
    header: 'Tarih',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('date'));
      return date.toLocaleDateString('tr-TR');
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        present: { label: 'Mevcut', variant: 'default' as const },
        absent: { label: 'Yok', variant: 'destructive' as const },
        late: { label: 'Geç', variant: 'secondary' as const },
        excused: { label: 'Mazeret', variant: 'outline' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'arrivalTime',
    header: 'Varış Saati',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const time = row.getValue('arrivalTime');
      return time || '-';
    },
  },
];

const summaryColumns = [
  {
    accessorKey: 'studentName',
    header: 'Öğrenci',
  },
  {
    accessorKey: 'studentNumber',
    header: 'Numara',
  },
  {
    accessorKey: 'className',
    header: 'Sınıf',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const className = row.getValue('className');
      return <Badge variant="outline">{className}</Badge>;
    },
  },
  {
    accessorKey: 'totalDays',
    header: 'Toplam Gün',
  },
  {
    accessorKey: 'presentDays',
    header: 'Mevcut',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const days = row.getValue('presentDays');
      return <span className="text-green-600 font-semibold">{days}</span>;
    },
  },
  {
    accessorKey: 'absentDays',
    header: 'Yok',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const days = row.getValue('absentDays');
      return <span className="text-red-600 font-semibold">{days}</span>;
    },
  },
  {
    accessorKey: 'lateDays',
    header: 'Geç',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const days = row.getValue('lateDays');
      return <span className="text-yellow-600 font-semibold">{days}</span>;
    },
  },
  {
    accessorKey: 'attendanceRate',
    header: 'Devam Oranı',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const rate = row.getValue('attendanceRate');
      let colorClass = 'text-red-600';
      if (rate >= 90) colorClass = 'text-green-600';
      else if (rate >= 80) colorClass = 'text-yellow-600';
      
      return <span className={`font-semibold ${colorClass}`}>{rate.toFixed(1)}%</span>;
    },
  },
];

export default function AttendancePage() {
  const { currentTenantId } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Daily attendance taking
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);

  // Mock data
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      studentId: 'student1',
      studentName: 'Ahmet Yılmaz',
      studentNumber: '2024001',
      classId: 'class1',
      className: '9-A',
      subjectId: 'math',
      subjectName: 'Matematik',
      teacherId: 'teacher1',
      teacherName: 'Mehmet Öztürk',
      date: '2024-12-01',
      period: 1,
      status: 'present',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      studentId: 'student1',
      studentName: 'Ahmet Yılmaz',
      studentNumber: '2024001',
      classId: 'class1',
      className: '9-A',
      teacherId: 'teacher1',
      teacherName: 'Mehmet Öztürk',
      date: '2024-12-02',
      status: 'late',
      arrivalTime: '08:15',
      notes: 'Otobüs gecikti',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '3',
      studentId: 'student2',
      studentName: 'Ayşe Demir',
      studentNumber: '2024002',
      classId: 'class1',
      className: '9-A',
      teacherId: 'teacher1',
      teacherName: 'Mehmet Öztürk',
      date: '2024-12-01',
      status: 'present',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '4',
      studentId: 'student2',
      studentName: 'Ayşe Demir',
      studentNumber: '2024002',
      classId: 'class1',
      className: '9-A',
      teacherId: 'teacher1',
      teacherName: 'Mehmet Öztürk',
      date: '2024-12-02',
      status: 'absent',
      notes: 'Hasta',
      tenantId: currentTenantId || 'demo-school',
    },
  ];

  const mockAttendanceSummaries: AttendanceSummary[] = [
    {
      studentId: 'student1',
      studentName: 'Ahmet Yılmaz',
      studentNumber: '2024001',
      className: '9-A',
      totalDays: 20,
      presentDays: 18,
      absentDays: 1,
      lateDays: 1,
      excusedDays: 0,
      attendanceRate: 90,
    },
    {
      studentId: 'student2',
      studentName: 'Ayşe Demir',
      studentNumber: '2024002',
      className: '9-A',
      totalDays: 20,
      presentDays: 17,
      absentDays: 2,
      lateDays: 1,
      excusedDays: 0,
      attendanceRate: 85,
    },
  ];

  const mockStudents = [
    { id: 'student1', name: 'Ahmet Yılmaz', number: '2024001' },
    { id: 'student2', name: 'Ayşe Demir', number: '2024002' },
    { id: 'student3', name: 'Mustafa Kaya', number: '2024003' },
  ];

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setAttendanceRecords(mockAttendanceRecords);
          setAttendanceSummaries(mockAttendanceSummaries);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Yoklama verileri yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadAttendance();
    }
  }, [currentTenantId]);

  // Initialize daily attendance when class is selected
  useEffect(() => {
    if (selectedClass) {
      const attendance = mockStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        studentNumber: student.number,
        status: 'present' as const,
      }));
      setDailyAttendance(attendance);
    }
  }, [selectedClass]);

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentNumber.includes(searchTerm);
    
    const matchesClass = classFilter === 'all' || record.className === classFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date === dateFilter;
    
    return matchesSearch && matchesClass && matchesStatus && matchesDate;
  });

  const filteredSummaries = attendanceSummaries.filter(summary => {
    const matchesSearch = 
      summary.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.studentNumber.includes(searchTerm);
    
    const matchesClass = classFilter === 'all' || summary.className === classFilter;
    
    return matchesSearch && matchesClass;
  });

  const handleAttendanceChange = (studentId: string, field: keyof DailyAttendance, value: string) => {
    setDailyAttendance(prev => 
      prev.map(attendance => 
        attendance.studentId === studentId 
          ? { ...attendance, [field]: value }
          : attendance
      )
    );
  };

  const saveDailyAttendance = () => {
    // Burada API çağrısı yapılacak
    console.log('Saving attendance for', selectedDate, selectedClass, dailyAttendance);
    alert('Yoklama kaydedildi!');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Yoklama Sistemi</h1>
          <p className="text-gray-600">Öğrenci devam durumunu takip edin</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor Al
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yoklama Al
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Günlük Yoklama</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tarih</label>
                    <Input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sınıf</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sınıf seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9-A">9-A</SelectItem>
                        <SelectItem value="10-B">10-B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedClass && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-4">Öğrenci Listesi</h3>
                      <div className="space-y-3">
                        {dailyAttendance.map((attendance) => (
                          <div key={attendance.studentId} className="flex items-center space-x-4 p-3 border rounded-lg">
                            <div className="flex-1">
                              <span className="font-medium">{attendance.studentName}</span>
                              <span className="text-sm text-gray-500 ml-2">({attendance.studentNumber})</span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  checked={attendance.status === 'present'}
                                  onCheckedChange={(checked) => 
                                    checked && handleAttendanceChange(attendance.studentId, 'status', 'present')
                                  }
                                />
                                <label className="text-sm">Mevcut</label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  checked={attendance.status === 'absent'}
                                  onCheckedChange={(checked) => 
                                    checked && handleAttendanceChange(attendance.studentId, 'status', 'absent')
                                  }
                                />
                                <label className="text-sm">Yok</label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  checked={attendance.status === 'late'}
                                  onCheckedChange={(checked) => 
                                    checked && handleAttendanceChange(attendance.studentId, 'status', 'late')
                                  }
                                />
                                <label className="text-sm">Geç</label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  checked={attendance.status === 'excused'}
                                  onCheckedChange={(checked) => 
                                    checked && handleAttendanceChange(attendance.studentId, 'status', 'excused')
                                  }
                                />
                                <label className="text-sm">Mazeret</label>
                              </div>
                            </div>
                            
                            {attendance.status === 'late' && (
                              <Input 
                                type="time"
                                placeholder="Varış saati"
                                className="w-32"
                                value={attendance.arrivalTime || ''}
                                onChange={(e) => 
                                  handleAttendanceChange(attendance.studentId, 'arrivalTime', e.target.value)
                                }
                              />
                            )}
                            
                            <Input 
                              placeholder="Not"
                              className="w-32"
                              value={attendance.notes || ''}
                              onChange={(e) => 
                                handleAttendanceChange(attendance.studentId, 'notes', e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        İptal
                      </Button>
                      <Button onClick={saveDailyAttendance}>
                        Yoklamayı Kaydet
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Kayıt</p>
                <p className="text-xl font-semibold">{attendanceRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mevcut</p>
                <p className="text-xl font-semibold">
                  {attendanceRecords.filter(r => r.status === 'present').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <UserX className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Devamsız</p>
                <p className="text-xl font-semibold">
                  {attendanceRecords.filter(r => r.status === 'absent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Geç Gelen</p>
                <p className="text-xl font-semibold">
                  {attendanceRecords.filter(r => r.status === 'late').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Yoklama Kayıtları</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Devam Özetleri</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yoklama Kayıtları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Öğrenci ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sınıf filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sınıflar</SelectItem>
                    <SelectItem value="9-A">9-A</SelectItem>
                    <SelectItem value="10-B">10-B</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="present">Mevcut</SelectItem>
                    <SelectItem value="absent">Yok</SelectItem>
                    <SelectItem value="late">Geç</SelectItem>
                    <SelectItem value="excused">Mazeret</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-48"
                />
              </div>

              <DataTable
                columns={attendanceColumns}
                data={filteredRecords}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Devam Özetleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Öğrenci ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sınıf filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sınıflar</SelectItem>
                    <SelectItem value="9-A">9-A</SelectItem>
                    <SelectItem value="10-B">10-B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={summaryColumns}
                data={filteredSummaries}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}