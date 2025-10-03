import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are not set. Make sure SUPABASE_URL, SUPABASE_KEY, and SUPABASE_SERVICE_ROLE_KEY are in your .env file.");
}

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
export const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);