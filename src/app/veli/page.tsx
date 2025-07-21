'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, FileText, Calendar, MessageSquare, TrendingUp } from 'lucide-react';

export default function VeliDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Giriş yapılmadı</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Veli Paneli</h1>
        <p className="mt-2 text-gray-600">
          Hoş geldiniz, {user?.profile?.fullName || user?.email}
        </p>
      </div>

      {/* Children Overview */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Çocuklarım
            </CardTitle>
            <CardDescription>Çocuklarınızın akademik durum özeti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Child 1 */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Ahmet Yılmaz</CardTitle>
                      <CardDescription>5-A Sınıfı • Öğrenci No: 1023</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Aktif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Bu ay devam:</span>
                      <span className="font-medium text-green-600">22/23 gün</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Genel ortalama:</span>
                      <span className="font-medium text-blue-600">85.5</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Bekleyen ödev:</span>
                      <span className="font-medium text-orange-600">2 adet</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Child 2 */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Ayşe Yılmaz</CardTitle>
                      <CardDescription>3-B Sınıfı • Öğrenci No: 1157</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Aktif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Bu ay devam:</span>
                      <span className="font-medium text-green-600">23/23 gün</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Genel ortalama:</span>
                      <span className="font-medium text-blue-600">92.3</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Bekleyen ödev:</span>
                      <span className="font-medium text-green-600">Yok</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parent Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Devam</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2/2</div>
            <p className="text-xs text-muted-foreground">
              Çocukların bugün okulda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yeni Mesaj</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Öğretmenlerden mesaj
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta Ödev</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Toplam ödev sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akademik Ortalama</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88.9</div>
            <p className="text-xs text-muted-foreground">
              Genel başarı ortalaması
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Parents */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Hızlı İşlemler
            </CardTitle>
            <CardDescription>Veli takip ve iletişim araçları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium">Öğretmenle İletişim</span>
                  <span className="text-xs text-gray-600">Mesaj gönder</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6 text-green-500" />
                  <span className="text-sm font-medium">Not Raporu</span>
                  <span className="text-xs text-gray-600">Akademik durum</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <span className="text-sm font-medium">Devam Raporu</span>
                  <span className="text-xs text-gray-600">Devamsızlık takibi</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-orange-500" />
                  <span className="text-sm font-medium">Ödev Takibi</span>
                  <span className="text-xs text-gray-600">Ödev durumu</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Son Aktiviteler
            </CardTitle>
            <CardDescription>Çocuklarınızın okul faaliyetleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Not
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Matematik Sınavı Sonucu</p>
                  <p className="text-sm text-gray-600">Ahmet - 5-A • Puan: 95</p>
                </div>
                <div className="text-xs text-gray-500">2 saat önce</div>
              </div>

              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Ödev
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Türkçe Ödevi Teslim Edildi</p>
                  <p className="text-sm text-gray-600">Ayşe - 3-B • Kompozisyon</p>
                </div>
                <div className="text-xs text-gray-500">5 saat önce</div>
              </div>

              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    Mesaj
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Öğretmenden Mesaj</p>
                  <p className="text-sm text-gray-600">Sınıf öğretmeni • Veli toplantısı hk.</p>
                </div>
                <div className="text-xs text-gray-500">1 gün önce</div>
              </div>

              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Devam
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Devam Kaydı</p>
                  <p className="text-sm text-gray-600">Ahmet ve Ayşe • Tam katılım</p>
                </div>
                <div className="text-xs text-gray-500">1 gün önce</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Performance Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Akademik Performans
            </CardTitle>
            <CardDescription>Son 3 aylık not ortalamaları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Chart placeholder for Ahmet */}
              <div className="space-y-4">
                <h4 className="font-medium">Ahmet Yılmaz - 5A</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matematik</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-20 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">85</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Türkçe</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-22 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">90</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fen Bilgisi</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-18 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">78</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart placeholder for Ayşe */}
              <div className="space-y-4">
                <h4 className="font-medium">Ayşe Yılmaz - 3B</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matematik</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-23 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">95</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Türkçe</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-21 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">88</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hayat Bilgisi</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-24 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">98</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}