/**
 * Primary Domain Ayarlama API endpoint
 * Bir domain'i tenant için primary olarak ayarlar
 * Referans: docs/api-endpoints.md
 */

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DomainService } from "@/lib/domain/domain-service";
import { Database } from "@/types/database.types";
import { TenantDomainError } from "@/lib/errors/tenant-errors";

// Domain servisi örneği oluştur
const domainService = new DomainService();

/**
 * PUT /api/domains/{domainId}/primary
 * Bir domain'i primary olarak ayarlar
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const domainId = params.domainId;
    
    // JSON verisini al
    const body = await req.json();
    const { tenantId } = body;
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant ID gereklidir" },
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
    
    // Domain'i primary olarak ayarla
    try {
      await domainService.setPrimaryDomain(domainId, tenantId);
      
      // Domain bilgisini al
      const domain = await domainService.getDomainById(domainId);
      
      return NextResponse.json({
        success: true,
        message: "Domain primary olarak ayarlandı",
        data: {
          id: domain?.id,
          domain: domain?.domain,
          is_primary: true
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
    console.error("Primary domain ayarlama hatası:", error);
    return NextResponse.json(
      { success: false, error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 