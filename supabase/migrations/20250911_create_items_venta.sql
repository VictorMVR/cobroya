-- Migration: Create items_venta table
-- This table stores the individual line items for each sale

CREATE TABLE IF NOT EXISTS public.items_venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unit DECIMAL(10,2) NOT NULL CHECK (precio_unit >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_venta_venta_id ON public.items_venta(venta_id);
CREATE INDEX IF NOT EXISTS idx_items_venta_producto_id ON public.items_venta(producto_id);
CREATE INDEX IF NOT EXISTS idx_items_venta_created_at ON public.items_venta(created_at);

-- Add RLS policies (following same pattern as items_cuenta)
ALTER TABLE public.items_venta ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all items_venta
CREATE POLICY "Users can view items_venta" ON public.items_venta
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert items_venta
CREATE POLICY "Users can insert items_venta" ON public.items_venta
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update items_venta
CREATE POLICY "Users can update items_venta" ON public.items_venta
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete items_venta
CREATE POLICY "Users can delete items_venta" ON public.items_venta
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON public.items_venta TO authenticated;
GRANT ALL ON public.items_venta TO service_role;

-- Add comment
COMMENT ON TABLE public.items_venta IS 'Stores individual line items for each sale transaction';