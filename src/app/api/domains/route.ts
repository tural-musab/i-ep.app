/**
 * Domain yönetimi API route
 * Tenanlar için domain yönetimi işlemlerini sağlar
 * Referans: docs/api-endpoints.md, Domain Endpoints bölümü
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createDnsRecord,
  deleteDnsRecord,
  verifyCustomDomain,
} from "@/lib/cloudflare/domains";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { validateTenantAccess } from "@/lib/auth/permissions";
import { Database } from "@/types/database.types";
import { DomainService } from "@/lib/domain/domain-service";

// Domain servisi örneği oluştur
const domainService = new DomainService();

/**
 * GET /api/domains
 * Domain listesini getirir
 */
export async function GET(req: NextRequest) {
  try {
    // URL parametrelerini al
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const type = searchParams.get("type") as "subdomain" | "custom" | null;
    const isVerified = searchParams.get("isVerified");
    
    // Supabase istemcisi oluştur
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Kullanıcı oturum bilgisini al
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Eğer belirli bir tenant'ın domainleri isteniyorsa, erişim kontrolü yap
    if (tenantId) {
      const hasAccess = await validateTenantAccess(
        session.user,
        tenantId
      );

      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Bu tenant için erişim yetkiniz yok" },
          { status: 403 }
        );
      }
    } else {
      // Tüm domainlere erişim için admin kontrolü
      // TODO: Burada admin kontrolü yapılmalı
    }

    // Domain servisi ile domainleri getir
    const domains = await domainService.getDomains({
      tenantId: tenantId || undefined,
      type: type || undefined,
      isVerified: isVerified ? isVerified === 'true' : undefined
    });

    // Sonuçları döndür
    return NextResponse.json({ 
      success: true, 
      data: domains,
      count: domains.length
    });
  } catch (error) {
    console.error("Domain API hatası:", error);
    return NextResponse.json(
      { success: false, error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // JSON verisini al
    const body = await req.json();
    const { tenantId, subdomain, action } = body;

    if (!tenantId || !subdomain) {
      return NextResponse.json(
        { error: "Tenant ID ve subdomain gereklidir" },
        { status: 400 }
      );
    }

    // Supabase istemcisi oluştur
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Kullanıcı oturum bilgisini al
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Kullanıcının tenant erişimini doğrula
    const hasAccess = await validateTenantAccess({
      userId: session.user.id,
      tenantId,
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Bu tenant için erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    // İşleme göre domain işlemini gerçekleştir
    let result;
    switch (action) {
      case "create":
        result = await createDnsRecord({
          subdomain,
          rootDomain: "i-ep.app",
        });
        break;
      case "delete":
        result = await deleteDnsRecord(subdomain, "i-ep.app");
        break;
      case "verify":
        const domain = body.domain;
        if (!domain) {
          return NextResponse.json(
            { error: "Domain gereklidir" },
            { status: 400 }
          );
        }
        result = await verifyCustomDomain(domain);
        break;
      default:
        return NextResponse.json(
          { error: "Geçersiz işlem" },
          { status: 400 }
        );
    }

    // API cevabını gönder
    return NextResponse.json(result);
  } catch (error) {
    console.error("Domain API hatası:", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 