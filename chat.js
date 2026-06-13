document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); }

  const urlParams = new URLSearchParams(window.location.search);
  const partnerId = urlParams.get('partnerId');
  const partnerName = decodeURIComponent(urlParams.get('partnerName') || 'Partner');
  const apiURL = urlParams.get('api_url') || '';
  const apiBase = apiURL ? apiURL.replace(/\/+$/, '') : '';

  if (!partnerId) {
    document.getElementById('messagesArea').innerHTML = `<div class="empty-chat"><div class="icon">⚠️</div><p>No partner specified.</p></div>`;
    return;
  }

  const partnerNameEl = document.getElementById('partnerNameEl');
  const partnerPhoto = document.getElementById('partnerPhoto');
  const messagesArea = document.getElementById('messagesArea');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');
  const backBtn = document.getElementById('backBtn');

  partnerNameEl.textContent = partnerName;

  // Back button → matches list
  backBtn.addEventListener('click', () => {
    window.location.href = 'matches.html' + (apiURL ? `?api_url=${encodeURIComponent(apiURL)}` : '');
  });

  // Load partner photo
  const initData = tg?.initData || '';
  fetch(`${apiBase}/api/matches`, { headers: { 'Authorization': `tma ${initData}` } })
    .then(r => r.json())
    .then(data => {
      const match = data.matches?.find(m => m.partnerId == partnerId);
      if (match && match.photo) partnerPhoto.src = match.photo;
    }).catch(() => {});

  backBtn.addEventListener('click', () => {
    window.location.href = `matches.html?api_url=${encodeURIComponent(apiBase)}`;
  });

  function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async function loadMessages() {
    try {
      const res = await fetch(`${apiBase}/api/messages/${partnerId}`, {
        headers: { 'Authorization': `tma ${initData}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.messages || data.messages.length === 0) {
        messagesArea.innerHTML = `
          <div class="empty-chat">
            <div class="icon">💬</div>
            <p>No messages yet. Say hi! 👋</p>
          </div>`;
        return;
      }

      messagesArea.innerHTML = data.messages.map(m => {
        const isOwn = m.sender_id != partnerId;
        return `<div class="msg-bubble ${isOwn ? 'own' : 'other'}">
          ${escapeHtml(m.content)}
          <div class="msg-time">${formatTime(m.created_at)}</div>
        </div>`;
      }).join('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  async function sendMessage() {
    const content = msgInput.value.trim();
    if (!content) return;
    sendBtn.disabled = true;
    msgInput.value = '';
    try {
      const res = await fetch(`${apiBase}/api/messages/${partnerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `tma ${initData}` },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadMessages();
    } catch (err) {
      console.error('Failed to send:', err);
      msgInput.value = content;
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  loadMessages();
  setInterval(loadMessages, 3000);
});
