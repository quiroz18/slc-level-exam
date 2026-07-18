(function () {
  const sb = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);

  const loginView = document.getElementById('loginView');
  const forceChangeView = document.getElementById('forceChangeView');
  const listView = document.getElementById('listView');
  const detailView = document.getElementById('detailView');
  const logoutBtn = document.getElementById('logoutBtn');

  let session = null;
  let studentsCache = [];

  async function authedCall(path, options = {}) {
    const { data: { session: s } } = await sb.auth.getSession();
    if (!s) throw new Error('Session expired. Please log in again.');
    const res = await fetch('/api/' + path, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + s.access_token,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'Something went wrong.');
    return data;
  }

  function hideAllViews() {
    loginView.style.display = 'none';
    forceChangeView.style.display = 'none';
    listView.style.display = 'none';
    detailView.style.display = 'none';
  }

  function showLoggedIn() {
    hideAllViews();
    listView.style.display = 'block';
    logoutBtn.style.display = 'inline-flex';
    loadStudents();
  }

  function showLoggedOut() {
    hideAllViews();
    loginView.style.display = 'block';
    logoutBtn.style.display = 'none';
  }

  function showForceChange() {
    hideAllViews();
    forceChangeView.style.display = 'block';
    logoutBtn.style.display = 'inline-flex';
  }

  // A teacher must change their password before reaching the dashboard until
  // their user_metadata carries password_changed: true (set the first time
  // they successfully change it, see forceChangeForm handler below).
  function needsPasswordChange(s) {
    return !s?.user?.user_metadata?.password_changed;
  }

  // ---- Reusable password show/hide toggle ----
  function wireToggle(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Hide' : 'Show';
    });
  }
  wireToggle('tPass', 'togglePass');
  wireToggle('newPass1', 'toggleNewPass1');
  wireToggle('newPass2', 'toggleNewPass2');

  // ---- Login ----
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('loginError');
    errorBox.style.display = 'none';
    const email = document.getElementById('tEmail').value.trim();
    const password = document.getElementById('tPass').value;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      errorBox.textContent = error.message;
      errorBox.style.display = 'block';
      return;
    }
    session = data.session;
    if (needsPasswordChange(session)) {
      showForceChange();
    } else {
      showLoggedIn();
    }
  });

  // ---- Forced first-login password change ----
  document.getElementById('forceChangeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('forceChangeError');
    errorBox.style.display = 'none';

    const p1 = document.getElementById('newPass1').value;
    const p2 = document.getElementById('newPass2').value;

    if (p1 !== p2) {
      errorBox.textContent = "Passwords don't match.";
      errorBox.style.display = 'block';
      return;
    }
    if (p1.length < 8) {
      errorBox.textContent = 'Password must be at least 8 characters.';
      errorBox.style.display = 'block';
      return;
    }

    const btn = document.getElementById('forceChangeSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving\u2026';

    const { data, error } = await sb.auth.updateUser({
      password: p1,
      data: { password_changed: true },
    });

    if (error) {
      errorBox.textContent = error.message;
      errorBox.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Set password and continue';
      return;
    }

    session = { ...session, user: data.user };
    showLoggedIn();
  });

  logoutBtn.addEventListener('click', async () => {
    await sb.auth.signOut();
    showLoggedOut();
  });

  // ---- Student list ----
  async function loadStudents() {
    const rows = document.getElementById('studentRows');
    const emptyMsg = document.getElementById('emptyMsg');
    rows.innerHTML = '<tr><td colspan="5" class="muted">Loading…</td></tr>';
    try {
      const data = await authedCall('teacher-list-students');
      studentsCache = data.students;
      rows.innerHTML = '';
      if (!data.students.length) {
        emptyMsg.style.display = 'block';
        return;
      }
      emptyMsg.style.display = 'none';
      data.students.forEach((s) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(s.full_name)}</td>
          <td>${escapeHtml(s.email)}</td>
          <td><span class="status-pill status-${s.attempt_status}">${s.attempt_status.replace('_', ' ')}</span></td>
          <td>${s.current_attempt?.level || '—'}</td>
          <td>${s.current_attempt ? s.current_attempt.score + '/' + s.current_attempt.total : '—'}</td>
        `;
        tr.addEventListener('click', () => openDetail(s.id));
        rows.appendChild(tr);
      });
    } catch (err) {
      rows.innerHTML = `<tr><td colspan="5" class="error-box">${escapeHtml(err.message)}</td></tr>`;
    }
  }

  document.getElementById('refreshBtn').addEventListener('click', loadStudents);
  document.getElementById('backBtn').addEventListener('click', () => {
    detailView.style.display = 'none';
    listView.style.display = 'block';
  });

  // ---- Detail view ----
  let currentStudentId = null;

  async function openDetail(studentId) {
    currentStudentId = studentId;
    listView.style.display = 'none';
    detailView.style.display = 'block';
    document.getElementById('detName').textContent = 'Loading…';
    document.getElementById('questionReview').innerHTML = '';
    document.getElementById('reportsList').innerHTML = '';

    try {
      const data = await authedCall('teacher-student-detail?student_id=' + studentId);
      renderDetail(data);
    } catch (err) {
      document.getElementById('detName').textContent = 'Error';
      document.getElementById('detContact').textContent = err.message;
    }
  }

  function renderDetail(data) {
    const { student, current_attempt, question_review, reports } = data;
    document.getElementById('detName').textContent = student.full_name;
    document.getElementById('detContact').textContent = `${student.email} · ${student.phone}`;

    const badge = document.getElementById('detLevelBadge');
    badge.innerHTML = current_attempt?.level
      ? `<div class="level-badge badge-${levelSlug(current_attempt.level)}">${current_attempt.level} · ${current_attempt.score}/${current_attempt.total}</div>`
      : `<span class="status-pill status-${student.attempt_status}">${student.attempt_status.replace('_', ' ')}</span>`;

    // Reports
    const reportsList = document.getElementById('reportsList');
    if (!reports.length) {
      reportsList.innerHTML = '<p class="muted">No reports yet.</p>';
    } else {
      reportsList.innerHTML = reports.map((r, i) => `
        <div class="mb-16" style="border-bottom:1px solid var(--border); padding-bottom:12px;">
          <div class="flex-between">
            <p class="muted mono" style="margin:0 0 6px;">${new Date(r.generated_at).toLocaleString()}</p>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.82rem;" data-report-index="${i}">Download PDF</button>
              <button class="btn btn-secondary" style="padding:6px 10px; font-size:0.82rem; color:var(--danger); border-color:var(--danger);" data-delete-report-id="${r.id}" title="Delete report">🗑</button>
            </div>
          </div>
          <p><strong>Strengths:</strong> ${escapeHtml(r.strengths)}</p>
          <p><strong>Weaknesses:</strong> ${escapeHtml(r.weaknesses)}</p>
          <p><strong>Short-term goals:</strong></p>
          <div class="report-block">${escapeHtml(r.short_term_goals)}</div>
          <p><strong>Long-term goals:</strong></p>
          <div class="report-block">${escapeHtml(r.long_term_goals)}</div>
          <p><strong>Suggested action plan for class:</strong></p>
          <div class="report-block">${escapeHtml(r.action_plan || '')}</div>
        </div>
      `).join('');

      reportsList.querySelectorAll('[data-report-index]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const r = reports[parseInt(btn.dataset.reportIndex, 10)];
          downloadReportPdf(student, current_attempt, r);
        });
      });

      reportsList.querySelectorAll('[data-delete-report-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this report permanently? This cannot be undone.')) return;
          btn.disabled = true;
          try {
            await authedCall('teacher-delete-report', { method: 'POST', body: { report_id: btn.dataset.deleteReportId } });
            await openDetail(currentStudentId);
          } catch (err) {
            alert(err.message);
            btn.disabled = false;
          }
        });
      });
    }

    // Question review
    const reviewEl = document.getElementById('questionReview');
    if (!question_review.length) {
      reviewEl.innerHTML = '<p class="muted">No completed attempt to review yet.</p>';
    } else {
      reviewEl.innerHTML = question_review.map((q) => `
        <div class="question-review ${q.is_correct ? 'correct' : 'incorrect'}">
          <span class="tag">${escapeHtml(q.category)}</span>
          <p style="margin:6px 0;"><strong>${q.id}.</strong> ${escapeHtml(q.text)}</p>
          <p class="muted" style="margin:0;">
            Student's answer: <strong>${q.given ? q.given + ') ' + escapeHtml(q.options[q.given] || '') : '—'}</strong>
            &nbsp;·&nbsp; Correct answer: <strong>${q.correct}) ${escapeHtml(q.options[q.correct])}</strong>
          </p>
        </div>
      `).join('');
    }
  }

  function loadImageAsDataURL(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight });
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image: ' + url));
      img.src = url;
    });
  }

  async function downloadReportPdf(student, attempt, report) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('The PDF library did not load. Check your internet connection and try refreshing the page.');
      return;
    }
    try {
      await buildAndSaveReportPdf(student, attempt, report);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Something went wrong generating the PDF: ' + err.message);
    }
  }

  async function buildAndSaveReportPdf(student, attempt, report) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    const INK = [16, 24, 27];
    const TEAL = [42, 111, 119];
    const TEAL_SOFT = [228, 240, 239];
    const GREEN = [47, 125, 79];
    const GREEN_SOFT = [230, 242, 234];
    const AMBER = [184, 113, 10];
    const AMBER_SOFT = [252, 239, 218];
    const GREY = [110, 110, 110];
    const DARK = [28, 27, 26];

    const RED = [166, 54, 47];
    const RED_SOFT = [250, 231, 229];

    const ORANGE = [184, 80, 10];
    const GOLD = [140, 122, 10];
    const BLUE = [43, 92, 158];

    const levelColors = {
      'Level Intro': RED,
      'Level 1': ORANGE,
      'Level 2': AMBER,
      'Level 3': GOLD,
      'Level 4': BLUE,
      'Level 5': GREEN,
    };
    const levelColor = levelColors[attempt?.level] || TEAL;

    let logo = null;
    try {
      logo = await loadImageAsDataURL('images/slc-logo.png');
    } catch (e) {
      console.warn('SLC logo could not be loaded for the PDF header:', e);
    }

    // ---------- Header ----------
    doc.setFillColor(...INK);
    doc.rect(0, 0, pageWidth, 100, 'F');
    let titleX = margin + 20;
    if (logo) {
      const logoSize = 44;
      const logoHeight = logoSize * (logo.height / logo.width);
      doc.addImage(logo.dataUrl, 'PNG', margin, (100 - logoHeight) / 2, logoSize, logoHeight);
      titleX = margin + logoSize + 14;
    } else {
      doc.setFillColor(...TEAL);
      doc.circle(margin + 6, 34, 5, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(21);
    doc.text('SLC English Level Report', titleX, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(190, 196, 194);
    doc.text('Shakespeare Language Center', titleX, 56);
    doc.text(
      `Generated ${new Date(report.generated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`,
      titleX, 70
    );

    let y = 145;

    // ---------- Student name + contact ----------
    doc.setTextColor(...DARK);
    doc.setFont('times', 'bold');
    doc.setFontSize(19);
    doc.text(student.full_name, margin, y);
    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    doc.text(`${student.email}   |   ${student.phone}`, margin, y);

    // ---------- Level badge (top-right) ----------
    const levelLabel = attempt?.level || 'N/A';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const badgeTextWidth = doc.getTextWidth(levelLabel);
    const badgeW = badgeTextWidth + 34;
    const badgeX = pageWidth - margin - badgeW;
    doc.setFillColor(...levelColor);
    doc.roundedRect(badgeX, 108, badgeW, 28, 14, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(levelLabel, badgeX + 17, 126);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(`${attempt?.score ?? '-'} / ${attempt?.total ?? '-'} correct`, badgeX + badgeW / 2, 150, { align: 'center' });

    y += 40;
    doc.setDrawColor(228, 224, 216);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 30;

    // ---------- Helper: section header with colored accent bar ----------
    function sectionHeader(title, color) {
      doc.setFillColor(...color);
      doc.rect(margin, y - 10, 4, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...DARK);
      doc.text(title.toUpperCase(), margin + 12, y);
      y += 20;
    }

    // ---------- Helper: bulleted paragraph list ----------
    function bulletList(items, color, indentText) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      items.forEach((item) => {
        if (y > pageHeight - 70) { doc.addPage(); y = 60; }
        const wrapped = doc.splitTextToSize(item, contentWidth - 16);
        doc.setFillColor(...color);
        doc.circle(margin + 3, y - 3, 2.2, 'F');
        doc.setTextColor(...DARK);
        wrapped.forEach((line, idx) => {
          doc.text(line, margin + 14, y);
          y += 14;
        });
        y += 4;
      });
      y += 8;
    }

    // ---------- Helper: paragraph inside a colored card box with full-height accent border ----------
    function cardParagraph(text, bg, accent) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(text, contentWidth - 28);
      const boxHeight = wrapped.length * 14 + 20;
      if (y + boxHeight > pageHeight - 70) { doc.addPage(); y = 60; }
      doc.setFillColor(...bg);
      doc.roundedRect(margin, y - 14, contentWidth, boxHeight, 6, 6, 'F');
      if (accent) {
        doc.setFillColor(...accent);
        doc.roundedRect(margin, y - 14, 5, boxHeight, 2.5, 2.5, 'F');
      }
      doc.setTextColor(...DARK);
      let ty = y;
      wrapped.forEach((line) => { doc.text(line, margin + 14, ty); ty += 14; });
      y += boxHeight + 12;
    }

    // ---------- Helper: plain wrapped paragraph ----------
    function paragraph(text) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      const wrapped = doc.splitTextToSize(text, contentWidth);
      wrapped.forEach((line) => {
        if (y > pageHeight - 70) { doc.addPage(); y = 60; }
        doc.text(line, margin, y);
        y += 14;
      });
      y += 12;
    }

    // ---------- Strengths ----------
    sectionHeader('Strengths', GREEN);
    cardParagraph(report.strengths, GREEN_SOFT, GREEN);

    // ---------- Weaknesses ----------
    sectionHeader('Areas to Reinforce', AMBER);
    cardParagraph(report.weaknesses, AMBER_SOFT, AMBER);

    // ---------- Short-term goals ----------
    if (y > pageHeight - 120) { doc.addPage(); y = 60; }
    sectionHeader('Short-Term Goals', TEAL);
    const shortLines = report.short_term_goals.split('\n').filter(Boolean);
    const shortIntro = shortLines[0] && !shortLines[0].startsWith('•') ? shortLines.shift() : null;
    if (shortIntro) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...GREY);
      const wrapped = doc.splitTextToSize(shortIntro, contentWidth);
      wrapped.forEach((line) => { doc.text(line, margin, y); y += 13; });
      y += 6;
    }
    bulletList(shortLines.map((l) => l.replace(/^•\s*/, '')), TEAL);

    // ---------- Long-term goals ----------
    if (y > pageHeight - 120) { doc.addPage(); y = 60; }
    sectionHeader('Long-Term Goals', TEAL);
    const longLines = report.long_term_goals.split('\n').filter(Boolean);
    const longIntro = longLines[0] && !longLines[0].startsWith('•') ? longLines.shift() : null;
    if (longIntro) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...GREY);
      const wrapped = doc.splitTextToSize(longIntro, contentWidth);
      wrapped.forEach((line) => { doc.text(line, margin, y); y += 13; });
      y += 6;
    }
    bulletList(longLines.map((l) => l.replace(/^•\s*/, '')), TEAL);

    // ---------- Suggested action plan for class ----------
    if (report.action_plan) {
      const blocks = report.action_plan.split('\n\n').filter(Boolean);

      // Pre-measure the first block so the header is never left alone at the bottom of a page.
      if (blocks.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const [firstMain, firstExample] = blocks[0].split('\nExample: ');
        const firstMainWrapped = doc.splitTextToSize(firstMain, contentWidth - 28);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        const firstExampleWrapped = firstExample ? doc.splitTextToSize('Example: ' + firstExample, contentWidth - 28) : [];
        const firstBoxHeight = (firstMainWrapped.length + firstExampleWrapped.length) * 13 + 26;
        if (y + 20 + firstBoxHeight > pageHeight - 70) { doc.addPage(); y = 60; }
      } else if (y > pageHeight - 140) {
        doc.addPage(); y = 60;
      }

      sectionHeader('Suggested Action Plan for Class', TEAL);

      blocks.forEach((block) => {
        const [mainLine, exampleLine] = block.split('\nExample: ');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const mainWrapped = doc.splitTextToSize(mainLine, contentWidth - 28);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        const exampleWrapped = exampleLine ? doc.splitTextToSize('Example: ' + exampleLine, contentWidth - 28) : [];
        const boxHeight = (mainWrapped.length + exampleWrapped.length) * 13 + 26;

        if (y + boxHeight > pageHeight - 70) { doc.addPage(); y = 60; }
        doc.setFillColor(...TEAL_SOFT);
        doc.roundedRect(margin, y - 14, contentWidth, boxHeight, 6, 6, 'F');
        doc.setFillColor(...TEAL);
        doc.roundedRect(margin, y - 14, 5, boxHeight, 2.5, 2.5, 'F');

        let ty = y;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...TEAL);
        mainWrapped.forEach((line, idx) => {
          doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
          doc.setTextColor(...DARK);
          doc.text(line, margin + 14, ty);
          ty += 13;
        });
        if (exampleWrapped.length) {
          ty += 2;
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(...GREY);
          exampleWrapped.forEach((line) => {
            doc.text(line, margin + 14, ty);
            ty += 13;
          });
        }
        y += boxHeight + 10;
      });
    }

    // ---------- Footer on every page ----------
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setDrawColor(228, 224, 216);
      doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text('Confidential — for teaching planning purposes only.', margin, pageHeight - 26);
      doc.text(`Page ${p} of ${pageCount}`, pageWidth - margin, pageHeight - 26, { align: 'right' });
    }

    const safeName = student.full_name.replace(/[^a-z0-9]+/gi, '_');
    doc.save(`${safeName}_English_Report.pdf`);
  }

  document.getElementById('genReportBtn').addEventListener('click', async () => {
    const btn = document.getElementById('genReportBtn');
    btn.disabled = true;
    btn.textContent = 'Generating…';
    try {
      await authedCall('teacher-generate-report', { method: 'POST', body: { student_id: currentStudentId } });
      await openDetail(currentStudentId);
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate report';
    }
  });

  document.getElementById('resetBtn').addEventListener('click', async () => {
    if (!confirm('Reset this student\u2019s attempt? They will be able to take the exam again from any device.')) return;
    try {
      await authedCall('teacher-reset-attempt', { method: 'POST', body: { student_id: currentStudentId } });
      await openDetail(currentStudentId);
      loadStudents();
    } catch (err) {
      alert(err.message);
    }
  });

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ---- Restore session on load ----
  sb.auth.getSession().then(({ data }) => {
    if (data.session) {
      session = data.session;
      if (needsPasswordChange(session)) {
        showForceChange();
      } else {
        showLoggedIn();
      }
    } else {
      showLoggedOut();
    }
  });
})();
