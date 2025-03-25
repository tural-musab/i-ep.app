/**
 * Domain Doğrulama Komponenti
 * Özel domainlerin doğrulama sürecini yönetir
 * Referans: docs/components/super-admin/domain/DomainVerification.md
 */

"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button"; // Button bileşenini düzelttik

// Toast servisi için basit bir fallback oluşturalım
const toast = (message: string) => {
  console.log("Toast message:", message);
  // Gerçek bir toast gösterimi olsaydı burada çağrılırdı
};

// Utility fonksiyonu için basit bir implementasyon
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};

// Eksik UI bileşenlerini oluşturalım
// Card bileşenleri
function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>{children}</div>;
}

function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>{children}</h3>;
}

function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>;
}

function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props}>{children}</div>;
}

// Alert bileşenleri
function Alert({ className, children, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "success" }) {
  return (
    <div
      className={cn("relative w-full rounded-lg border p-4", {
        "bg-background text-foreground": variant === "default",
        "border-red-600 text-red-600": variant === "destructive",
        "border-green-600 text-green-600": variant === "success",
      }, className)}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}>{children}</h5>;
}

function AlertDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props}>{children}</div>;
}

// Badge bileşeni
function Badge({ className, children, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "outline" | "success" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border border-border": variant === "outline",
          "border-transparent bg-green-500 text-white": variant === "success",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Progress bileşeni
function Progress({ className, value = 0, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

// Lucide ikonlarını yerel olarak tanımlayalım
function Copy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 2v6h6" />
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
      <path d="M21 22v-6h-6" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </svg>
  );
}

function ExternalLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

// Steps bileşenleri
interface StepProps {
  title: string;
  description?: string;
  status?: "waiting" | "current" | "complete";
}

function Step({ title, description, status = "waiting" }: StepProps) {
  return (
    <div className="flex items-start space-x-2">
      <div 
        className={cn("mt-0.5 h-6 w-6 rounded-full flex items-center justify-center border text-xs", {
          "bg-muted border-gray-300": status === "waiting",
          "bg-primary text-white border-primary": status === "current",
          "bg-green-500 text-white border-green-500": status === "complete",
        })}
      >
        {status === "complete" ? <Check className="h-3 w-3" /> : null}
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </div>
    </div>
  );
}

function Steps({ size = "md", activeStep = 0, children }: { size?: "sm" | "md" | "lg", activeStep?: number, children: React.ReactNode }) {
  const steps = React.Children.toArray(children);
  
  return (
    <div className={cn("flex flex-col space-y-4", {
      "gap-1": size === "sm",
      "gap-2": size === "md",
      "gap-4": size === "lg",
    })}>
      {steps.map((step, index) => {
        // @ts-ignore
        return React.cloneElement(step, {
          status: index < activeStep ? "complete" : index === activeStep ? "current" : "waiting"
        });
      })}
    </div>
  );
}

// Toast hook
const useToast = () => {
  return {
    toast: (props: { title: string; description: string }) => {
      toast(props.description);
    }
  };
};

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
                size="sm"
                className="h-6 w-6 p-0 min-w-0"
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
          variant="ghost"
          onClick={() => window.open(`https://${domain}`, '_blank')}
          disabled={!status?.verified}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Doğrulanmış Siteyi Ziyaret Et
        </Button>
        
        <Button
          variant="primary"
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