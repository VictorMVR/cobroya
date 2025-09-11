-- Configuración inicial de la base de datos para CobroYa
-- Ejecutar este script en el editor SQL de Supabase

-- 1. Crear tabla de tenants (inquilinos/tiendas)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    dominio VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'vendedor', -- admin, vendedor, cajero
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(100),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, codigo)
);

-- 4. Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuestos DECIMAL(10,2) DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'completada', -- completada, cancelada, pendiente
    metodo_pago VARCHAR(50) DEFAULT 'efectivo', -- efectivo, tarjeta, transferencia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla de detalles de venta
CREATE TABLE IF NOT EXISTS venta_detalles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insertar datos de prueba
INSERT INTO tenants (nombre, descripcion, dominio) 
VALUES ('Mi Tiendita', 'Tienda de conveniencia local', 'cobroya.mx')
ON CONFLICT DO NOTHING;

-- Obtener el ID del tenant para los siguientes inserts
DO $$
DECLARE
    tenant_uuid UUID;
BEGIN
    SELECT id INTO tenant_uuid FROM tenants WHERE nombre = 'Mi Tiendita' LIMIT 1;
    
    -- Insertar productos de prueba
    INSERT INTO productos (tenant_id, codigo, nombre, precio, stock) VALUES
    (tenant_uuid, 'PROD001', 'Coca Cola 600ml', 25.00, 50),
    (tenant_uuid, 'PROD002', 'Pan Blanco', 30.00, 20),
    (tenant_uuid, 'PROD003', 'Leche Entera 1L', 22.50, 15),
    (tenant_uuid, 'PROD004', 'Galletas María', 18.00, 30),
    (tenant_uuid, 'PROD005', 'Agua Natural 1L', 12.00, 40)
    ON CONFLICT DO NOTHING;
    
    -- Insertar usuario administrador de prueba
    INSERT INTO usuarios (tenant_id, email, nombre, rol) VALUES
    (tenant_uuid, 'admin@cobroya.mx', 'Administrador', 'admin')
    ON CONFLICT DO NOTHING;
END $$;

-- 7. Configurar Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_detalles ENABLE ROW LEVEL SECURITY;

-- 8. Crear políticas básicas de acceso (permite acceso público para desarrollo)
-- En producción, estas políticas deberían ser más restrictivas

-- Política para tenants (lectura pública)
CREATE POLICY "Allow public read on tenants" ON tenants
    FOR SELECT USING (true);

-- Política para productos (lectura pública)
CREATE POLICY "Allow public read on productos" ON productos
    FOR SELECT USING (true);

-- Política para usuarios (lectura pública)
CREATE POLICY "Allow public read on usuarios" ON usuarios
    FOR SELECT USING (true);

-- Política para ventas (lectura pública)
CREATE POLICY "Allow public read on ventas" ON ventas
    FOR SELECT USING (true);

-- Política para venta_detalles (lectura pública)
CREATE POLICY "Allow public read on venta_detalles" ON venta_detalles
    FOR SELECT USING (true);

-- 9. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Crear triggers para actualizar automáticamente updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mensaje de confirmación
SELECT 'Base de datos CobroYa configurada exitosamente!' as mensaje;