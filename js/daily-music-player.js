/**
 * Daily Music Player - Vinyl Record Player with NetEase Playlist Integration
 */
(function() {
  'use strict';

  function initDailyMusic() {
    const data = window.BLOG_PLAYLIST_DATA;
    if (!data || !data.songs || data.songs.length === 0) {
      console.warn('Daily Music: No playlist data found.');
      return;
    }

    const songs = data.songs;
    const totalSongs = songs.length;

    // Elements
    const card = document.getElementById('card-music');
    if (!card) return;

    const audio = document.getElementById('music-audio');
    const vinylDisc = document.getElementById('music-vinyl-disc');
    const vinylCover = document.getElementById('music-vinyl-cover');
    const tonearm = document.getElementById('music-tonearm');
    const titleEl = document.getElementById('music-title');
    const artistEl = document.getElementById('music-artist');
    const tagEl = document.getElementById('music-tag');
    const neteaseLink = document.getElementById('music-netease-link');
    const playBtn = document.getElementById('music-play-btn');
    const playIcon = playBtn ? playBtn.querySelector('i') : null;
    const prevBtn = document.getElementById('music-prev-btn');
    const nextBtn = document.getElementById('music-next-btn');
    const randomBtn = document.getElementById('music-random-btn');
    const progressWrap = document.getElementById('music-progress-wrap');
    const progressBar = document.getElementById('music-progress-bar');
    const curTimeEl = document.getElementById('music-cur-time');
    const durTimeEl = document.getElementById('music-dur-time');
    const drawerToggle = document.getElementById('music-drawer-toggle');
    const drawerList = document.getElementById('music-drawer-list');
    const drawerCount = document.getElementById('music-drawer-count');

    if (!audio) return;

    // Date-based daily song index
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    let hash = 0;
    const seed = dateStr + '_daily_netease_music_v1';
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const todayDefaultIndex = Math.abs(hash) % totalSongs;

    let currentIndex = todayDefaultIndex;
    let isPlaying = false;
    let isUserSeeking = false;

    // Format mm:ss
    function formatTime(sec) {
      if (isNaN(sec) || sec < 0) return '00:00';
      const mins = Math.floor(sec / 60);
      const secs = Math.floor(sec % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Populate drawer list
    if (drawerCount) drawerCount.textContent = `(${totalSongs}首)`;
    if (drawerList) {
      drawerList.innerHTML = songs.map((s, idx) => `
        <div class="music-list-item ${idx === currentIndex ? 'active' : ''}" data-index="${idx}">
          <span class="ml-index">${idx + 1}</span>
          <div class="ml-info">
            <div class="ml-title" title="${s.title}">${s.title}</div>
            <div class="ml-artist" title="${s.artist}">${s.artist}</div>
          </div>
          <span class="ml-wave-icon"><i class="fas fa-play"></i></span>
        </div>
      `).join('');

      drawerList.addEventListener('click', (e) => {
        const item = e.target.closest('.music-list-item');
        if (item) {
          const idx = parseInt(item.getAttribute('data-index'), 10);
          if (!isNaN(idx)) {
            loadSong(idx, true);
          }
        }
      });
    }

    // Load song details
    function loadSong(index, autoPlay = false) {
      currentIndex = (index + totalSongs) % totalSongs;
      const song = songs[currentIndex];

      if (titleEl) {
        titleEl.textContent = song.title;
        titleEl.title = song.title;
      }
      if (artistEl) {
        artistEl.textContent = song.artist + (song.album ? ` · 《${song.album}》` : '');
        artistEl.title = artistEl.textContent;
      }
      if (vinylCover) {
        vinylCover.src = song.cover || 'img/author.jpg';
      }
      if (tagEl) {
        tagEl.textContent = (currentIndex === todayDefaultIndex) ? '🌟 今日之选' : `🎵 第 ${currentIndex + 1} 首`;
      }
      if (neteaseLink) {
        neteaseLink.href = `https://music.163.com/#/song?id=${song.id}`;
      }

      // Update active item in drawer
      if (drawerList) {
        const items = drawerList.querySelectorAll('.music-list-item');
        items.forEach((it, i) => {
          it.classList.toggle('active', i === currentIndex);
        });
        const activeItem = drawerList.querySelector('.music-list-item.active');
        if (activeItem && drawerList.style.display === 'block') {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      audio.src = song.url;
      audio.load();

      if (progressBar) progressBar.style.width = '0%';
      if (curTimeEl) curTimeEl.textContent = '00:00';
      if (durTimeEl) durTimeEl.textContent = '00:00';

      if (autoPlay) {
        play();
      } else {
        pause();
      }
    }

    function play() {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayStateUI();
      }).catch(err => {
        console.warn('Playback prevented or failed:', err);
        pause();
      });
    }

    function pause() {
      audio.pause();
      isPlaying = false;
      updatePlayStateUI();
    }

    function updatePlayStateUI() {
      if (playIcon) {
        playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
      }
      if (vinylDisc) {
        vinylDisc.classList.toggle('spinning', isPlaying);
      }
      if (tonearm) {
        tonearm.classList.toggle('playing', isPlaying);
      }
    }

    // Controls
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        loadSong(currentIndex + 1, true);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        loadSong(currentIndex - 1, true);
      });
    }

    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * totalSongs);
        } while (nextIdx === currentIndex && totalSongs > 1);
        loadSong(nextIdx, true);
      });
    }

    // Progress Bar
    audio.addEventListener('timeupdate', () => {
      if (isUserSeeking || isNaN(audio.duration) || audio.duration === 0) return;
      const progress = (audio.currentTime / audio.duration) * 100;
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (curTimeEl) curTimeEl.textContent = formatTime(audio.currentTime);
      if (durTimeEl) durTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('loadedmetadata', () => {
      if (durTimeEl) durTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
      // Auto-advance to next song
      loadSong(currentIndex + 1, true);
    });

    // Error handling (e.g. VIP copyright limitation on outer URL)
    audio.addEventListener('error', (e) => {
      console.warn('Audio playback error on track:', songs[currentIndex].title, e);
      if (titleEl) {
        titleEl.textContent = `${songs[currentIndex].title} (外链受限，自动切换...)`;
      }
      setTimeout(() => {
        loadSong(currentIndex + 1, isPlaying);
      }, 1500);
    });

    // Seek Click
    if (progressWrap) {
      progressWrap.addEventListener('click', (e) => {
        if (isNaN(audio.duration) || audio.duration === 0) return;
        const rect = progressWrap.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        audio.currentTime = ratio * audio.duration;
        if (progressBar) progressBar.style.width = `${ratio * 100}%`;
      });
    }

    // Drawer toggle
    if (drawerToggle && drawerList) {
      drawerToggle.addEventListener('click', () => {
        const isHidden = drawerList.style.display === 'none';
        drawerList.style.display = isHidden ? 'block' : 'none';
        const icon = drawerToggle.querySelector('.drawer-arrow');
        if (icon) {
          icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      });
    }

    // Initial load
    loadSong(todayDefaultIndex, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDailyMusic);
  } else {
    initDailyMusic();
  }
})();
