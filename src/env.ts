import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Env profil desteği - default: undefined, options: local-remote
const ENV_PROFILE = process.env.NEXT_ENV_PROFILE;

// Profil kullanılıyorsa loglama yap
if (ENV_PROFILE) {
  console.log(`Using ENV profile: ${ENV_PROFILE}`);
}

export const env = createEnv({
  server: {
    // Database - Supabase kullandığımız için optional
    DATABASE_URL: z.string().url().optional(),
    POSTGRES_URL: z.string().url().optional(),
    POSTGRES_PRISMA_URL: z.string().url().optional(),
    POSTGRES_URL_NON_POOLING: z.string().url().optional(),
    POSTGRES_USER: z.string().optional(),
    POSTGRES_HOST: z.string().optional(),
    POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_DATABASE: z.string().optional(),

    // Auth
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    SUPABASE_JWT_SECRET: z.string().min(32).optional(),

    // Email - optional for now
    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z.string().transform(Number).optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),

    // Cloudflare - optional
    CLOUDFLARE_API_TOKEN: z.string().optional(),
    CLOUDFLARE_ZONE_ID: z.string().optional(),
    CLOUDFLARE_EMAIL: z.string().email().optional(),
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),

    // Redis - optional
    UPSTASH_REDIS_URL: z.string().url().optional(),
    UPSTASH_REDIS_TOKEN: z.string().optional(),

    // Environment
    NODE_ENV: z.enum(["development", "production", "test", "staging"]),
    
    // Env Profile (optional)
    NEXT_ENV_PROFILE: z.enum(["local-remote"]).optional(),
    
    // CORS Settings
    CORS_ALLOW_ORIGINS: z.string().optional(),
    
    // Domain
    ROOT_DOMAIN: z.string().default("i-ep.app"),
    VERCEL_URL: z.string().optional(),
  },
  client: {
    // Public URLs
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    
    // Supabase Public
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

    // Multi-tenant - optional
    NEXT_PUBLIC_TENANT_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_ADMIN_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_BASE_DOMAIN: z.string().optional(),
  },
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_EMAIL,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_ENV_PROFILE: process.env.NEXT_ENV_PROFILE,
    CORS_ALLOW_ORIGINS: process.env.CORS_ALLOW_ORIGINS,
    ROOT_DOMAIN: process.env.ROOT_DOMAIN,
    VERCEL_URL: process.env.VERCEL_URL,
    // Client
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_TENANT_DOMAIN: process.env.NEXT_PUBLIC_TENANT_DOMAIN,
    NEXT_PUBLIC_ADMIN_DOMAIN: process.env.NEXT_PUBLIC_ADMIN_DOMAIN,
    NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN,
  },
  // Validation'ı atlayalım çünkü optional değerler için hatalı validation yapıyor
  skipValidation: true,
  emptyStringAsUndefined: true,
}); 