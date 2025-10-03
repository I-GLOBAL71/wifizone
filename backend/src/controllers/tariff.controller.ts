import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

export const getTariffs = async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .order('price_cfa', { ascending: true });

    if (error) {
        console.error('Error fetching tariffs:', error);
        return res.status(500).send('Could not fetch tariffs');
    }

    res.status(200).json(data);
};

export const createTariff = async (req: Request, res: Response) => {
    const { name, data_bytes, duration_seconds, price_cfa, speed_limit } = req.body;

    const { data, error } = await supabase
        .from('tariffs')
        .insert([{ name, data_bytes, duration_seconds, price_cfa, speed_limit }])
        .select()
        .single();

    if (error) {
        console.error('Error creating tariff:', error);
        return res.status(500).send('Could not create tariff');
    }

    res.status(201).json(data);
};

export const updateTariff = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, data_bytes, duration_seconds, price_cfa, speed_limit } = req.body;

    const { data, error } = await supabase
        .from('tariffs')
        .update({ name, data_bytes, duration_seconds, price_cfa, speed_limit })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`Error updating tariff ${id}:`, error);
        return res.status(500).send('Could not update tariff');
    }

    res.status(200).json(data);
};