const { createClient } = require('@supabase/supabase-js');

// Uses the SERVICE ROLE key — full database access, bypasses RLS.
// This must ONLY ever run server-side (inside netlify/functions).
// Set these in Netlify: Site settings → Environment variables.
function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

// Verifies a teacher's login token (sent from the frontend after they
// sign in with Supabase Auth) is valid. Returns the user, or null.
async function verifyTeacher(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

module.exports = { getAdminClient, verifyTeacher };
