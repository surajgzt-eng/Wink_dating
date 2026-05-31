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
  let currentUploadedPhotoUrl = photoUrl;
  const apiURL = urlParams.get('api_url') || '';

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
    if (tg && tg.initDataUnsafe?.query_id) {
      tg.showAlert("⚠️ Verification can only be started when you open your profile from the bottom keyboard menu button (👤 My Profile 3D) in the bot chat.\n\nPlease close this window, ensure you see the chat menu keyboard, and tap '👤 My Profile 3D' to proceed!");
      return;
    }
    const payload = { action: 'verify_request' };
    if (tg) {
      tg.sendData(JSON.stringify(payload));
    } else {
      console.log('Sending mock verify request payload:', payload);
      alert('Verification request sent. Open in Telegram to proceed.');
    }
  });

  // Change Photo Action
  const changePhotoBtn = document.getElementById('changePhotoBtn');
  const photoInput = document.getElementById('photoInput');

  changePhotoBtn.addEventListener('click', () => {
    photoInput.click();
  });

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      if (tg) tg.showAlert('⚠️ Image file size must be less than 5MB!');
      else alert('⚠️ Image file size must be less than 5MB!');
      return;
    }

    const originalText = changePhotoBtn.textContent;
    changePhotoBtn.disabled = true;
    changePhotoBtn.textContent = '⏳ Uploading...';

    try {
      const formData = new FormData();
      formData.append('file', file);

      let uploadedUrl = '';
      let success = false;

      // Try uploading via our backend proxy first if apiURL is provided
      if (apiURL) {
        try {
          const response = await fetch(`${apiURL}/api/upload`, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            if (result && result.url) {
              uploadedUrl = result.url;
              success = true;
            }
          }
        } catch (proxyErr) {
          console.warn('Backend proxy upload failed, attempting fallback...', proxyErr);
        }
      }

      // Fallback: Upload to tmpfiles.org (temporary 24h upload) if proxy failed or wasn't provided
      if (!success) {
        try {
          const response = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            if (result && result.data && result.data.url) {
              uploadedUrl = result.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
              success = true;
              console.log('Uploaded successfully to temporary fallback storage:', uploadedUrl);
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback upload also failed:', fallbackErr);
        }
      }

      if (success && uploadedUrl) {
        currentUploadedPhotoUrl = uploadedUrl;
        profilePhoto.src = uploadedUrl;
        if (tg) tg.showAlert('✨ Photo uploaded successfully! Remember to tap "Save Changes" at the bottom of the page to save your updated profile.');
        else alert('✨ Photo uploaded successfully!');
      } else {
        throw new Error('All upload endpoints failed. Please check your network or try again.');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      if (tg) {
        tg.showAlert('⚠️ Failed to upload image. Please try another photo or try again later.');
      } else {
        alert('⚠️ Failed to upload image: ' + err.message);
      }
    } finally {
      changePhotoBtn.disabled = false;
      changePhotoBtn.textContent = originalText;
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
    if (tg && tg.initDataUnsafe?.query_id) {
      tg.showAlert("⚠️ Your profile changes cannot be saved because this window was opened from an inline button.\n\nTo save changes, you MUST open your profile by tapping the bottom keyboard menu button (👤 My Profile 3D) in the bot chat.\n\nPlease close this window and try again using the bottom menu!");
      return;
    }
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
      bio: bio,
      photo_url: currentUploadedPhotoUrl
    };

    if (tg) {
      tg.sendData(JSON.stringify(payload));
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
