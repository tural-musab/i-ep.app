-- Management şemasındaki tablolara erişmek için yardımcı fonksiyonlar

-- Tenant oluşturmak için fonksiyon
CREATE OR REPLACE FUNCTION create_tenant(
  p_id UUID,
  p_name TEXT,
  p_display_name TEXT,
  p_schema_name TEXT,
  p_status TEXT,
  p_plan TEXT
) RETURNS JSONB AS $$
BEGIN
  INSERT INTO management.tenants (
    id,
    name,
    display_name,
    schema_name,
    database_name,
    status,
    subscription_plan,
    subscription_start_date,
    subscription_end_date,
    max_users,
    settings,
    metadata
  ) VALUES (
    p_id,
    p_name,
    p_display_name,
    p_schema_name,
    'default',
    p_status::management.tenant_status,
    p_plan::management.subscription_plan_type,
    NOW(),
    NOW() + INTERVAL '1 year',
    50,
    '{}'::JSONB,
    '{}'::JSONB
  );
  
  RETURN json_build_object('success', true, 'id', p_id)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Domain oluşturmak için fonksiyon
CREATE OR REPLACE FUNCTION create_domain(
  p_tenant_id UUID,
  p_domain TEXT,
  p_is_primary BOOLEAN
) RETURNS JSONB AS $$
BEGIN
  INSERT INTO management.domains (
    tenant_id,
    domain,
    is_primary,
    status
  ) VALUES (
    p_tenant_id,
    p_domain,
    p_is_primary,
    'active'
  );
  
  RETURN json_build_object('success', true)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bu fonksiyonları aşağıdaki gibi çalıştırabilirsiniz:
-- SELECT create_tenant('11111111-1111-1111-1111-111111111111', 'test-tenant', 'Test Tenant', 'tenant_test_tenant', 'active', 'premium');
-- SELECT create_domain('11111111-1111-1111-1111-111111111111', 'test-tenant.i-ep.app', true); 