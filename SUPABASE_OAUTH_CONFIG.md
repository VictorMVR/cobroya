# 🔧 Configuración OAuth en Supabase Dashboard

## URLs que DEBEN estar configuradas en Supabase:

### 1. En Supabase Dashboard:
Ve a **Authentication → URL Configuration**

#### Site URL:
```
https://www.cobroya.mx
```

#### Redirect URLs (TODAS estas deben estar):
```
https://www.cobroya.mx/auth/callback
https://www.cobroya.mx/api/auth/callback
https://www.cobroya.mx/
https://cobroya.mx/auth/callback
https://cobroya.mx/api/auth/callback
https://cobroya.mx/
http://localhost:3000/auth/callback
http://localhost:3000/api/auth/callback
http://localhost:3000/
```

### 2. En Google Console:
Ve a **APIs & Services → Credentials → Tu OAuth Client**

#### Authorized JavaScript origins:
```
https://www.cobroya.mx
https://cobroya.mx
http://localhost:3000
```

#### Authorized redirect URIs (IMPORTANTE):
```
https://diypvjjafabzoumenowt.supabase.co/auth/v1/callback
```
👆 Esta es la URL de Supabase que Google necesita

## 🎯 Flujo Correcto:

1. Usuario hace click en "Continuar con Google"
2. Va a Google para autenticarse
3. Google redirige a: `https://diypvjjafabzoumenowt.supabase.co/auth/v1/callback`
4. Supabase procesa y redirige a: `https://www.cobroya.mx/?code=xxxxx` 
5. Nuestra app detecta el código y lo procesa en `/api/auth/callback`
6. Usuario es redirigido a `/onboarding` o `/admin` según corresponda

## ⚠️ IMPORTANTE:

Si el código sigue llegando a `/?code=xxx` en lugar de `/auth/callback`, es porque:
- Supabase está usando la "Site URL" como destino por defecto
- Por eso agregamos el handler en `app/page.tsx` para capturar y redirigir

## 📋 Verificación:

1. Confirma que todas las URLs están en Supabase Dashboard
2. Confirma que la URL de Supabase está en Google Console
3. Prueba el login nuevamente