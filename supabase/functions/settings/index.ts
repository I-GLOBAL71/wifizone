import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  console.log(`[settings] Received ${req.method} request for ${req.url}`);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { pathname } = url

    const settingKeyMatch = pathname.match(/^\/settings\/([a-zA-Z0-9_.-]+)$/);

    if (req.method === 'POST' && pathname.endsWith('/get-setting')) { // New route for invocation
      const { key } = await req.json();
      console.log(`[settings] Getting setting for key: ${key}`);
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error || !data) {
        console.warn(`[settings] Setting for key '${key}' not found or error:`, error);
        const { data: defaultData, error: defaultError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'columns')
          .single();
        
        if (defaultError || !defaultData) {
          console.warn(`[settings] Default setting 'columns' not found. Falling back to '2'.`);
          return new Response(JSON.stringify({ value: '2' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }); // Fallback default
        }
        console.log(`[settings] Using default setting 'columns':`, defaultData);
        return new Response(JSON.stringify(defaultData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
      console.log(`[settings] Successfully fetched setting for key '${key}':`, data);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    } else if (settingKeyMatch && req.method === 'GET') {
      // GET /settings/:key -> getSetting
      const key = settingKeyMatch[1];
      console.log(`[settings] Getting setting for key: ${key}`);
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error || !data) {
        console.warn(`[settings] Setting for key '${key}' not found or error:`, error);
        const { data: defaultData, error: defaultError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'columns')
          .single();
        
        if (defaultError || !defaultData) {
          console.warn(`[settings] Default setting 'columns' not found. Falling back to '2'.`);
          return new Response(JSON.stringify({ value: '2' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }); // Fallback default
        }
        console.log(`[settings] Using default setting 'columns':`, defaultData);
        return new Response(JSON.stringify(defaultData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
      console.log(`[settings] Successfully fetched setting for key '${key}':`, data);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

    } else if (pathname === '/settings' && req.method === 'POST') {
      // POST /settings -> saveSetting
      const { key, value } = await req.json();

      if (!key || value === undefined) {
        return new Response('Key and value are required', { headers: corsHeaders, status: 400 });
      }

      const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' })
        .select()
        .single();

      if (error) {
        console.error('Error saving setting:', error);
        return new Response('Could not save setting', { headers: corsHeaders, status: 500 });
      }

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });

    } else if (pathname === '/payment-providers' && req.method === 'GET') {
      // GET /payment-providers -> getPaymentProviders
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['campay_enabled', 'flutterwave_enabled', 'flutterwave_public_key']);

      if (error) throw error;

      const settings = data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const providers = [];

      if (settings.campay_enabled === 'true') {
        providers.push({
          id: 'campay',
          name: 'Campay (Mobile Money)',
        });
      }

      if (settings.flutterwave_enabled === 'true' && settings.flutterwave_public_key) {
        providers.push({
          id: 'flutterwave',
          name: 'Flutterwave (Carte & Mobile Money)',
          publicKey: settings.flutterwave_public_key,
        });
      }

      return new Response(JSON.stringify(providers), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    return new Response('Not found', { headers: corsHeaders, status: 404 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})