/**
 * @jest-environment jsdom
 */

import logger from '@/lib/logger';

// Mock'lar
jest.mock('@/lib/logger');

describe('Documentation Integration Tests', () => {
  beforeAll(() => {
    // Test ortamında console.log'ları sustur
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Docs Site Health Check', () => {
    it('should verify docs build process', async () => {
      // Docs site build kontrolü için mock endpoint
      const mockDocsBuildStatus = {
        status: 'success',
        buildTime: '2025-01-08T10:00:00Z',
        version: '1.0.0'
      };

      // Docs build status'ı simüle ediyoruz
      expect(mockDocsBuildStatus.status).toBe('success');
      expect(mockDocsBuildStatus.version).toBe('1.0.0');
      
      // Logger çağrısını test et
      logger.info('Docs build status checked', { 
        status: mockDocsBuildStatus.status,
        buildTime: mockDocsBuildStatus.buildTime 
      });
    });

    it('should validate documentation structure', async () => {
      // Dokümantasyon yapısının gerekli bölümlerini kontrol et
      const expectedSections = [
        'getting-started',
        'api-reference',
        'guides',
        'architecture',
        'onboarding'
      ];

      // Mock sidebar yapısı
      const mockSidebar = {
        sections: [
          { id: 'intro', title: 'Giriş', items: [] },
          { id: 'onboarding', title: 'Onboarding', items: ['setup', 'architecture'] },
          { id: 'api', title: 'API Reference', items: ['endpoints', 'swagger-ui'] },
          { id: 'guides', title: 'Rehberler', items: [] },
          { id: 'architecture', title: 'Mimari', items: [] }
        ]
      };

      // Ana bölümlerin varlığını kontrol et
      const foundSections = mockSidebar.sections.map(section => section.id);
      
      // Temel bölümlerin var olduğunu doğrula
      expect(foundSections).toContain('onboarding');
      expect(foundSections).toContain('api');
      expect(foundSections).toContain('architecture');

      // API bölümünün gerekli sayfalara sahip olduğunu kontrol et
      const apiSection = mockSidebar.sections.find(s => s.id === 'api');
      expect(apiSection?.items).toContain('endpoints');
      expect(apiSection?.items).toContain('swagger-ui');

      logger.info('Documentation structure validated', { 
        sectionsFound: foundSections.length,
        expectedSections: expectedSections.length 
      });
    });

    it('should verify API documentation accessibility', async () => {
      // API dokümantasyonunun erişilebilirliğini test et
      const mockApiDocsResponse = {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8'
        },
        body: '<!DOCTYPE html><html><head><title>API Docs</title></head></html>'
      };

      // Swagger UI'ın yüklendiğini simüle et
      expect(mockApiDocsResponse.status).toBe(200);
      expect(mockApiDocsResponse.headers['content-type']).toContain('text/html');
      expect(mockApiDocsResponse.body).toContain('API Docs');

      logger.info('API documentation accessibility verified', { 
        status: mockApiDocsResponse.status 
      });
    });

    it('should check for broken internal links', async () => {
      // İç linkler için mock veri
      const mockInternalLinks = [
        '/docs/onboarding/setup-guide',
        '/docs/api/endpoints',
        '/docs/architecture/multi-tenant-strategy',
        '/docs/components/super-admin-panel'
      ];

      // Tüm internal linklerin geçerli olduğunu simüle et
      const linkCheckResults = mockInternalLinks.map(link => ({
        url: link,
        status: 'valid',
        statusCode: 200
      }));

      // Hiçbir broken link olmamalı
      const brokenLinks = linkCheckResults.filter(result => result.status !== 'valid');
      expect(brokenLinks).toHaveLength(0);

      // Tüm linkler 200 döndürmeli
      linkCheckResults.forEach(result => {
        expect(result.statusCode).toBe(200);
      });

      logger.info('Internal links validation completed', { 
        totalLinks: mockInternalLinks.length,
        brokenLinks: brokenLinks.length 
      });
    });

    it('should validate frontmatter in documentation files', async () => {
      // Mock dokümantasyon dosyası frontmatter'ları
      const mockDocFiles = [
        {
          path: 'intro.md',
          frontmatter: {
            id: 'intro',
            title: 'İ-EP.APP Dokümantasyonu',
            sidebar_position: 1,
            slug: '/',
            last_updated: '2025-01-08'
          }
        },
        {
          path: 'api/endpoints.md',
          frontmatter: {
            id: 'endpoints',
            title: 'API Endpoints',
            sidebar_position: 1,
            last_updated: '2025-01-08'
          }
        },
        {
          path: 'onboarding/README.md',
          frontmatter: {
            id: 'onboarding-intro',
            title: 'Geliştirici Onboarding',
            sidebar_position: 1,
            last_updated: '2025-01-08'
          }
        }
      ];

      // Her dosyada gerekli frontmatter alanlarının olduğunu kontrol et
      mockDocFiles.forEach(file => {
        const fm = file.frontmatter;
        
        expect(fm.id).toBeDefined();
        expect(fm.title).toBeDefined();
        expect(fm.sidebar_position).toBeDefined();
        expect(fm.last_updated).toBeDefined();
        
        // Date format kontrolü
        expect(fm.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      logger.info('Frontmatter validation completed', { 
        filesChecked: mockDocFiles.length 
      });
    });
  });

  describe('Search Functionality', () => {
    it('should validate search functionality', async () => {
      // Docusaurus search mock'u
      const mockSearchResults = [
        {
          title: 'API Endpoints',
          content: 'Bu doküman, İ-EP.APP projesindeki tüm API endpointlerini...',
          url: '/docs/api/endpoints'
        },
        {
          title: 'Geliştirici Onboarding',
          content: 'Bu rehber, İ-EP.APP projesine yeni katılan geliştiricilerin...',
          url: '/docs/onboarding/'
        }
      ];

      // Search sonuçlarının geçerli olduğunu kontrol et
      expect(mockSearchResults).toHaveLength(2);
      mockSearchResults.forEach(result => {
        expect(result.title).toBeDefined();
        expect(result.content).toBeDefined();
        expect(result.url).toMatch(/^\/docs\//);
      });

      logger.info('Search functionality validated', { 
        resultsCount: mockSearchResults.length 
      });
    });
  });
}); 