const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const messageBox = document.getElementById('message');
const dashboard = document.getElementById('dashboard');
const authCard = document.getElementById('authCard');
const welcomeText = document.getElementById('welcomeText');
const statsGrid = document.getElementById('statsGrid');
const activityList = document.getElementById('activityList');
const logoutBtn = document.getElementById('logoutBtn');

function setMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.classList.toggle('error', isError);
}

function switchView(view) {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === `${view}Form`));
  setMessage('');
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function renderDashboard(data) {
  const { profile, stats, activity } = data;

  authCard.classList.add('hidden');
  dashboard.classList.remove('hidden');
  welcomeText.textContent = `WELCOME, ${profile.username.toUpperCase()}`;

  statsGrid.innerHTML = '';
  Object.entries(stats).forEach(([key, value]) => {
    const box = document.createElement('article');
    box.className = 'stat-box';
    box.innerHTML = `<h4>${key.toUpperCase()}</h4><p>${value}</p>`;
    statsGrid.appendChild(box);
  });

  activityList.innerHTML = '';
  if (!activity.length) {
    activityList.innerHTML = '<li>No activity yet. Start your first quest!</li>';
    return;
  }

  activity.forEach((entry) => {
    const item = document.createElement('li');
    const date = new Date(entry.created_at).toLocaleString();
    item.textContent = `${entry.event_text} • ${date}`;
    activityList.appendChild(item);
  });
}

async function loadDashboard() {
  const data = await apiRequest('/api/dashboard');
  renderDashboard(data);
}

async function checkSession() {
  try {
    const me = await apiRequest('/api/me', { method: 'GET' });
    if (me.authenticated) {
      await loadDashboard();
    }
  } catch (error) {
    setMessage(error.message, true);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await apiRequest('/api/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setMessage('Account created. Loading dashboard...');
    signupForm.reset();
    await loadDashboard();
  } catch (error) {
    setMessage(error.message, true);
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setMessage('Login success!');
    loginForm.reset();
    await loadDashboard();
  } catch (error) {
    setMessage(error.message, true);
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await apiRequest('/api/logout', { method: 'POST' });
    dashboard.classList.add('hidden');
    authCard.classList.remove('hidden');
    switchView('login');
    setMessage('Logged out. See you soon, ranger!');
  } catch (error) {
    setMessage(error.message, true);
  }
});

checkSession();
