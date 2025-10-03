import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateRandom } from '../_shared/helpers.ts'
import { createMikrotikUser } from '../_shared/mikrotik-rest.ts'

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Placeholder for Campay signature verification
function verifyCampaySignature(req: Request): boolean {
  // TODO: Implement actual signature verification based on Campay documentation
  console.log('Verifying Campay signature for request:', req.headers);
  return true;
}

// Placeholder for notification sending
async function sendNotificationToUser(userId: string, notification: { title: string; body: string }) {
  // TODO: Implement push/email notification via Firebase/Supabase
  console.log(`Sending notification to ${userId}: ${notification.title} - ${notification.body}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()

    if (!verifyCampaySignature(req)) {
      return new Response('Invalid signature', { headers: corsHeaders, status: 400 });
    }

    if (payload.status === 'SUCCESS') {
      const sessionId = payload.external_reference;
      if (!sessionId) {
        return new Response('Session ID is missing', { headers: corsHeaders, status: 400 });
      }

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select(`
          *,
          tariffs ( * )
        `)
        .eq('session_id', sessionId)
        .single();

      if (purchaseError || !purchase) {
        console.error('Purchase not found or error:', purchaseError);
        return new Response('Purchase session not found', { headers: corsHeaders, status: 404 });
      }

      if (purchase.state === 'completed') {
        console.log(`Purchase ${purchase.id} already completed.`);
        return new Response('OK (already processed)', { headers: corsHeaders, status: 200 });
      }

      const username = `u${Date.now()}${Math.floor(Math.random() * 9000)}`;
      const password = generateRandom(8);

      // @ts-ignore - We know tariffs is there from the select query
      const tariff = purchase.tariffs;
      const durationInSeconds = tariff.duration_seconds;
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;
      const limitUptime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      try {
        await createMikrotikUser({
          name: username,
          pass: password,
          limitUptime: limitUptime,
          comment: `purchase_id:${purchase.id}`
        });
      } catch (error) {
        console.error('Failed to create MikroTik user:', error);
        // We will still mark the purchase as complete, but log the error
        // You might want to add more robust error handling here, like a retry queue
      }


      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          state: 'completed',
          mikrotik_user: username,
          mikrotik_pass: password,
        })
        .eq('id', purchase.id);

      if (updateError) {
        console.error('Failed to update purchase record:', updateError);
        return new Response('Failed to update purchase status', { headers: corsHeaders, status: 500 });
      }

      // If there was a referral, process the commission
      if (purchase.referral_id && purchase.user_id) {
        // The RPC function now handles all calculation logic
        const { error: rpcError } = await supabase.rpc('add_commission_to_ambassador', {
          p_ambassador_id: purchase.referral_id,
          p_purchase_id: purchase.id,
          p_purchase_amount: purchase.amount,
          p_customer_user_id: purchase.user_id,
        });

        if (rpcError) {
          console.error('Failed to process commission:', rpcError);
          // Don't block the purchase completion, just log the error
        }
      }

      if (purchase.user_id) {
        await sendNotificationToUser(purchase.user_id, {
          title: 'Paiement Réussi!',
          body: `Votre code d'accès est: ${username}`,
        });
      }

      return new Response('OK', { headers: corsHeaders, status: 200 });
    }

    return new Response('Webhook received and ignored', { headers: corsHeaders, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})