import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateRandom } from '../_shared/helpers.ts'
import { createMikrotikUser } from '../_shared/mikrotik-rest.ts'

// Supabase client setup
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

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
    const secretHash = Deno.env.get('FLUTTERWAVE_SECRET_HASH');
    const signature = req.headers.get('verif-hash');

    if (!signature || signature !== secretHash) {
        return new Response('Unauthorized', { headers: corsHeaders, status: 401 });
    }

    const payload = await req.json();

    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
        const { tx_ref: sessionId, transaction_id, amount, currency } = payload.data;

        if (!sessionId) {
            return new Response('Transaction reference (session_id) is missing', { headers: corsHeaders, status: 400 });
        }

        // --- Verify Transaction with Flutterwave API ---
        const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            headers: {
                'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`
            }
        });
        const verificationData = await verifyResponse.json();

        if (verificationData.status !== 'success' || verificationData.data.status !== 'successful') {
             console.error('Flutterwave verification failed:', verificationData.message);
             return new Response('Transaction verification failed', { headers: corsHeaders, status: 400 });
        }
        
        const verifiedTx = verificationData.data;

        // --- Process Purchase ---
        const { data: purchase, error: purchaseError } = await supabase
            .from('purchases')
            .select('*, tariffs (*)')
            .eq('session_id', sessionId)
            .single();

        if (purchaseError || !purchase) {
            console.error('Purchase not found for session:', sessionId, purchaseError);
            return new Response('Purchase session not found', { headers: corsHeaders, status: 404 });
        }
        
        // Security Check: Verify amount and currency
        if (verifiedTx.amount < purchase.amount || verifiedTx.currency !== 'XAF') {
             console.error(`Tampering attempt? Purchase amount: ${purchase.amount} XAF, Paid: ${verifiedTx.amount} ${verifiedTx.currency}`);
             return new Response('Invalid amount or currency', { headers: corsHeaders, status: 400 });
        }

        if (purchase.state === 'completed') {
            console.log(`Purchase ${purchase.id} already completed.`);
            return new Response('OK (already processed)', { headers: corsHeaders, status: 200 });
        }

        // --- Create MikroTik User ---
        const username = `u${Date.now()}${Math.floor(Math.random() * 9000)}`;
        const password = generateRandom(8);
        // @ts-ignore
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


        // --- Update Purchase Record ---
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
            // TODO: Consider a retry or manual alert mechanism here
            return new Response('Failed to update purchase status', { headers: corsHeaders, status: 500 });
        }
        
        // --- Handle Referral Commission ---
        if (purchase.referral_id && purchase.user_id) {
           const { error: rpcError } = await supabase.rpc('add_commission_to_ambassador', {
               p_ambassador_id: purchase.referral_id,
               p_purchase_id: purchase.id,
               p_purchase_amount: purchase.amount,
               p_customer_user_id: purchase.user_id,
           });
           if (rpcError) console.error('Failed to process commission:', rpcError);
        }

        if (purchase.user_id) {
            await sendNotificationToUser(purchase.user_id, {
                title: 'Paiement Réussi!',
                body: `Votre code d'accès est: ${username}`,
            });
        }

        return new Response('OK', { headers: corsHeaders, status: 200 });

    }

    return new Response('Webhook received', { headers: corsHeaders, status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})