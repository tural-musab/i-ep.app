import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Maarif Okul Portalı API Dokümantasyonu',
        version: '1.0.0',
        description: 'Maarif Okul Portalı SaaS için API dokümantasyonu',
        contact: {
          name: 'Maarif Okul Portalı Destek',
          email: 'destek@i-ep.app',
        },
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
      servers: [
        {
          url: 'https://api.i-ep.app',
          description: 'Üretim Ortamı',
        },
        {
          url: 'https://api-dev.i-ep.app',
          description: 'Geliştirme Ortamı',
        },
        {
          url: 'http://localhost:3000',
          description: 'Yerel Geliştirme Ortamı',
        },
      ],
      tags: [
        {
          name: 'tenant',
          description: 'Tenant (Okul) yönetim API\'leri',
        },
        {
          name: 'auth',
          description: 'Kimlik doğrulama API\'leri',
        },
        {
          name: 'user',
          description: 'Kullanıcı yönetim API\'leri',
        },
        {
          name: 'student',
          description: 'Öğrenci yönetim API\'leri',
        },
        {
          name: 'teacher',
          description: 'Öğretmen yönetim API\'leri',
        },
        {
          name: 'class',
          description: 'Sınıf yönetim API\'leri',
        },
        {
          name: 'grade',
          description: 'Not yönetim API\'leri',
        },
      ],
    },
  });
  return spec;
}; 