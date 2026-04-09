const signupForm = document.getElementById('signupForm');
const msg = document.getElementById('msg');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = Object.fromEntries(new FormData(signupForm).entries());

  try {
    await apiRequest('/api/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setMessage(msg, 'Account created! Redirecting to dashboard...');
    window.location.href = '/dashboard.html';
  } catch (error) {
    setMessage(msg, error.message, true);
  }
});
