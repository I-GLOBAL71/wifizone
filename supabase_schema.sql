-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default settings
INSERT INTO settings (key, value) VALUES ('columns', '2') ON CONFLICT (key) DO NOTHING;

-- Tariffs Table
CREATE TABLE IF NOT EXISTS tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_cfa INT NOT NULL,
    duration_seconds INT NOT NULL, -- e.g., 86400 for 24 hours
    data_bytes BIGINT, -- in bytes, null for unlimited
    speed_limit TEXT, -- e.g., '512k/1M'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tariff_id UUID REFERENCES tariffs(id),
    user_id UUID, -- Can be null for anonymous purchases
    session_id TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    amount INT NOT NULL,
    mikrotik_user TEXT,
    mikrotik_pass TEXT,
    referral_id UUID REFERENCES ambassadors(id), -- Link to the ambassador who referred this purchase
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ambassadors Table
CREATE TABLE IF NOT EXISTS ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Enable Row Level Security for ambassadors
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

-- Policies for ambassadors table
CREATE POLICY "Allow authenticated users to read their own ambassador data"
ON ambassadors
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID NOT NULL REFERENCES ambassadors(id),
    purchase_id UUID NOT NULL REFERENCES purchases(id),
    commission_amount INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(purchase_id) -- Ensure one commission per purchase
);

-- Add default commission rate to settings
INSERT INTO settings (key, value) VALUES ('commission_rate', '10') ON CONFLICT (key) DO NOTHING; -- 10%
INSERT INTO settings (key, value) VALUES ('discount_rate', '5') ON CONFLICT (key) DO NOTHING; -- 5% for the customer
-- New flexible commission settings
INSERT INTO settings (key, value) VALUES ('commission_mode', 'percentage') ON CONFLICT (key) DO NOTHING; -- 'percentage', 'fixed', 'both'
INSERT INTO settings (key, value) VALUES ('commission_fixed_amount', '500') ON CONFLICT (key) DO NOTHING; -- e.g., 500 XAF
INSERT INTO settings (key, value) VALUES ('commission_percentage_limit', '3') ON CONFLICT (key) DO NOTHING; -- Apply percentage for the first 3 purchases

-- Seed some sample tariffs
INSERT INTO tariffs (name, price_cfa, duration_seconds, data_bytes, speed_limit) VALUES
('Basic 1 Day', 500, 86400, 1073741824, '1M/2M'), -- 1GB
('Premium 7 Days', 2500, 604800, 10737418240, '5M/10M'), -- 10GB
('Unlimited 30 Days', 10000, 2592000, NULL, '2M/5M')
ON CONFLICT DO NOTHING;

-- RPC function to add commission
CREATE OR REPLACE FUNCTION add_commission_to_ambassador(
    p_ambassador_id UUID,
    p_purchase_id UUID,
    p_purchase_amount INT,
    p_customer_user_id UUID
)
RETURNS void AS $$
DECLARE
    v_commission_mode TEXT;
    v_commission_rate INT;
    v_commission_fixed_amount INT;
    v_commission_percentage_limit INT;
    v_customer_purchase_count INT;
    v_final_commission_amount INT := 0;
BEGIN
    -- Fetch settings
    SELECT value INTO v_commission_mode FROM settings WHERE key = 'commission_mode';
    SELECT value::INT INTO v_commission_rate FROM settings WHERE key = 'commission_rate';
    SELECT value::INT INTO v_commission_fixed_amount FROM settings WHERE key = 'commission_fixed_amount';
    SELECT value::INT INTO v_commission_percentage_limit FROM settings WHERE key = 'commission_percentage_limit';

    -- Count previous purchases by the same customer
    SELECT count(*) INTO v_customer_purchase_count FROM purchases WHERE user_id = p_customer_user_id AND state = 'completed';

    -- Calculate commission based on mode
    IF v_commission_mode = 'fixed' OR v_commission_mode = 'both' THEN
        -- Fixed amount is often for the very first purchase (lead acquisition)
        IF v_customer_purchase_count = 1 THEN
            v_final_commission_amount := v_final_commission_amount + v_commission_fixed_amount;
        END IF;
    END IF;

    IF v_commission_mode = 'percentage' OR v_commission_mode = 'both' THEN
        -- Apply percentage only if within the purchase limit
        IF v_customer_purchase_count <= v_commission_percentage_limit THEN
            v_final_commission_amount := v_final_commission_amount + (p_purchase_amount * v_commission_rate / 100);
        END IF;
    END IF;

    -- Only proceed if a commission was actually earned
    IF v_final_commission_amount > 0 THEN
        -- Add the commission to the ambassador's balance
        UPDATE ambassadors
        SET balance = balance + v_final_commission_amount
        WHERE id = p_ambassador_id;

        -- Log the referral transaction
        INSERT INTO referrals(ambassador_id, purchase_id, commission_amount)
        VALUES (p_ambassador_id, p_purchase_id, v_final_commission_amount);
    END IF;
END;
$$ LANGUAGE plpgsql;