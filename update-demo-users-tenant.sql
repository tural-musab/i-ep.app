-- Update existing demo users to use the correct tenant ID

-- Update raw_user_meta_data for all demo users
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data, 
    '{tenant_id}', 
    '"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"'
)
WHERE email LIKE '%@demo.local';

-- Verify the updates
SELECT 
    email, 
    raw_user_meta_data ->> 'name' as name,
    raw_user_meta_data ->> 'role' as role,
    raw_user_meta_data ->> 'tenant_id' as tenant_id
FROM auth.users 
WHERE email LIKE '%@demo.local'
ORDER BY email;