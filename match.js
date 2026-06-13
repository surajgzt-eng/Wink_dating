document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); }

  const urlParams = new URLSearchParams(window.location.search);
  const apiURL = urlParams.get('api_url') || '';
  const myName = urlParams.get('myName') || 'You';
  const partnerName = urlParams.get('partnerName') || 'Someone';
  const myPhoto = urlParams.get('myPhoto') || '';
  const partnerPhoto = urlParams.get('partnerPhoto') || '';

  document.getElementById('myAvatar').src = myPhoto || 'default_avatar.png';
  document.getElementById('partnerAvatar').src = partnerPhoto || 'default_avatar.png';
  document.getElementById('namesEl').innerHTML = `${escapeHtml(myName)} &amp; ${escapeHtml(partnerName)}`;

  document.getElementById('viewMatchesBtn').addEventListener('click', () => {
    window.location.href = `matches.html?api_url=${encodeURIComponent(apiURL)}`;
  });
});

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
