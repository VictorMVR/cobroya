# 🚨 URGENTE: Fix Database Error en Google OAuth

## Problema:
```
error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

## Causa:
Supabase está intentando guardar usuarios en una tabla `usuarios` que no existe, porque configuramos el sistema para usar solo Supabase Auth.

## Solución Inmediata:

### 1. Ir al Dashboard de Supabase:
https://supabase.com/dashboard

### 2. Navegar a: Authentication → Settings

### 3. Buscar la sección "Database Settings" o "Custom Schema"

### 4. Verificar estas configuraciones:

**DESHABILITAR:**
- ❌ "Enable custom user table" 
- ❌ "Save user profile data to custom table"
- ❌ Cualquier referencia a tabla "usuarios"

**HABILITAR:**
- ✅ "Enable email confirmations" (opcional, pero recomendado)
- ✅ "Enable phone confirmations" (opcional)

### 5. En "Auth Schema Settings":
- Tabla de usuarios: **Usar tabla auth.users por defecto**
- NO usar tabla custom `public.usuarios`

### 6. Si existe trigger o función que inserte en tabla usuarios:
Ve a SQL Editor y ejecuta:
```sql
-- Ver triggers existentes
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%';

-- Si existe trigger de inserción de usuarios, eliminarlo:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

### 7. Alternativa: Crear tabla usuarios mínima
Si Supabase insiste en usar tabla custom:
```sql
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own profile" ON usuarios 
  FOR ALL USING (auth.uid() = id);
```

## ⚡ Test después del fix:
1. Limpiar cookies del navegador para cobroya.mx
2. Intentar login con Google otra vez
3. Debería redirigir a /onboarding sin error

---
**PRIORIDAD ALTA** - Esto impide que cualquiera se registre en el sistema.