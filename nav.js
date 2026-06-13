// Shared bottom navigation — call injectBottomNav('activePage') at DOMContentLoaded
function injectBottomNav(activePage) {
  const tg = window.Telegram?.WebApp;
  const urlParams = new URLSearchParams(window.location.search);
  const apiURL = urlParams.get('api_url') || '';

  const nav = document.createElement('div');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <button class="bottom-nav-item ${activePage === 'profile' ? 'active' : ''}" data-page="profile.html">
      <span class="nav-icon">👤</span>
      <span>Profile</span>
    </button>
    <button class="bottom-nav-item ${activePage === 'matches' ? 'active' : ''}" data-page="matches.html">
      <span class="nav-icon">💕</span>
      <span>Matches</span>
    </button>
    <button class="bottom-nav-item ${activePage === 'premium' ? 'active' : ''}" data-page="premium.html">
      <span class="nav-icon">⭐</span>
      <span>Premium</span>
    </button>
  `;

  nav.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.page) {
        window.location.href = btn.dataset.page + (apiURL ? `?api_url=${encodeURIComponent(apiURL)}` : '');
      }
    });
  });

  document.body.appendChild(nav);

  // Add padding for nav bar (unless body already has page-with-nav)
  if (!document.body.classList.contains('page-with-nav')) {
    document.body.classList.add('page-with-nav');
  }
}
