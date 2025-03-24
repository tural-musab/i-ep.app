/**
 * Özel Domain Ekleme API endpoint
 * Tenant için yeni bir özel domain ekler
 * Referans: docs/api-endpoints.md
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DomainService } from "@/lib/domain/domain-service";
import { validateTenantAccess } from "@/lib/auth/permissions";
import { Database } from "@/types/database.types";
import { TenantDomainError } from "@/lib/errors/tenant-errors";

// Domain servisi örneği oluştur
const domainService = new DomainService();

/**
 * POST /api/domains/custom
 * Yeni bir özel domain ekler
 */
export async function POST(req: NextRequest) {
  try {
    // JSON verisini al
    const body = await req.json();
    const { tenantId, domain, isPrimary = false } = body;
    
    if (!tenantId || !domain) {
      return NextResponse.json(
        { success: false, error: "Tenant ID ve domain gereklidir" },
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
        { success: false, error: "Oturum açmanız gerekiyor" },
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
        { success: false, error: "Bu tenant için erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    // Domain servisi ile özel domain ekle
    try {
      const result = await domainService.addCustomDomain(tenantId, domain, isPrimary);
      
      return NextResponse.json({
        success: true,
        data: {
          ...result.domainRecord,
          verification_instructions: result.verificationInstructions
        }
      });
    } catch (error) {
      if (error instanceof TenantDomainError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Özel domain ekleme hatası:", error);
    return NextResponse.json(
      { success: false, error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 