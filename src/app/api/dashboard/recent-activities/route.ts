/**
 * Recent Activities API Endpoint
 * İ-EP.APP - Dashboard Recent Activities
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * GET /api/dashboard/recent-activities
 * Mock data for recent activities
 */
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/dashboard/recent-activities',
    },
    async () => {
      try {
        const recentActivities = [
          {
            id: '1',
            type: 'assignment',
            title: 'Matematik Ödev 3 teslim edildi',
            description: 'Ahmet Yılmaz tarafından matematik ödevi teslim edildi',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 dakika önce
            user: 'Ahmet Yılmaz',
            icon: 'assignment'
          },
          {
            id: '2',
            type: 'attendance',
            title: 'Devamsızlık kaydı güncellendi',
            description: '9A sınıfı için günlük devam kaydı tamamlandı',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 saat önce
            user: 'Fatma Özdemir',
            icon: 'attendance'
          },
          {
            id: '3',
            type: 'grade',
            title: 'Yeni notlar eklendi',
            description: 'Türkçe dersi sınav notları sisteme girildi',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 saat önce
            user: 'Mehmet Kaya',
            icon: 'grade'
          },
          {
            id: '4',
            type: 'parent_communication',
            title: 'Veli toplantısı planlandı',
            description: 'Kasım ayı veli toplantısı için davet gönderildi',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 saat önce
            user: 'Zeynep Arslan',
            icon: 'communication'
          },
          {
            id: '5',
            type: 'system',
            title: 'Sistem güncellemesi',
            description: 'Platform güvenlik güncellemesi tamamlandı',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 saat önce
            user: 'Sistem',
            icon: 'system'
          }
        ];

        return NextResponse.json({
          success: true,
          data: recentActivities
        });
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: 'Son aktiviteler alınamadı' },
          { status: 500 }
        );
      }
    }
  );
}