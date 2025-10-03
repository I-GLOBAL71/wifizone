import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

export const getSetting = async (req: Request, res: Response) => {
    const { key } = req.params;
    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

    if (error || !data) {
        // If not found, check for a default or return a sensible default
        const { data: defaultData, error: defaultError } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'columns')
            .single();
        
        if (defaultError || !defaultData) {
            return res.status(200).json({ value: '2' }); // Fallback default
        }
        return res.status(200).json(defaultData);
    }
    res.status(200).json(data);
};

export const saveSetting = async (req: Request, res: Response) => {
    const { key, value } = req.body;

    if (!key || value === undefined) {
        return res.status(400).send('Key and value are required');
    }

    const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' })
        .select()
        .single();

    if (error) {
        console.error('Error saving setting:', error);
        return res.status(500).send('Could not save setting');
    }

    res.status(201).json(data);
};

export const getPaymentProviders = async (req: Request, res: Response) => {
    try {
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

        res.status(200).json(providers);
    } catch (error) {
        console.error('Error fetching payment providers:', error);
        res.status(500).send('Could not fetch payment providers');
    }
};