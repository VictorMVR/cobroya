-- Add tenant_id to tables that don't have it yet

-- Add tenant_id to ventas table
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Add tenant_id to cuentas table  
ALTER TABLE cuentas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ventas_tenant_id ON ventas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_tenant_id ON cuentas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_productos_tenant_id ON productos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clientes_tenant_id ON clientes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tenant_id ON categorias(tenant_id);