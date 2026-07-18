const { getAdminClient } = require('./_shared/supabaseAdmin');
const { json } = require('./_shared/respond');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const email = (event.queryStringParameters?.email || '').trim().toLowerCase();
  if (!email) return json(400, { error: 'email is required' });

  const supabase = getAdminClient();

  const { data: student } = await supabase
    .from('students')
    .select('id, full_name, attempt_status')
    .eq('email', email)
    .maybeSingle();

  if (!student) {
    return json(404, { status: 'not_found', message: 'No record found for this email.' });
  }

  if (student.attempt_status !== 'completed') {
    return json(200, {
      status: student.attempt_status,
      message: student.attempt_status === 'in_progress'
        ? 'Your exam is in progress or was not finished.'
        : 'You have not taken the exam yet.',
    });
  }

  const { data: attempt } = await supabase
    .from('attempts')
    .select('level, submitted_at')
    .eq('student_id', student.id)
    .eq('is_current', true)
    .maybeSingle();

  return json(200, {
    status: 'completed',
    full_name: student.full_name,
    level: attempt?.level || null,
    submitted_at: attempt?.submitted_at || null,
  });
};
