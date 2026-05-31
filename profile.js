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
  const userGender = urlParams.get('gender') || 'male';
  const userSeeking = urlParams.get('seeking') || 'female';
  const userAge = parseInt(urlParams.get('age') || '18', 10);
  const userCity = urlParams.get('city') || '';
  const userInterestsRaw = urlParams.get('interests') || '';
  const userBio = urlParams.get('bio') || '';
  const isVerified = urlParams.get('verified') === '1' || urlParams.get('verified') === 'true';
  const isPremium = urlParams.get('premium') === '1' || urlParams.get('premium') === 'true';
  const referralLink = urlParams.get('ref_link') || '';
  const photoUrl = urlParams.get('photo_url') || '';

  // Setup elements
  const profilePhoto = document.getElementById('profilePhoto');
  const verifyBadge = document.getElementById('verifyBadge');
  const premiumBadge = document.getElementById('premiumBadge');
  const profileNameAge = document.getElementById('profileNameAge');
  const profileLocation = document.getElementById('profileLocation');
  
  const valGender = document.getElementById('valGender');
  const valSeeking = document.getElementById('valSeeking');
  const valCity = document.getElementById('valCity');
  const valInterests = document.getElementById('valInterests');
  const valBio = document.getElementById('valBio');

  const verifyProfileBtn = document.getElementById('verifyProfileBtn');
  const referralLinkInput = document.getElementById('referralLinkInput');

  // Fill in profile photo (fallback to default_avatar if none provided)
  profilePhoto.src = photoUrl || 'default_avatar.png';
  profilePhoto.onerror = () => {
    profilePhoto.src = 'default_avatar.png';
  };

  // Badges
  if (isVerified) verifyBadge.style.display = 'block';
  if (isPremium) premiumBadge.style.display = 'block';
  if (!isVerified) verifyProfileBtn.style.display = 'block';

  // Info details
  profileNameAge.textContent = `User, ${userAge || '--'}`;
  profileLocation.innerHTML = `<span class="loc-icon">📍</span> ${userCity || 'Not specified'}`;
  
  valGender.textContent = userGender.charAt(0).toUpperCase() + userGender.slice(1);
  valSeeking.textContent = userSeeking.charAt(0).toUpperCase() + userSeeking.slice(1);
  valCity.textContent = userCity || 'Not specified';
  valInterests.textContent = userInterestsRaw.replace(/,/g, ', ') || 'Not specified';
  valBio.textContent = userBio || 'Not specified';

  // Referral link
  referralLinkInput.value = referralLink || 'https://t.me/wink_dating_bot';

  // 3D Parallax Tilt Effect
  const card = document.getElementById('avatarCard');
  const scene = document.getElementById('avatarScene');

  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angleX = -(y / rect.height) * 25; // max 25 degrees tilt
    const angleY = (x / rect.width) * 25;
    card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
  });

  scene.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });

  scene.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = scene.getBoundingClientRect();
      const x = touch.clientX - rect.left - rect.width / 2;
      const y = touch.clientY - rect.top - rect.height / 2;
      const angleX = -(y / rect.height) * 20;
      const angleY = (x / rect.width) * 20;
      card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    }
  });

  scene.addEventListener('touchend', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });

  // Share Copy Button Action
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const copySuccessMsg = document.getElementById('copySuccessMsg');

  copyLinkBtn.addEventListener('click', () => {
    referralLinkInput.select();
    referralLinkInput.setSelectionRange(0, 99999);
    try {
      navigator.clipboard.writeText(referralLinkInput.value);
      copySuccessMsg.style.display = 'block';
      setTimeout(() => {
        copySuccessMsg.style.display = 'none';
      }, 3000);
    } catch (err) {
      // Fallback
      alert('Could not copy link automatically, please select and copy it manually!');
    }
  });

  // Verify Account Action
  verifyProfileBtn.addEventListener('click', () => {
    const payload = { action: 'verify_request' };
    if (tg) {
      tg.sendData(JSON.stringify(payload));
      tg.close();
    } else {
      console.log('Sending mock verify request payload:', payload);
      alert('Verification request sent. Open in Telegram to proceed.');
    }
  });

  // Edit / Cancel Buttons Setup
  const profileViewScreen = document.getElementById('profileViewScreen');
  const profileEditScreen = document.getElementById('profileEditScreen');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  // Form elements
  const editGender = document.getElementById('editGender');
  const editSeeking = document.getElementById('editSeeking');
  const editAge = document.getElementById('editAge');
  const editCity = document.getElementById('editCity');
  const editCityCustom = document.getElementById('editCityCustom');
  const interestsTagsContainer = document.getElementById('interestsTagsContainer');
  const editBio = document.getElementById('editBio');
  const bioCharCount = document.getElementById('bioCharCount');

  // Interest Presets
  const interestPresets = ['Gaming', 'Coding', 'Music', 'Movies', 'Fitness', 'Travel', 'Food', 'Art', 'Books', 'Anime'];
  let selectedInterests = userInterestsRaw ? userInterestsRaw.split(',') : [];

  // Toggle custom city field based on 'Other'
  editCity.addEventListener('change', () => {
    if (editCity.value === 'Other') {
      editCityCustom.style.display = 'block';
    } else {
      editCityCustom.style.display = 'none';
    }
  });

  // Update bio character count
  editBio.addEventListener('input', () => {
    bioCharCount.textContent = editBio.value.length;
  });

  // Populate Interest tags
  const renderInterestTags = () => {
    interestsTagsContainer.innerHTML = '';
    interestPresets.forEach(tag => {
      const chip = document.createElement('div');
      chip.className = 'interest-tag';
      chip.textContent = tag;
      if (selectedInterests.includes(tag)) {
        chip.classList.add('selected');
      }
      
      chip.addEventListener('click', () => {
        if (selectedInterests.includes(tag)) {
          selectedInterests = selectedInterests.filter(t => t !== tag);
          chip.classList.remove('selected');
        } else {
          if (selectedInterests.length >= 5) {
            if (tg) {
              tg.showAlert('You can select a maximum of 5 interests!');
            } else {
              alert('You can select a maximum of 5 interests!');
            }
            return;
          }
          selectedInterests.push(tag);
          chip.classList.add('selected');
        }
      });
      interestsTagsContainer.appendChild(chip);
    });
  };

  // Open Edit Mode
  editProfileBtn.addEventListener('click', () => {
    // Populate fields
    editGender.value = userGender;
    editSeeking.value = userSeeking;
    editAge.value = userAge || 18;
    
    // Check if city matches presets
    const cityPresets = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];
    if (cityPresets.includes(userCity)) {
      editCity.value = userCity;
      editCityCustom.style.display = 'none';
    } else if (userCity) {
      editCity.value = 'Other';
      editCityCustom.value = userCity;
      editCityCustom.style.display = 'block';
    } else {
      editCity.value = 'Mumbai';
      editCityCustom.style.display = 'none';
    }

    selectedInterests = userInterestsRaw ? userInterestsRaw.split(',') : [];
    renderInterestTags();

    editBio.value = userBio;
    bioCharCount.textContent = userBio.length;

    // View swap
    profileViewScreen.style.display = 'none';
    profileEditScreen.style.display = 'block';
  });

  // Cancel Edit Mode
  cancelEditBtn.addEventListener('click', () => {
    profileViewScreen.style.display = 'block';
    profileEditScreen.style.display = 'none';
  });

  // Save changes and submit via WebApp sendData
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  saveProfileBtn.addEventListener('click', () => {
    const age = parseInt(editAge.value, 10);
    if (isNaN(age) || age < 18 || age > 99) {
      if (tg) tg.showAlert('Please enter a valid age between 18 and 99!');
      else alert('Please enter a valid age between 18 and 99!');
      return;
    }

    let city = editCity.value;
    if (city === 'Other') {
      city = editCityCustom.value.trim();
      if (!city) {
        if (tg) tg.showAlert('Please specify your custom city name!');
        else alert('Please specify your custom city name!');
        return;
      }
    }

    if (selectedInterests.length === 0) {
      if (tg) tg.showAlert('Please select at least 1 interest!');
      else alert('Please select at least 1 interest!');
      return;
    }

    const bio = editBio.value.trim();
    if (bio.length < 3 || bio.length > 100) {
      if (tg) tg.showAlert('Bio must be between 3 and 100 characters!');
      else alert('Bio must be between 3 and 100 characters!');
      return;
    }

    const payload = {
      action: 'edit_profile',
      gender: editGender.value,
      seeking: editSeeking.value,
      age: age,
      city: city,
      interests: selectedInterests.join(','),
      bio: bio
    };

    if (tg) {
      tg.sendData(JSON.stringify(payload));
      tg.close();
    } else {
      console.log('Sending mock edit profile payload:', payload);
      alert('Profile updated. Open inside Telegram to save.');
    }
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
