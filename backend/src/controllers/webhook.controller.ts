import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { router } from '../services/mikrotik';
import { generateRandom } from '../utils/helpers';

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

export const handleCampayWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  
  if (!verifyCampaySignature(req)) {
    return res.status(400).send('Invalid signature');
  }

  if (payload.status === 'SUCCESS') {
    const sessionId = payload.external_reference; 
    if (!sessionId) {
        return res.status(400).send('Session ID is missing');
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
      return res.status(404).send('Purchase session not found');
    }

    if (purchase.state === 'completed') {
        console.log(`Purchase ${purchase.id} already completed.`);
        return res.status(200).send('OK (already processed)');
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
      const conn = await router.connect();
      
      await conn.write('/ip/hotspot/user/add', [
        `=name=${username}`,
        `=password=${password}`,
        `=limit-uptime=${limitUptime}`,
        `=comment=purchase_id:${purchase.id}`
      ]);
      
      conn.close();

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
        return res.status(500).send('Failed to update purchase status');
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

      return res.status(200).send('OK');

    } catch (error) {
      console.error('Failed to create MikroTik user or connect to router:', error);
      return res.status(500).send('Internal server error');
    }
  }

  res.status(200).send('Webhook received and ignored');
};

export const handleFlutterwaveWebhook = async (req: Request, res: Response) => {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
        return res.status(401).send('Unauthorized');
    }

    const payload = req.body;

    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
        const { tx_ref: sessionId, transaction_id, amount, currency } = payload.data;

        if (!sessionId) {
            return res.status(400).send('Transaction reference (session_id) is missing');
        }

        // --- Verify Transaction with Flutterwave API ---
        try {
            const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
                headers: {
                    'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
                }
            });
            const verificationData = await verifyResponse.json();

            if (verificationData.status !== 'success' || verificationData.data.status !== 'successful') {
                 console.error('Flutterwave verification failed:', verificationData.message);
                 return res.status(400).send('Transaction verification failed');
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
                return res.status(404).send('Purchase session not found');
            }
            
            // Security Check: Verify amount and currency
            if (verifiedTx.amount < purchase.amount || verifiedTx.currency !== 'XAF') {
                 console.error(`Tampering attempt? Purchase amount: ${purchase.amount} XAF, Paid: ${verifiedTx.amount} ${verifiedTx.currency}`);
                 return res.status(400).send('Invalid amount or currency');
            }

            if (purchase.state === 'completed') {
                console.log(`Purchase ${purchase.id} already completed.`);
                return res.status(200).send('OK (already processed)');
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

            const conn = await router.connect();
            await conn.write('/ip/hotspot/user/add', [
                `=name=${username}`,
                `=password=${password}`,
                `=limit-uptime=${limitUptime}`,
                `=comment=purchase_id:${purchase.id}`
            ]);
            conn.close();

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
                return res.status(500).send('Failed to update purchase status');
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

            return res.status(200).send('OK');

        } catch (error) {
            console.error('Error in Flutterwave webhook processing:', error);
            return res.status(500).send('Internal server error');
        }
    }

    res.status(200).send('Webhook received');
};