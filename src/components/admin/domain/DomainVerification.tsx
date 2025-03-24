/**
 * Domain Doğrulama Komponenti
 * Özel domainlerin doğrulama sürecini yönetir
 * Referans: docs/components/super-admin/domain/DomainVerification.md
 */

"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Check, AlertTriangle, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { Step, Steps } from "@/components/ui/steps";

interface DomainVerificationProps {
  /** Domain ID */
  domainId: string;
  
  /** Domain adresi */
  domain: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Doğrulama tamamlandığında çağrılır */
  onVerified?: () => void;
  
  /** Hata durumunda çağrılır */
  onError?: (error: any) => void;
  
  /** Otomatik kontrol aralığı (ms) */
  checkInterval?: number;
}

interface VerificationStatus {
  verified: boolean;
  dnsConfigured: boolean;
  sslStatus: string;
  message?: string;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
}

export function DomainVerification({
  domainId,
  domain,
  tenantId,
  onVerified,
  onError,
  checkInterval = 30000,
}: DomainVerificationProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dnsRecord, setDnsRecord] = useState<DnsRecord>({
    type: "CNAME",
    name: domain,
    value: "cname.vercel-dns.com"
  });
  const [copied, setCopied] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  
  // Doğrulama durumunu kontrol et
  const checkVerificationStatus = async () => {
    setChecking(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/domains/verify/${domainId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
        setCheckCount(prev => prev + 1);
        
        // Doğrulama tamamlandı mı?
        if (result.data.verified) {
          clearInterval(intervalId);
          onVerified?.();
          toast({
            title: "Başarılı",
            description: "Domain başarıyla doğrulandı",
          });
        }
      } else {
        setError(result.error || "Doğrulama kontrolü yapılırken bir hata oluştu");
        onError?.(result.error);
      }
    } catch (error) {
      console.error("Doğrulama kontrolü hatası:", error);
      setError("Doğrulama kontrolü yapılırken bir hata oluştu");
      onError?.(error);
    } finally {
      setChecking(false);
      setLoading(false);
    }
  };
  
  // Doğrulama talimatlarını al
  const fetchVerificationInstructions = async () => {
    try {
      // Burada normalde API'den doğrulama talimatlarını alacaktık
      // Şimdilik statik bilgileri kullanıyoruz
      setDnsRecord({
        type: "CNAME",
        name: domain,
        value: "cname.vercel-dns.com"
      });
    } catch (error) {
      console.error("Doğrulama talimatları alınamadı:", error);
      setError("Doğrulama talimatları alınamadı");
    }
  };
  
  // DNS kaydı değerini panoya kopyala
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Kopyalandı",
        description: "DNS kaydı panoya kopyalandı",
      });
    });
  };
  
  // Aktif adım numarasını hesapla
  const getActiveStep = (): number => {
    if (!status) return 0;
    if (status.verified) return 2;
    if (status.dnsConfigured) return 1;
    return 0;
  };
  
  // Doğrulama ilerlemesini hesapla
  const getVerificationProgress = (): number => {
    if (!status) return 5;
    if (status.verified) return 100;
    if (status.dnsConfigured) return status.sslStatus === "active" ? 90 : 65;
    if (checkCount > 0) return 30;
    return 5;
  };
  
  let intervalId: NodeJS.Timeout;
  
  // İlk yüklemede doğrulama durumunu kontrol et
  useEffect(() => {
    fetchVerificationInstructions();
    checkVerificationStatus();
    
    // Periyodik kontrol
    intervalId = setInterval(() => {
      if (!status?.verified) {
        checkVerificationStatus();
      }
    }, checkInterval);
    
    return () => clearInterval(intervalId);
  }, [domainId, tenantId]);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{domain} Doğrulama</span>
          <Badge variant={status?.verified ? "success" : "outline"}>
            {status?.verified ? "Doğrulandı" : "Bekliyor"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Doğrulama adımları */}
        <div className="mb-6">
          <Steps size="sm" activeStep={getActiveStep()}>
            <Step
              title="DNS Kaydı Ekleyin"
              description="Domain DNS ayarlarınızı güncelleyin"
              status={getActiveStep() >= 0 ? (getActiveStep() > 0 ? "complete" : "current") : "waiting"}
            />
            <Step
              title="DNS Propagasyonu"
              description="DNS değişikliklerinin yayılması"
              status={getActiveStep() >= 1 ? (getActiveStep() > 1 ? "complete" : "current") : "waiting"}
            />
            <Step
              title="SSL Sertifikası"
              description="SSL sertifikasının oluşturulması"
              status={getActiveStep() >= 2 ? "complete" : "waiting"}
            />
          </Steps>
        </div>

        {/* İlerleme çubuğu */}
        <div className="mb-6">
          <Progress value={getVerificationProgress()} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Doğrulama İlerlemesi: %{getVerificationProgress()}
          </p>
        </div>
        
        {/* Hata mesajı */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* DNS ayarları talimatları */}
        <div className="bg-muted p-4 rounded-md mb-4">
          <h3 className="text-sm font-semibold mb-2">DNS Kaydı Ekleme Talimatları</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Domain sağlayıcınızın DNS yönetim paneline giderek aşağıdaki kaydı ekleyin:
          </p>
          
          <div className="grid grid-cols-4 gap-2 text-sm mb-2 font-medium">
            <div>Tür</div>
            <div>İsim</div>
            <div>Değer</div>
            <div>TTL</div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-sm mb-4 bg-background p-2 rounded">
            <div>{dnsRecord.type}</div>
            <div className="truncate">{dnsRecord.name === domain ? '@' : dnsRecord.name}</div>
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">{dnsRecord.value}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(dnsRecord.value)}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <div>Auto</div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Not: DNS değişikliklerinin yayılması 24-48 saat sürebilir, ancak genellikle daha kısa sürede tamamlanır.
          </p>
        </div>
        
        {/* Durum mesajı */}
        {status && (
          <Alert variant={status.verified ? "success" : "default"} className="mb-4">
            <div className="flex gap-2">
              {status.verified ? (
                <Check className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              <div>
                <AlertTitle>
                  {status.verified 
                    ? "Domain Doğrulandı" 
                    : status.dnsConfigured 
                      ? "DNS Doğrulandı, SSL Bekleniyor" 
                      : "Doğrulama Bekleniyor"}
                </AlertTitle>
                <AlertDescription>
                  {status.message || (status.verified 
                    ? "Domain doğrulaması tamamlandı, SSL sertifikası oluşturuldu." 
                    : status.dnsConfigured 
                      ? "DNS kaydı doğrulandı, SSL sertifikası oluşturma işlemi devam ediyor." 
                      : "DNS kaydının doğrulanması bekleniyor.")}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.open(`https://${domain}`, '_blank')}
          disabled={!status?.verified}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Doğrulanmış Siteyi Ziyaret Et
        </Button>
        
        <Button
          variant="secondary"
          onClick={checkVerificationStatus}
          disabled={checking}
        >
          {checking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {!checking && <RefreshCw className="h-4 w-4 mr-2" />}
          Durumu Kontrol Et
        </Button>
      </CardFooter>
    </Card>
  );
} 