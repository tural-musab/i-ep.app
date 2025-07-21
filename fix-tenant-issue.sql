-- Fix tenant ID mismatch issue
-- Create the missing localhost development tenant

-- First check existing tenants
SELECT id, name, subdomain, is_active FROM tenants;

-- Create localhost development tenant with UUID
INSERT INTO tenants (
    id, 
    name, 
    subdomain, 
    settings, 
    is_active,
    created_at,
    updated_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'Demo İlköğretim Okulu (Localhost)',
    'localhost',
    jsonb_build_object(
        'features', ARRAY['assignments', 'attendance', 'grades', 'parent_communication'],
        'theme', 'default',
        'language', 'tr',
        'timezone', 'Europe/Istanbul'
    ),
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Verify the tenant was created
SELECT id, name, subdomain, is_active FROM tenants WHERE subdomain = 'localhost';