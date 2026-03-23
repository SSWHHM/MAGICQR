import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function setup() {
  console.log('🚀 Starting autonomous setup for Magic QR 2.0...\n');

  // 1. Create Admin User
  console.log('  👤 Creating admin user...');
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: 'wildnutbeats@gmail.com',
    password: 'Password123!', // User can change this later
    email_confirm: true
  });
  if (userError) {
    if (userError.message.includes('already exists')) {
      console.log('     ✅ User already exists.');
    } else {
      console.log('     ❌ Error:', userError.message);
    }
  } else {
    console.log('     ✅ User created successfully.');
  }

  // 2. Create Storage Bucket
  console.log('\n  📦 Creating storage bucket "logos"...');
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('logos', {
    public: true,
    fileSizeLimit: 1024 * 1024 * 2, // 2MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });
  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('     ✅ Bucket already exists.');
    } else {
      console.log('     ❌ Error:', bucketError.message);
    }
  } else {
    console.log('     ✅ Bucket created successfully.');
  }

  console.log('\n✅ Setup utility finished. Next: Run migrations in Dashboard SQL Editor.\n');
}

setup();
