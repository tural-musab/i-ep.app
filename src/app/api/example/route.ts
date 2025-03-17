import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Örnek veri döndürür
 *     description: Bu endpoint, API dokümantasyonu için örnek olarak kullanılır
 *     tags:
 *       - example
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API çalışıyor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-16T20:00:00Z"
 */
export async function GET(request: Request) {
  return NextResponse.json({
    message: "API çalışıyor",
    timestamp: new Date().toISOString()
  });
}

/**
 * @swagger
 * /api/example:
 *   post:
 *     summary: Gönderilen veriyi işler ve yanıt döndürür
 *     description: Bu endpoint, API dokümantasyonu için örnek olarak kullanılır
 *     tags:
 *       - example
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Örnek İsim"
 *               message:
 *                 type: string
 *                 example: "Merhaba Dünya"
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Örnek İsim"
 *                     message:
 *                       type: string
 *                       example: "Merhaba Dünya"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-16T20:00:00Z"
 *       400:
 *         description: Geçersiz istek
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "name alanı zorunludur"
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basit doğrulama
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "name alanı zorunludur" }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...body,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Geçersiz JSON formatı" }, 
      { status: 400 }
    );
  }
} 