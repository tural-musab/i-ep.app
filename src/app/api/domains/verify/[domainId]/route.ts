/**
 * Domain Doğrulama API endpoint
 * Bir domain'in DNS yapılandırmasını doğrular
 * Referans: docs/api-endpoints.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DomainService } from '@/lib/domain/domain-service';
import { Database } from '@/types/database.types';
import { TenantDomainError } from '@/lib/errors/tenant-errors';

// Domain servisi örneği oluştur
const domainService = new DomainService();

/**
 * POST /api/domains/verify/{domainId}
 * Domain'in DNS yapılandırmasını ve SSL durumunu doğrular
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const { domainId } = await params;

    if (!domainId) {
      return NextResponse.json({ success: false, error: 'Domain ID gereklidir' }, { status: 400 });
    }

    // Supabase istemcisi oluştur
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Kullanıcı oturum bilgisini al
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Domain'i getir
    const domain = await domainService.getDomainById(domainId);

    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain bulunamadı' }, { status: 404 });
    }

    // Domain doğrulama işlemini başlat
    try {
      const verificationResult = await domainService.verifyDomain(domainId);

      return NextResponse.json({
        success: true,
        data: {
          verified: verificationResult.dnsConfigured && verificationResult.sslActive,
          dnsConfigured: verificationResult.dnsConfigured,
          sslStatus: verificationResult.sslActive ? 'active' : 'provisioning',
          message: verificationResult.message,
        },
      });
    } catch (error) {
      if (error instanceof TenantDomainError) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Domain doğrulama hatası:', error);
    return NextResponse.json(
      { success: false, error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
