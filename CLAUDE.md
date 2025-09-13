# ⚡ CLAUDE CODE - REGLAS DEFINITIVAS PARA BASE DE DATOS

## 🚨 REGLAS OBLIGATORIAS - NUNCA ROMPAS ESTAS REGLAS

### 1. ✅ CONEXIÓN A BASE DE DATOS - USA SIEMPRE ESTO:

```bash
# Ver todas las tablas disponibles
npm run db

# Ver estructura de una tabla específica
npm run db productos

# Ver estructura + datos de ejemplo
npm run db productos --data

# Ejecutar query SQL directo
npm run db --query "SELECT * FROM productos LIMIT 3"

# Sincronizar tipos después de cambios en BD
npm run db:sync
```

### 2. 🚫 LO QUE NUNCA DEBES HACER:

- **NUNCA** inventes campos que no existen
- **NUNCA** crees scripts nuevos si `npm run db` ya existe
- **NUNCA** asumas la estructura de una tabla
- **NUNCA** trabajes sin verificar la BD primero
- **NUNCA** te vayas por tangentes instalando cosas
- **NUNCA** pierdas tiempo "investigando" - usa `npm run db tabla`

### 3. ✅ PROCESO CORRECTO SIEMPRE:

1. **PRIMERO:** `npm run db tabla` para ver estructura real
2. **SEGUNDO:** Hacer lo que pidió el usuario
3. **TERCERO:** Si modificaste BD, ejecutar `npm run db:sync`

### 4. 📋 COMANDOS DISPONIBLES:

```bash
# INFORMACIÓN
npm run db                      # Lista todas las tablas
npm run db productos           # Estructura de productos
npm run db productos --data    # Estructura + datos

# CONSULTAS
npm run db --query "SELECT count(*) FROM ventas"
npm run db --query "DESCRIBE productos"

# SINCRONIZACIÓN  
npm run db:sync                # Regenera tipos TypeScript
```

### 5. 🎯 EJEMPLOS DE USO CORRECTO:

**❌ INCORRECTO:**
```
Usuario: "Muestra los productos"
Claude: "Déjame crear un script para conectarme..."
```

**✅ CORRECTO:**
```
Usuario: "Muestra los productos" 
Claude: npm run db productos --data
Claude: [muestra estructura y datos reales]
```

### 6. 🔧 CONFIGURACIÓN TÉCNICA:

**Variables de entorno (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://diypvjjafabzoumenowt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Clientes de Supabase:**
- Browser: `lib/supabase/client.ts` 
- Server: `lib/supabase/server.ts`
- Tipos: `types/supabase.ts`

### 7. 🚀 TABLA DE REFERENCIA RÁPIDA:

| Tabla | Campos principales | Uso |
|-------|-------------------|-----|
| productos | nombre, precio_venta, descripcion | Catálogo |
| clientes | nombre, email, credito_limite | CRM |
| ventas | total, cliente_id, usuario_id | Transacciones |
| usuarios | email, nombre, rol | Auth |

### 8. ⚠️ SI ALGO NO FUNCIONA:

1. **ANTES que nada:** `npm run db` para verificar conexión
2. Si falla, revisar `.env.local`
3. Si sigue fallando, usar `supabase status`
4. **NUNCA** crear scripts alternativos

---

## 🎯 RESUMEN EJECUTIVO:

**El usuario dice:** "Hazme X con la tabla productos"
**Tu respuesta:** `npm run db productos` (para ver estructura) → hacer X → listo

**NO MÁS:**
- ❌ Scripts nuevos cada vez
- ❌ "Déjame instalar..."
- ❌ "Déjame crear un script..."
- ❌ Inventar campos
- ❌ Perder 10 minutos conectándose

**SOLO:**
- ✅ `npm run db tabla`
- ✅ Hacer lo pedido
- ✅ Listo

---

*Sigue estas reglas al pie de la letra. El usuario ya sufrió suficiente esperando.*