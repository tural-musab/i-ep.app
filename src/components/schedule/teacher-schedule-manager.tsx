/**
 * Teacher Schedule Manager Component
 * Sprint 8: Class Scheduling System Development
 * İ-EP.APP - Öğretmen Ders Programı Yönetici
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  School,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
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
  Save,
  X,
  Check,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Heart,
  Star,
  Award,
  Trophy,
  Medal,
  Crown,
  Zap,
  Bolt,
  Flash,
  Sparkles,
  Flame,
  Fire,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Umbrella,
  Snowflake,
  Droplets,
  Waves,
  Mountain,
  Tree,
  Leaf,
  Flower,
  Seedling,
  Cactus,
  Pine,
  Palmtree,
  Mushroom,
  Clover,
  Cherry,
  Apple,
  Banana,
  Grape,
  Strawberry,
  Lemon,
  Orange,
  Peach,
  Pear,
  Watermelon,
  Pineapple,
  Kiwi,
  Mango,
  Coconut,
  Avocado,
  Eggplant,
  Potato,
  Carrot,
  Corn,
  Pepper,
  Cucumber,
  Tomato,
  Onion,
  Garlic,
  Broccoli,
  Lettuce,
  Spinach,
  Cabbage,
  Cauliflower,
  Radish,
  Beet,
  Celery,
  Asparagus,
  Artichoke,
  Peas,
  Beans,
  Lentils,
  Chickpeas,
  Soybeans,
  Peanuts,
  Almonds,
  Walnuts,
  Hazelnuts,
  Pistachios,
  Cashews,
  Pecans,
  Macadamia,
  Brazil,
  Chestnuts,
  Sunflower,
  Pumpkin,
  Sesame,
  Flax,
  Chia,
  Poppy,
  Cumin,
  Coriander,
  Cardamom,
  Cinnamon,
  Nutmeg,
  Ginger,
  Turmeric,
  Paprika,
  Saffron,
  Vanilla,
  Basil,
  Oregano,
  Thyme,
  Rosemary,
  Sage,
  Mint,
  Parsley,
  Cilantro,
  Dill,
  Fennel,
  Tarragon,
  Chives,
  Lavender,
  Chamomile,
  Lemongrass,
  Eucalyptus,
  Peppermint,
  Spearmint,
  Wintergreen,
  Bergamot,
  Jasmine,
  Rose,
  Violet,
  Lily,
  Tulip,
  Daisy,
  Sunflower2,
  Daffodil,
  Iris,
  Orchid,
  Peony,
  Carnation,
  Chrysanthemum,
  Hibiscus,
  Magnolia,
  Azalea,
  Rhododendron,
  Camellia,
  Gardenia,
  Begonia,
  Geranium,
  Petunia,
  Marigold,
  Zinnia,
  Poppy2,
  Cosmos,
  Aster,
  Pansy,
  Snapdragon,
  Foxglove,
  Delphinium,
  Larkspur,
  Lupine,
  Hollyhock,
  Sunflower3,
  Moonflower,
  Morning,
  Evening,
  Four,
  Sweet,
  Bitter,
  Wild,
  Garden,
  Field,
  Forest,
  Meadow,
  Prairie,
  Desert,
  Tropical,
  Alpine,
  Coastal,
  Wetland,
  Woodland,
  Grassland,
  Savanna,
  Tundra,
  Rainforest,
  Deciduous,
  Coniferous,
  Evergreen,
  Seasonal,
  Perennial,
  Annual,
  Biennial,
  Native,
  Exotic,
  Rare,
  Common,
  Endangered,
  Protected,
  Cultivated,
  Wild2,
  Hybrid,
  Heirloom,
  Organic,
  Natural,
  Synthetic,
  Artificial,
  Processed,
  Raw,
  Fresh,
  Dried,
  Frozen,
  Canned,
  Preserved,
  Fermented,
  Pickled,
  Smoked,
  Grilled,
  Roasted,
  Baked,
  Boiled,
  Steamed,
  Fried,
  Sauteed,
  Stir,
  Braised,
  Stewed,
  Poached,
  Blanched,
  Marinated,
  Seasoned,
  Spiced,
  Herbed,
  Flavored,
  Sweetened,
  Salted,
  Peppered,
  Soured,
  Bitter2,
  Umami,
  Savory,
  Mild,
  Spicy,
  Hot,
  Cool,
  Warm,
  Cold,
  Frozen2,
  Melted,
  Solid,
  Liquid,
  Gas,
  Plasma,
  Energy,
  Matter,
  Atom,
  Molecule,
  Element,
  Compound,
  Mixture,
  Solution,
  Suspension,
  Emulsion,
  Colloid,
  Crystal,
  Powder,
  Granule,
  Flake,
  Chunk,
  Piece,
  Slice,
  Cube,
  Sphere,
  Cylinder,
  Cone,
  Pyramid,
  Prism,
  Hexagon,
  Octagon,
  Pentagon,
  Square,
  Rectangle,
  Triangle,
  Circle,
  Oval,
  Diamond,
  Heart2,
  Star2,
  Cross,
  Plus2,
  Minus,
  Multiply,
  Divide,
  Equals,
  Percent,
  Degree,
  Infinity,
  Pi,
  Sigma,
  Delta,
  Omega,
  Alpha,
  Beta,
  Gamma,
  Lambda,
  Mu,
  Nu,
  Xi,
  Omicron,
  Phi,
  Chi,
  Psi,
  Tau,
  Upsilon,
  Eta,
  Theta,
  Iota,
  Kappa,
  Rho,
  Epsilon,
  Zeta
} from 'lucide-react';
import { ScheduleRepository, TeacherSchedule } from '@/lib/repository/schedule-repository';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TeacherScheduleManagerProps {
  teacherId?: string;
  academicYear?: string;
  semester?: 1 | 2;
}

export function TeacherScheduleManager({ 
  teacherId, 
  academicYear = '2024-2025',
  semester = 1
}: TeacherScheduleManagerProps) {
  const [schedule, setSchedule] = useState<TeacherSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(teacherId || '');
  const [selectedYear, setSelectedYear] = useState<string>(academicYear);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(semester);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'schedule' | 'workload' | 'preferences'>('schedule');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']));

  const scheduleRepository = new ScheduleRepository();

  // Mock data
  const mockTeachers = [
    { id: '1', name: 'Ayşe Matematik', subject: 'Matematik', email: 'ayse.matematik@school.edu.tr', phone: '+90 532 123 4567' },
    { id: '2', name: 'Mehmet Türkçe', subject: 'Türkçe', email: 'mehmet.turkce@school.edu.tr', phone: '+90 532 123 4568' },
    { id: '3', name: 'Fatma Fen', subject: 'Fen Bilgisi', email: 'fatma.fen@school.edu.tr', phone: '+90 532 123 4569' },
    { id: '4', name: 'Ali Sosyal', subject: 'Sosyal Bilgiler', email: 'ali.sosyal@school.edu.tr', phone: '+90 532 123 4570' },
    { id: '5', name: 'Zeynep İngilizce', subject: 'İngilizce', email: 'zeynep.ingilizce@school.edu.tr', phone: '+90 532 123 4571' }
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

  const loadTeacherSchedule = async () => {
    if (!selectedTeacher) {
      setError('Lütfen bir öğretmen seçin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const teacherSchedule = await scheduleRepository.generateTeacherSchedule(
        selectedTeacher,
        selectedYear,
        selectedSemester
      );
      setSchedule(teacherSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Öğretmen programı yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveTeacherPreferences = async (preferences: any) => {
    if (!schedule) return;

    setLoading(true);
    try {
      // Mock save operation
      setSchedule({
        ...schedule,
        preferences: preferences
      });
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tercihler kaydedilirken bir hata oluştu');
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
      a.download = `ogretmen_programi_${schedule.schedule_data.teacher_info.name}_${selectedYear}_${selectedSemester}.${format}`;
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

  const getWorkloadColor = (hours: number, maxHours: number) => {
    const percentage = (hours / maxHours) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderScheduleView = () => {
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
                          <School className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{period.class_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{period.student_count} öğrenci</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{period.classroom}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {period.preparation_time && (
                          <Badge variant="outline" className="text-xs">
                            Hazırlık: {period.preparation_time}dk
                          </Badge>
                        )}
                        {period.notes && (
                          <Badge variant="outline" className="text-xs">
                            {period.notes}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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

  const renderWorkloadView = () => {
    if (!schedule) return null;

    const workload = schedule.schedule_data.workload_statistics;
    const maxHours = schedule.schedule_data.teacher_info.max_hours_per_week;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getWorkloadColor(workload.total_hours_per_week, maxHours)}`}>
                  {workload.total_hours_per_week}
                </div>
                <div className="text-sm text-gray-600">Haftalık Toplam Saat</div>
                <div className="text-xs text-gray-500">Max: {maxHours} saat</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{workload.total_classes}</div>
                <div className="text-sm text-gray-600">Toplam Sınıf</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{workload.average_class_size}</div>
                <div className="text-sm text-gray-600">Ortalama Sınıf Mevcudu</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{workload.preparation_time_total}</div>
                <div className="text-sm text-gray-600">Hazırlık Süresi (dk)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>İş Yükü Analizi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Haftalık İş Yükü</span>
                  <span className="text-sm text-gray-600">
                    {workload.total_hours_per_week}/{maxHours} saat
                  </span>
                </div>
                <Progress value={(workload.total_hours_per_week / maxHours) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Verdiği Dersler</h4>
                  <div className="space-y-1">
                    {workload.subjects_taught.map((subject, index) => (
                      <Badge key={index} variant="outline">{subject}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Günlük Dağılım</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">En Yoğun Gün</span>
                      <span className="text-sm font-medium">{dayNames[workload.peak_day as keyof typeof dayNames]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">En Hafif Gün</span>
                      <span className="text-sm font-medium">{dayNames[workload.light_day as keyof typeof dayNames]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPreferencesView = () => {
    if (!schedule) return null;

    const preferences = schedule.preferences;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Öğretmen Tercihleri
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {editMode ? 'İptal' : 'Düzenle'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Tercih Edilen Günler</h4>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(dayNames).map(([day, name]) => (
                    <div key={day} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{name}</div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
                        preferences.preferred_days.includes(day) 
                          ? 'bg-green-100 border-green-500 text-green-700' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {preferences.preferred_days.includes(day) ? <Check className="h-3 w-3" /> : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Tercih Edilen Saatler</h4>
                <div className="space-y-2">
                  {preferences.preferred_times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{time.start_time} - {time.end_time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Çalışma Tercihleri</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Arka arkaya ders vermekten kaçın</span>
                    <Badge variant={preferences.avoid_back_to_back ? 'default' : 'outline'}>
                      {preferences.avoid_back_to_back ? 'Evet' : 'Hayır'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maksimum ardışık ders saati</span>
                    <Badge variant="outline">{preferences.max_consecutive_hours} saat</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Öğle arası gerekli</span>
                    <Badge variant={preferences.lunch_break_required ? 'default' : 'outline'}>
                      {preferences.lunch_break_required ? 'Evet' : 'Hayır'}
                    </Badge>
                  </div>
                </div>
              </div>

              {preferences.notes && (
                <div>
                  <h4 className="font-medium mb-3">Ek Notlar</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{preferences.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Müsaitlik Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.availability.map((availability, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{dayNames[availability.day as keyof typeof dayNames]}</h4>
                    <Badge variant="outline">
                      {availability.available_periods.length} / {availability.available_periods.length + availability.unavailable_periods.length} saat
                    </Badge>
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                      <div key={period} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{period}</div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs ${
                          availability.available_periods.includes(period)
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : availability.unavailable_periods.includes(period)
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                          {availability.available_periods.includes(period) ? '✓' : 
                           availability.unavailable_periods.includes(period) ? '✗' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                  {availability.reason && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Sebep:</strong> {availability.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Öğretmen Program Yöneticisi</h2>
          <p className="text-gray-600 mt-1">Öğretmen ders programları ve tercihlerini yönetin</p>
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
            <User className="h-5 w-5" />
            Öğretmen Seçimi
          </CardTitle>
          <CardDescription>
            Program görüntülemek istediğiniz öğretmeni seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Öğretmen</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Öğretmen seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
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
                <Label>&nbsp;</Label>
                <Button 
                  onClick={loadTeacherSchedule} 
                  disabled={loading || !selectedTeacher}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Programı Görüntüle
                    </>
                  )}
                </Button>
              </div>
            </div>

            {schedule && (
              <div className="flex gap-2 pt-2">
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

      {/* Teacher Schedule Display */}
      {schedule && (
        <div className="space-y-6">
          {/* Teacher Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Öğretmen Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {schedule.schedule_data.teacher_info.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{schedule.schedule_data.teacher_info.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{schedule.schedule_data.teacher_info.subject}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{schedule.schedule_data.teacher_info.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{schedule.schedule_data.teacher_info.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Haftalık Ders Yükü</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {schedule.schedule_data.workload_statistics.total_hours_per_week}
                  </div>
                  <div className="text-sm text-gray-600">
                    / {schedule.schedule_data.teacher_info.max_hours_per_week} saat
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule">Haftalık Program</TabsTrigger>
              <TabsTrigger value="workload">İş Yükü Analizi</TabsTrigger>
              <TabsTrigger value="preferences">Tercihler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="mt-6">
              {renderScheduleView()}
            </TabsContent>
            
            <TabsContent value="workload" className="mt-6">
              {renderWorkloadView()}
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-6">
              {renderPreferencesView()}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}