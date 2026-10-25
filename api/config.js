// Public configuration only. Never send provider keys or Supabase service-role secrets.
export function GET(){
  const supabaseUrl=process.env.SUPABASE_URL||'';
  const supabaseAnonKey=process.env.SUPABASE_ANON_KEY||'';
  return Response.json({
    databaseConfigured: Boolean(supabaseUrl&&supabaseAnonKey),
    aiConfigured: Boolean(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL),
    supabaseUrl,
    supabaseAnonKey
  },{headers:{'Cache-Control':'no-store'}});
}
