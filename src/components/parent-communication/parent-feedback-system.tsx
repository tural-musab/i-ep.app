/**
 * Parent Feedback System Component
 * Sprint 6: Parent Communication Portal Development
 * İ-EP.APP - Veli Geri Bildirim Sistemi
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  MessageSquare,
  Star,
  Send,
  Eye,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Archive,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Users,
  Calendar,
  BookOpen,
  GraduationCap,
  Settings,
  Home,
  MessageCircle,
  Lightbulb,
  AlertTriangle,
  Award,
  FileText,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Flag,
  UserCheck,
  Activity,
  Zap,
  Heart,
  Smile,
  Frown,
  Meh,
  Phone,
  Mail,
  Info,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ParentFeedback {
  id: string;
  parent: {
    id: string;
    name: string;
    avatar: string;
    email: string;
    phone: string;
  };
  student?: {
    id: string;
    name: string;
    class: string;
    number: string;
  };
  teacher?: {
    id: string;
    name: string;
    subject: string;
    avatar: string;
  };
  feedback: {
    type:
      | 'teacher_performance'
      | 'school_service'
      | 'curriculum'
      | 'facility'
      | 'suggestion'
      | 'complaint';
    category: 'academic' | 'behavioral' | 'administrative' | 'facility' | 'communication' | 'other';
    rating: number;
    title: string;
    description: string;
    isAnonymous: boolean;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
  };
  status: 'submitted' | 'reviewed' | 'responded' | 'resolved' | 'escalated';
  response?: string;
  responseDate?: string;
  respondedBy?: {
    id: string;
    name: string;
    role: string;
  };
  escalatedTo?: string;
  resolutionDate?: string;
  satisfactionRating?: number;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackSummary {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  averageResponseTime: number;
  satisfactionScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  categoryBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    rating: number;
  }>;
}

interface FeedbackTemplate {
  id: string;
  name: string;
  type: ParentFeedback['feedback']['type'];
  category: ParentFeedback['feedback']['category'];
  questions: Array<{
    id: string;
    question: string;
    type: 'text' | 'rating' | 'multiple_choice' | 'scale';
    required: boolean;
    options?: string[];
  }>;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export function ParentFeedbackSystem() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [isCreatingFeedback, setIsCreatingFeedback] = useState(false);
  const [isRespondingTo, setIsRespondingTo] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  // Mock data - gerçek uygulamada API'den gelecek
  const [feedbacks] = useState<ParentFeedback[]>([
    {
      id: '1',
      parent: {
        id: '1',
        name: 'Ayşe Veli',
        avatar: '/api/placeholder/40/40',
        email: 'ayse.veli@parent.com',
        phone: '+90 555 123 4567',
      },
      student: {
        id: '1',
        name: 'Ali Veli',
        class: '5-A',
        number: '2025001',
      },
      teacher: {
        id: '1',
        name: 'Ahmet Öğretmen',
        subject: 'Matematik',
        avatar: '/api/placeholder/40/40',
      },
      feedback: {
        type: 'teacher_performance',
        category: 'academic',
        rating: 5,
        title: 'Mükemmel Öğretmen Performansı',
        description:
          'Ahmet Öğretmen matematik derslerinde çok başarılı. Çocuğum artık matematiği daha iyi anlıyor ve sevmeye başladı. Öğretmenimizin sabırla ve özenle yaklaşımı takdire şayan.',
        isAnonymous: false,
        tags: ['matematik', 'öğretmen', 'başarı', 'sabır'],
        priority: 'low',
        metadata: {
          subject: 'Matematik',
          semester: '2024-2025-1',
          teachingMethod: 'interactive',
        },
      },
      status: 'responded',
      response:
        "Değerli velimiz, geri bildiriminiz için teşekkür ederiz. Ahmet Öğretmen ile paylaştık ve kendisi çok memnun oldu. Ali'nin matematik dersindeki gelişimi bizim için de gurur verici.",
      responseDate: '2025-01-15T14:30:00',
      respondedBy: {
        id: '1',
        name: 'Fatma Müdür',
        role: 'Okul Müdürü',
      },
      satisfactionRating: 5,
      createdAt: '2025-01-15T10:00:00',
      updatedAt: '2025-01-15T14:30:00',
    },
    {
      id: '2',
      parent: {
        id: '2',
        name: 'Mehmet Kaya',
        avatar: '/api/placeholder/40/40',
        email: 'mehmet.kaya@parent.com',
        phone: '+90 555 234 5678',
      },
      student: {
        id: '2',
        name: 'Fatma Kaya',
        class: '6-B',
        number: '2025002',
      },
      feedback: {
        type: 'school_service',
        category: 'administrative',
        rating: 3,
        title: 'İletişim Konusunda Geliştirme Önerisi',
        description:
          'Okul yönetimi ile iletişim konusunda bazı sıkıntılar yaşıyoruz. Özellikle randevu alma konusunda daha hızlı bir sistem olabilir. Ayrıca önemli duyuruların daha zamanında paylaşılması gerekiyor.',
        isAnonymous: false,
        tags: ['iletişim', 'randevu', 'duyuru', 'sistem'],
        priority: 'medium',
        metadata: {
          communicationChannel: 'phone',
          issueType: 'appointment_system',
        },
      },
      status: 'reviewed',
      createdAt: '2025-01-14T09:30:00',
      updatedAt: '2025-01-14T11:00:00',
    },
    {
      id: '3',
      parent: {
        id: '3',
        name: 'Fatma Demir',
        avatar: '/api/placeholder/40/40',
        email: 'fatma.demir@parent.com',
        phone: '+90 555 345 6789',
      },
      student: {
        id: '3',
        name: 'Ahmet Demir',
        class: '5-A',
        number: '2025003',
      },
      feedback: {
        type: 'facility',
        category: 'facility',
        rating: 2,
        title: 'Spor Salonu Aydınlatma Sorunu',
        description:
          'Spor salonunun aydınlatması yetersiz. Çocuklar beden eğitimi dersi sırasında zorluk yaşıyor. Ayrıca salonun havalandırması da yeterli değil.',
        isAnonymous: false,
        tags: ['spor salonu', 'aydınlatma', 'havalandırma', 'beden eğitimi'],
        priority: 'high',
        metadata: {
          facility: 'gymnasium',
          issues: ['lighting', 'ventilation'],
        },
      },
      status: 'escalated',
      escalatedTo: 'Okul Müdürü',
      createdAt: '2025-01-13T16:00:00',
      updatedAt: '2025-01-14T08:00:00',
    },
    {
      id: '4',
      parent: {
        id: '4',
        name: 'Hasan Yılmaz',
        avatar: '/api/placeholder/40/40',
        email: 'hasan.yilmaz@parent.com',
        phone: '+90 555 456 7890',
      },
      student: {
        id: '4',
        name: 'Zehra Yılmaz',
        class: '6-A',
        number: '2025004',
      },
      feedback: {
        type: 'curriculum',
        category: 'academic',
        rating: 4,
        title: 'İngilizce Müfredatı Önerisi',
        description:
          'İngilizce derslerinin daha interaktif olması güzel olurdu. Konuşma pratiği için daha çok fırsat verilmesi gerektiğini düşünüyorum. Oyun tabanlı öğrenme yöntemleri kullanılabilir.',
        isAnonymous: false,
        tags: ['ingilizce', 'müfredat', 'konuşma', 'interaktif'],
        priority: 'medium',
        metadata: {
          subject: 'İngilizce',
          suggestion: 'interactive_learning',
        },
      },
      status: 'submitted',
      createdAt: '2025-01-12T14:00:00',
      updatedAt: '2025-01-12T14:00:00',
    },
    {
      id: '5',
      parent: {
        id: '5',
        name: 'Elif Özkan',
        avatar: '/api/placeholder/40/40',
        email: 'elif.ozkan@parent.com',
        phone: '+90 555 567 8901',
      },
      student: {
        id: '5',
        name: 'Mert Özkan',
        class: '5-B',
        number: '2025005',
      },
      feedback: {
        type: 'suggestion',
        category: 'other',
        rating: 4,
        title: 'Okul Sonrası Aktivite Önerisi',
        description:
          'Okul sonrası çocuklar için daha fazla aktivite düzenlenebilir. Kodlama, robotik, müzik gibi alanlarda kulüpler kurulabilir. Bu şekilde çocuklar boş vakitlerini daha verimli değerlendirebilir.',
        isAnonymous: false,
        tags: ['aktivite', 'kulüp', 'kodlama', 'müzik'],
        priority: 'low',
        metadata: {
          suggestionType: 'extracurricular',
          activities: ['coding', 'robotics', 'music'],
        },
      },
      status: 'resolved',
      response:
        'Öneriniz için teşekkürler. Gelecek dönem için kulüp faaliyetlerini genişletme planımız var. Kodlama ve robotik kulübü açılması konusunda çalışmalarımızı başlattık.',
      responseDate: '2025-01-10T16:00:00',
      respondedBy: {
        id: '2',
        name: 'Ali Müdür Yardımcısı',
        role: 'Müdür Yardımcısı',
      },
      resolutionDate: '2025-01-10T16:00:00',
      satisfactionRating: 4,
      createdAt: '2025-01-08T11:00:00',
      updatedAt: '2025-01-10T16:00:00',
    },
  ]);

  const [feedbackTemplates] = useState<FeedbackTemplate[]>([
    {
      id: '1',
      name: 'Öğretmen Performansı',
      type: 'teacher_performance',
      category: 'academic',
      questions: [
        {
          id: '1',
          question: 'Öğretmenin ders anlatım kalitesini değerlendirin',
          type: 'rating',
          required: true,
        },
        {
          id: '2',
          question: 'Öğretmenin öğrencilere yaklaşımını nasıl buluyorsunuz?',
          type: 'multiple_choice',
          required: true,
          options: ['Çok iyi', 'İyi', 'Orta', 'Kötü'],
        },
        {
          id: '3',
          question: 'Ek yorumlarınız',
          type: 'text',
          required: false,
        },
      ],
      isActive: true,
      usageCount: 45,
      createdAt: '2025-01-01T00:00:00',
    },
    {
      id: '2',
      name: 'Okul Hizmetleri',
      type: 'school_service',
      category: 'administrative',
      questions: [
        {
          id: '1',
          question: 'Okul hizmetlerini genel olarak nasıl değerlendiriyorsunuz?',
          type: 'rating',
          required: true,
        },
        {
          id: '2',
          question: 'Hangi alanda gelişim gerektiğini düşünüyorsunuz?',
          type: 'multiple_choice',
          required: false,
          options: ['İletişim', 'Randevu Sistemi', 'Bilgilendirme', 'Hızlı Yanıt'],
        },
        {
          id: '3',
          question: 'Önerileriniz',
          type: 'text',
          required: false,
        },
      ],
      isActive: true,
      usageCount: 28,
      createdAt: '2025-01-01T00:00:00',
    },
  ]);

  const [newFeedbackData, setNewFeedbackData] = useState({
    student: '',
    teacher: '',
    type: 'teacher_performance',
    category: 'academic',
    rating: 5,
    title: '',
    description: '',
    isAnonymous: false,
    tags: '',
    priority: 'medium',
  });

  const [responseData, setResponseData] = useState({
    response: '',
    escalate: false,
    escalateTo: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher_performance':
        return <UserCheck className="h-4 w-4" />;
      case 'school_service':
        return <Settings className="h-4 w-4" />;
      case 'curriculum':
        return <BookOpen className="h-4 w-4" />;
      case 'facility':
        return <Home className="h-4 w-4" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />;
      case 'complaint':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Send className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      case 'responded':
        return <MessageCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingEmoji = (rating: number) => {
    if (rating >= 4) return <Smile className="h-4 w-4" />;
    if (rating >= 3) return <Meh className="h-4 w-4" />;
    return <Frown className="h-4 w-4" />;
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchesType = filterType === 'all' || feedback.feedback.type === filterType;
    const matchesCategory =
      filterCategory === 'all' || feedback.feedback.category === filterCategory;
    const matchesRating =
      filterRating === 'all' ||
      (filterRating === '5' && feedback.feedback.rating === 5) ||
      (filterRating === '4' && feedback.feedback.rating === 4) ||
      (filterRating === '3' && feedback.feedback.rating === 3) ||
      (filterRating === '2' && feedback.feedback.rating === 2) ||
      (filterRating === '1' && feedback.feedback.rating === 1);
    return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesRating;
  });

  const feedbackSummary: FeedbackSummary = {
    totalFeedback: feedbacks.length,
    averageRating: feedbacks.reduce((sum, f) => sum + f.feedback.rating, 0) / feedbacks.length,
    responseRate:
      (feedbacks.filter((f) => f.status === 'responded' || f.status === 'resolved').length /
        feedbacks.length) *
      100,
    averageResponseTime: 2.5, // hours
    satisfactionScore:
      feedbacks
        .filter((f) => f.satisfactionRating)
        .reduce((sum, f) => sum + (f.satisfactionRating || 0), 0) /
      feedbacks.filter((f) => f.satisfactionRating).length,
    trendDirection: 'up',
    categoryBreakdown: {
      academic: feedbacks.filter((f) => f.feedback.category === 'academic').length,
      behavioral: feedbacks.filter((f) => f.feedback.category === 'behavioral').length,
      administrative: feedbacks.filter((f) => f.feedback.category === 'administrative').length,
      facility: feedbacks.filter((f) => f.feedback.category === 'facility').length,
      communication: feedbacks.filter((f) => f.feedback.category === 'communication').length,
      other: feedbacks.filter((f) => f.feedback.category === 'other').length,
    },
    typeBreakdown: {
      teacher_performance: feedbacks.filter((f) => f.feedback.type === 'teacher_performance')
        .length,
      school_service: feedbacks.filter((f) => f.feedback.type === 'school_service').length,
      curriculum: feedbacks.filter((f) => f.feedback.type === 'curriculum').length,
      facility: feedbacks.filter((f) => f.feedback.type === 'facility').length,
      suggestion: feedbacks.filter((f) => f.feedback.type === 'suggestion').length,
      complaint: feedbacks.filter((f) => f.feedback.type === 'complaint').length,
    },
    monthlyTrend: [
      { month: 'Ocak', count: 15, rating: 4.2 },
      { month: 'Aralık', count: 12, rating: 4.0 },
      { month: 'Kasım', count: 18, rating: 4.1 },
    ],
  };

  const handleSubmitFeedback = () => {
    console.log('Submitting feedback:', newFeedbackData);
    // API call will be implemented here
    setIsCreatingFeedback(false);
    setNewFeedbackData({
      student: '',
      teacher: '',
      type: 'teacher_performance',
      category: 'academic',
      rating: 5,
      title: '',
      description: '',
      isAnonymous: false,
      tags: '',
      priority: 'medium',
    });
  };

  const handleRespondToFeedback = (feedbackId: string) => {
    console.log('Responding to feedback:', feedbackId, responseData);
    // API call will be implemented here
    setIsRespondingTo(null);
    setResponseData({
      response: '',
      escalate: false,
      escalateTo: '',
    });
  };

  const handleEscalateFeedback = (feedbackId: string) => {
    console.log('Escalating feedback:', feedbackId);
    // API call will be implemented here
  };

  const handleResolveFeedback = (feedbackId: string) => {
    console.log('Resolving feedback:', feedbackId);
    // API call will be implemented here
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Veli Geri Bildirim Sistemi
              </CardTitle>
              <CardDescription>Veli geri bildirimlerini yönetin ve yanıtlayın</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCreatingFeedback(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Geri Bildirim Ekle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Geri Bildirim Ara</Label>
              <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Başlık, açıklama, veli veya öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="submitted">Gönderildi</SelectItem>
                  <SelectItem value="reviewed">İncelendi</SelectItem>
                  <SelectItem value="responded">Yanıtlandı</SelectItem>
                  <SelectItem value="resolved">Çözüldü</SelectItem>
                  <SelectItem value="escalated">Yönlendirildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tür</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="teacher_performance">Öğretmen</SelectItem>
                  <SelectItem value="school_service">Okul Hizmetleri</SelectItem>
                  <SelectItem value="curriculum">Müfredat</SelectItem>
                  <SelectItem value="facility">Tesis</SelectItem>
                  <SelectItem value="suggestion">Öneri</SelectItem>
                  <SelectItem value="complaint">Şikayet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Puan</Label>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="5">5 Yıldız</SelectItem>
                  <SelectItem value="4">4 Yıldız</SelectItem>
                  <SelectItem value="3">3 Yıldız</SelectItem>
                  <SelectItem value="2">2 Yıldız</SelectItem>
                  <SelectItem value="1">1 Yıldız</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Geri Bildirim</CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackSummary.totalFeedback}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              Bu ay artış
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {feedbackSummary.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center">
              {getRatingStars(Math.round(feedbackSummary.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yanıt Oranı</CardTitle>
            <MessageCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              %{feedbackSummary.responseRate.toFixed(1)}
            </div>
            <p className="text-muted-foreground text-xs">
              {feedbackSummary.averageResponseTime}s ortalama yanıt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memnuniyet</CardTitle>
            <Heart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {feedbackSummary.satisfactionScore.toFixed(1)}
            </div>
            <p className="text-muted-foreground text-xs">Yanıt memnuniyeti</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="feedbacks">Geri Bildirimler</TabsTrigger>
          <TabsTrigger value="pending">Bekleyen</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
          <TabsTrigger value="templates">Şablonlar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Feedbacks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Son Geri Bildirimler
                </CardTitle>
                <CardDescription>En son alınan geri bildirimler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFeedbacks.slice(0, 5).map((feedback) => (
                    <div
                      key={feedback.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(feedback.feedback.type)}
                        {getRatingEmoji(feedback.feedback.rating)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-sm font-medium">{feedback.feedback.title}</p>
                          <Badge variant="outline" className={getStatusColor(feedback.status)}>
                            {getStatusIcon(feedback.status)}
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-gray-600">
                          {feedback.feedback.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {feedback.feedback.isAnonymous ? 'Anonim' : feedback.parent.name}
                          </div>
                          <div className="flex items-center gap-1">
                            {getRatingStars(feedback.feedback.rating)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(feedback.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFeedback(feedback.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Puan Dağılımı
                </CardTitle>
                <CardDescription>Alınan puanların dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = feedbacks.filter((f) => f.feedback.rating === rating).length;
                    const percentage = (count / feedbacks.length) * 100;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex min-w-[80px] items-center gap-1">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <div className="min-w-[40px] text-right">
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Kategori Dağılımı
              </CardTitle>
              <CardDescription>Geri bildirim kategorilerinin dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(feedbackSummary.categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      {category === 'academic' && <BookOpen className="h-4 w-4" />}
                      {category === 'behavioral' && <UserCheck className="h-4 w-4" />}
                      {category === 'administrative' && <Settings className="h-4 w-4" />}
                      {category === 'facility' && <Home className="h-4 w-4" />}
                      {category === 'communication' && <MessageCircle className="h-4 w-4" />}
                      {category === 'other' && <MoreHorizontal className="h-4 w-4" />}
                      <h3 className="font-medium">
                        {category === 'academic'
                          ? 'Akademik'
                          : category === 'behavioral'
                            ? 'Davranış'
                            : category === 'administrative'
                              ? 'İdari'
                              : category === 'facility'
                                ? 'Tesis'
                                : category === 'communication'
                                  ? 'İletişim'
                                  : category === 'other'
                                    ? 'Diğer'
                                    : category}
                      </h3>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">
                      %{((count / feedbackSummary.totalFeedback) * 100).toFixed(1)} oranında
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedbacks Tab */}
        <TabsContent value="feedbacks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Geri Bildirimler</CardTitle>
              <CardDescription>Alınan geri bildirimler ve durumları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(feedback.feedback.type)}
                          {getRatingEmoji(feedback.feedback.rating)}
                        </div>
                        <div>
                          <h3 className="font-medium">{feedback.feedback.title}</h3>
                          <p className="text-sm text-gray-600">
                            {feedback.feedback.isAnonymous
                              ? 'Anonim Geri Bildirim'
                              : feedback.parent.name}
                            {feedback.student &&
                              ` • ${feedback.student.name} - ${feedback.student.class}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getRatingStars(feedback.feedback.rating)}
                        </div>
                        <Badge variant="outline" className={getStatusColor(feedback.status)}>
                          {getStatusIcon(feedback.status)}
                        </Badge>
                        {feedback.feedback.priority && (
                          <Badge
                            variant="outline"
                            className={getPriorityColor(feedback.feedback.priority)}
                          >
                            {feedback.feedback.priority}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{feedback.feedback.description}</p>
                    </div>

                    {feedback.feedback.tags && feedback.feedback.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {feedback.feedback.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {feedback.response && (
                      <div className="mb-3 rounded-lg bg-green-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {feedback.respondedBy?.name} - {feedback.respondedBy?.role}
                          </span>
                          <span className="text-xs text-gray-600">
                            {feedback.responseDate &&
                              new Date(feedback.responseDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{feedback.response}</p>
                        {feedback.satisfactionRating && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-600">Memnuniyet:</span>
                            {getRatingStars(feedback.satisfactionRating)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(feedback.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        {feedback.teacher && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>
                              {feedback.teacher.name} - {feedback.teacher.subject}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Detay
                        </Button>
                        {feedback.status === 'submitted' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRespondingTo(feedback.id)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Yanıtla
                          </Button>
                        )}
                        {feedback.status === 'reviewed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEscalateFeedback(feedback.id)}
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Yönlendir
                          </Button>
                        )}
                        {feedback.status === 'responded' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveFeedback(feedback.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Çöz
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Geri Bildirimler</CardTitle>
              <CardDescription>Yanıt bekleyen geri bildirimler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks
                  .filter((f) => f.status === 'submitted' || f.status === 'reviewed')
                  .map((feedback) => (
                    <div key={feedback.id} className="rounded-lg border bg-yellow-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(feedback.feedback.type)}
                            {getRatingEmoji(feedback.feedback.rating)}
                          </div>
                          <div>
                            <h3 className="font-medium">{feedback.feedback.title}</h3>
                            <p className="text-sm text-gray-600">
                              {feedback.feedback.isAnonymous
                                ? 'Anonim Geri Bildirim'
                                : feedback.parent.name}
                              {feedback.student &&
                                ` • ${feedback.student.name} - ${feedback.student.class}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getRatingStars(feedback.feedback.rating)}
                          </div>
                          <Badge variant="outline" className={getStatusColor(feedback.status)}>
                            {getStatusIcon(feedback.status)}
                          </Badge>
                          {feedback.feedback.priority && (
                            <Badge
                              variant="outline"
                              className={getPriorityColor(feedback.feedback.priority)}
                            >
                              {feedback.feedback.priority}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{feedback.feedback.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Gönderilme: {new Date(feedback.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRespondingTo(feedback.id)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Yanıtla
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEscalateFeedback(feedback.id)}
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Yönlendir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Geri Bildirim İstatistikleri</CardTitle>
                <CardDescription>Detaylı performans metrikleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {feedbackSummary.totalFeedback}
                      </div>
                      <div className="text-sm text-blue-800">Toplam Geri Bildirim</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {feedbackSummary.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-green-800">Ortalama Puan</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Durum Dağılımı</h4>
                    <div className="space-y-2">
                      {Object.entries({
                        submitted: feedbacks.filter((f) => f.status === 'submitted').length,
                        reviewed: feedbacks.filter((f) => f.status === 'reviewed').length,
                        responded: feedbacks.filter((f) => f.status === 'responded').length,
                        resolved: feedbacks.filter((f) => f.status === 'resolved').length,
                        escalated: feedbacks.filter((f) => f.status === 'escalated').length,
                      }).map(([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between rounded bg-gray-50 p-2"
                        >
                          <span className="text-sm capitalize">
                            {status === 'submitted'
                              ? 'Gönderildi'
                              : status === 'reviewed'
                                ? 'İncelendi'
                                : status === 'responded'
                                  ? 'Yanıtlandı'
                                  : status === 'resolved'
                                    ? 'Çözüldü'
                                    : status === 'escalated'
                                      ? 'Yönlendirildi'
                                      : status}
                          </span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tür Dağılımı</CardTitle>
                <CardDescription>Geri bildirim türlerinin dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(feedbackSummary.typeBreakdown).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type)}
                        <div>
                          <div className="text-sm font-medium">
                            {type === 'teacher_performance'
                              ? 'Öğretmen Performansı'
                              : type === 'school_service'
                                ? 'Okul Hizmetleri'
                                : type === 'curriculum'
                                  ? 'Müfredat'
                                  : type === 'facility'
                                    ? 'Tesis'
                                    : type === 'suggestion'
                                      ? 'Öneri'
                                      : type === 'complaint'
                                        ? 'Şikayet'
                                        : type}
                          </div>
                          <div className="text-xs text-gray-600">{type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{count}</div>
                        <div className="text-xs text-gray-600">
                          %{((count / feedbackSummary.totalFeedback) * 100).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geri Bildirim Şablonları</CardTitle>
              <CardDescription>Standart geri bildirim formları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackTemplates.map((template) => (
                  <div key={template.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(template.type)}
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.questions.length} soru</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {template.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                        <Badge variant="outline">{template.usageCount} kullanım</Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="mb-2 text-sm font-medium">Sorular:</h4>
                      <div className="space-y-2">
                        {template.questions.map((question) => (
                          <div key={question.id} className="rounded bg-gray-50 p-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{question.question}</span>
                              <Badge variant="secondary" className="text-xs">
                                {question.type === 'text'
                                  ? 'Metin'
                                  : question.type === 'rating'
                                    ? 'Puan'
                                    : question.type === 'multiple_choice'
                                      ? 'Çoktan Seçmeli'
                                      : question.type === 'scale'
                                        ? 'Ölçek'
                                        : question.type}
                              </Badge>
                              {question.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Zorunlu
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Oluşturulma: {new Date(template.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="mr-2 h-4 w-4" />
                          Kopyala
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Feedback Modal */}
      {isCreatingFeedback && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <CardTitle>Yeni Geri Bildirim</CardTitle>
              <CardDescription>Geri bildirim ekleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Öğrenci</Label>
                    <Select
                      value={newFeedbackData.student}
                      onValueChange={(value) =>
                        setNewFeedbackData({ ...newFeedbackData, student: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Öğrenci seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student1">Ali Veli - 5-A</SelectItem>
                        <SelectItem value="student2">Fatma Kaya - 6-B</SelectItem>
                        <SelectItem value="student3">Ahmet Demir - 5-A</SelectItem>
                        <SelectItem value="student4">Zehra Yılmaz - 6-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Öğretmen (Opsiyonel)</Label>
                    <Select
                      value={newFeedbackData.teacher}
                      onValueChange={(value) =>
                        setNewFeedbackData({ ...newFeedbackData, teacher: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Öğretmen seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher1">Ahmet Öğretmen - Matematik</SelectItem>
                        <SelectItem value="teacher2">Zeynep Öğretmen - Türkçe</SelectItem>
                        <SelectItem value="teacher3">Mustafa Öğretmen - Fen Bilgisi</SelectItem>
                        <SelectItem value="teacher4">Elif Öğretmen - İngilizce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Geri Bildirim Türü</Label>
                    <Select
                      value={newFeedbackData.type}
                      onValueChange={(value) =>
                        setNewFeedbackData({ ...newFeedbackData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher_performance">Öğretmen Performansı</SelectItem>
                        <SelectItem value="school_service">Okul Hizmetleri</SelectItem>
                        <SelectItem value="curriculum">Müfredat</SelectItem>
                        <SelectItem value="facility">Tesis</SelectItem>
                        <SelectItem value="suggestion">Öneri</SelectItem>
                        <SelectItem value="complaint">Şikayet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select
                      value={newFeedbackData.category}
                      onValueChange={(value) =>
                        setNewFeedbackData({ ...newFeedbackData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Akademik</SelectItem>
                        <SelectItem value="behavioral">Davranış</SelectItem>
                        <SelectItem value="administrative">İdari</SelectItem>
                        <SelectItem value="facility">Tesis</SelectItem>
                        <SelectItem value="communication">İletişim</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Puan</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewFeedbackData({ ...newFeedbackData, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newFeedbackData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input
                    placeholder="Geri bildirim başlığı"
                    value={newFeedbackData.title}
                    onChange={(e) =>
                      setNewFeedbackData({ ...newFeedbackData, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    placeholder="Geri bildirim açıklaması"
                    value={newFeedbackData.description}
                    onChange={(e) =>
                      setNewFeedbackData({ ...newFeedbackData, description: e.target.value })
                    }
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Etiketler (virgülle ayırın)</Label>
                  <Input
                    placeholder="etiket1, etiket2, etiket3"
                    value={newFeedbackData.tags}
                    onChange={(e) =>
                      setNewFeedbackData({ ...newFeedbackData, tags: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Öncelik</Label>
                    <Select
                      value={newFeedbackData.priority}
                      onValueChange={(value) =>
                        setNewFeedbackData({ ...newFeedbackData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Anonim Geri Bildirim</Label>
                      <Switch
                        checked={newFeedbackData.isAnonymous}
                        onCheckedChange={(checked) =>
                          setNewFeedbackData({ ...newFeedbackData, isAnonymous: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingFeedback(false)}>
                    İptal
                  </Button>
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={!newFeedbackData.title || !newFeedbackData.description}
                  >
                    Geri Bildirim Gönder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Response Modal */}
      {isRespondingTo && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <CardTitle>Geri Bildirime Yanıt Ver</CardTitle>
              <CardDescription>Geri bildirime yanıt yazın</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Yanıt</Label>
                  <Textarea
                    placeholder="Yanıtınızı yazın..."
                    value={responseData.response}
                    onChange={(e) => setResponseData({ ...responseData, response: e.target.value })}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Üst Makama Yönlendir</Label>
                    <Switch
                      checked={responseData.escalate}
                      onCheckedChange={(checked) =>
                        setResponseData({ ...responseData, escalate: checked })
                      }
                    />
                  </div>
                  {responseData.escalate && (
                    <Select
                      value={responseData.escalateTo}
                      onValueChange={(value) =>
                        setResponseData({ ...responseData, escalateTo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yönlendirileceği kişi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principal">Okul Müdürü</SelectItem>
                        <SelectItem value="vice_principal">Müdür Yardımcısı</SelectItem>
                        <SelectItem value="coordinator">Koordinatör</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsRespondingTo(null)}>
                    İptal
                  </Button>
                  <Button
                    onClick={() => handleRespondToFeedback(isRespondingTo)}
                    disabled={!responseData.response}
                  >
                    Yanıt Gönder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
