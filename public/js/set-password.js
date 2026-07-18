(function () {
  const sb = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);

  const loadingCard = document.getElementById('loadingCard');
  const formCard = document.getElementById('formCard');
  const invalidCard = document.getElementById('invalidCard');
  const successCard = document.getElementById('successCard');
  const welcomeMsg = document.getElementById('welcomeMsg');
  const errorBox = document.getElementById('errorBox');

  function show(card) {
    [loadingCard, formCard, invalidCard, successCard].forEach((c) => { c.style.display = 'none'; });
    card.style.display = 'block';
  }

  function showForm(session) {
    welcomeMsg.textContent = session.user?.email
      ? `Welcome, ${session.user.email}. Choose a password to finish setting up your teacher account.`
      : 'Choose a password to finish setting up your teacher account.';
    show(formCard);
  }

  let resolved = false;

  sb.auth.onAuthStateChange((event, session) => {
    if (session && !resolved) {
      resolved = true;
      showForm(session);
    }
  });

  sb.auth.getSession().then(({ data }) => {
    if (data.session && !resolved) {
      resolved = true;
      showForm(data.session);
    } else if (!resolved) {
      setTimeout(async () => {
        if (resolved) return;
        const { data: data2 } = await sb.auth.getSession();
        if (data2.session) {
          resolved = true;
          showForm(data2.session);
        } else {
          resolved = true;
          show(invalidCard);
        }
      }, 1500);
    }
  });

  function wireToggle(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Hide' : 'Show';
    });
  }
  wireToggle('pass1', 'toggle1');
  wireToggle('pass2', 'toggle2');

  document.getElementById('setPassForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const pass1 = document.getElementById('pass1').value;
    const pass2 = document.getElementById('pass2').value;

    if (pass1 !== pass2) {
      errorBox.textContent = "Passwords don't match.";
      errorBox.style.display = 'block';
      return;
    }
    if (pass1.length < 8) {
      errorBox.textContent = 'Password must be at least 8 characters.';
      errorBox.style.display = 'block';
      return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving\u2026';

    const { error } = await sb.auth.updateUser({ password: pass1 });

    if (error) {
      errorBox.textContent = error.message;
      errorBox.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Set password and continue';
      return;
    }

    show(successCard);
  });
})();
