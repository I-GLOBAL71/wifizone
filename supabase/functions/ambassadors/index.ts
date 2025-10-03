import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { generateRandom } from '../_shared/helpers.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client for elevated privileges
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)


serve(async (req) => {
  console.log(`[ambassadors] Received ${req.method} request for ${req.url}`);
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { pathname } = url

    // Regex to check for /ambassadors/:id
    const ambassadorIdMatch = pathname.match(/^\/ambassadors\/([a-zA-Z0-9_-]+)$/);


    if (pathname === '/ambassadors' && req.method === 'GET') {
      console.log('[ambassadors] Handling GET /ambassadors');
      //  GET /ambassadors -> getAllAmbassadors
      const { data, error } = await supabase.from('ambassadors').select('*')
      if (error) {
        console.error('[ambassadors] Error fetching all ambassadors:', error);
        throw error;
      }
      console.log('[ambassadors] Successfully fetched all ambassadors:', data);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else if (ambassadorIdMatch && req.method === 'GET') {
      // GET /ambassadors/:id -> getAmbassadorById
      const id = ambassadorIdMatch[1];
      console.log(`[ambassadors] Getting ambassador by user_id: ${id}`);
      const { data: ambassador, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('user_id', id)
        .maybeSingle()

      if (error) {
        console.error(`[ambassadors] Error fetching ambassador for user_id ${id}:`, error);
        if (error.code === 'PGRST116') {
          return new Response('Ambassador not found', { headers: corsHeaders, status: 404 })
        }
        throw error
      }
      if (!ambassador) {
        console.warn(`[ambassadors] Ambassador not found for user_id: ${id}`);
        return new Response('Ambassador not found', { headers: corsHeaders, status: 404 })
      }
      console.log(`[ambassadors] Successfully fetched ambassador for user_id ${id}:`, ambassador);
       // Mocked stats for now
      const responseData = {
          ...ambassador,
          stats: {
              signups: 12,
              clicks: 150,
          }
      };

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else if (pathname === '/ambassadors' && req.method === 'POST') {
      // POST /ambassadors -> createAmbassador
      const { user_id, name: providedName, email: providedEmail, referral_code: providedReferralCode } = await req.json()

      if (!user_id) {
        return new Response('user_id is required', { headers: corsHeaders, status: 400 })
      }

      const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id)
      if (userError || !authUser) {
        console.error('Auth user not found:', userError)
        return new Response('Authenticated user not found.', { headers: corsHeaders, status: 404 })
      }

      const name = providedName || authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'New Ambassador'
      const email = providedEmail || authUser.user.email
      const safeName = name ? String(name) : ''
      const referral_code = providedReferralCode || `${safeName.substring(0, 4).replace(/\s/g, '').toLowerCase()}${generateRandom(4)}`

      const { data, error } = await supabaseAdmin
        .from('ambassadors')
        .insert({ user_id, name, email, referral_code })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return new Response('Ambassador profile already exists for this user.', { headers: corsHeaders, status: 409 })
        }
        throw error
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
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