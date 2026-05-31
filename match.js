document.addEventListener('DOMContentLoaded', () => {
  // Initialize Telegram WebApp
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0f081d');
  }

  // Parse query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const myName = urlParams.get('myName') || 'You';
  const partnerName = urlParams.get('partnerName') || 'Someone';
  const myPhoto = urlParams.get('myPhoto') || '';
  const partnerPhoto = urlParams.get('partnerPhoto') || '';

  // DOM Elements
  const myAvatarEl = document.getElementById('myAvatar');
  const partnerAvatarEl = document.getElementById('partnerAvatar');
  const myNameLabelEl = document.getElementById('myNameLabel');
  const partnerNameLabelEl = document.getElementById('partnerNameLabel');
  const chatNowBtn = document.getElementById('chatNowBtn');

  // Update names
  myNameLabelEl.textContent = myName;
  partnerNameLabelEl.textContent = partnerName;

  // Set avatars (with default fallback)
  myAvatarEl.src = myPhoto || 'default_avatar.png';
  myAvatarEl.onerror = () => {
    myAvatarEl.src = 'default_avatar.png';
  };

  partnerAvatarEl.src = partnerPhoto || 'default_avatar.png';
  partnerAvatarEl.onerror = () => {
    partnerAvatarEl.src = 'default_avatar.png';
  };

  // Close webapp on click
  chatNowBtn.addEventListener('click', () => {
    if (tg) {
      tg.close();
    } else {
      window.close();
    }
  });

  // Confetti Particle System
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = [
    '#9333ea', // primary purple
    '#ec4899', // secondary pink
    '#eab308', // gold accent
    '#3b82f6', // blue
    '#10b981', // green
    '#ff4d4d'  // red
  ];

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height - 20;
      this.size = Math.random() * 8 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speed = Math.random() * 3 + 2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
      this.wobble = Math.random() * 2;
      this.wobbleSpeed = Math.random() * 0.05;
    }

    update() {
      this.y += this.speed;
      this.rotation += this.rotationSpeed;
      this.x += Math.sin(this.wobble) * 0.5;
      this.wobble += this.wobbleSpeed;

      // Reset particles that fall off bottom
      if (this.y > height) {
        this.y = Math.random() * -20 - 10;
        this.x = Math.random() * width;
        this.speed = Math.random() * 3 + 2;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      
      // Random shape: rectangle or square
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
      
      ctx.restore();
    }
  }

  const particles = [];
  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    particles.push(new ConfettiParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  // Start confetti animation
  animate();
});
