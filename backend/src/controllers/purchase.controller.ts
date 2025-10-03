import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

export const createPurchaseSession = async (req: Request, res: Response) => {
    const { tariff_id, user_id } = req.body; // user_id can be optional

    if (!tariff_id) {
        return res.status(400).send('tariff_id is required');
    }

    // 1. Fetch tariff details to get the amount
    const { data: tariff, error: tariffError } = await supabase
        .from('tariffs')
        .select('price_cfa')
        .eq('id', tariff_id)
        .single();

    if (tariffError || !tariff) {
        return res.status(404).send('Tariff not found');
    }

    // 2. Create a unique session ID
    const sessionId = `sess_${Date.now()}${Math.random().toString(36).substring(2, 8)}`;

    // 3. Create a pending purchase record
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
        return res.status(500).send('Could not initiate purchase session');
    }

    // 4. Return the session ID to the frontend
    res.status(201).json({
        message: 'Session created successfully',
        session_id: sessionId,
        purchase_id: purchase.id,
        amount: tariff.price_cfa,
    });
};

export const getPurchaseStatus = async (req: Request, res: Response) => {
    const { session_id } = req.params;

    if (!session_id) {
        return res.status(400).send('Session ID is required');
    }

    const { data: purchase, error } = await supabase
        .from('purchases')
        .select('state, mikrotik_user, mikrotik_pass')
        .eq('session_id', session_id)
        .single();

    if (error || !purchase) {
        return res.status(404).send('Purchase not found');
    }

    res.status(200).json(purchase);
};

export const applyReferral = async (req: Request, res: Response) => {
    const { referral_code, session_id } = req.body;

    if (!referral_code || !session_id) {
        return res.status(400).send('referral_code and session_id are required');
    }

    // 1. Find the ambassador
    const { data: ambassador, error: ambassadorError } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('referral_code', referral_code)
        .single();

    if (ambassadorError || !ambassador) {
        return res.status(404).send('Referral code not found');
    }

    // 2. Get discount rate for the customer
    const { data: setting, error: settingError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'discount_rate')
        .single();

    if (settingError || !setting) {
        return res.status(500).send('Discount rate not configured');
    }
    const discountRate = parseInt(setting.value, 10) / 100;

    // 3. Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, amount')
        .eq('session_id', session_id)
        .single();

    if (purchaseError || !purchase) {
        return res.status(404).send('Purchase session not found');
    }

    // 4. Calculate discount and update purchase
    const discountAmount = Math.floor(purchase.amount * discountRate);
    const newAmount = purchase.amount - discountAmount;

    const { error: updateError } = await supabase
        .from('purchases')
        .update({ amount: newAmount, referral_id: ambassador.id }) // Assuming you add a referral_id column
        .eq('id', purchase.id);

    if (updateError) {
        return res.status(500).send('Failed to apply discount');
    }

    res.status(200).json({
        message: 'Discount applied successfully',
        discount_amount: discountAmount,
        new_amount: newAmount,
    });
};