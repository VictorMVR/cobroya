-- Enable RLS on all relevant tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Helper function to get user tenant_id from auth metadata
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

-- Helper function to check if user is super admin
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

-- Tenants policies
CREATE POLICY "Super admin can see all tenants" ON tenants
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can see their own tenant" ON tenants
  FOR SELECT USING (id = auth.get_user_tenant_id());

CREATE POLICY "Authenticated users can create tenants" ON tenants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Productos policies  
CREATE POLICY "Super admin can manage all products" ON productos
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage products in their tenant" ON productos
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());

-- Clientes policies
CREATE POLICY "Super admin can manage all clients" ON clientes
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage clients in their tenant" ON clientes
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());

-- Ventas policies
CREATE POLICY "Super admin can see all sales" ON ventas
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage sales in their tenant" ON ventas
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());

-- Venta_detalle policies
CREATE POLICY "Super admin can see all sale details" ON venta_detalle
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can see sale details in their tenant" ON venta_detalle
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ventas 
      WHERE ventas.id = venta_detalle.venta_id 
      AND ventas.tenant_id = auth.get_user_tenant_id()
    )
  );

CREATE POLICY "Users can insert sale details in their tenant" ON venta_detalle
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventas 
      WHERE ventas.id = venta_detalle.venta_id 
      AND ventas.tenant_id = auth.get_user_tenant_id()
    )
  );

-- Cuentas policies
CREATE POLICY "Super admin can manage all accounts" ON cuentas
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage accounts in their tenant" ON cuentas
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());

-- Categorias policies
CREATE POLICY "Super admin can manage all categories" ON categorias
  FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Users can manage categories in their tenant" ON categorias
  FOR ALL USING (tenant_id = auth.get_user_tenant_id());