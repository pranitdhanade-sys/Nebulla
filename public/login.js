const loginForm = document.getElementById('loginForm');
const msg = document.getElementById('msg');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = Object.fromEntries(new FormData(loginForm).entries());

  try {
    await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setMessage(msg, 'Login successful! Redirecting...');
    window.location.href = '/dashboard.html';
  } catch (error) {
    setMessage(msg, error.message, true);
  }
});
