/**
 * Domain Yönetimi Sayfası
 * Admin panelinde domain yönetimi için ana sayfa
 * Referans: docs/components/super-admin/README.md, Domain Yönetimi bölümü
 */

"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainTable } from "@/components/admin/domain/DomainTable";
import { AddDomainDialog } from "@/components/admin/domain/AddDomainDialog";
import { DomainService } from "@/lib/domain/domain-service";
import { DomainRecord, VerificationDetails } from "@/lib/domain/domain-service";
import { TenantDomainError } from "@/lib/errors/tenant-errors";

interface DomainTab {
  id: string;
  label: string;
  type?: "subdomain" | "custom";
  isVerified?: boolean;
}

export default function DomainsPage() {
  const { toast } = useToast();
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [verificationDetails, setVerificationDetails] = useState<VerificationDetails | null>(null);

  // Domain tabs
  const tabs: DomainTab[] = [
    { id: "all", label: "Tüm Domainler" },
    { id: "subdomains", label: "Subdomainler", type: "subdomain" },
    { id: "custom", label: "Özel Domainler", type: "custom" },
    { id: "pending", label: "Bekleyen", isVerified: false },
    { id: "verified", label: "Doğrulanmış", isVerified: true },
  ];

  // Domain listesini getir
  const fetchDomains = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/domains");
      const result = await response.json();

      if (result.success) {
        setDomains(result.data);
      } else {
        toast({
          title: "Hata",
          description: result.error || "Domainler yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Domain yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Domainler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Domain silme işlemi
  const handleDeleteDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Domain başarıyla silindi",
        });
        fetchDomains(); // Listeyi yenile
      } else {
        toast({
          title: "Hata",
          description: result.error || "Domain silinirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Domain silme hatası:", error);
      toast({
        title: "Hata",
        description: "Domain silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Domain doğrulama işlemi
  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/domains/verify/${domainId}`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        if (result.data.verified) {
          toast({
            title: "Başarılı",
            description: "Domain başarıyla doğrulandı",
          });
        } else {
          setVerificationDetails(result.data);
          toast({
            title: "Doğrulama Devam Ediyor",
            description: result.data.message || "Doğrulama işlemi devam ediyor",
          });
        }
        fetchDomains(); // Listeyi yenile
      } else {
        toast({
          title: "Hata",
          description: result.error || "Domain doğrulanırken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Domain doğrulama hatası:", error);
      toast({
        title: "Hata",
        description: "Domain doğrulanırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Primary domain ayarlama
  const handleSetPrimary = async (domainId: string, tenantId: string) => {
    try {
      const response = await fetch(`/api/domains/${domainId}/primary`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId }),
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Primary domain başarıyla ayarlandı",
        });
        fetchDomains(); // Listeyi yenile
      } else {
        toast({
          title: "Hata",
          description: result.error || "Primary domain ayarlanırken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Primary domain ayarlama hatası:", error);
      toast({
        title: "Hata",
        description: "Primary domain ayarlanırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Domain ekleme işlemi tamamlandığında
  const handleDomainAdded = () => {
    fetchDomains();
    setAddDialogOpen(false);
  };

  // Seçili tab değiştiğinde filtreleme
  const getFilteredDomains = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    
    if (!activeTabData || activeTab === "all") {
      return domains;
    }
    
    return domains.filter(domain => {
      if (activeTabData.type && domain.type !== activeTabData.type) {
        return false;
      }
      
      if (activeTabData.isVerified !== undefined && domain.is_verified !== activeTabData.isVerified) {
        return false;
      }
      
      return true;
    });
  };

  // İlk yüklemede domain listesini getir
  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Domain Yönetimi</h1>
        <Button onClick={() => setAddDialogOpen(true)}>Domain Ekle</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domainler</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} forceMount>
              <DomainTable
                domains={getFilteredDomains()}
                loading={loading}
                onDelete={handleDeleteDomain}
                onVerify={handleVerifyDomain}
                onSetPrimary={handleSetPrimary}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddDomainDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onDomainAdded={handleDomainAdded}
      />
    </div>
  );
} 