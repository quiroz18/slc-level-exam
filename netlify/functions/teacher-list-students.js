const { getAdminClient, verifyTeacher } = require('./_shared/supabaseAdmin');
const { json } = require('./_shared/respond');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const teacher = await verifyTeacher(event.headers.authorization || event.headers.Authorization);
  if (!teacher) return json(401, { error: 'Not authorized' });

  const supabase = getAdminClient();

  const { data: students, error } = await supabase
    .from('students')
    .select('id, full_name, email, phone, attempt_status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) return json(500, { error: error.message });

  const studentIds = students.map((s) => s.id);
  let attemptsByStudent = {};
  if (studentIds.length) {
    const { data: attempts } = await supabase
      .from('attempts')
      .select('student_id, level, score, total, submitted_at, is_current')
      .in('student_id', studentIds)
      .eq('is_current', true);
    (attempts || []).forEach((a) => { attemptsByStudent[a.student_id] = a; });
  }

  const result = students.map((s) => ({
    ...s,
    current_attempt: attemptsByStudent[s.id] || null,
  }));

  return json(200, { students: result });
};
