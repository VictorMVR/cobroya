# 🔍 Debug OAuth Paso a Paso

## Lo que está pasando según Network:

### ✅ PARTE 1 - FUNCIONANDO:
1. Click en "Continuar con Google"
2. Request a: `https://diypvjjafabzoumenowt.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fwww.cobroya.mx%2Fauth%2Fcallback`
3. Supabase responde con 302 redirect a Google
4. **Status: 302 Found** ✅

### ❌ PARTE 2 - PROBLEMA:
5. Debería ir a Google OAuth screen
6. Después de auth en Google → Google debería redirect a `https://diypvjjafabzoumenowt.supabase.co/auth/v1/callback` 
7. Supabase procesa → redirect a `https://www.cobroya.mx/auth/callback?code=xxx`
8. **PERO** en lugar de eso, vas directo a `/login?error=auth_error`

## 🎯 Diagnóstico:

### Problema 1: Google Console Configuration
**Verifica en Google Console que tienes EXACTAMENTE:**
```
Authorized redirect URIs:
https://diypvjjafabzoumenowt.supabase.co/auth/v1/callback
```

### Problema 2: OAuth Consent Screen
¿Has configurado OAuth Consent Screen en Google Console?
- Debe estar en modo "Production" o tener tu email agregado como Test User

### Problema 3: Client ID Mismatch
El Client ID en headers: `562876118472-ff0ik7j873nohmsigu52i6m3ulqevkgg.apps.googleusercontent.com`
¿Este Client ID está configurado correctamente en Supabase?

## 🔧 ACCIONES INMEDIATAS:

### 1. Verificar Google Console:
- Ve a https://console.developers.google.com
- APIs & Services → Credentials 
- Encuentra Client ID: `562876118472-ff0ik7j873nohmsigu52i6m3ulqevkgg`
- Verifica que Redirect URI sea: `https://diypvjjafabzoumenowt.supabase.co/auth/v1/callback`

### 2. Verificar OAuth Consent:
- APIs & Services → OAuth consent screen
- ¿Está "Published" o tienes tu email en "Test users"?

### 3. Probar Manualmente:
Abre esta URL directamente en browser:
```
https://diypvjjafabzoumenowt.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fwww.cobroya.mx%2Fauth%2Fcallback
```

¿Qué pasa cuando abres esa URL?