'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, User, Mail, UserCheck, GraduationCap, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserCreateData {
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | '';
  class?: string;
  subject?: string;
  parentEmail?: string;
  notes?: string;
}

interface UserCreateModalProps {
  onUserCreate: (userData: UserCreateData) => void;
  isLoading?: boolean;
}

export function UserCreateModal({ onUserCreate, isLoading = false }: UserCreateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<UserCreateData>({
    email: '',
    fullName: '',
    role: '',
    class: '',
    subject: '',
    parentEmail: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        email: '',
        fullName: '',
        role: '',
        class: '',
        subject: '',
        parentEmail: '',
        notes: ''
      });
      setErrors({});
    }
    setIsOpen(open);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Ad Soyad gereklidir';
    }

    if (!formData.role) {
      newErrors.role = 'Rol seçimi gereklidir';
    }

    if (formData.role === 'student' && !formData.class) {
      newErrors.class = 'Öğrenci için sınıf bilgisi gereklidir';
    }

    if (formData.role === 'teacher' && !formData.subject) {
      newErrors.subject = 'Öğretmen için ders bilgisi gereklidir';
    }

    if (formData.role === 'parent' && !formData.parentEmail) {
      newErrors.parentEmail = 'Veli için iletişim email\'i gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onUserCreate(formData);
      setIsOpen(false);
      // Form will be reset by handleOpenChange
    } catch (error) {
      console.error('User creation error:', error);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof UserCreateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get role-specific fields
  const getRoleSpecificFields = () => {
    switch (formData.role) {
      case 'student':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="class">Sınıf *</Label>
              <Select 
                value={formData.class} 
                onValueChange={(value) => handleFieldChange('class', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sınıf seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9-A">9-A</SelectItem>
                  <SelectItem value="9-B">9-B</SelectItem>
                  <SelectItem value="9-C">9-C</SelectItem>
                  <SelectItem value="10-A">10-A</SelectItem>
                  <SelectItem value="10-B">10-B</SelectItem>
                  <SelectItem value="10-C">10-C</SelectItem>
                  <SelectItem value="11-A">11-A</SelectItem>
                  <SelectItem value="11-B">11-B</SelectItem>
                  <SelectItem value="11-C">11-C</SelectItem>
                  <SelectItem value="12-A">12-A</SelectItem>
                  <SelectItem value="12-B">12-B</SelectItem>
                  <SelectItem value="12-C">12-C</SelectItem>
                </SelectContent>
              </Select>
              {errors.class && <p className="text-sm text-red-600 mt-1">{errors.class}</p>}
            </div>
          </div>
        );

      case 'teacher':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Branş / Ders *</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => handleFieldChange('subject', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Branş seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Matematik">Matematik</SelectItem>
                  <SelectItem value="Fizik">Fizik</SelectItem>
                  <SelectItem value="Kimya">Kimya</SelectItem>
                  <SelectItem value="Biyoloji">Biyoloji</SelectItem>
                  <SelectItem value="Türkçe">Türkçe</SelectItem>
                  <SelectItem value="İngilizce">İngilizce</SelectItem>
                  <SelectItem value="Tarih">Tarih</SelectItem>
                  <SelectItem value="Coğrafya">Coğrafya</SelectItem>
                  <SelectItem value="Felsefe">Felsefe</SelectItem>
                  <SelectItem value="Beden Eğitimi">Beden Eğitimi</SelectItem>
                  <SelectItem value="Müzik">Müzik</SelectItem>
                  <SelectItem value="Resim">Resim</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
            </div>
          </div>
        );

      case 'parent':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="parentEmail">İletişim Email *</Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="veli@example.com"
                value={formData.parentEmail}
                onChange={(e) => handleFieldChange('parentEmail', e.target.value)}
              />
              {errors.parentEmail && <p className="text-sm text-red-600 mt-1">{errors.parentEmail}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Veli bildirimlerinin gönderileceği email adresi
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="outline" className="border-red-500 text-red-600">Yönetici</Badge>;
      case 'teacher':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Öğretmen</Badge>;
      case 'student':
        return <Badge variant="outline" className="border-green-500 text-green-600">Öğrenci</Badge>;
      case 'parent':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Veli</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Yeni Kullanıcı Oluştur
          </DialogTitle>
          <DialogDescription>
            Sisteme yeni kullanıcı ekleyin. Tüm gerekli bilgileri doldurun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Temel Bilgiler</h4>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Ad Soyad *</Label>
                <Input
                  id="fullName"
                  placeholder="Ahmet Yılmaz"
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                />
                {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Adresi *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ahmet@example.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="role">Kullanıcı Rolü *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleFieldChange('role', value as UserCreateData['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <UserCheck className="mr-2 h-4 w-4 text-red-500" />
                      Yönetici
                    </div>
                  </SelectItem>
                  <SelectItem value="teacher">
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
                      Öğretmen
                    </div>
                  </SelectItem>
                  <SelectItem value="student">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                      Öğrenci
                    </div>
                  </SelectItem>
                  <SelectItem value="parent">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-purple-500" />
                      Veli
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
              {formData.role && (
                <div className="mt-2">
                  {getRoleBadge(formData.role)}
                </div>
              )}
            </div>
          </div>

          {/* Role-specific fields */}
          {formData.role && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Rol Özel Bilgileri</h4>
              {getRoleSpecificFields()}
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Notlar</Label>
            <textarea
              id="notes"
              placeholder="Bu kullanıcı hakkında ek notlar..."
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}