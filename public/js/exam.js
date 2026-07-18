(function () {
  const studentId = sessionStorage.getItem('exam_student_id');
  const attemptId = sessionStorage.getItem('exam_attempt_id');
  const startedAt = sessionStorage.getItem('exam_started_at');
  const timeLimit = parseInt(sessionStorage.getItem('exam_time_limit') || '3600', 10);
  const fullName = sessionStorage.getItem('exam_full_name') || '';

  if (!studentId || !attemptId || !startedAt) {
    window.location.href = 'index.html';
    return;
  }

  let currentIndex = 0;
  const answers = {}; // { "1": "b", ... }
  let saveTimeout = null;
  let submitted = false;

  const qCount = document.getElementById('qCount');
  const qTag = document.getElementById('qTag');
  const qText = document.getElementById('qText');
  const qOptions = document.getElementById('qOptions');
  const navDots = document.getElementById('navDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const timerValue = document.getElementById('timerValue');
  const inkFill = document.getElementById('inkFill');
  const saveStatus = document.getElementById('saveStatus');

  function buildDots() {
    navDots.innerHTML = '';
    QUESTIONS.forEach((q, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.type = 'button';
      dot.title = 'Question ' + (i + 1);
      dot.addEventListener('click', () => goTo(i));
      navDots.appendChild(dot);
    });
    refreshDots();
  }

  function refreshDots() {
    [...navDots.children].forEach((dot, i) => {
      dot.classList.toggle('answered', !!answers[String(QUESTIONS[i].id)]);
      dot.classList.toggle('current', i === currentIndex);
    });
  }

  function renderQuestion() {
    const q = QUESTIONS[currentIndex];
    qCount.textContent = `Question ${currentIndex + 1} of ${QUESTIONS.length}`;
    qTag.textContent = 'Multiple choice';
    qText.textContent = q.text;
    qOptions.innerHTML = '';

    Object.entries(q.options).forEach(([letter, label]) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'option';
      if (answers[String(q.id)] === letter) wrapper.classList.add('selected');

      wrapper.innerHTML = `
        <input type="radio" name="q_${q.id}" value="${letter}" ${answers[String(q.id)] === letter ? 'checked' : ''}>
        <span class="letter">${letter})</span>
        <span>${label}</span>
      `;
      wrapper.querySelector('input').addEventListener('change', () => selectAnswer(q.id, letter));
      qOptions.appendChild(wrapper);
    });

    prevBtn.disabled = currentIndex === 0;
    const isLast = currentIndex === QUESTIONS.length - 1;
    nextBtn.style.display = isLast ? 'none' : 'inline-flex';
    submitBtn.style.display = isLast ? 'inline-flex' : 'none';

    refreshDots();
  }

  function selectAnswer(id, letter) {
    answers[String(id)] = letter;
    renderQuestion();
    scheduleSave();
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(QUESTIONS.length - 1, index));
    renderQuestion();
  }

  function scheduleSave() {
    saveStatus.textContent = 'Saving…';
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        await apiCall('save-progress', { method: 'POST', body: { attempt_id: attemptId, answers } });
        saveStatus.textContent = 'Saved ✓';
      } catch {
        saveStatus.textContent = 'Could not save — check your connection.';
      }
    }, 800);
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // ---- Submit flow ----
  const overlay = document.getElementById('confirmOverlay');
  const confirmText = document.getElementById('confirmText');

  submitBtn.addEventListener('click', () => {
    const unanswered = QUESTIONS.length - Object.keys(answers).length;
    confirmText.textContent = unanswered > 0
      ? `You have ${unanswered} unanswered question(s). Once submitted, you cannot make changes.`
      : 'Once submitted, you cannot make changes. Ready to see your result?';
    overlay.style.display = 'flex';
  });

  document.getElementById('cancelSubmit').addEventListener('click', () => { overlay.style.display = 'none'; });

  document.getElementById('confirmSubmit').addEventListener('click', async () => {
    await doSubmit();
  });

  async function doSubmit() {
    if (submitted) return;
    submitted = true;
    overlay.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    try {
      await apiCall('submit-exam', { method: 'POST', body: { attempt_id: attemptId, student_id: studentId, answers } });
      sessionStorage.clear();
      const email = localStorage.getItem('pending_exam_email') || '';
      window.location.href = 'student.html' + (email ? ('?email=' + encodeURIComponent(email)) : '');
    } catch (err) {
      submitted = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit exam';
      alert(err.message);
    }
  }

  // ---- Timer ----
  function tick() {
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const remaining = Math.max(0, timeLimit - elapsed);
    const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
    const secs = (remaining % 60).toString().padStart(2, '0');
    timerValue.textContent = `${mins}:${secs}`;
    timerValue.classList.toggle('low', remaining <= 300);
    inkFill.style.width = ((remaining / timeLimit) * 100) + '%';

    if (remaining <= 0 && !submitted) {
      doSubmit();
      return;
    }
    setTimeout(tick, 1000);
  }

  buildDots();
  renderQuestion();
  tick();

  window.addEventListener('beforeunload', (e) => {
    if (!submitted) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
