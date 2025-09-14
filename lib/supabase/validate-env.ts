// Utility to validate and clean Supabase environment variables

export function validateSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables')
  }
  
  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error('Invalid Supabase URL format')
  }
  
  // Validate anon key format (should be a JWT)
  if (!supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.split('.').length !== 3) {
    throw new Error('Invalid Supabase anon key format')
  }
  
  // Clean any potential whitespace, newlines, and invisible characters  
  // JWT can contain: alphanumeric, dots, hyphens, underscores, plus, forward slash
  const cleanAnonKey = supabaseAnonKey
    .replace(/[\r\n\t]/g, '')     // Remove newlines and tabs
    .replace(/\s/g, '')           // Remove spaces
    .trim()
  
  console.log('🔧 Original key length:', supabaseAnonKey.length)
  console.log('🔧 Cleaned key length:', cleanAnonKey.length)
  console.log('🔧 Key preview:', cleanAnonKey.substring(0, 50) + '...')
  
  return {
    url: supabaseUrl,
    anonKey: cleanAnonKey
  }
}