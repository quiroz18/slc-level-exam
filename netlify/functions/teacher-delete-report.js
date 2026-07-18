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

  const { report_id } = body;
  if (!report_id) return json(400, { error: 'report_id is required' });

  const supabase = getAdminClient();

  const { error } = await supabase.from('reports').delete().eq('id', report_id);
  if (error) return json(500, { error: error.message });

  return json(200, { deleted: true });
};
