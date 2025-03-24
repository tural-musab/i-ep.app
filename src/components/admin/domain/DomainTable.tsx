/**
 * Domain Tablosu Komponenti
 * Domain listesini görüntüler ve yönetim işlemlerini sağlar
 * Referans: docs/domain-management.md
 */

"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DomainRecord } from "@/lib/domain/domain-service";
import { MoreHorizontal, Check, X, Globe, ShieldCheck, Lock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface DomainTableProps {
  domains: DomainRecord[];
  loading: boolean;
  onDelete: (domainId: string) => void;
  onVerify: (domainId: string) => void;
  onSetPrimary: (domainId: string, tenantId: string) => void;
  onCheckSSL?: (domainId: string) => void;
}

export function DomainTable({ 
  domains, 
  loading, 
  onDelete, 
  onVerify, 
  onSetPrimary,
  onCheckSSL 
}: DomainTableProps) {
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  // Domain doğrulama işlemi
  const handleVerify = async (domainId: string) => {
    setVerifyingDomain(domainId);
    await onVerify(domainId);
    setVerifyingDomain(null);
  };

  // Domain silme işlemi
  const handleDelete = async (domainId: string) => {
    setDeletingDomain(domainId);
    await onDelete(domainId);
    setDeletingDomain(null);
  };

  // Primary domain ayarlama
  const handleSetPrimary = async (domainId: string, tenantId: string) => {
    setSettingPrimary(domainId);
    await onSetPrimary(domainId, tenantId);
    setSettingPrimary(null);
  };

  // Domain tipini görüntüle
  const getDomainType = (type: string) => {
    return type === "subdomain" ? "Subdomain" : "Özel Domain";
  };

  // Domain durumunu görüntüle
  const getDomainStatusBadge = (domain: DomainRecord) => {
    if (domain.is_verified) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="w-3 h-3 mr-1" />
          Doğrulanmış
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <RefreshCw className="w-3 h-3 mr-1" />
        Bekliyor
      </Badge>
    );
  };

  // Oluşturulma tarihini formatla
  const formatCreatedAt = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: tr
      });
    } catch (error) {
      return dateString;
    }
  };

  // Loading durumunda iskelet göster
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Domain yoksa mesaj göster
  if (domains.length === 0) {
    return (
      <div className="text-center py-8">
        <Globe className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
        <p className="mt-4 text-muted-foreground">Görüntülenecek domain bulunamadı</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead>Tür</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Primary</TableHead>
          <TableHead>Oluşturulma</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map(domain => (
          <TableRow key={domain.id}>
            <TableCell className="font-medium">{domain.domain}</TableCell>
            <TableCell>
              <Badge variant="secondary">{getDomainType(domain.type)}</Badge>
            </TableCell>
            <TableCell>{getDomainStatusBadge(domain)}</TableCell>
            <TableCell>
              {domain.is_primary ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Primary
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatCreatedAt(domain.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menü</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!domain.is_verified && (
                    <DropdownMenuItem 
                      onClick={() => handleVerify(domain.id)}
                      disabled={verifyingDomain === domain.id}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {verifyingDomain === domain.id ? "Doğrulanıyor..." : "Doğrula"}
                    </DropdownMenuItem>
                  )}
                  
                  {domain.is_verified && !domain.is_primary && (
                    <DropdownMenuItem 
                      onClick={() => handleSetPrimary(domain.id, domain.tenant_id)}
                      disabled={settingPrimary === domain.id}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      {settingPrimary === domain.id ? "Ayarlanıyor..." : "Primary Yap"}
                    </DropdownMenuItem>
                  )}
                  
                  {domain.type === "custom" && (
                    <DropdownMenuItem 
                      onClick={() => onCheckSSL?.(domain.id)}
                      disabled={!domain.is_verified}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      SSL Durumu
                    </DropdownMenuItem>
                  )}
                  
                  {!domain.is_primary && (
                    <DropdownMenuItem 
                      onClick={() => handleDelete(domain.id)}
                      disabled={deletingDomain === domain.id}
                      className="text-red-600 focus:text-red-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {deletingDomain === domain.id ? "Siliniyor..." : "Sil"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 