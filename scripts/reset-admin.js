import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function reset() {
  console.log('👤 Resetting admin login for wildnutbeats@gmail.com...\n');

  // Check if user exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Error listing users:', listError.message);
    return;
  }

  const existing = users.find(u => u.email === 'wildnutbeats@gmail.com');

  if (existing) {
    console.log(`   Found user with ID: ${existing.id}. Updating password and confirming email...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: 'Password123!',
      email_confirm: true
    });
    if (updateError) console.error('   ❌ Error updating:', updateError.message);
    else console.log('   ✅ Password reset to: Password123!');
  } else {
    console.log('   User not found. Creating fresh...');
    const { error: createError } = await supabase.auth.admin.createUser({
      email: 'wildnutbeats@gmail.com',
      password: 'Password123!',
      email_confirm: true
    });
    if (createError) console.error('   ❌ Error creating:', createError.message);
    else console.log('   ✅ Created fresh with: Password123!');
  }
}

reset();
