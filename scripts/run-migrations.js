/**
 * Magic QR 2.0 — Migration Runner
 * Runs all SQL migrations against a Supabase project via Management API
 * Usage: node scripts/run-migrations.js
 */

const PROJECT_ID = 'ilxupjirtfxbvucvqpxm';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlseHVwamlydGZ4YnZ1Y3ZxcHhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDE2OTQ1NiwiZXhwIjoyMDg5NzQ1NDU2fQ._y9vXydz4FysLDbbrJADfYnPNkf2Hxsx9-piNrQ68gs';

const MIGRATIONS = [
  {
    name: '001_initial_schema',
    sql: `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS businesses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  category        TEXT,
  city            TEXT,
  neighborhood    TEXT,
  google_place_id TEXT,
  logo_url        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id         UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  price_range         TEXT,
  tags                TEXT[],
  active              BOOLEAN DEFAULT true,
  seo_status          TEXT DEFAULT 'pending' CHECK (seo_status IN ('pending','scanning','ready','failed')),
  seo_keyword_count   INT DEFAULT 0,
  seo_retry_count     INT DEFAULT 0,
  seo_last_attempt    TIMESTAMPTZ,
  seo_error           TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_keywords (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id      UUID REFERENCES services(id) ON DELETE CASCADE,
  keyword         TEXT NOT NULL,
  type            TEXT CHECK (type IN ('branded','service_based','location_based','long_tail','intent_based')),
  priority        INT DEFAULT 1 CHECK (priority IN (1,2,3)),
  is_active       BOOLEAN DEFAULT true,
  inject_count    INT DEFAULT 0,
  last_injected   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_variants (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id          UUID REFERENCES services(id) ON DELETE CASCADE,
  business_id         UUID REFERENCES businesses(id) ON DELETE CASCADE,
  text                TEXT NOT NULL,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active','used','deprioritized')),
  length              TEXT CHECK (length IN ('short','medium','long')),
  last_used           TIMESTAMPTZ,
  deprioritized_until TIMESTAMPTZ,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id      UUID REFERENCES services(id),
  type            TEXT CHECK (type IN ('scan','next','shown','copy_open','confirm_posted','negative_feedback')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback_inbox (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id      UUID REFERENCES services(id),
  rating          INT CHECK (rating BETWEEN 1 AND 5),
  message         TEXT,
  is_resolved     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_keyword_usage (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id    UUID REFERENCES review_variants(id) ON DELETE CASCADE,
  keyword_id    UUID REFERENCES seo_keywords(id) ON DELETE SET NULL,
  keyword_text  TEXT NOT NULL,
  injected_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(business_id, active);
CREATE INDEX IF NOT EXISTS idx_keywords_service_active ON seo_keywords(service_id, is_active, priority);
CREATE INDEX IF NOT EXISTS idx_keywords_lru ON seo_keywords(service_id, last_injected NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_variants_service_lru ON review_variants(service_id, last_used NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_events_business_type ON events(business_id, type, created_at);
`
  },
  {
    name: '002_rls_policies',
    sql: `
-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_keyword_usage ENABLE ROW LEVEL SECURITY;

-- Businesses: owner-only write, public read by slug
CREATE POLICY "owner_all_businesses" ON businesses
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "public_read_businesses" ON businesses
  FOR SELECT USING (true);

-- Services: owner-only write, public read if active
CREATE POLICY "owner_all_services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "public_read_active_services" ON services
  FOR SELECT USING (active = true);

-- SEO Keywords: owner-only, never exposed to public
CREATE POLICY "owner_all_keywords" ON seo_keywords
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- Review Variants: owner write, public read active
CREATE POLICY "owner_all_variants" ON review_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "public_read_active_variants" ON review_variants
  FOR SELECT USING (is_active = true AND status = 'active');

-- Events: public insert (customer scans), owner read
CREATE POLICY "public_insert_events" ON events FOR INSERT WITH CHECK (true);

CREATE POLICY "owner_read_events" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- Feedback: public insert (negative review form), owner read/update
CREATE POLICY "feedback_public_insert" ON feedback_inbox FOR INSERT WITH CHECK (true);

CREATE POLICY "owner_read_feedback" ON feedback_inbox
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "owner_update_feedback" ON feedback_inbox
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- Keyword usage: owner only
CREATE POLICY "owner_all_rkw" ON review_keyword_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM review_variants rv
      JOIN businesses b ON rv.business_id = b.id
      WHERE rv.id = variant_id AND b.owner_id = auth.uid()
    )
  );
`
  },
  {
    name: '003_rpc_functions',
    sql: `
CREATE OR REPLACE FUNCTION get_random_variants(
  p_service_id UUID,
  p_count INT DEFAULT 4,
  p_exclude_ids UUID[] DEFAULT '{}'
)
RETURNS SETOF review_variants AS $$
  SELECT * FROM review_variants
  WHERE service_id = p_service_id
    AND is_active = true
    AND status = 'active'
    AND id != ALL(p_exclude_ids)
    AND (deprioritized_until IS NULL OR deprioritized_until < now())
  ORDER BY last_used NULLS FIRST
  LIMIT p_count;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION increment_keyword_inject(keyword_ids UUID[])
RETURNS void AS $$
  UPDATE seo_keywords
  SET inject_count = inject_count + 1,
      last_injected = now()
  WHERE id = ANY(keyword_ids);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
`
  },
  {
    name: '004_extensions',
    sql: `
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
`
  }
];

async function runSQL(sql, migrationName) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Migration ${migrationName} failed (${resp.status}): ${text}`);
  }
  return await resp.json();
}

async function main() {
  console.log(`\n🚀 Running Magic QR 2.0 migrations on project: ${PROJECT_ID}\n`);
  for (const m of MIGRATIONS) {
    process.stdout.write(`  ⏳ ${m.name}...`);
    try {
      await runSQL(m.sql, m.name);
      console.log(' ✅');
    } catch (err) {
      console.log(` ❌\n  ${err.message}`);
      process.exit(1);
    }
  }
  console.log('\n✅ All migrations complete!\n');
}

main();
