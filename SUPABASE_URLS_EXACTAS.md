# 🎯 URLs EXACTAS para Supabase Dashboard

## EN SUPABASE → Authentication → URL Configuration:

### Redirect URLs (AGREGAR ESTAS):
```
https://cobroya.mx/auth/callback
https://www.cobroya.mx/auth/callback
https://cobroya.mx/api/auth/callback  
https://www.cobroya.mx/api/auth/callback
http://localhost:3000/auth/callback
http://localhost:3000/api/auth/callback
```

### Site URL (mantener):
```
https://cobroya.mx
```

## ✅ RESULTADO:
Después de agregar estas URLs, el OAuth funcionará independientemente de si el usuario viene de:
- `cobroya.mx` → redirect a `https://cobroya.mx/auth/callback` ✅
- `www.cobroya.mx` → redirect a `https://www.cobroya.mx/auth/callback` ✅

Ambas rutas estarán autorizadas y funcionarán correctamente.