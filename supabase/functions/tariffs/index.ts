import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  console.log(`[tariffs] Received ${req.method} request for ${req.url}`);
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { pathname } = url

    // Regex to check for /tariffs/:id
    const tariffIdMatch = pathname.match(/^\/tariffs\/([a-zA-Z0-9_-]+)$/);

    if (pathname === '/tariffs' && req.method === 'GET') {
      console.log('[tariffs] Handling GET /tariffs');
      // GET /tariffs -> getTariffs
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .order('price_cfa', { ascending: true });
      if (error) {
        console.error('[tariffs] Error fetching tariffs:', error);
        throw error;
      }
      console.log('[tariffs] Successfully fetched tariffs:', data);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else if (pathname === '/tariffs' && req.method === 'POST') {
      const { name, data_bytes, duration_seconds, price_cfa, speed_limit } = await req.json()
      const { data, error } = await supabase
        .from('tariffs')
        .insert([{ name, data_bytes, duration_seconds, price_cfa, speed_limit }])
        .select()
        .single();
      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    } else if (tariffIdMatch && req.method === 'PUT') {
      // PUT /tariffs/:id -> updateTariff
      const id = tariffIdMatch[1];
      const { name, data_bytes, duration_seconds, price_cfa, speed_limit } = await req.json()
      const { data, error } = await supabase
        .from('tariffs')
        .update({ name, data_bytes, duration_seconds, price_cfa, speed_limit })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Not found', { headers: corsHeaders, status: 404 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})