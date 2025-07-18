import { NextResponse } from 'next/server';
import { DomainService } from '@/lib/domain/domain-service';

export async function DELETE(request: Request) {
  try {
    // URL'den domain ID'yi al
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('id');

    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID gereklidir' }, { status: 400 });
    }

    // Tenant ID'yi al (middleware ile gelecektir)
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
    }

    // Domain servisini başlat
    const domainService = new DomainService();

    // Domain'i sil
    const success = await domainService.removeDomain(domainId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Domain başarıyla silindi',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Domain silinirken bir hata oluştu',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Domain silme hatası:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Domain silinirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}
