import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

const { logger } = Sentry;

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
export async function GET() {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/example',
    },
    async (span) => {
      try {
        // Add attributes to the span
        span.setAttribute('endpoint', '/api/example');
        span.setAttribute('method', 'GET');

        // Log the request
        logger.info('Processing GET request to /api/example', {
          endpoint: '/api/example',
          method: 'GET',
          timestamp: new Date().toISOString(),
        });

        const response = {
          message: 'API çalışıyor',
          timestamp: new Date().toISOString(),
        };

        // Log successful response
        logger.info('Successfully processed GET request', {
          endpoint: '/api/example',
          responseData: response,
        });

        return NextResponse.json(response);
      } catch (error) {
        // Log and capture the error
        logger.error('Error processing GET request to /api/example', {
          endpoint: '/api/example',
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        Sentry.captureException(error, {
          tags: { api_route: 'example', method: 'GET' },
          extra: { endpoint: '/api/example' },
        });

        span.setStatus({ code: 2, message: 'Internal Server Error' });

        return NextResponse.json({ success: false, error: 'İç sunucu hatası' }, { status: 500 });
      }
    }
  );
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
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/example',
    },
    async (span) => {
      try {
        // Add attributes to the span
        span.setAttribute('endpoint', '/api/example');
        span.setAttribute('method', 'POST');

        // Log the request start
        logger.info('Processing POST request to /api/example', {
          endpoint: '/api/example',
          method: 'POST',
          timestamp: new Date().toISOString(),
        });

        const body = await request.json();

        // Add request data to span (without sensitive info)
        span.setAttribute('request.hasName', !!body.name);
        span.setAttribute('request.hasMessage', !!body.message);

        // Basit doğrulama
        if (!body.name) {
          logger.warn('Validation failed: missing name field', {
            endpoint: '/api/example',
            validationError: 'name field required',
          });

          span.setAttribute('validation.error', 'name_required');
          span.setStatus({ code: 1, message: 'Bad Request' });

          return NextResponse.json(
            { success: false, error: 'name alanı zorunludur' },
            { status: 400 }
          );
        }

        const responseData = {
          success: true,
          data: {
            ...body,
            timestamp: new Date().toISOString(),
          },
        };

        // Log successful processing
        logger.info('Successfully processed POST request', {
          endpoint: '/api/example',
          userName: body.name,
          success: true,
        });

        return NextResponse.json(responseData);
      } catch (error) {
        // Handle JSON parsing errors or other exceptions
        logger.error('Error processing POST request to /api/example', {
          endpoint: '/api/example',
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof SyntaxError ? 'json_parse' : 'unknown',
        });

        Sentry.captureException(error, {
          tags: {
            api_route: 'example',
            method: 'POST',
            error_type: error instanceof SyntaxError ? 'json_parse' : 'unknown',
          },
          extra: {
            endpoint: '/api/example',
            timestamp: new Date().toISOString(),
          },
        });

        span.setStatus({ code: 2, message: 'Internal Server Error' });

        return NextResponse.json(
          {
            success: false,
            error: error instanceof SyntaxError ? 'Geçersiz JSON formatı' : 'İç sunucu hatası',
          },
          { status: error instanceof SyntaxError ? 400 : 500 }
        );
      }
    }
  );
}
