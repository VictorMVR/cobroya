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
  
  // Clean any potential whitespace or newlines
  const cleanAnonKey = supabaseAnonKey.replace(/[\r\n\t]/g, '').trim()
  
  return {
    url: supabaseUrl,
    anonKey: cleanAnonKey
  }
}