const { getAdminClient, verifyTeacher } = require('./_shared/supabaseAdmin');
const { json } = require('./_shared/respond');
const { buildReportText } = require('./_shared/level');

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

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('full_name')
    .eq('id', student_id)
    .maybeSingle();

  if (studentError || !student) return json(404, { error: 'Student not found.' });

  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('id, topic_breakdown, level, submitted_at')
    .eq('student_id', student_id)
    .eq('is_current', true)
    .maybeSingle();

  if (attemptError || !attempt || !attempt.submitted_at) {
    return json(400, { error: 'This student does not have a completed attempt yet.' });
  }

  const reportText = buildReportText(attempt.topic_breakdown || {}, attempt.level, student.full_name);

  const { data: report, error: insertError } = await supabase
    .from('reports')
    .insert({
      student_id,
      attempt_id: attempt.id,
      strengths: reportText.strengths,
      weaknesses: reportText.weaknesses,
      short_term_goals: reportText.short_term_goals,
      long_term_goals: reportText.long_term_goals,
      action_plan: reportText.action_plan,
    })
    .select('*')
    .single();

  if (insertError) return json(500, { error: insertError.message });

  return json(200, { report });
};
