const { getAdminClient } = require('./_shared/supabaseAdmin');
const { json } = require('./_shared/respond');
const { TIME_LIMIT_SECONDS } = require('./_shared/examData');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  const full_name = (body.full_name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const phone = (body.phone || '').trim();
  const device_id = (body.device_id || '').trim();

  if (!full_name || !email || !phone || !device_id) {
    return json(400, { error: 'Full name, email, phone, and device_id are all required.' });
  }

  const supabase = getAdminClient();

  // 1) Has THIS email already completed the exam?
  const { data: existingByEmail } = await supabase
    .from('students')
    .select('id, full_name, attempt_status')
    .eq('email', email)
    .maybeSingle();

  if (existingByEmail && existingByEmail.attempt_status === 'completed') {
    return json(403, {
      error: 'already_completed',
      message: 'This email has already completed the exam. Ask your teacher to reset it if you need another attempt.',
    });
  }

  // 2) Has THIS device already been used to complete an exam (by anyone)?
  const { data: deviceLock } = await supabase
    .from('students')
    .select('id, full_name, email')
    .eq('device_id', device_id)
    .eq('attempt_status', 'completed')
    .maybeSingle();

  if (deviceLock && deviceLock.email !== email) {
    return json(403, {
      error: 'device_locked',
      message: 'This device already has a completed exam on it. Ask your teacher to reset the previous attempt before using this device again.',
    });
  }

  // 3) Create or update the student row.
  let studentId = existingByEmail?.id;
  if (studentId) {
    await supabase
      .from('students')
      .update({ full_name, phone, device_id, attempt_status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', studentId);
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('students')
      .insert({ full_name, email, phone, device_id, attempt_status: 'in_progress' })
      .select('id')
      .single();
    if (insertError) return json(500, { error: insertError.message });
    studentId = inserted.id;
  }

  // 4) Mark any previous attempts as not current, then create a fresh attempt.
  await supabase.from('attempts').update({ is_current: false }).eq('student_id', studentId);

  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .insert({
      student_id: studentId,
      started_at: new Date().toISOString(),
      time_limit_seconds: TIME_LIMIT_SECONDS,
      answers: {},
      is_current: true,
    })
    .select('id, started_at, time_limit_seconds')
    .single();

  if (attemptError) return json(500, { error: attemptError.message });

  return json(200, {
    student_id: studentId,
    attempt_id: attempt.id,
    started_at: attempt.started_at,
    time_limit_seconds: attempt.time_limit_seconds,
  });
};
