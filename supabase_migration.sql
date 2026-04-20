-- 1. Update Owners Table for SaaS details
ALTER TABLE owners ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Bangalore';
ALTER TABLE owners ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- 2. Enable Row Level Security (RLS) on all tables
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_transfers ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Owner-Isolation)

-- Owners: Can only see/edit their own profile
CREATE POLICY owner_isolation_owners ON owners
    FOR ALL USING (auth.uid() = auth_user_id);

-- Pets: Can only see/edit pets they own
CREATE POLICY owner_isolation_pets ON pets
    FOR ALL USING (
        owner_id IN (SELECT id FROM owners WHERE auth_user_id = auth.uid())
    );

-- Health Records: Can only see records for pets they own
CREATE POLICY owner_isolation_health_records ON health_records
    FOR ALL USING (
        owner_id IN (SELECT id FROM owners WHERE auth_user_id = auth.uid())
    );

-- 4. Initial User Helper
-- This ensures when a new user signs up, they appear in the owners table
-- (Alternatively handled by the Onboarding Wizard in code)
