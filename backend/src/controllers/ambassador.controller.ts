import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../services/supabase';
import { generateRandom } from '../utils/helpers';

export const getAmbassadorById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data: ambassador, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('user_id', id)
        .maybeSingle(); // Use maybeSingle() to avoid error on no rows.

    if (error) {
        console.error('Error fetching ambassador:', error);
        // Don't return 500 for "not found" errors, which is what PGRST116 is.
        if (error.code === 'PGRST116') {
            return res.status(404).send('Ambassador not found');
        }
        return res.status(500).send('Error fetching ambassador data');
    }

    if (!ambassador) {
        return res.status(404).send('Ambassador not found');
    }

    // Mocked stats for now
    const responseData = {
        ...ambassador,
        stats: {
            signups: 12,
            clicks: 150,
        }
    };
    res.status(200).json(responseData);
};

export const createAmbassador = async (req: Request, res: Response) => {
    const { user_id, name: providedName, email: providedEmail } = req.body;

    if (!user_id) {
        return res.status(400).send('user_id is required');
    }

    // 1. Verify user exists in auth.users and get their details as a fallback
    const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (userError || !authUser) {
        console.error('Auth user not found:', userError);
        return res.status(404).send('Authenticated user not found.');
    }

    // Determine the name and email, prioritizing provided values but falling back to auth data.
    const name = providedName || authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'New Ambassador';
    const email = providedEmail || authUser.user.email;

    // Ensure name is a string before using substring on it.
    const safeName = name ? String(name) : '';

    // 2. Use the provided referral code or generate a new one
    const referral_code = req.body.referral_code || `${safeName.substring(0, 4).replace(/\s/g, '').toLowerCase()}${generateRandom(4)}`;

    // 3. Insert the new ambassador
    const { data, error } = await supabaseAdmin
        .from('ambassadors')
        .insert({
            user_id,
            name,
            email,
            referral_code,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create new ambassador:', error);
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).send('Ambassador profile already exists for this user.');
        }
        return res.status(500).send('Could not create ambassador profile.');
    }

    res.status(201).json(data);
};

export const getAllAmbassadors = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('ambassadors')
        .select('*');

    if (error) {
        console.error('Error fetching ambassadors:', error);
        return res.status(500).send('Could not fetch ambassadors');
    }

    res.status(200).json(data);
};