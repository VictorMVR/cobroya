-- Add user management fields to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS propietario_email VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'gratuito';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS limite_cajeros INT DEFAULT 2;

-- Create invitations table for inviting cashiers
CREATE TABLE IF NOT EXISTS invitaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  rol VARCHAR(50) DEFAULT 'CAJERO',
  invitado_por_email VARCHAR(255) NOT NULL,
  usado BOOLEAN DEFAULT false,
  expira_en TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitaciones_codigo ON invitaciones(codigo);
CREATE INDEX IF NOT EXISTS idx_invitaciones_tenant ON invitaciones(tenant_id);

-- Enable RLS on invitaciones table
ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see invitations from their tenant
CREATE POLICY "Users can view own tenant invitations" ON invitaciones
  FOR SELECT USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE propietario_email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policy: Only tenant owners can create invitations
CREATE POLICY "Tenant owners can create invitations" ON invitaciones
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE propietario_email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policy: Only tenant owners can update their invitations
CREATE POLICY "Tenant owners can update invitations" ON invitaciones
  FOR UPDATE USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE propietario_email = auth.jwt() ->> 'email'
    )
  );