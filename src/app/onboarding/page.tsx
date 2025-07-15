'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import OnboardingWizard from '@/components/onboarding/onboarding-wizard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, ArrowRight, Settings, Users, BookOpen, MessageSquare } from 'lucide-react'

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      // Check if user has already completed onboarding
      checkOnboardingStatus()
    }
  }, [user, loading, checkOnboardingStatus])

  const checkOnboardingStatus = useCallback(async () => {
    try {
      // This would typically check the user's onboarding status from the backend
      // For now, we'll simulate this check
      const hasCompletedOnboarding = user?.user_metadata?.onboarding_completed || false
      
      if (hasCompletedOnboarding) {
        router.push('/dashboard')
        return
      }
      
      setIsCheckingStatus(false)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setIsCheckingStatus(false)
    }
  }, [user, router])

  const handleStartOnboarding = () => {
    setShowWizard(true)
  }

  const handleOnboardingComplete = () => {
    router.push('/dashboard')
  }

  if (loading || isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <OnboardingWizard
          tenantId={user.tenant_id || 'default'}
          userId={user.id}
          userRole={user.role || 'teacher'}
          onComplete={handleOnboardingComplete}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            İ-EP.APP&apos;e Hoş Geldiniz!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kapsamlı okul yönetim sisteminize hoş geldiniz. Başlamak için kısa bir kurulum sürecinden geçelim.
          </p>
        </div>

        {/* What You'll Set Up */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Neler Yapacağız?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Settings className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-lg">Okul Kurulumu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Okul bilgilerinizi girin ve temel ayarları yapın
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto text-green-600 mb-2" />
                <CardTitle className="text-lg">Profil Oluşturma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Kişisel bilgilerinizi tamamlayın ve tercihleri belirleyin
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-lg">Sınıf Kurulumu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  İlk sınıfınızı oluşturun ve öğrenci yönetimine başlayın
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="w-12 h-12 mx-auto text-orange-600 mb-2" />
                <CardTitle className="text-lg">Entegrasyonlar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Mevcut sistemlerinizi İ-EP.APP ile entegre edin
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Neden İ-EP.APP?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Kapsamlı Yönetim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Not yönetimi, devamsızlık takibi, ödev sistemi ve veli iletişimi tek platformda
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Kolay Kullanım
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Sezgisel arayüz ve kullanıcı dostu tasarım ile hızlı adapte olun
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Güvenli & Güncel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Verileriniz güvende, sistem sürekli güncellenir ve yeni özellikler eklenir
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-center">⏱️ Kurulum Süresi</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">~15 dakika</div>
              <p className="text-gray-600 mb-4">
                Ortalama kurulum süresi sadece 15 dakika. İstediğiniz zaman duraklatabilir ve daha sonra devam edebilirsiniz.
              </p>
              <div className="flex justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>6 kolay adım</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>%95 tamamlanma oranı</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>İsteğe bağlı adımlar</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleStartOnboarding}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg"
          >
            Başlayalım
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Kurulum sırasında istediğiniz zaman çıkış yapabilir ve daha sonra devam edebilirsiniz.
          </p>
        </div>

        {/* Help */}
        <div className="mt-12 text-center">
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>
              <strong>Yardıma mı ihtiyacınız var?</strong> Kurulum sırasında herhangi bir sorunla karşılaşırsanız, 
              destek ekibimiz size yardımcı olmaktan mutluluk duyar.
              <br />
              <Button variant="link" className="p-0 mt-2" onClick={() => router.push('/support')}>
                Destek Merkezi →
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
} 