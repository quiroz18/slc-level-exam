const { getAdminClient, verifyTeacher } = require('./_shared/supabaseAdmin');
const { json } = require('./_shared/respond');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const teacher = await verifyTeacher(event.headers.authorization || event.headers.Authorization);
  if (!teacher) return json(401, { error: 'Not authorized' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  const { student_id } = body;
  if (!student_id) return json(400, { error: 'student_id is required' });

  const supabase = getAdminClient();

  // Previous attempts stay in the table for history — just marked not current.
  await supabase.from('attempts').update({ is_current: false }).eq('student_id', student_id);

  const { error } = await supabase
    .from('students')
    .update({ attempt_status: 'not_started', updated_at: new Date().toISOString() })
    .eq('id', student_id);

  if (error) return json(500, { error: error.message });

  return json(200, { reset: true });
};
