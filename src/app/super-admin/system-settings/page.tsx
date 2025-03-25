'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Settings, Shield, Mail, Server, Database, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface DefaultTenantSettings {
  max_users: number;
  subscription_tier: string;
  storage_limit_mb: number;
}

interface SecuritySettings {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_number: boolean;
  password_require_symbol: boolean;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_minutes: number;
}

interface SystemSettings {
  site_name: string;
  contact_email: string;
  support_email: string;
  max_file_size_mb: number;
  allowed_file_types: string[];
  enable_maintenance_mode: boolean;
  enable_audit_logging: boolean;
  tenant_creation_enabled: boolean;
  default_tenant_settings: DefaultTenantSettings;
  security_settings: SecuritySettings;
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('genel');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'i-EP',
    contact_email: 'contact@i-ep.app',
    support_email: 'support@i-ep.app',
    max_file_size_mb: 50,
    allowed_file_types: ['pdf', 'jpg', 'png', 'docx', 'xlsx', 'pptx'],
    enable_maintenance_mode: false,
    enable_audit_logging: true,
    tenant_creation_enabled: true,
    default_tenant_settings: {
      max_users: 100,
      subscription_tier: 'standard',
      storage_limit_mb: 1024,
    },
    security_settings: {
      password_min_length: 8,
      password_require_uppercase: true,
      password_require_number: true,
      password_require_symbol: true,
      max_login_attempts: 5,
      lockout_duration_minutes: 30,
      session_timeout_minutes: 60,
    },
  });

  // URL'den gelen "tab" parametresini işle
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['genel', 'tenant', 'guvenlik', 'e-posta', 'bakım'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Ayarları yükle
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const supabase = createClientComponentClient();
        
        // Sistem ayarlarını getir
        // Gerçek uygulamada burası veritabanından gelecek
        // Şimdilik örnek veri kullanıyoruz
        
        // Örnek olarak 1 saniye bekletelim
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mevcut state'i kullan
        
      } catch (error) {
        console.error('Sistem ayarları yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      if (section === 'default_tenant_settings') {
        setSettings(prev => ({
          ...prev,
          default_tenant_settings: {
            ...prev.default_tenant_settings,
            [field]: value
          }
        }));
      } else if (section === 'security_settings') {
        setSettings(prev => ({
          ...prev,
          security_settings: {
            ...prev.security_settings,
            [field]: value
          }
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      if (section === 'default_tenant_settings') {
        setSettings(prev => ({
          ...prev,
          default_tenant_settings: {
            ...prev.default_tenant_settings,
            [field]: numValue
          }
        }));
      } else if (section === 'security_settings') {
        setSettings(prev => ({
          ...prev,
          security_settings: {
            ...prev.security_settings,
            [field]: numValue
          }
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      if (section === 'security_settings') {
        setSettings(prev => ({
          ...prev,
          security_settings: {
            ...prev.security_settings,
            [field]: checked
          }
        }));
      } else if (section === 'default_tenant_settings') {
        setSettings(prev => ({
          ...prev,
          default_tenant_settings: {
            ...prev.default_tenant_settings,
            [field]: checked
          }
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      if (section === 'default_tenant_settings') {
        setSettings(prev => ({
          ...prev,
          default_tenant_settings: {
            ...prev.default_tenant_settings,
            [field]: value
          }
        }));
      } else if (section === 'security_settings') {
        setSettings(prev => ({
          ...prev,
          security_settings: {
            ...prev.security_settings,
            [field]: value
          }
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Burada ayarları kaydediyoruz
      // Gerçek uygulamada veritabanına kaydedilecek
      
      // Örnek olarak 1 saniye bekletelim
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Sistem ayarları başarıyla kaydedildi');
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.error('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
        <p className="text-muted-foreground">
          Uygulama genelinde sistem ayarlarını yapılandırın
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ayarlar</CardTitle>
          <CardDescription>
            Sistem için genel ayarları ve yapılandırmaları yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="genel" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Genel</span>
              </TabsTrigger>
              <TabsTrigger value="tenant" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Tenant</span>
              </TabsTrigger>
              <TabsTrigger value="guvenlik" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Güvenlik</span>
              </TabsTrigger>
              <TabsTrigger value="e-posta" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>E-posta</span>
              </TabsTrigger>
              <TabsTrigger value="bakım" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span>Bakım</span>
              </TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Genel Ayarlar */}
                <TabsContent value="genel" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="site_name">Site Adı</Label>
                      <Input 
                        id="site_name" 
                        name="site_name" 
                        value={settings.site_name} 
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max_file_size_mb">Maksimum Dosya Boyutu (MB)</Label>
                      <Input 
                        id="max_file_size_mb" 
                        name="max_file_size_mb" 
                        type="number" 
                        value={settings.max_file_size_mb} 
                        onChange={handleNumericChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allowed_file_types">İzin Verilen Dosya Türleri</Label>
                      <Input 
                        id="allowed_file_types" 
                        name="allowed_file_types" 
                        value={settings.allowed_file_types.join(', ')} 
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            allowed_file_types: e.target.value.split(',').map(t => t.trim())
                          }));
                        }} 
                      />
                      <p className="text-xs text-muted-foreground">Dosya uzantılarını virgülle ayırın (örn: pdf, jpg, png)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable_audit_logging">Denetim Günlüğü</Label>
                        <Switch 
                          id="enable_audit_logging" 
                          checked={settings.enable_audit_logging} 
                          onCheckedChange={(checked) => handleSwitchChange('enable_audit_logging', checked)} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Sistem genelinde tüm işlemlerin kaydını tut</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tenant Ayarları */}
                <TabsContent value="tenant" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tenant_creation_enabled">Tenant Oluşturma</Label>
                        <Switch 
                          id="tenant_creation_enabled" 
                          checked={settings.tenant_creation_enabled} 
                          onCheckedChange={(checked) => handleSwitchChange('tenant_creation_enabled', checked)} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Yeni tenant oluşturma özelliğini etkinleştir/devre dışı bırak</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="default_tenant_settings.max_users">Varsayılan Maksimum Kullanıcı Sayısı</Label>
                      <Input 
                        id="default_tenant_settings.max_users" 
                        name="default_tenant_settings.max_users" 
                        type="number" 
                        value={settings.default_tenant_settings.max_users} 
                        onChange={handleNumericChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="default_tenant_settings.storage_limit_mb">Varsayılan Depolama Limiti (MB)</Label>
                      <Input 
                        id="default_tenant_settings.storage_limit_mb" 
                        name="default_tenant_settings.storage_limit_mb" 
                        type="number" 
                        value={settings.default_tenant_settings.storage_limit_mb} 
                        onChange={handleNumericChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="default_tenant_settings.subscription_tier">Varsayılan Abonelik Seviyesi</Label>
                      <Select 
                        value={settings.default_tenant_settings.subscription_tier}
                        onValueChange={(value) => handleSelectChange('default_tenant_settings.subscription_tier', value)}
                      >
                        <SelectTrigger id="default_tenant_settings.subscription_tier">
                          <SelectValue placeholder="Abonelik seviyesi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Ücretsiz</SelectItem>
                          <SelectItem value="standard">Standart</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Kurumsal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Güvenlik Ayarları */}
                <TabsContent value="guvenlik" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="security_settings.password_min_length">Minimum Şifre Uzunluğu</Label>
                      <Input 
                        id="security_settings.password_min_length" 
                        name="security_settings.password_min_length" 
                        type="number" 
                        value={settings.security_settings.password_min_length} 
                        onChange={handleNumericChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="security_settings.max_login_attempts">Maksimum Giriş Denemesi</Label>
                      <Input 
                        id="security_settings.max_login_attempts" 
                        name="security_settings.max_login_attempts" 
                        type="number" 
                        value={settings.security_settings.max_login_attempts} 
                        onChange={handleNumericChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="security_settings.lockout_duration_minutes">Hesap Kilitleme Süresi (dakika)</Label>
                      <Input 
                        id="security_settings.lockout_duration_minutes" 
                        name="security_settings.lockout_duration_minutes" 
                        type="number" 
                        value={settings.security_settings.lockout_duration_minutes} 
                        onChange={handleNumericChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="security_settings.session_timeout_minutes">Oturum Zaman Aşımı (dakika)</Label>
                      <Input 
                        id="security_settings.session_timeout_minutes" 
                        name="security_settings.session_timeout_minutes" 
                        type="number" 
                        value={settings.security_settings.session_timeout_minutes} 
                        onChange={handleNumericChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="security_settings.password_require_uppercase">Büyük Harf Gerektir</Label>
                        <Switch 
                          id="security_settings.password_require_uppercase" 
                          checked={settings.security_settings.password_require_uppercase} 
                          onCheckedChange={(checked) => handleSwitchChange('security_settings.password_require_uppercase', checked)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="security_settings.password_require_number">Sayı Gerektir</Label>
                        <Switch 
                          id="security_settings.password_require_number" 
                          checked={settings.security_settings.password_require_number} 
                          onCheckedChange={(checked) => handleSwitchChange('security_settings.password_require_number', checked)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="security_settings.password_require_symbol">Özel Karakter Gerektir</Label>
                        <Switch 
                          id="security_settings.password_require_symbol" 
                          checked={settings.security_settings.password_require_symbol} 
                          onCheckedChange={(checked) => handleSwitchChange('security_settings.password_require_symbol', checked)} 
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* E-posta Ayarları */}
                <TabsContent value="e-posta" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">İletişim E-postası</Label>
                      <Input 
                        id="contact_email" 
                        name="contact_email" 
                        type="email" 
                        value={settings.contact_email} 
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="support_email">Destek E-postası</Label>
                      <Input 
                        id="support_email" 
                        name="support_email" 
                        type="email" 
                        value={settings.support_email} 
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="smtp_settings">SMTP Ayarları</Label>
                      <p className="text-xs text-muted-foreground">Bu sistem Supabase Auth ve e-posta entegrasyonu kullanmaktadır. SMTP ayarları Supabase Dashboard üzerinden yapılandırılmalıdır.</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Bakım Ayarları */}
                <TabsContent value="bakım" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable_maintenance_mode">Bakım Modu</Label>
                        <Switch 
                          id="enable_maintenance_mode" 
                          checked={settings.enable_maintenance_mode} 
                          onCheckedChange={(checked) => handleSwitchChange('enable_maintenance_mode', checked)} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Aktifleştirildiğinde, süper adminler hariç tüm kullanıcılar bakım sayfasına yönlendirilir</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backup_frequency">Yedekleme Sıklığı</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger id="backup_frequency">
                          <SelectValue placeholder="Yedekleme sıklığını seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Saatlik</SelectItem>
                          <SelectItem value="daily">Günlük</SelectItem>
                          <SelectItem value="weekly">Haftalık</SelectItem>
                          <SelectItem value="monthly">Aylık</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Bu ayarlar Supabase yedekleme planını etkilemez, sadece uygulama veri yedeklemesi için geçerlidir</p>
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="maintenance_message">Bakım Mesajı</Label>
                      <Textarea 
                        id="maintenance_message" 
                        placeholder="Bakım modunda gösterilecek mesaj"
                        className="min-h-[100px]"
                        defaultValue="Sistemimiz şu anda bakım modundadır. Kısa süre içinde tekrar hizmet vermeye başlayacağız. Anlayışınız için teşekkür ederiz."
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="database-operations">Veritabanı İşlemleri</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Database className="h-4 w-4" /> 
                          <span>RLS Politikalarını Yeniden Uygula</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Database className="h-4 w-4" /> 
                          <span>Veritabanı Bakımı Çalıştır</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Database className="h-4 w-4" /> 
                          <span>Önbelleği Temizle</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Ayarları Kaydet</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 