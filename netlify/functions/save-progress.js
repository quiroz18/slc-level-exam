const { getAdminClient } = require('./_shared/supabaseAdmin');
const { json } = require('./_shared/respond');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  const { attempt_id, answers } = body;
  if (!attempt_id || typeof answers !== 'object') {
    return json(400, { error: 'attempt_id and answers are required.' });
  }

  const supabase = getAdminClient();

  // Only allow saving progress on an attempt that hasn't been submitted yet.
  const { data: attempt, error: fetchError } = await supabase
    .from('attempts')
    .select('id, submitted_at')
    .eq('id', attempt_id)
    .maybeSingle();

  if (fetchError || !attempt) return json(404, { error: 'Attempt not found.' });
  if (attempt.submitted_at) return json(409, { error: 'This attempt has already been submitted.' });

  const { error: updateError } = await supabase
    .from('attempts')
    .update({ answers })
    .eq('id', attempt_id);

  if (updateError) return json(500, { error: updateError.message });

  return json(200, { saved: true });
};
