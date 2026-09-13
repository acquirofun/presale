-- ============================================
-- REFERRAL SYSTEM DATABASE SETUP
-- Run these commands in Supabase SQL Editor
-- ============================================

-- 1. Create referral_codes table
-- Stores generated referral codes and their metadata
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  referrer_wallet_address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_referrals INTEGER DEFAULT 0,
  total_referred_amount NUMERIC DEFAULT 0
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_wallet ON referral_codes(referrer_wallet_address);

-- 2. Create referral_relationships table
-- Tracks who referred whom and prevents duplicate referrals
CREATE TABLE IF NOT EXISTS referral_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  referred_wallet_address TEXT NOT NULL UNIQUE,
  referrer_wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_referred_amount NUMERIC DEFAULT 0
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_referral_relationships_referred ON referral_relationships(referred_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_relationships_referrer ON referral_relationships(referrer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_relationships_code ON referral_relationships(referral_code);

-- 3. Create referral_earnings table
-- Tracks referrer earnings per transaction (transaction_id set to BIGINT to match transactions.id)
CREATE TABLE IF NOT EXISTS referral_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_wallet_address TEXT NOT NULL,
  referred_wallet_address TEXT NOT NULL,
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE CASCADE,
  earned_amount NUMERIC NOT NULL,
  earned_points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referred ON referral_earnings(referred_wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_transaction ON referral_earnings(transaction_id);

-- 4. Update transactions table to add referral tracking columns
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS referral_code_used TEXT,
ADD COLUMN IF NOT EXISTS referral_bonus_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrer_wallet_address TEXT;

-- Add index for referral lookups on transactions
CREATE INDEX IF NOT EXISTS idx_transactions_referral_code ON transactions(referral_code_used);
CREATE INDEX IF NOT EXISTS idx_transactions_referrer ON transactions(referrer_wallet_address);

-- 5. Create a function to check if user qualifies for referral code
-- User must have at least $30 in total successful transactions
CREATE OR REPLACE FUNCTION user_qualifies_for_referral(user_wallet TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DECLARE total_spent NUMERIC;
  
  SELECT COALESCE(SUM(amount), 0) INTO total_spent
  FROM transactions
  WHERE sender_address = LOWER(user_wallet)
  AND status = 'SUCCESS';
  
  RETURN total_spent >= 30;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := substr(md5(random()::text), 1, 8);
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Create a function to validate referral code
CREATE OR REPLACE FUNCTION validate_referral_code(code TEXT, user_wallet TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  referrer_wallet TEXT,
  error_message TEXT
) AS $$
DECLARE
  referral_rec RECORD;
  already_referred BOOLEAN;
BEGIN
  -- Check if code exists and is active
  SELECT * INTO referral_rec
  FROM referral_codes
  WHERE code = code AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'Invalid referral code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user is trying to use their own code
  IF LOWER(referral_rec.referrer_wallet_address) = LOWER(user_wallet) THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'Cannot use your own referral code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user has already used a referral code
  SELECT EXISTS(
    SELECT 1 FROM referral_relationships
    WHERE referred_wallet_address = LOWER(user_wallet)
  ) INTO already_referred;
  
  IF already_referred THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'You have already used a referral code'::TEXT;
    RETURN;
  END IF;
  
  -- Code is valid
  RETURN QUERY SELECT true, referral_rec.referrer_wallet_address, NULL::TEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 8. Create a trigger to update referral code stats when transaction succeeds
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referral_code total referrals and amount
  IF NEW.referral_code_used IS NOT NULL THEN
    UPDATE referral_codes
    SET 
      total_referrals = total_referrals + 1,
      total_referred_amount = total_referred_amount + NEW.amount
    WHERE code = NEW.referral_code_used;
    
    -- Update referral_relationships total referred amount
    UPDATE referral_relationships
    SET total_referred_amount = total_referred_amount + NEW.amount
    WHERE referred_wallet_address = NEW.sender_address;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS trigger_update_referral_stats ON transactions;
CREATE TRIGGER trigger_update_referral_stats
AFTER UPDATE OF status ON transactions
FOR EACH ROW
WHEN (NEW.status = 'SUCCESS' AND OLD.status != 'SUCCESS')
EXECUTE FUNCTION update_referral_stats();

-- 9. Add helpful comments for documentation
COMMENT ON TABLE referral_codes IS 'Stores generated referral codes and their statistics';
COMMENT ON TABLE referral_relationships IS 'Tracks relationships between referrers and referred users';
COMMENT ON TABLE referral_earnings IS 'Tracks earnings from referrals per transaction';
COMMENT ON FUNCTION user_qualifies_for_referral IS 'Checks if user has spent at least $30 in successful transactions';
COMMENT ON FUNCTION generate_referral_code IS 'Generates a unique 8-character referral code';
COMMENT ON FUNCTION validate_referral_code IS 'Validates referral code and checks for duplicate usage';

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Test the functions: SELECT validate_referral_code('TESTCODE', '0x123...');
-- 3. Implement frontend components to use these tables
-- ============================================
