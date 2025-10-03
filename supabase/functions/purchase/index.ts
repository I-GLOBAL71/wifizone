import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { pathname } = url

    const purchaseStatusMatch = pathname.match(/^\/purchase\/status\/([a-zA-Z0-9_.-]+)$/);

    if (pathname === '/create-session' && req.method === 'POST') {
      // POST /create-session -> createPurchaseSession
      const { tariff_id, user_id } = await req.json();

      if (!tariff_id) {
        return new Response('tariff_id is required', { headers: corsHeaders, status: 400 });
      }

      const { data: tariff, error: tariffError } = await supabase
        .from('tariffs')
        .select('price_cfa')
        .eq('id', tariff_id)
        .single();

      if (tariffError || !tariff) {
        return new Response('Tariff not found', { headers: corsHeaders, status: 404 });
      }

      const sessionId = `sess_${Date.now()}${Math.random().toString(36).substring(2, 8)}`;

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          tariff_id: tariff_id,
          user_id: user_id || null,
          session_id: sessionId,
          state: 'pending',
          amount: tariff.price_cfa,
        })
        .select('id')
        .single();

      if (purchaseError) {
        console.error('Error creating purchase record:', purchaseError);
        return new Response('Could not initiate purchase session', { headers: corsHeaders, status: 500 });
      }

      return new Response(JSON.stringify({
        message: 'Session created successfully',
        session_id: sessionId,
        purchase_id: purchase.id,
        amount: tariff.price_cfa,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });

    } else if (purchaseStatusMatch && req.method === 'GET') {
      // GET /purchase/status/:session_id -> getPurchaseStatus
      const session_id = purchaseStatusMatch[1];

      if (!session_id) {
        return new Response('Session ID is required', { headers: corsHeaders, status: 400 });
      }

      const { data: purchase, error } = await supabase
        .from('purchases')
        .select('state, mikrotik_user, mikrotik_pass')
        .eq('session_id', session_id)
        .single();

      if (error || !purchase) {
        return new Response('Purchase not found', { headers: corsHeaders, status: 404 });
      }

      return new Response(JSON.stringify(purchase), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

    } else if (pathname === '/apply-referral' && req.method === 'POST') {
      // POST /apply-referral -> applyReferral
      const { referral_code, session_id } = await req.json();

      if (!referral_code || !session_id) {
        return new Response('referral_code and session_id are required', { headers: corsHeaders, status: 400 });
      }

      const { data: ambassador, error: ambassadorError } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('referral_code', referral_code)
        .single();

      if (ambassadorError || !ambassador) {
        return new Response('Referral code not found', { headers: corsHeaders, status: 404 });
      }

      const { data: setting, error: settingError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'discount_rate')
        .single();

      if (settingError || !setting) {
        return new Response('Discount rate not configured', { headers: corsHeaders, status: 500 });
      }
      const discountRate = parseInt(setting.value, 10) / 100;

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, amount')
        .eq('session_id', session_id)
        .single();

      if (purchaseError || !purchase) {
        return new Response('Purchase session not found', { headers: corsHeaders, status: 404 });
      }

      const discountAmount = Math.floor(purchase.amount * discountRate);
      const newAmount = purchase.amount - discountAmount;

      const { error: updateError } = await supabase
        .from('purchases')
        .update({ amount: newAmount, referral_id: ambassador.id })
        .eq('id', purchase.id);

      if (updateError) {
        return new Response('Failed to apply discount', { headers: corsHeaders, status: 500 });
      }

      return new Response(JSON.stringify({
        message: 'Discount applied successfully',
        discount_amount: discountAmount,
        new_amount: newAmount,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    return new Response('Not found', { headers: corsHeaders, status: 404 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})