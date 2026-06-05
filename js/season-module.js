/**
 * Seasonal Theme Module
 * Detects season by date + allows manual switching
 */
const SeasonManager = (() => {
  const SEASONS = {
    spring: { months: [2, 3, 4], icon: '🌸', label: '春', banner: 'img/banner-spring.jpg' },    // 3-5月
    summer: { months: [5, 6, 7], icon: '☀️', label: '夏', banner: 'img/banner-summer.jpg' },    // 6-8月
    autumn: { months: [8, 9, 10], icon: '🍂', label: '秋', banner: 'img/banner-autumn.jpg' },    // 9-11月
    winter: { months: [11, 0, 1], icon: '❄️', label: '冬', banner: 'img/banner-winter.jpg' },   // 12-2月
  };

  const STORAGE_KEY = 'season-theme';

  function detectSeason() {
    const month = new Date().getMonth(); // 0-11
    for (const [key, s] of Object.entries(SEASONS)) {
      if (s.months.includes(month)) return key;
    }
    return 'spring';
  }

  function getSeason() {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Only return a specific season if it's a valid key (not 'auto')
    if (saved && saved !== 'auto' && SEASONS[saved]) return saved;
    return 'auto';
  }

  function getActiveSeason() {
    const choice = getSeason();
    return choice === 'auto' ? detectSeason() : choice;
  }

  function applySeason(season) {
    const root = document.documentElement;
    root.setAttribute('data-season', season);

    const info = SEASONS[season];
    if (!info) return;

    // Update background images
    const bgEl = document.getElementById('web_bg');
    const header = document.getElementById('page-header');
    const footer = document.getElementById('footer');

    [bgEl, header, footer].forEach(el => {
      if (el) el.style.backgroundImage = `url(${info.banner})`;
    });
  }

  function setSeason(season) {
    if (season === 'auto') {
      localStorage.setItem(STORAGE_KEY, 'auto');
    } else {
      localStorage.setItem(STORAGE_KEY, season);
    }
    applySeason(getActiveSeason());
    updateSwitcherUI();
  }

  function updateSwitcherUI() {
    const choice = getSeason();
    const active = getActiveSeason();

    document.querySelectorAll('.season-btn').forEach(btn => {
      const val = btn.dataset.season;
      btn.classList.toggle('active', val === choice || (choice === 'auto' && val === 'auto'));
    });

    // Update auto button tooltip to show detected season
    const autoBtn = document.querySelector('.season-btn[data-season="auto"]');
    if (autoBtn) {
      const info = SEASONS[active];
      autoBtn.title = `自动 (${info.icon}${info.label})`;
    }
  }

  function injectSwitcher() {
    // Try existing container first (index page)
    let container = document.getElementById('rightside-config-hide');
    
    // If no container exists (article pages), create a floating switcher
    if (!container) {
      container = document.createElement('div');
      container.id = 'rightside-config-hide';
      container.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:100;';
      document.body.appendChild(container);
    }
    
    if (document.querySelector('.season-switcher')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'season-switcher';

    const btns = [
      { key: 'auto', icon: '🔄', title: '自动' },
      ...Object.entries(SEASONS).map(([k, v]) => ({ key: k, icon: v.icon, title: v.label })),
    ];

    btns.forEach(({ key, icon, title }) => {
      const btn = document.createElement('button');
      btn.className = 'season-btn';
      btn.dataset.season = key;
      btn.title = title;
      btn.textContent = icon;
      btn.addEventListener('click', () => setSeason(key));
      wrapper.appendChild(btn);
    });

    container.appendChild(wrapper);
    updateSwitcherUI();
  }

  function init() {
    applySeason(getActiveSeason());
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectSwitcher);
    } else {
      injectSwitcher();
    }
  }

  return { init, getActiveSeason, setSeason, SEASONS };
})();

// Auto-init
SeasonManager.init();
