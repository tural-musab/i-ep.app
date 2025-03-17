import { NextResponse } from 'next/server';
import { DomainService } from '@/lib/domain/domain-service';

export async function GET(request: Request) {
  try {
    // Tenant ID'yi al (middleware ile gelecektir)
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
    }
    
    // Domain servisini başlat
    const domainService = new DomainService();
    
    // Tenant'a ait domain listesini al
    const domains = await domainService.getTenantDomains(tenantId);
    
    return NextResponse.json({
      success: true,
      domains
    });
  } catch (error) {
    console.error('Domain listesi alınırken hata:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Domain listesi alınırken bir hata oluştu'
    }, { status: 500 });
  }
} 