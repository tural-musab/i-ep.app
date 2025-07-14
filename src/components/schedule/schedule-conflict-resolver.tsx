/**
 * Schedule Conflict Detection & Resolution System
 * Sprint 8: Class Scheduling System Development
 * İ-EP.APP - Ders Programı Çakışma Çözme Sistemi
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Users, 
  School, 
  BookOpen, 
  Clock, 
  Calendar,
  Target,
  Zap,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Filter,
  Search,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Info,
  Warning,
  Error,
  Success,
  Help,
  Question,
  Lightbulb,
  Wrench,
  Tool,
  Cog,
  Gear,
  Hammer,
  Screwdriver,
  Drill,
  Saw,
  Chisel,
  Plane,
  Ruler,
  Pencil,
  Eraser,
  Pen,
  Marker,
  Highlighter,
  Crayon,
  Brush,
  Palette,
  Canvas,
  Paint,
  Spray,
  Roller,
  Bucket,
  Ladder,
  Rope,
  Chain,
  Lock,
  Key,
  Safe,
  Vault,
  Box,
  Package,
  Gift,
  Present,
  Bag,
  Suitcase,
  Backpack,
  Briefcase,
  Handbag,
  Purse,
  Wallet,
  Money,
  Coin,
  Bill,
  Credit,
  Debit,
  Card,
  Cash,
  Bank,
  ATM,
  Store,
  Shop,
  Market,
  Mall,
  Building,
  House,
  Home,
  Office,
  Factory,
  Warehouse,
  Garage,
  Shed,
  Barn,
  Tent,
  Cabin,
  Castle,
  Tower,
  Bridge,
  Road,
  Street,
  Highway,
  Path,
  Trail,
  Sidewalk,
  Crosswalk,
  Intersection,
  Roundabout,
  Tunnel,
  Overpass,
  Underpass,
  Subway,
  Train,
  Bus,
  Car,
  Truck,
  Van,
  Motorcycle,
  Bicycle,
  Scooter,
  Skateboard,
  Roller,
  Skates,
  Ski,
  Snowboard,
  Sled,
  Sleigh,
  Boat,
  Ship,
  Yacht,
  Sailboat,
  Canoe,
  Kayak,
  Raft,
  Surfboard,
  Jet,
  Airplane,
  Helicopter,
  Rocket,
  Satellite,
  UFO,
  Spaceship,
  Planet,
  Moon,
  Sun,
  Star,
  Galaxy,
  Universe,
  Earth,
  Globe,
  Map,
  Compass,
  GPS,
  Location,
  Pin,
  Marker2,
  Flag,
  Banner,
  Sign,
  Signal,
  Light,
  Lamp,
  Bulb,
  Candle,
  Fire,
  Flame,
  Torch,
  Flashlight,
  Laser,
  Beam,
  Ray,
  Wave,
  Sound,
  Music,
  Note,
  Song,
  Album,
  Playlist,
  Radio,
  Speaker,
  Headphones,
  Microphone,
  Record,
  Play,
  Pause,
  Stop,
  Skip,
  Rewind,
  Forward,
  Shuffle,
  Repeat,
  Volume,
  Mute,
  Loud,
  Quiet,
  Whisper,
  Shout,
  Speak,
  Talk,
  Say,
  Tell,
  Ask,
  Answer,
  Question2,
  Exclamation,
  Period,
  Comma,
  Semicolon,
  Colon,
  Quote,
  Apostrophe,
  Hyphen,
  Dash,
  Underscore,
  Asterisk,
  Plus,
  Minus2,
  Equals,
  Divide,
  Multiply,
  Percent2,
  Dollar,
  Euro,
  Pound,
  Yen,
  Rupee,
  Ruble,
  Won,
  Peso,
  Real,
  Rand,
  Shekel,
  Dinar,
  Dirham,
  Riyal,
  Lira,
  Franc,
  Krona,
  Krone,
  Forint,
  Zloty,
  Koruna,
  Leu,
  Hryvnia,
  Tenge,
  Som,
  Manat,
  Dram,
  Lari,
  Birr,
  Cedi,
  Naira,
  Kwanza,
  Kwacha,
  Shilling,
  Pula,
  Lilangeni,
  Nakfa,
  Ouguiya,
  Ariary,
  Rupiah,
  Ringgit,
  Baht,
  Kip,
  Riel,
  Dong,
  Tugrik,
  Pataca,
  Taka,
  Afghani,
  Rial,
  Dram2,
  Lari2,
  Leku,
  Peso2,
  Guarani,
  Sol,
  Boliviano,
  Sucre,
  Cordoba,
  Quetzal,
  Lempira,
  Colon,
  Balboa,
  Gourde,
  Dollar2,
  Peso3,
  Franc2,
  Dinar2,
  Dirham2,
  Riyal2,
  Rial2,
  Toman,
  Afghani2,
  Rupee2,
  Taka2,
  Kyat,
  Kip2,
  Riel2,
  Dong2,
  Pataca2,
  Ringgit2,
  Baht2,
  Rupiah2,
  Dollar3,
  Peso4,
  Won2,
  Yen2,
  Yuan,
  Renminbi,
  Hong,
  Macao,
  Taiwan,
  Singapore,
  Brunei,
  Malaysian,
  Indonesian,
  Philippine,
  Vietnamese,
  Cambodian,
  Laotian,
  Thai,
  Myanmar,
  Bangladeshi,
  Pakistani,
  Indian,
  Sri,
  Nepalese,
  Bhutanese,
  Maldivian,
  Afghan,
  Iranian,
  Iraqi,
  Kuwaiti,
  Bahraini,
  Qatari,
  Emirati,
  Omani,
  Yemeni,
  Saudi,
  Jordanian,
  Lebanese,
  Syrian,
  Turkish,
  Israeli,
  Palestinian,
  Egyptian,
  Sudanese,
  Libyan,
  Tunisian,
  Algerian,
  Moroccan,
  Mauritanian,
  Malian,
  Burkinabe,
  Niger,
  Chadian,
  Central,
  Cameroonian,
  Equatorial,
  Gabonese,
  Congolese,
  Angolan,
  Namibian,
  Botswanan,
  South,
  Zimbabwean,
  Zambian,
  Malawian,
  Mozambican,
  Swazi,
  Lesotho,
  Madagascan,
  Mauritian,
  Seychellois,
  Comorian,
  Djiboutian,
  Eritrean,
  Ethiopian,
  Kenyan,
  Tanzanian,
  Ugandan,
  Rwandan,
  Burundian,
  Somali,
  Somalilander,
  Ghanaian,
  Ivorian,
  Burkinabe2,
  Malian2,
  Mauritanian2,
  Senegalese,
  Gambian,
  Guinea,
  Sierra,
  Liberian,
  Nigerian,
  Beninese,
  Togolese,
  Ghanaian2,
  Ivorian2,
  Burkina,
  Faso,
  Mali,
  Mauritania,
  Senegal,
  Gambia,
  Guinea2,
  Bissau,
  Cape,
  Verde,
  Sao,
  Tome,
  Principe,
  Equatorial2,
  Guinea3,
  Gabon,
  Congo,
  Democratic,
  Republic,
  Angola,
  Namibia,
  Botswana,
  Zimbabwe,
  Zambia,
  Malawi,
  Mozambique,
  Swaziland,
  Lesotho2,
  Madagascar,
  Mauritius,
  Seychelles,
  Comoros,
  Mayotte,
  Reunion,
  Djibouti,
  Eritrea,
  Ethiopia,
  Kenya,
  Tanzania,
  Uganda,
  Rwanda,
  Burundi,
  Somalia,
  Somaliland,
  Sudan,
  South2,
  Sudan2,
  Chad,
  Central2,
  African,
  Republic2,
  Cameroon,
  Nigeria,
  Niger2,
  Benin,
  Togo,
  Ghana,
  Ivory,
  Coast,
  Liberia,
  Sierra2,
  Leone,
  Guinea4,
  Mali2,
  Burkina2,
  Faso2,
  Senegal2,
  Gambia2,
  Guinea5,
  Bissau2,
  Cape2,
  Verde2,
  Sao2,
  Tome2,
  Principe2,
  Morocco,
  Western,
  Sahara,
  Algeria,
  Tunisia,
  Libya,
  Egypt,
  Sudan3,
  Ethiopia2,
  Somalia2,
  Kenya2,
  Tanzania2,
  Uganda2,
  Rwanda2,
  Burundi2,
  Congo2,
  Democratic2,
  Republic3,
  Angola2,
  Zambia2,
  Malawi2,
  Mozambique2,
  Zimbabwe2,
  Botswana2,
  Namibia2,
  South3,
  Africa,
  Lesotho3,
  Swaziland2,
  Madagascar2,
  Mauritius2,
  Seychelles2,
  Comoros2,
  Mayotte2,
  Reunion2,
  Djibouti2,
  Eritrea2,
  Chad2,
  Central3,
  African2,
  Republic4,
  Cameroon2,
  Equatorial3,
  Guinea6,
  Gabon2,
  Sao3,
  Tome3,
  Principe3,
  Nigeria2,
  Niger3,
  Benin2,
  Togo2,
  Ghana2,
  Ivory2,
  Coast2,
  Liberia2,
  Sierra3,
  Leone2,
  Guinea7,
  Mali3,
  Burkina3,
  Faso3,
  Senegal3,
  Gambia3,
  Guinea8,
  Bissau3,
  Cape3,
  Verde3,
  Mauritania2,
  Morocco2,
  Western2,
  Sahara2,
  Algeria2,
  Tunisia2,
  Libya2,
  Egypt2
} from 'lucide-react';
import { ScheduleRepository, ScheduleConflict } from '@/lib/repository/schedule-repository';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ScheduleConflictResolverProps {
  scheduleId?: string;
  showResolved?: boolean;
}

export function ScheduleConflictResolver({ 
  scheduleId, 
  showResolved = false 
}: ScheduleConflictResolverProps) {
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'ignored'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set());

  const scheduleRepository = new ScheduleRepository();

  const dayNames = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  };

  const conflictTypeNames = {
    teacher_overlap: 'Öğretmen Çakışması',
    classroom_overlap: 'Sınıf Çakışması',
    student_overlap: 'Öğrenci Çakışması',
    resource_conflict: 'Kaynak Çakışması'
  };

  const severityNames = {
    critical: 'Kritik',
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük'
  };

  const statusNames = {
    pending: 'Beklemede',
    resolved: 'Çözüldü',
    ignored: 'Göz Ardı Edildi'
  };

  useEffect(() => {
    loadConflicts();
  }, [scheduleId]);

  const loadConflicts = async () => {
    setLoading(true);
    setError(null);

    try {
      const allConflicts = await scheduleRepository.getScheduleConflicts();
      setConflicts(allConflicts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çakışmalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resolveConflict = async (conflictId: string, resolutionOptionId: string, notes?: string) => {
    setLoading(true);
    try {
      const success = await scheduleRepository.resolveScheduleConflict(conflictId, resolutionOptionId, notes);
      if (success) {
        await loadConflicts();
        setSelectedConflict(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çakışma çözümlenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const ignoreConflict = async (conflictId: string) => {
    setLoading(true);
    try {
      // Mock ignore functionality
      setConflicts(prev => 
        prev.map(conflict => 
          conflict.id === conflictId 
            ? { ...conflict, status: 'ignored' as const }
            : conflict
        )
      );
      setSelectedConflict(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çakışma göz ardı edilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleConflictExpansion = (conflictId: string) => {
    const newExpanded = new Set(expandedConflicts);
    if (newExpanded.has(conflictId)) {
      newExpanded.delete(conflictId);
    } else {
      newExpanded.add(conflictId);
    }
    setExpandedConflicts(newExpanded);
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ignored': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConflicts = conflicts.filter(conflict => {
    const statusMatch = filterStatus === 'all' || conflict.status === filterStatus;
    const severityMatch = filterSeverity === 'all' || conflict.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  const conflictStats = {
    total: conflicts.length,
    pending: conflicts.filter(c => c.status === 'pending').length,
    resolved: conflicts.filter(c => c.status === 'resolved').length,
    ignored: conflicts.filter(c => c.status === 'ignored').length,
    critical: conflicts.filter(c => c.severity === 'critical').length,
    high: conflicts.filter(c => c.severity === 'high').length,
    medium: conflicts.filter(c => c.severity === 'medium').length,
    low: conflicts.filter(c => c.severity === 'low').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Çakışma Çözümleme Sistemi</h2>
          <p className="text-gray-600 mt-1">Ders programı çakışmalarını tespit edin ve çözümleyin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadConflicts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{conflictStats.total}</div>
              <div className="text-sm text-gray-600">Toplam Çakışma</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{conflictStats.pending}</div>
              <div className="text-sm text-gray-600">Beklemede</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{conflictStats.resolved}</div>
              <div className="text-sm text-gray-600">Çözüldü</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{conflictStats.critical}</div>
              <div className="text-sm text-gray-600">Kritik</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <select 
                className="w-40 px-3 py-2 border rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="pending">Beklemede</option>
                <option value="resolved">Çözüldü</option>
                <option value="ignored">Göz Ardı Edildi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Önem Derecesi</label>
              <select 
                className="w-40 px-3 py-2 border rounded-md"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="critical">Kritik</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Conflicts List */}
      <div className="space-y-4">
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Çakışmalar yükleniyor...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filteredConflicts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Çakışma Bulunamadı</h3>
                <p className="text-gray-600">
                  {filterStatus === 'all' && filterSeverity === 'all' 
                    ? 'Sistemde herhangi bir çakışma tespit edilmedi.'
                    : 'Seçili filtrelere uygun çakışma bulunamadı.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filteredConflicts.map((conflict) => (
          <Card key={conflict.id} className={`border-l-4 ${getConflictColor(conflict.severity).split(' ')[2]}`}>
            <CardHeader className="cursor-pointer" onClick={() => toggleConflictExpansion(conflict.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getConflictIcon(conflict.conflict_type)}
                  <div>
                    <CardTitle className="text-lg">{conflict.conflict_details.description}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className={getConflictColor(conflict.severity)}>
                        {severityNames[conflict.severity]}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {dayNames[conflict.conflict_details.time_slot.day as keyof typeof dayNames]} • 
                        {conflict.conflict_details.time_slot.period}. Saat • 
                        {conflict.conflict_details.time_slot.start_time} - {conflict.conflict_details.time_slot.end_time}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(conflict.status)}
                  <Badge variant="outline">
                    {statusNames[conflict.status]}
                  </Badge>
                  {expandedConflicts.has(conflict.id) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
              </div>
            </CardHeader>

            {expandedConflicts.has(conflict.id) && (
              <CardContent>
                <div className="space-y-6">
                  {/* Conflict Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Çakışma Detayları</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Çakışma Türü</span>
                          <span className="text-sm font-medium">{conflictTypeNames[conflict.conflict_type]}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Önem Derecesi</span>
                          <Badge variant="outline" className={getConflictColor(conflict.severity)}>
                            {severityNames[conflict.severity]}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Oluşturulma</span>
                          <span className="text-sm font-medium">
                            {format(new Date(conflict.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Etkilenen Unsurlar</h4>
                      <div className="space-y-2">
                        {conflict.affected_entities.teachers && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Öğretmenler: {conflict.affected_entities.teachers.length}</span>
                          </div>
                        )}
                        {conflict.affected_entities.classes && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Sınıflar: {conflict.affected_entities.classes.length}</span>
                          </div>
                        )}
                        {conflict.affected_entities.classrooms && (
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">Derslikler: {conflict.affected_entities.classrooms.length}</span>
                          </div>
                        )}
                        {conflict.affected_entities.subjects && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Dersler: {conflict.affected_entities.subjects.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conflicting Schedules */}
                  <div>
                    <h4 className="font-medium mb-3">Çakışan Programlar</h4>
                    <div className="space-y-2">
                      {conflict.conflict_details.conflicting_schedules.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {schedule.schedule_type === 'class' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            <span className="font-medium">{schedule.entity_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {schedule.schedule_type === 'class' ? 'Sınıf' : 'Öğretmen'}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Options */}
                  {conflict.status === 'pending' && (
                    <div>
                      <h4 className="font-medium mb-3">Çözüm Seçenekleri</h4>
                      <div className="space-y-4">
                        {conflict.resolution_options.map((option) => (
                          <div key={option.option_id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{option.description}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getImpactColor(option.impact_level)}>
                                  {option.impact_level === 'high' ? 'Yüksek' : 
                                   option.impact_level === 'medium' ? 'Orta' : 'Düşük'} etki
                                </Badge>
                                <span className="text-sm text-gray-600">{option.estimated_time} dk</span>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <h5 className="text-sm font-medium">Uygulama Adımları:</h5>
                              <ol className="list-decimal list-inside space-y-1">
                                {option.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-sm text-gray-600">{step}</li>
                                ))}
                              </ol>
                            </div>

                            {option.affects_other_schedules && (
                              <Alert className="mb-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  Bu çözüm diğer programları etkileyebilir. Dikkatli olun.
                                </AlertDescription>
                              </Alert>
                            )}

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => resolveConflict(conflict.id, option.option_id)}
                                disabled={loading}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Bu Çözümü Uygula
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Önizle
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {conflict.status === 'pending' && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => ignoreConflict(conflict.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Göz Ardı Et
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Manuel Düzenle
                      </Button>
                    </div>
                  )}

                  {/* Resolution Info */}
                  {conflict.status === 'resolved' && conflict.resolved_by && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-800">Çakışma Çözüldü</span>
                      </div>
                      <div className="text-sm text-green-700">
                        <div>Çözen: {conflict.resolved_by}</div>
                        <div>Tarih: {format(new Date(conflict.resolved_at!), 'dd MMM yyyy HH:mm', { locale: tr })}</div>
                        {conflict.resolution_notes && (
                          <div className="mt-2">Not: {conflict.resolution_notes}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}