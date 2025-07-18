/**
 * SSL Durum Kontrolü API endpoint
 * Bir domain'in SSL durumunu kontrol eder
 * Referans: docs/api-endpoints.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DomainService } from '@/lib/domain/domain-service';
import { Database } from '@/types/database.types';

// Domain servisi örneği oluştur
const domainService = new DomainService();

/**
 * GET /api/domains/{domainId}/ssl-status
 * Domain'in SSL durumunu kontrol eder
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  try {
    const { domainId } = await params;

    // Supabase istemcisi oluştur
    const supabase = createServerSupabaseClient<Database>();

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

    // SSL durumunu döndür
    return NextResponse.json({
      success: true,
      data: {
        domain: domain.domain,
        sslActive: sslStatus.sslActive,
        issuer: 'Cloudflare/Vercel',
        validFrom: domain.verified_at || null,
        validTo: null, // SSL sertifikalarının geçerlilik süresi bilgisini şu an alamıyoruz
        details: sslStatus.details,
      },
    });
  } catch (error) {
    console.error('SSL durum kontrolü hatası:', error);
    return NextResponse.json(
      { success: false, error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
