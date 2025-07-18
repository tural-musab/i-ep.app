/**
 * Domain Detay ve Silme API endpoint
 * Belirli bir domain'in detaylarını getirir veya siler
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
 * GET /api/domains/{domainId}
 * Belirli bir domain'in detaylarını getirir
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  try {
    const { domainId } = await params;

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

    // SSL durumunu kontrol et
    const sslStatus = await domainService.checkSSLStatus(domainId);

    // Domain detaylarını döndür
    return NextResponse.json({
      success: true,
      data: {
        ...domain,
        dns_status: {
          dnsConfigured: domain.is_verified, // Eğer doğrulanmışsa DNS konfigürasyonu doğru demektir
          sslActive: sslStatus.sslActive,
          lastChecked: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Domain detay hatası:', error);
    return NextResponse.json(
      { success: false, error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/domains/{domainId}
 * Bir domain'i siler
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const { domainId } = await params;

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

    // Domain silme işlemini başlat
    try {
      await domainService.deleteDomain(domainId);

      return NextResponse.json({
        success: true,
        message: 'Domain başarıyla silindi',
      });
    } catch (error) {
      if (error instanceof TenantDomainError) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Domain silme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
