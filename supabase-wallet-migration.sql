-- Wallet + transactions + lead status + free trial

ALTER TABLE advisor_profiles
  ADD COLUMN IF NOT EXISTS wallet_balance integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_leads_used integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('topup','lead_purchase','free_lead','refund')),
  lead_id uuid REFERENCES leads(id),
  stripe_session_id text,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  amount_paid integer NOT NULL DEFAULT 0,
  is_free boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (advisor_id, lead_id)
);

CREATE TABLE IF NOT EXISTS lead_statuses (
  advisor_id uuid NOT NULL REFERENCES advisor_profiles(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','booked','converted')),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (advisor_id, lead_id)
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisor_own_wallet_transactions" ON wallet_transactions FOR ALL TO authenticated USING (advisor_id = auth.uid());
CREATE POLICY "advisor_own_purchases" ON lead_purchases FOR ALL TO authenticated USING (advisor_id = auth.uid());
CREATE POLICY "advisor_own_statuses" ON lead_statuses FOR ALL TO authenticated USING (advisor_id = auth.uid());

-- Atomic wallet credit (idempotent via stripe_session_id)
CREATE OR REPLACE FUNCTION credit_wallet(p_advisor_id uuid, p_amount integer, p_session_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM wallet_transactions WHERE stripe_session_id = p_session_id) THEN RETURN; END IF;
  UPDATE advisor_profiles SET wallet_balance = wallet_balance + p_amount WHERE id = p_advisor_id;
  INSERT INTO wallet_transactions (advisor_id, amount, type, stripe_session_id, description)
  VALUES (p_advisor_id, p_amount, 'topup', p_session_id, 'Wallet top-up');
END; $$;

-- Atomic lead purchase (handles free trial + wallet deduction)
CREATE OR REPLACE FUNCTION purchase_lead(p_advisor_id uuid, p_lead_id uuid, p_price integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance integer; v_free_used integer; v_is_free boolean := false; v_cost integer := p_price;
BEGIN
  SELECT wallet_balance, free_leads_used INTO v_balance, v_free_used FROM advisor_profiles WHERE id = p_advisor_id;
  IF v_free_used < 3 AND p_price <= 10000 THEN v_is_free := true; v_cost := 0; END IF;
  IF NOT v_is_free AND v_balance < p_price THEN RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_funds'); END IF;
  INSERT INTO lead_purchases (advisor_id, lead_id, amount_paid, is_free) VALUES (p_advisor_id, p_lead_id, v_cost, v_is_free) ON CONFLICT DO NOTHING;
  IF v_is_free THEN
    UPDATE advisor_profiles SET free_leads_used = free_leads_used + 1 WHERE id = p_advisor_id;
    INSERT INTO wallet_transactions (advisor_id, amount, type, lead_id, description) VALUES (p_advisor_id, 0, 'free_lead', p_lead_id, 'Free trial lead');
  ELSE
    UPDATE advisor_profiles SET wallet_balance = wallet_balance - p_price WHERE id = p_advisor_id;
    INSERT INTO wallet_transactions (advisor_id, amount, type, lead_id, description) VALUES (p_advisor_id, -p_price, 'lead_purchase', p_lead_id, 'Lead purchase');
  END IF;
  INSERT INTO lead_statuses (advisor_id, lead_id, status) VALUES (p_advisor_id, p_lead_id, 'new') ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('ok', true, 'is_free', v_is_free);
END; $$;
