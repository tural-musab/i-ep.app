/**
 * SQL Injection Security Tests
 * 
 * Bu test dosyası SQL enjeksiyon saldırılarına karşı API endpoints'lerin
 * güvenliğini test eder. Supabase RLS ve parameterized queries ile
 * korunmuş olmalıyız, ancak ek güvenlik katmanlarını da test ediyoruz.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse, UrlWithParsedQuery } from 'url';
import next from 'next';

// Next.js app setup for testing
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3001');

let app: ReturnType<typeof next>;
let server: ReturnType<typeof createServer>;
let handle: (req: any, res: any, parsedUrl?: any) => Promise<void>;

beforeAll(async () => {
  // Prepare Next.js app
  app = next({ dev, hostname, port });
  handle = app.getRequestHandler();
  
  await app.prepare();
  
  // Create test server
  server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
  // Start server
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`Test server running on http://${hostname}:${port}`);
      resolve();
    });
  });
}, 30000);

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
  if (app) {
    await app.close();
  }
});

describe('SQL Injection Security Tests', () => {
  // Classic SQL injection payloads
  const sqlInjectionPayloads = [
    // Basic SQL injection attempts
    "' OR 1=1--",
    "' OR '1'='1",
    "' OR 1=1#",
    "' OR 1=1/*",
    
    // Union-based injections
    "' UNION SELECT null--",
    "' UNION SELECT 1,2,3--",
    "' UNION SELECT username,password FROM users--",
    "' UNION SELECT schema_name FROM information_schema.schemata--",
    
    // Boolean-based blind injections
    "' AND 1=1--",
    "' AND 1=2--",
    "' AND (SELECT COUNT(*) FROM users)>0--",
    
    // Time-based blind injections
    "'; WAITFOR DELAY '00:00:05'--",
    "' OR pg_sleep(5)--",
    
    // Error-based injections
    "' AND (SELECT COUNT(*) FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3)x GROUP BY CONCAT(version(),floor(rand(0)*2)))--",
    
    // PostgreSQL specific injections
    "'; DROP TABLE users;--",
    "' OR version()--",
    "' OR current_user--",
    "' OR current_database()--",
    
    // NoSQL injection attempts (for completeness)
    "'; return true; //",
    "' || 1==1",
    
    // Encoded payloads
    "%27%20OR%201%3D1--", // ' OR 1=1--
    "%22%20UNION%20SELECT%20null--", // " UNION SELECT null--
  ];

  describe('User Search API (/api/users) SQL Injection Tests', () => {
    sqlInjectionPayloads.forEach((payload, index) => {
      it(`should reject SQL injection payload #${index + 1}: "${payload.substring(0, 50)}..."`, async () => {
        const response = await request(server)
          .get('/api/users')
          .query({ search: payload })
          .set('Accept', 'application/json');

        // Should either reject with 400/403 or return empty results
        // Should NOT leak sensitive data or execute SQL
        expect([400, 401, 403, 422, 500]).toContain(response.status);
        
        if (response.status === 200) {
          // If it returns 200, should be empty or limited results
          expect(response.body).toBeDefined();
          
          if (Array.isArray(response.body)) {
            // Should not return massive amounts of data (indication of successful injection)
            expect(response.body.length).toBeLessThan(1000);
          }
          
          // Should not contain system information
          const responseText = JSON.stringify(response.body).toLowerCase();
          expect(responseText).not.toMatch(/information_schema/);
          expect(responseText).not.toMatch(/pg_/);
          expect(responseText).not.toMatch(/mysql/);
          expect(responseText).not.toMatch(/version/);
          expect(responseText).not.toMatch(/database/);
          expect(responseText).not.toMatch(/schema/);
        }
      }, 10000);
    });

    it('should handle multiple injection attempts in sequence', async () => {
      const dangerousPayloads = [
        "' OR 1=1--",
        "' UNION SELECT null--",
        "'; DROP TABLE users;--"
      ];

      for (const payload of dangerousPayloads) {
        const response = await request(server)
          .get('/api/users')
          .query({ search: payload });

        expect([400, 401, 403, 422, 500]).toContain(response.status);
      }
    });
  });

  describe('Tenants API (/api/tenants) SQL Injection Tests', () => {
    sqlInjectionPayloads.slice(0, 10).forEach((payload, index) => {
      it(`should reject SQL injection payload #${index + 1} on tenants endpoint`, async () => {
        const response = await request(server)
          .get('/api/tenants')
          .query({ filter: payload })
          .set('Accept', 'application/json');

        // Should reject malicious input
        expect([400, 401, 403, 422, 500]).toContain(response.status);
        
        if (response.status === 200) {
          const responseText = JSON.stringify(response.body).toLowerCase();
          
          // Should not expose sensitive system information
          expect(responseText).not.toMatch(/pg_/);
          expect(responseText).not.toMatch(/information_schema/);
          expect(responseText).not.toMatch(/current_user/);
          expect(responseText).not.toMatch(/version/);
        }
      });
    });
  });

  describe('POST Endpoints SQL Injection Tests', () => {
    const postPayloads = [
      "' OR 1=1--",
      "'; DROP TABLE users;--",
      "' UNION SELECT password FROM auth.users--"
    ];

    it('should reject SQL injection in POST /api/users', async () => {
      for (const payload of postPayloads) {
        const response = await request(server)
          .post('/api/users')
          .send({
            name: payload,
            email: payload,
            role: payload
          })
          .set('Content-Type', 'application/json');

        // Should reject or sanitize malicious input
        expect([400, 401, 403, 422, 500]).toContain(response.status);
      }
    });

    it('should reject SQL injection in authentication endpoints', async () => {
      const authPayloads = [
        "admin' OR '1'='1",
        "admin'; DROP TABLE auth.users;--"
      ];

      for (const payload of authPayloads) {
        const response = await request(server)
          .post('/api/auth/callback')
          .send({
            email: payload,
            password: payload
          })
          .set('Content-Type', 'application/json');

        // Should not authenticate or leak information
        expect([400, 401, 403, 422, 500]).toContain(response.status);
      }
    });
  });

  describe('Header and Parameter Injection Tests', () => {
    it('should reject SQL injection in headers', async () => {
      const response = await request(server)
        .get('/api/users')
        .set('X-Tenant-ID', "tenant' OR 1=1--")
        .set('User-Agent', "Mozilla' UNION SELECT password FROM users--")
        .set('Referer', "http://evil.com'; DROP TABLE users;--");

      expect([400, 401, 403, 422, 500]).toContain(response.status);
    });

    it('should reject SQL injection in URL parameters', async () => {
      const response = await request(server)
        .get("/api/users/123'; DROP TABLE users;--")
        .set('Accept', 'application/json');

      expect([400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Second-Order SQL Injection Tests', () => {
    it('should not execute stored malicious input', async () => {
      // First, try to store malicious input
      const maliciousInput = "test'; DROP TABLE users;--";
      
      const createResponse = await request(server)
        .post('/api/users')
        .send({
          name: maliciousInput,
          email: 'test@example.com',
          role: 'user'
        })
        .set('Content-Type', 'application/json');

      // If creation succeeds, ensure retrieval doesn't execute the stored SQL
      if (createResponse.status === 200 || createResponse.status === 201) {
        const userId = createResponse.body?.id;
        
        if (userId) {
          const retrieveResponse = await request(server)
            .get(`/api/users/${userId}`)
            .set('Accept', 'application/json');

          // Should return the data safely without executing SQL
          if (retrieveResponse.status === 200) {
            expect(retrieveResponse.body).toBeDefined();
            // The malicious input should be stored as plain text, not executed
            expect(retrieveResponse.body.name).toBe(maliciousInput);
          }
        }
      }
    });
  });

  describe('Database Error Information Disclosure', () => {
    it('should not expose database errors to users', async () => {
      const errorTriggeringPayloads = [
        "' AND (SELECT * FROM nonexistent_table)--",
        "' GROUP BY 1,2,3,4,5,6,7,8,9,10--",
        "' HAVING 1=1--"
      ];

      for (const payload of errorTriggeringPayloads) {
        const response = await request(server)
          .get('/api/users')
          .query({ search: payload });

        // Should not expose detailed database error messages
        const responseText = JSON.stringify(response.body).toLowerCase();
        expect(responseText).not.toMatch(/syntax error/);
        expect(responseText).not.toMatch(/postgresql/);
        expect(responseText).not.toMatch(/relation.*does not exist/);
        expect(responseText).not.toMatch(/column.*does not exist/);
        expect(responseText).not.toMatch(/supabase/);
      }
    });
  });

  describe('Performance and DoS Protection', () => {
    it('should handle complex SQL injection attempts without hanging', async () => {
      const complexPayload = "' AND (SELECT COUNT(*) FROM (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5)x)>0--";
      
      const startTime = Date.now();
      const response = await request(server)
        .get('/api/users')
        .query({ search: complexPayload });
      const endTime = Date.now();

      // Should respond within reasonable time (not hang)
      expect(endTime - startTime).toBeLessThan(5000);
      expect([400, 401, 403, 422, 500]).toContain(response.status);
    });

    it('should rate limit repeated injection attempts', async () => {
      const payload = "' OR 1=1--";
      const responses = [];

      // Send multiple requests rapidly
      for (let i = 0; i < 10; i++) {
        const response = await request(server)
          .get('/api/users')
          .query({ search: payload })
          .set('X-Forwarded-For', '192.168.1.100'); // Simulate same IP

        responses.push(response.status);
      }

      // Should eventually rate limit (429) or consistently reject
      const rejectedCount = responses.filter(status => [400, 401, 403, 422, 429, 500].includes(status)).length;
      expect(rejectedCount).toBeGreaterThan(5);
    });
  });
}); 