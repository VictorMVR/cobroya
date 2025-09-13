-- Add aplica_iva field to productos table
-- This field indicates whether the product price should include IVA calculation or not

ALTER TABLE public.productos 
ADD COLUMN aplica_iva BOOLEAN DEFAULT true;

-- Add comment to explain the field
COMMENT ON COLUMN public.productos.aplica_iva IS 'Indicates if IVA should be calculated for this product (true) or if price is IVA-exempt (false)';

-- Update RLS policies to include the new field (if needed)
-- The existing policies should automatically cover this new field