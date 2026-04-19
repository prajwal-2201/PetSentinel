-- ============================================================
-- PetSentinel — Initial Schema Migration
-- Run against: https://uyorhnqptxspxglbepbo.supabase.co
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── owners (maps to Supabase Auth users) ────────────────────
CREATE TABLE IF NOT EXISTS public.owners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,                        -- links to auth.users.id
  full_name   TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  address     TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── pets ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  species         TEXT NOT NULL,                   -- dog, cat, rabbit, etc.
  breed           TEXT,
  date_of_birth   DATE,
  weight_kg       DECIMAL(5, 2),
  microchip_id    TEXT UNIQUE,
  status          TEXT NOT NULL DEFAULT 'active'   -- active | transferred | deceased
    CHECK (status IN ('active', 'transferred', 'deceased')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── health_records (biological identity vault) ───────────────
CREATE TABLE IF NOT EXISTS public.health_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
  owner_id        UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
  record_type     TEXT NOT NULL
    CHECK (record_type IN (
      'vaccination', 'deworming', 'allergy', 'surgery',
      'diagnosis', 'medication', 'lab_result', 'behavioral_note', 'other'
    )),
  title           TEXT NOT NULL,
  description     TEXT,
  administered_by TEXT,                            -- vet name / clinic
  administered_at DATE NOT NULL,
  next_due_at     DATE,
  document_url    TEXT,                            -- Supabase Storage URL
  metadata        JSONB DEFAULT '{}'::jsonb,       -- flexible extra data
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ownership_transfers (audit trail + Health Vault Transfer) ─
CREATE TABLE IF NOT EXISTS public.ownership_transfers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id            UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
  from_owner_id     UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
  to_owner_id       UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
  initiated_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
  records_transferred INTEGER DEFAULT 0,          -- count of health_records moved
  transfer_hash     TEXT,                          -- SHA-256 of transferred record IDs (integrity)
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── triage_sessions (audit log for ML triage calls) ─────────
CREATE TABLE IF NOT EXISTS public.triage_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      TEXT NOT NULL,                  -- short ID from backend
  pet_id          UUID REFERENCES public.pets(id),
  owner_id        UUID REFERENCES public.owners(id),
  input_text      TEXT NOT NULL,
  ml_severity     TEXT,
  supervisor_lock BOOLEAN DEFAULT FALSE,
  triggered_keywords TEXT[],
  risk_score      DECIMAL(5, 3),
  ml_confidence   DECIMAL(5, 3),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pets_owner_id            ON public.pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id    ON public.health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_owner_id  ON public.health_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_transfers_pet_id         ON public.ownership_transfers(pet_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_owner     ON public.ownership_transfers(from_owner_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_owner       ON public.ownership_transfers(to_owner_id);
CREATE INDEX IF NOT EXISTS idx_triage_sessions_pet_id   ON public.triage_sessions(pet_id);

-- ── RLS (Row Level Security) ──────────────────────────────────
ALTER TABLE public.owners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ownership_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_sessions  ENABLE ROW LEVEL SECURITY;

-- Owners can only see their own data
CREATE POLICY "owners_self" ON public.owners
  FOR ALL USING (auth.uid() = auth_user_id);

-- Pet owners can see their pets
CREATE POLICY "pets_owner"  ON public.pets
  FOR ALL USING (
    owner_id = (SELECT id FROM public.owners WHERE auth_user_id = auth.uid())
  );

-- Health records follow pet ownership
CREATE POLICY "health_records_owner" ON public.health_records
  FOR ALL USING (
    owner_id = (SELECT id FROM public.owners WHERE auth_user_id = auth.uid())
  );

-- Transfers visible to both parties
CREATE POLICY "transfers_parties" ON public.ownership_transfers
  FOR ALL USING (
    from_owner_id = (SELECT id FROM public.owners WHERE auth_user_id = auth.uid())
    OR
    to_owner_id   = (SELECT id FROM public.owners WHERE auth_user_id = auth.uid())
  );

-- Triage sessions visible to owning user
CREATE POLICY "triage_owner" ON public.triage_sessions
  FOR ALL USING (
    owner_id = (SELECT id FROM public.owners WHERE auth_user_id = auth.uid())
  );

-- ── Health Vault Transfer RPC ────────────────────────────────
-- Atomic transaction: updates pet owner + copies health records + creates audit row
CREATE OR REPLACE FUNCTION public.transfer_health_vault(
  p_pet_id          UUID,
  p_from_owner_id   UUID,
  p_to_owner_id     UUID,
  p_notes           TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transfer_id UUID;
  v_record_count INTEGER := 0;
  v_record_ids  UUID[];
  v_hash        TEXT;
BEGIN
  -- 1. Verify pet belongs to from_owner
  IF NOT EXISTS (
    SELECT 1 FROM public.pets
    WHERE id = p_pet_id AND owner_id = p_from_owner_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Pet not found or not owned by from_owner';
  END IF;

  -- 2. Verify to_owner exists
  IF NOT EXISTS (SELECT 1 FROM public.owners WHERE id = p_to_owner_id) THEN
    RAISE EXCEPTION 'Destination owner not found';
  END IF;

  -- 3. Count records to transfer
  SELECT COUNT(*), ARRAY_AGG(id)
    INTO v_record_count, v_record_ids
    FROM public.health_records
   WHERE pet_id = p_pet_id AND owner_id = p_from_owner_id;

  -- 4. Compute integrity hash (sorted record IDs as comma-separated string, MD5)
  SELECT MD5(STRING_AGG(id::TEXT, ',' ORDER BY id))
    INTO v_hash
    FROM UNNEST(v_record_ids) AS id;

  -- 5. Create transfer audit record (pending)
  INSERT INTO public.ownership_transfers (
    pet_id, from_owner_id, to_owner_id, status,
    records_transferred, transfer_hash, notes
  )
  VALUES (
    p_pet_id, p_from_owner_id, p_to_owner_id, 'pending',
    v_record_count, v_hash, p_notes
  )
  RETURNING id INTO v_transfer_id;

  -- 6. Re-assign health records to new owner
  UPDATE public.health_records
     SET owner_id   = p_to_owner_id,
         updated_at = NOW()
   WHERE pet_id = p_pet_id
     AND owner_id = p_from_owner_id;

  -- 7. Update pet ownership
  UPDATE public.pets
     SET owner_id   = p_to_owner_id,
         status     = 'transferred',
         updated_at = NOW()
   WHERE id = p_pet_id;

  -- 8. Mark transfer completed
  UPDATE public.ownership_transfers
     SET status       = 'completed',
         completed_at = NOW()
   WHERE id = v_transfer_id;

  RETURN JSONB_BUILD_OBJECT(
    'transfer_id',          v_transfer_id,
    'pet_id',               p_pet_id,
    'from_owner_id',        p_from_owner_id,
    'to_owner_id',          p_to_owner_id,
    'records_transferred',  v_record_count,
    'integrity_hash',       v_hash,
    'status',               'completed'
  );

EXCEPTION WHEN OTHERS THEN
  -- Any error automatically rolls back the whole transaction
  UPDATE public.ownership_transfers
     SET status = 'rejected'
   WHERE id = v_transfer_id;
  RAISE;
END;
$$;
