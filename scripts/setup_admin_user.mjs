// scripts/setup_admin_user.mjs - Create user_profiles and super admin account in Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase-supabasedeltafix.1cnep6.easypanel.host';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';
const BASIC_AUTH = Buffer.from('supabase:this_password_is_insecure_and_should_be_updated').toString('base64');

async function runQuery(sql, description) {
  console.log(`⏳ ${description}...`);
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${BASIC_AUTH}`,
      'apikey': SERVICE_KEY
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(`❌ Error in ${description}:`, txt);
    throw new Error(txt);
  }
  console.log(`✅ ${description}`);
}

async function main() {
  console.log('👤 Setting up User Profiles & Super Admin in Supabase...');

  // 1. Create user_profiles table in public schema
  const profilesTableSQL = `
  CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) DEFAULT 'Super Administrador',
    role VARCHAR(50) NOT NULL DEFAULT 'engineer' CHECK (role IN ('super_admin', 'engineering_manager', 'engineer', 'quality_inspector', 'operator')),
    departamento VARCHAR(100) DEFAULT 'Engenharia de Produto',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_read_profiles') THEN
      CREATE POLICY allow_read_profiles ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END $$;
  `;
  await runQuery(profilesTableSQL, 'Create user_profiles table');

  // 2. Use Supabase Admin Auth API to create/update the user
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = 'edsonmanoel2012@gmail.com';
  const password = '10207597Rdv*';

  console.log(`⏳ Registering user ${email} in Supabase Auth...`);

  // Check if user already exists
  const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('Error listing users:', listErr);
  }

  const existingUser = usersList?.users?.find((u) => u.email === email);
  let userId;

  if (existingUser) {
    console.log(`User already exists (id: ${existingUser.id}), updating password and metadata...`);
    const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password,
        email_confirm: true,
        user_metadata: { role: 'super_admin', full_name: 'Edson Manoel' }
      }
    );
    if (updateErr) throw updateErr;
    userId = existingUser.id;
    console.log('✅ User updated successfully!');
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'super_admin', full_name: 'Edson Manoel' }
    });
    if (createErr) throw createErr;
    userId = newUser.user.id;
    console.log('✅ User created successfully! ID:', userId);
  }

  // 3. Upsert user_profiles row
  const profileUpsertSQL = `
  INSERT INTO public.user_profiles (id, email, full_name, role, departamento, is_active)
  VALUES ('${userId}', '${email}', 'Edson Manoel', 'super_admin', 'Diretoria de Engenharia & Manufatura', true)
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    full_name = 'Edson Manoel',
    departamento = 'Diretoria de Engenharia & Manufatura',
    is_active = true;
  `;
  await runQuery(profileUpsertSQL, 'Upsert Super Admin Profile in user_profiles');

  console.log('\n🎉 Super Admin setup completed successfully!');
  console.log(`Login Email: ${email}`);
  console.log(`Role: super_admin (Acesso total irrestrito)`);
}

main().catch(console.error);
