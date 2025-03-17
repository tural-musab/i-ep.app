import { NextResponse } from 'next/server';
import { DomainService } from '@/lib/domain/domain-service';

export async function POST(request: Request) {
  try {
    // İstek içeriğini al
    const body = await request.json();
    const { domainId } = body;
    
    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID gereklidir' }, { status: 400 });
    }
    
    // Domain servisini başlat
    const domainService = new DomainService();
    
    // Domain doğrulama durumunu kontrol et
    const isVerified = await domainService.checkDomainVerification(domainId);
    
    return NextResponse.json({
      success: true,
      verified: isVerified,
      message: isVerified ? 'Domain doğrulandı' : 'Domain henüz doğrulanmadı'
    });
  } catch (error) {
    console.error('Domain doğrulama hatası:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Domain doğrulama kontrolü sırasında bir hata oluştu'
    }, { status: 500 });
  }
} 