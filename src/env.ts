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
    // Database
    DATABASE_URL: z.string().url(),
    POSTGRES_URL: z.string().url(),
    POSTGRES_PRISMA_URL: z.string().url(),
    POSTGRES_URL_NON_POOLING: z.string().url(),
    POSTGRES_USER: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DATABASE: z.string(),

    // Auth
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    SUPABASE_JWT_SECRET: z.string().min(32),

    // Email
    EMAIL_SERVER_HOST: z.string(),
    EMAIL_SERVER_PORT: z.string().transform(Number),
    EMAIL_SERVER_USER: z.string(),
    EMAIL_SERVER_PASSWORD: z.string(),
    EMAIL_FROM: z.string().email(),

    // Cloudflare
    CLOUDFLARE_API_TOKEN: z.string(),
    CLOUDFLARE_ZONE_ID: z.string(),
    CLOUDFLARE_EMAIL: z.string().email(),

    // Redis
    UPSTASH_REDIS_URL: z.string().url(),
    UPSTASH_REDIS_TOKEN: z.string(),

    // Environment
    NODE_ENV: z.enum(["development", "production", "test", "staging"]),
    
    // Env Profile (optional)
    NEXT_ENV_PROFILE: z.enum(["local-remote"]).optional(),
    
    // CORS Settings
    CORS_ALLOW_ORIGINS: z.string().optional(),
  },
  client: {
    // Public URLs
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    
    // Supabase Public
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

    // Multi-tenant
    NEXT_PUBLIC_TENANT_DOMAIN: z.string(),
    NEXT_PUBLIC_ADMIN_DOMAIN: z.string(),
    NEXT_PUBLIC_BASE_DOMAIN: z.string(),
  },
  runtimeEnv: process.env,
  // Yerel geliştirmede doğrulama adımını atlayalım
  skipValidation: true,
  emptyStringAsUndefined: true,
}); 