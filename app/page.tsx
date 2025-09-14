'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Smartphone, 
  ShoppingCart, 
  CreditCard, 
  Camera, 
  FileText, 
  Headphones,
  BarChart3,
  Cloud,
  Store,
  Pill,
  Shirt,
  Coffee,
  Wrench,
  Scissors,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle OAuth callback if code arrives here
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      // Redirect to auth callback with the code
      router.push(`/api/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">CobroYa</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition">
                  Características
                </a>
                <a href="#business" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition">
                  Negocios
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition">
                  Precios
                </a>
                <Link href="/pos" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Probar Gratis
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition">
                  Iniciar Sesión
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Características</a>
              <a href="#business" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Negocios</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Precios</a>
              <Link href="/pos" className="block px-3 py-2 bg-blue-600 text-white rounded-lg font-medium mb-2">
                Probar Gratis
              </Link>
              <Link href="/login" className="block px-3 py-2 text-gray-600 hover:text-blue-600 border border-gray-300 rounded-lg font-medium">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              El POS que tu
              <span className="text-blue-600"> negocio necesita</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Móvil, práctico y completo. Vende desde cualquier lugar con el sistema de punto de venta más intuitivo de México
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/pos" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Probar Gratis <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                Ver Demo
              </button>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-600">
                ¿Ya tienes cuenta? 
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                  Iniciar sesión aquí
                </Link>
              </p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">+1,000</div>
                <div className="text-gray-600">Negocios activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                <div className="text-gray-600">Aumento en ventas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Soporte disponible</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para vender más
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Características diseñadas para hacer crecer tu negocio desde el primer día
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Totalmente Móvil</h3>
              <p className="text-gray-600">Vende desde tablet, celular o computadora. Tu POS siempre contigo.</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Catálogos Pre-cargados</h3>
              <p className="text-gray-600">Productos listos por tipo de negocio. Empieza a vender en minutos.</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition">
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagos Modernos</h3>
              <p className="text-gray-600">Efectivo, tarjeta, transferencias, QR codes. Acepta todo tipo de pago.</p>
            </div>

            {/* Feature 4 */}
            <div className="text-center group">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition">
                <Camera className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Con Imágenes</h3>
              <p className="text-gray-600">Productos visuales para venta más rápida y clientes más satisfechos.</p>
            </div>

            {/* Feature 5 */}
            <div className="text-center group">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cuentas Pendientes</h3>
              <p className="text-gray-600">Control total de créditos y pagos diferidos. Nunca pierdas una venta.</p>
            </div>

            {/* Feature 6 */}
            <div className="text-center group">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition">
                <Headphones className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">Ayuda cuando la necesites. Por WhatsApp, teléfono o chat en vivo.</p>
            </div>

            {/* Feature 7 */}
            <div className="text-center group">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reportes Inteligentes</h3>
              <p className="text-gray-600">Ve cómo crece tu negocio. Reportes de ventas, inventario y más.</p>
            </div>

            {/* Feature 8 */}
            <div className="text-center group">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition">
                <Cloud className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">En la Nube</h3>
              <p className="text-gray-600">Tus datos seguros y sincronizados. Accede desde cualquier dispositivo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section id="business" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfecto para tu tipo de negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Catálogos especializados y funciones diseñadas para cada industria
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
              <Store className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Abarrotes</h3>
              <p className="text-sm text-gray-600">Tiendas de conveniencia</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
              <Pill className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Farmacias</h3>
              <p className="text-sm text-gray-600">Medicamentos y salud</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
              <Shirt className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Boutiques</h3>
              <p className="text-sm text-gray-600">Ropa y accesorios</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
              <Coffee className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Restaurantes</h3>
              <p className="text-sm text-gray-600">Comida y bebidas</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
              <Wrench className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Ferreterías</h3>
              <p className="text-sm text-gray-600">Herramientas y construcción</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
              <Scissors className="h-12 w-12 text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Estéticas</h3>
              <p className="text-sm text-gray-600">Belleza y cuidado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Los resultados hablan por sí solos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Miles de negocios ya están creciendo con CobroYa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-600 mb-2">+40%</h3>
              <p className="text-gray-600">Aumento promedio en ventas</p>
            </div>

            <div className="p-6">
              <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-600 mb-2">2 horas</h3>
              <p className="text-gray-600">Menos tiempo en administración</p>
            </div>

            <div className="p-6">
              <Shield className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-600 mb-2">99.9%</h3>
              <p className="text-gray-600">Disponibilidad del sistema</p>
            </div>

            <div className="p-6">
              <Star className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">4.8/5</h3>
              <p className="text-gray-600">Calificación de usuarios</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "CobroYa transformó mi negocio. Ahora puedo atender más clientes y llevar mejor control de todo. ¡Es súper fácil de usar!"
              </p>
              <div className="font-semibold text-gray-900">María González</div>
              <div className="text-sm text-gray-600">Abarrotes La Esquina</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "El soporte es increíble. Siempre me ayudan cuando lo necesito. Mis ventas subieron 50% desde que uso CobroYa."
              </p>
              <div className="font-semibold text-gray-900">Carlos Ruiz</div>
              <div className="text-sm text-gray-600">Farmacia San José</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Lo mejor es que puedo vender desde mi celular. Ya no pierdo ventas y mis clientes están más contentos."
              </p>
              <div className="font-semibold text-gray-900">Ana Martínez</div>
              <div className="text-sm text-gray-600">Boutique Elegance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Empieza gratis, crece con nosotros
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sin pagos iniciales, sin letra pequeña. Solo resultados.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Prueba GRATIS por 30 días
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Sin tarjeta de crédito. Sin compromisos. Solo éxito para tu negocio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link 
                href="/pos" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Empezar Ahora <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>

            <div className="text-center mb-4">
              <button className="text-white/80 hover:text-white text-sm underline transition-colors">
                ¿Necesitas ayuda? Hablar con Ventas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Setup gratis y capacitación</p>
              </div>
              <div>
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Soporte 24/7 incluido</p>
              </div>
              <div>
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Todas las funciones desbloqueadas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">CobroYa</h3>
              <p className="text-gray-300 mb-4">
                El punto de venta que hace crecer tu negocio.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Facebook
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Instagram
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  WhatsApp
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-300 hover:text-white transition">Características</a></li>
                <li><a href="#pricing" className="text-gray-300 hover:text-white transition">Precios</a></li>
                <li><Link href="/pos" className="text-gray-300 hover:text-white transition">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition">Centro de ayuda</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Contacto</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">WhatsApp: +52 55 1234 5678</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition">Términos de servicio</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Política de privacidad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Facturación</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CobroYa. Todos los derechos reservados. Hecho con ❤️ en México.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}