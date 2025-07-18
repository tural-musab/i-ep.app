import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant/tenant-utils';
import { UserRepository } from '@/lib/repositories/user-repository';

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Kullanıcıları getirir
 *     description: Tenant'a ait kullanıcıları listeler. Yönetici erişimi gerektirir.
 *     tags:
 *       - Users
 *     parameters:
 *       - name: role
 *         in: query
 *         description: Belirli bir role sahip kullanıcıları filtreler
 *         required: false
 *         schema:
 *           type: string
 *           enum: [admin, teacher, parent, student]
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Tenant bulunamadı
 */
export async function GET(request: NextRequest) {
  try {
    // Mevcut tenant'ı al
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
    }

    // URL parametrelerini al
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');

    // Kullanıcı repository'sini tenant ile başlat
    const userRepo = new UserRepository(tenant.id);

    // Role göre filtreleme yap veya tüm kullanıcıları getir
    let users;
    if (role) {
      users = await userRepo.getByRole(role);
    } else {
      users = await userRepo.getAll();
    }

    // Hassas bilgileri temizle
    const sanitizedUsers = users.map((user) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      last_login: user.last_login,
    }));

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error('Kullanıcılar listelenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Yeni kullanıcı oluşturur
 *     description: Tenant'a yeni bir kullanıcı ekler. Yönetici erişimi gerektirir.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - role
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Kullanıcının tam adı
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcının e-posta adresi
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, parent, student]
 *                 description: Kullanıcının rolü
 *               phone:
 *                 type: string
 *                 description: Telefon numarası
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek veya eksik alanlar
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Tenant bulunamadı
 */
export async function POST(request: NextRequest) {
  try {
    // Mevcut tenant'ı al
    const tenant = await getCurrentTenant();

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant bulunamadı' }, { status: 404 });
    }

    // İstek gövdesini al
    const body = await request.json();

    // Gerekli alanları kontrol et
    if (!body.full_name || !body.email || !body.role) {
      return NextResponse.json(
        { error: 'Eksik bilgiler. İsim, e-posta ve rol gereklidir' },
        { status: 400 }
      );
    }

    // Rol değerini kontrol et
    const validRoles = ['admin', 'teacher', 'parent', 'student'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Geçersiz rol. Geçerli roller: admin, teacher, parent, student' },
        { status: 400 }
      );
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta formatı' }, { status: 400 });
    }

    // Kullanıcı repository'sini tenant ile başlat
    const userRepo = new UserRepository(tenant.id);

    // E-posta adresi zaten kullanılıyor mu kontrol et
    const existingUser = await userRepo.getByEmail(body.email);
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanılıyor' }, { status: 400 });
    }

    // Yeni kullanıcı oluştur
    const newUser = await userRepo.create({
      full_name: body.full_name,
      email: body.email,
      role: body.role,
      phone: body.phone || null,
    });

    // Hassas bilgileri temizle
    const sanitizedUser = {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at,
    };

    return NextResponse.json(sanitizedUser, { status: 201 });
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
