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
  const partnerId = urlParams.get('partnerId') || '';
  const flash = urlParams.get('flash') === '1' || urlParams.get('flash') === 'true';
  const remainingMsgs = parseInt(urlParams.get('remaining') || '0', 10);

  // Setup single chat unlock section
  const singleUnlockSec = document.getElementById('singleUnlockSec');
  const singleUnlockBtn = document.getElementById('singleUnlockBtn');
  
  if (partnerId) {
    singleUnlockSec.style.display = 'block';
    singleUnlockBtn.textContent = `🔑 Unlock this chat only — ₹19`;
  } else {
    // If not matching, we don't display single-chat unlock option
    singleUnlockSec.style.display = 'none';
  }

  // Handle flash sale setup
  const flashSaleBanner = document.getElementById('flashSaleBanner');
  const flashCountdown = document.getElementById('flashCountdown');
  
  const monthlyPriceLabel = document.getElementById('monthlyPriceLabel');
  const monthlyPriceDetail = document.getElementById('monthlyPriceDetail');

  if (flash) {
    flashSaleBanner.style.display = 'flex';
    // Modify monthly card front price dynamically to reflect flash sale
    if (monthlyPriceLabel) monthlyPriceLabel.textContent = '₹59';
    if (monthlyPriceDetail) monthlyPriceDetail.textContent = '• ₹1.90 per day (Flash Sale)';
    
    // Manage flash sale timer in localStorage to make it persistent per-user session
    const timerKey = 'wynk_flash_sale_timer';
    let timeLeft = parseInt(localStorage.getItem(timerKey) || '300', 10);
    
    // Restart timer if invalid
    if (isNaN(timeLeft) || timeLeft <= 0) {
      timeLeft = 300;
    }

    const updateTimerDisplay = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      flashCountdown.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    updateTimerDisplay();

    const interval = setInterval(() => {
      timeLeft--;
      localStorage.setItem(timerKey, timeLeft.toString());
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(interval);
        // Hide flash sale
        flashSaleBanner.style.display = 'none';
        if (monthlyPriceLabel) monthlyPriceLabel.textContent = '₹199';
        if (monthlyPriceDetail) monthlyPriceDetail.textContent = '• ₹6.60 per day';
        localStorage.removeItem(timerKey);
      }
    }, 1000);
  } else {
    flashSaleBanner.style.display = 'none';
  }

  // Card Flip / Interaction Logic
  const planCards = document.querySelectorAll('.plan-card-wrapper');
  planCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking the button inside the back card, let the button click event handle it
      if (e.target.classList.contains('select-plan-btn')) {
        return;
      }
      
      // Toggle card flip
      card.classList.toggle('flipped');
      
      // Close other flipped cards
      planCards.forEach(otherCard => {
        if (otherCard !== card && otherCard.classList.contains('flipped')) {
          otherCard.classList.remove('flipped');
        }
      });
    });
  });

  // Action Helpers: send data back to bot
  const sendPurchaseAction = (planName, targetPartnerId = '') => {
    const payload = {
      action: 'purchase',
      plan: planName,
      partnerId: targetPartnerId
    };
    
    if (tg) {
      tg.sendData(JSON.stringify(payload));
      tg.close();
    } else {
      console.log('Sending mock purchase payload:', payload);
      alert(`Plan selected: ${planName}. Open inside Telegram to pay.`);
    }
  };

  // Bind Select Buttons (Back Side of Cards)
  const selectButtons = document.querySelectorAll('.select-plan-btn');
  selectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card from flipping back
      const plan = btn.getAttribute('data-plan');
      
      // If monthly plan selected during flash sale, it's a flash sale purchase
      let finalPlan = plan;
      if (plan === 'monthly' && flash) {
        finalPlan = 'flash_sale';
      }
      
      sendPurchaseAction(finalPlan);
    });
  });

  // Bind Single Chat Unlock Button
  singleUnlockBtn.addEventListener('click', () => {
    sendPurchaseAction('single', partnerId);
  });

  // Close Button
  document.getElementById('closeBtn').addEventListener('click', () => {
    if (tg) {
      tg.close();
    } else {
      window.close();
    }
  });
});
