const { getAdminClient, verifyTeacher } = require('./_shared/supabaseAdmin');
const { json } = require('./_shared/respond');
const { ANSWER_KEY } = require('./_shared/examData');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const teacher = await verifyTeacher(event.headers.authorization || event.headers.Authorization);
  if (!teacher) return json(401, { error: 'Not authorized' });

  const student_id = event.queryStringParameters?.student_id;
  if (!student_id) return json(400, { error: 'student_id is required' });

  const supabase = getAdminClient();

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('id', student_id)
    .maybeSingle();

  if (studentError || !student) return json(404, { error: 'Student not found' });

  const { data: attempts, error: attemptsError } = await supabase
    .from('attempts')
    .select('*')
    .eq('student_id', student_id)
    .order('created_at', { ascending: false });

  if (attemptsError) return json(500, { error: attemptsError.message });

  const currentAttempt = attempts.find((a) => a.is_current) || attempts[0] || null;

  // Build a per-question review (student's answer vs. correct answer) for the current attempt.
  let questionReview = [];
  if (currentAttempt && currentAttempt.answers) {
    questionReview = ANSWER_KEY.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      category: q.category,
      correct: q.correct,
      given: currentAttempt.answers[String(q.id)] || null,
      is_correct: currentAttempt.answers[String(q.id)] === q.correct,
    }));
  }

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('student_id', student_id)
    .order('generated_at', { ascending: false });

  return json(200, {
    student,
    attempts,
    current_attempt: currentAttempt,
    question_review: questionReview,
    reports: reports || [],
  });
};
