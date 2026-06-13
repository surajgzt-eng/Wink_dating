document.addEventListener('DOMContentLoaded', async () => {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); }

  const urlParams = new URLSearchParams(window.location.search);
  const apiURL = urlParams.get('api_url') || '';
  const apiBase = apiURL ? apiURL.replace(/\/+$/, '') : '';

  await loadMatches();

  async function loadMatches() {
    const listEl = document.getElementById('matchesList');
    try {
      const initData = tg?.initData || '';
      const res = await fetch(`${apiBase}/api/matches`, {
        headers: { 'Authorization': `tma ${initData}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.matches || data.matches.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state">
            <div class="icon">💔</div>
            <h3>No matches yet</h3>
            <p>Keep swiping in Telegram to find your match!</p>
          </div>`;
        return;
      }

      listEl.innerHTML = data.matches.map(m => `
        <div class="match-card" onclick="openChat(${m.partnerId}, '${escapeStr(m.name)}', '${escapeStr(apiBase)}')">
          <img class="match-photo" src="${m.photo || 'default_avatar.png'}"
               onerror="this.src='default_avatar.png'" alt="${escapeStr(m.name)}">
          <div class="match-info">
            <div class="match-name">${escapeStr(m.name)} ${m.isVerified ? '✅' : ''}</div>
            <div class="match-meta">${m.age ? m.age + 'yrs' : ''}${m.age && m.gender ? ' · ' : ''}${m.gender || ''}${m.city ? ' · ' + escapeStr(m.city) : ''}</div>
          </div>
          <div class="match-arrow">›</div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load matches:', err);
      listEl.innerHTML = `<div class="empty-state"><p>⚠️ Couldn't load matches. Make sure you're opening from Telegram.</p></div>`;
    }
  }
});

function escapeStr(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function openChat(partnerId, partnerName, apiBase) {
  window.location.href = `chat.html?partnerId=${partnerId}&partnerName=${encodeURIComponent(partnerName)}&api_url=${encodeURIComponent(apiBase)}`;
}
