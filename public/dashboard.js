const welcome = document.getElementById('welcome');
const statsContainer = document.getElementById('stats');
const activityList = document.getElementById('activityList');
const logoutBtn = document.getElementById('logoutBtn');

function renderStats(stats) {
  statsContainer.innerHTML = '';
  Object.entries(stats).forEach(([name, value]) => {
    const tile = document.createElement('div');
    tile.className = 'stat-box';
    tile.innerHTML = `<div>${name.toUpperCase()}</div><div>${value}</div>`;
    statsContainer.appendChild(tile);
  });
}

function renderActivity(activity) {
  activityList.innerHTML = '';

  if (!activity.length) {
    const li = document.createElement('li');
    li.textContent = 'No events yet.';
    activityList.appendChild(li);
    return;
  }

  activity.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.event_text} (${new Date(item.created_at).toLocaleString()})`;
    activityList.appendChild(li);
  });
}

async function loadDashboard() {
  try {
    const me = await apiRequest('/api/me', { method: 'GET' });
    if (!me.authenticated) {
      window.location.href = '/login.html';
      return;
    }

    const data = await apiRequest('/api/dashboard', { method: 'GET' });
    welcome.textContent = `Welcome, ${data.profile.username}!`;
    renderStats(data.stats);
    renderActivity(data.activity);
  } catch (error) {
    welcome.textContent = 'Could not load dashboard.';
  }
}

logoutBtn.addEventListener('click', async () => {
  try {
    await apiRequest('/api/logout', { method: 'POST' });
  } finally {
    window.location.href = '/login.html';
  }
});

loadDashboard();
