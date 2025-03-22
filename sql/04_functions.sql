-- Geçerli tenant ID'sini alma
CREATE OR REPLACE FUNCTION utils.get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  tenant_id UUID;
BEGIN
  tenant_id := current_setting('app.current_tenant_id', TRUE);
  IF tenant_id IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN tenant_id::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Geçerli kullanıcı ID'sini alma
CREATE OR REPLACE FUNCTION utils.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı rolünü alma
CREATE OR REPLACE FUNCTION utils.get_current_user_role()
RETURNS public.user_role AS $$
DECLARE
  user_role public.user_role;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının tenant ID'sini alma
CREATE OR REPLACE FUNCTION utils.get_user_tenant_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT tenant_id INTO tenant_id FROM public.users WHERE id = user_id;
  RETURN tenant_id;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant için yeni şema oluşturma
CREATE OR REPLACE FUNCTION management.create_tenant_schema(tenant_id UUID, schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Tenant şemasına şablon şemadaki tabloları kopyala
  -- Bu işlem yeni bir tenant oluşturulduğunda yapılacak
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant doğrulama
CREATE OR REPLACE FUNCTION utils.verify_tenant_access(tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  user_tenant_id UUID;
  user_role public.user_role;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN 
    RETURN FALSE;
  END IF;
  
  SELECT u.tenant_id, u.role INTO user_tenant_id, user_role
  FROM public.users u
  WHERE u.id = current_user_id;
  
  -- Super admin her zaman erişebilir
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Diğer kullanıcılar sadece kendi tenant'larına erişebilir
  RETURN user_tenant_id = tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 