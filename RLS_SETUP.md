# 🔒 Row Level Security Setup

## Manual Steps to Complete in Supabase Dashboard

### 1. Helper Functions

Go to SQL Editor in Supabase and run these functions:

```sql
-- Function to get user tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.get_user_tenant_id()
RETURNS uuid
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid,
    NULL
  );
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean,
    auth.email() = 'verdugorubio@gmail.com'
  );
$$;
```

### 2. Enable RLS on All Tables

```sql
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
```

### 3. Tenants Policies

```sql
CREATE POLICY "Super admin can see all tenants" ON tenants
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can see their own tenant" ON tenants
  FOR SELECT USING (id = auth.get_user_tenant_id());

CREATE POLICY "Authenticated users can create tenants" ON tenants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 4. Products Policies

```sql
CREATE POLICY "Super admin can manage all products" ON productos
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage products in their tenant" ON productos
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());
```

### 5. Categories Policies

```sql
CREATE POLICY "Super admin can manage all categories" ON categorias
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage categories in their tenant" ON categorias
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());
```

### 6. Clients Policies

```sql
CREATE POLICY "Super admin can manage all clients" ON clientes
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage clients in their tenant" ON clientes
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());
```

## 🚀 Super Admin Setup

When verdugorubio@gmail.com signs up for the first time, run this script:

```bash
node scripts/setup-super-admin.js
```

This will:
- Find the user in Supabase Auth
- Update their metadata with super admin role and master tenant
- Ensure they have full access to all features

## ✅ Status

- ✅ Helper functions created
- ✅ Super admin setup script ready
- ✅ Master tenant created (ID: a478d502-8c8a-4e45-810f-7e6811733781)
- ⏳ RLS policies need to be manually applied in Supabase Dashboard
- ⏳ Super admin user needs to sign up first