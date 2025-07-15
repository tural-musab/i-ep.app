/**
 * SSL Durumu Komponenti
 * Domain SSL sertifikası durumunu gösterir ve yönetir
 * Referans: docs/components/super-admin/domain/SSLStatus.md
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";
import { format, formatDistanceToNow, isAfter, subDays, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

interface SSLStatusProps {
  /** Domain ID */
  domainId: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Domain adı */
  domain: string;
  
  /** Yenileme yapıldığında çağrılır */
  onRenew?: () => void;
  
  /** Hata durumunda çağrılır */
  onError?: (error: SSLError) => void;
}

interface SSLCertificate {
  domain: string;
  sslActive: boolean;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  algorithm?: string;
  details?: Record<string, unknown>;
}

interface SSLError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

type SSLStatus = 'valid' | 'expired' | 'expiring_soon' | 'invalid' | 'pending';

export function SSLStatus({
  domainId,
  onRenew,
  onError
}: SSLStatusProps) {
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<SSLCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // SSL durumunu kontrol et
  const checkSSLStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/domains/${domainId}/ssl-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCertificate(result.data);
        
        // SSL süresinin dolmasına az kaldıysa uyarı ver
        if (result.data.validTo) {
          const expiryDate = parseISO(result.data.validTo);
          const now = new Date();
          const warningDate = subDays(expiryDate, 7);
          
          if (isAfter(now, expiryDate)) {
            toast({
              title: "SSL Sertifikası Süresi Doldu",
              description: "SSL sertifikasının süresi dolmuş. Lütfen yenileyin.",
              variant: "destructive",
            });
          } else if (isAfter(now, warningDate)) {
            toast({
              title: "SSL Sertifikası Süresi Doluyor",
              description: `SSL sertifikasının süresi ${formatDistanceToNow(expiryDate, { locale: tr })} içinde dolacak.`,
              variant: "warning",
            });
          }
        }
      } else {
        setError(result.error || "SSL durumu kontrol edilirken bir hata oluştu");
        
        if (onError) {
          onError({
            code: 'FETCH_ERROR',
            message: result.error || "SSL durumu kontrol edilirken bir hata oluştu"
          });
        }
      }
    } catch (error) {
      console.error("SSL durumu kontrol hatası:", error);
      setError("SSL durumu kontrol edilirken bir hata oluştu");
      
      if (onError) {
        onError({
          code: 'FETCH_ERROR',
          message: "SSL durumu kontrol edilirken bir hata oluştu"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [domainId, onError]);
  
  // SSL sertifikasını yenile
  const renewSSLCertificate = async () => {
    setRenewing(true);
    setError(null);
    
    try {
      // Burada normalde API'ye SSL yenileme isteği gönderilecek
      // Şimdilik sadece bir simülasyon yapıyoruz
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Yenileme Başlatıldı",
        description: "SSL sertifikası yenileme işlemi başlatıldı. Bu işlem birkaç dakika sürebilir.",
      });
      
      if (onRenew) {
        onRenew();
      }
      
      // Durumu güncelle
      checkSSLStatus();
    } catch (error) {
      console.error("SSL yenileme hatası:", error);
      setError("SSL sertifikası yenilenirken bir hata oluştu");
      
      if (onError) {
        onError({
          code: 'RENEWAL_ERROR',
          message: "SSL sertifikası yenilenirken bir hata oluştu"
        });
      }
    } finally {
      setRenewing(false);
    }
  };
  
  // SSL durumunu belirleme
  const getSSLStatus = (): SSLStatus => {
    if (!certificate) return 'pending';
    if (!certificate.sslActive) return 'invalid';
    
    if (certificate.validTo) {
      const expiryDate = parseISO(certificate.validTo);
      const now = new Date();
      const warningDate = subDays(expiryDate, 7);
      
      if (isAfter(now, expiryDate)) {
        return 'expired';
      }
      
      if (isAfter(now, warningDate)) {
        return 'expiring_soon';
      }
    }
    
    return 'valid';
  };
  
  // SSL durumuna göre badge oluştur
  const getSSLStatusBadge = () => {
    const status = getSSLStatus();
    
    switch (status) {
      case 'valid':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Geçerli
          </Badge>
        );
      case 'expiring_soon':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Timer className="w-3 h-3 mr-1" />
            Yakında Sona Erecek
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Süresi Dolmuş
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Geçersiz
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Kontrol Ediliyor
          </Badge>
        );
    }
  };
  
  // Komponent yüklendiğinde SSL durumunu kontrol et
  useEffect(() => {
    checkSSLStatus();
  }, [domainId, checkSSLStatus]);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-muted-foreground" />
              <span>SSL Durumu</span>
            </div>
            <Skeleton className="h-6 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <Lock className="w-5 h-5 mr-2 text-muted-foreground" />
            <span>SSL Durumu</span>
          </div>
          {getSSLStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Hata mesajı */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* SSL sertifika bilgileri */}
        {certificate && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1 flex items-center">
                  <Lock className="w-4 h-4 mr-1 text-muted-foreground" />
                  Domain
                </p>
                <p className="text-sm">{certificate.domain}</p>
              </div>
              
              {certificate.issuer && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-muted-foreground" />
                    Sertifika Sağlayıcı
                  </p>
                  <p className="text-sm">{certificate.issuer}</p>
                </div>
              )}
              
              {certificate.validFrom && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                    Başlangıç Tarihi
                  </p>
                  <p className="text-sm">
                    {format(new Date(certificate.validFrom), 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              )}
              
              {certificate.validTo && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                    Bitiş Tarihi
                  </p>
                  <p className="text-sm">
                    {format(new Date(certificate.validTo), 'dd MMMM yyyy', { locale: tr })}
                    <span className="text-xs ml-2 text-muted-foreground">
                      ({formatDistanceToNow(new Date(certificate.validTo), { addSuffix: true, locale: tr })})
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            {/* SSL durum özeti */}
            <Alert 
              variant={
                getSSLStatus() === 'valid' 
                  ? 'default' 
                  : getSSLStatus() === 'expiring_soon' 
                    ? 'warning' 
                    : 'destructive'
              }
            >
              <div className="flex gap-2">
                {getSSLStatus() === 'valid' ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : getSSLStatus() === 'expiring_soon' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                <div>
                  <AlertTitle>
                    {getSSLStatus() === 'valid' 
                      ? 'SSL Sertifikası Geçerli' 
                      : getSSLStatus() === 'expiring_soon' 
                        ? 'SSL Sertifikası Yakında Sona Erecek' 
                        : getSSLStatus() === 'expired'
                          ? 'SSL Sertifikası Süresi Doldu'
                          : 'SSL Sertifikası Geçersiz'}
                  </AlertTitle>
                  <AlertDescription>
                    {getSSLStatus() === 'valid' 
                      ? 'SSL sertifikası geçerli ve çalışıyor.' 
                      : getSSLStatus() === 'expiring_soon' 
                        ? 'SSL sertifikasının süresi yakında dolacak. Yenilemeyi düşünün.' 
                        : getSSLStatus() === 'expired'
                          ? 'SSL sertifikasının süresi doldu. Lütfen yenileyin.'
                          : 'SSL sertifikası geçersiz veya bulunamadı.'}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        )}
        
        {/* SSL sertifikası yoksa */}
        {!certificate?.sslActive && !error && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>SSL Sertifikası Bulunamadı</AlertTitle>
            <AlertDescription>
              Bu domain için aktif bir SSL sertifikası bulunamadı. 
              SSL sertifikası oluşturmak için domainin doğrulanmış olması gerekir.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={checkSSLStatus}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
        
        <Button
          variant="default"
          onClick={renewSSLCertificate}
          disabled={renewing || !certificate?.sslActive}
        >
          {renewing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Yenileniyor...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              SSL Yenile
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 