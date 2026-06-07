/**
 * FanYiyang's World - Main JavaScript
 * Enhanced with dynamic stats, category/tag filtering, glassmorphism effects
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==================== Theme Management ====================
  const saveToLocal = {
    set: (key, value, ttl) => {
      if (!ttl) return;
      const expiry = Date.now() + ttl * 86400000;
      localStorage.setItem(key, JSON.stringify({ value, expiry }));
    },
    get: (key) => {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return undefined;
      try {
        const { value, expiry } = JSON.parse(itemStr);
        if (Date.now() > expiry) { localStorage.removeItem(key); return undefined; }
        return value;
      } catch { return undefined; }
    }
  };

  const activateDarkMode = () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#1a1a1a');
    const btn = document.getElementById('darkmode');
    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
  };

  const activateLightMode = () => {
    document.documentElement.setAttribute('data-theme', 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#ffffff');
    const btn = document.getElementById('darkmode');
    if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
  };

  // Initialize theme
  const theme = saveToLocal.get('theme');
  if (theme === undefined) {
    const hour = new Date().getHours();
    const isNight = hour <= 6 || hour >= 18;
    isNight ? activateDarkMode() : activateLightMode();
  } else {
    theme === 'light' ? activateLightMode() : activateDarkMode();
  }

  // Dark mode toggle
  const darkmodeBtn = document.getElementById('darkmode');
  if (darkmodeBtn) {
    darkmodeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
      if (currentTheme === 'light') {
        activateDarkMode();
        saveToLocal.set('theme', 'dark', 365);
      } else {
        activateLightMode();
        saveToLocal.set('theme', 'light', 365);
      }
      setTimeout(() => { document.body.style.transition = ''; }, 600);
    });
  }

  // ==================== Typed.js Subtitle ====================
  const initTyped = () => {
    const subtitleEl = document.getElementById('subtitle');
    if (!subtitleEl) return;

    const strings = [
      'Share With You.',
      '探索无限可能的世界。',
      '在代码与文字之间游走。',
      '记录生活中的点滴思考。',
      '每一行代码都是一段故事。',
      '用技术改变世界，用文字记录改变。',
      '保持好奇，永远探索。',
      '在数字世界中寻找真实的自我。',
      '技术是工具，创意是灵魂。',
      '欢迎来到我的小世界。',
    ];

    if (typeof Typed !== 'undefined') {
      new Typed('#subtitle', {
        strings: strings,
        startDelay: 300,
        typeSpeed: 150,
        backSpeed: 50,
        loop: true,
        backDelay: 2000,
        showCursor: true,
        cursorChar: '|',
      });
    } else {
      let currentIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      const type = () => {
        const current = strings[currentIndex];
        if (isDeleting) {
          subtitleEl.textContent = current.substring(0, charIndex - 1);
          charIndex--;
        } else {
          subtitleEl.textContent = current.substring(0, charIndex + 1);
          charIndex++;
        }
        let delay = isDeleting ? 50 : 150;
        if (!isDeleting && charIndex === current.length) { delay = 2000; isDeleting = true; }
        else if (isDeleting && charIndex === 0) { isDeleting = false; currentIndex = (currentIndex + 1) % strings.length; delay = 300; }
        setTimeout(type, delay);
      };
      setTimeout(type, 300);
    }
  };

  if (typeof Typed !== 'undefined') {
    initTyped();
  } else {
    const checkTyped = setInterval(() => {
      if (typeof Typed !== 'undefined') { clearInterval(checkTyped); initTyped(); }
    }, 100);
    setTimeout(() => { clearInterval(checkTyped); if (typeof Typed === 'undefined') initTyped(); }, 5000);
  }

  // ==================== Calculate Word Count ====================
  const countWords = (text) => {
    if (!text) return 0;
    // Count Chinese chars + English words
    const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const english = (text.match(/[a-zA-Z]+/g) || []).length;
    return chinese + english;
  };

  // ==================== Format Number ====================
  const formatNumber = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  // ==================== Calculate Run Days (with h:m:s) ====================
  const START_DATE = new Date('2026-05-10');

  function formatRunTime() {
    const now = new Date();
    const diff = now - START_DATE;
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${days}天${pad(hours)}时${pad(minutes)}分${pad(seconds)}秒`;
  }

  // ==================== State ====================
  let allPosts = [];
  let activeCategory = null;
  let activeTag = null;

  // ==================== Load Posts from JSON ====================
  const loadPosts = async () => {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    try {
      const res = await fetch('data/posts.json');
      if (!res.ok) throw new Error('Failed to load posts');
      allPosts = await res.json();

      if (allPosts.length === 0) {
        postList.innerHTML = '<div class="post-empty"><i class="far fa-folder-open"></i><p>暂无文章，敬请期待</p></div>';
        return;
      }

      // Sort: sticky first, then by date desc
      allPosts.sort((a, b) => {
        if (a.sticky && !b.sticky) return -1;
        if (!a.sticky && b.sticky) return 1;
        return new Date(b.date) - new Date(a.date);
      });

      // Calculate stats
      const totalWords = allPosts.reduce((sum, p) => sum + countWords(p.excerpt || ''), 0);
      const lastUpdate = allPosts.reduce((latest, p) => {
        const d = p.updated || p.date;
        return d > latest ? d : latest;
      }, '');

      // Update web info
      const webinfoPosts = document.getElementById('webinfo-posts');
      const webinfoWords = document.getElementById('webinfo-words');
      const webinfoLastUpdate = document.getElementById('webinfo-last-update');
      const webinfoRunDays = document.getElementById('webinfo-run-days');

      if (webinfoPosts) webinfoPosts.textContent = allPosts.length;
      if (webinfoWords) webinfoWords.textContent = formatNumber(totalWords);
      if (webinfoLastUpdate) webinfoLastUpdate.textContent = lastUpdate;
      if (webinfoRunDays) {
        webinfoRunDays.textContent = formatRunTime();
        setInterval(() => { webinfoRunDays.textContent = formatRunTime(); }, 1000);
      }

      // Update all site-data counters (sidebar + mobile)
      const categories = new Set(allPosts.map(p => p.category));
      const tags = new Set(allPosts.flatMap(p => p.tags || []));

      document.querySelectorAll('.site-data').forEach(el => {
        const nums = el.querySelectorAll('.length-num');
        if (nums[0]) nums[0].textContent = allPosts.length;
        if (nums[1]) nums[1].textContent = tags.size;
        if (nums[2]) nums[2].textContent = categories.size;
      });

      // Render aside recent posts
      renderAsideRecentPosts(allPosts);

      // Render aside categories
      renderAsideCategories(allPosts);

      // Render aside tags
      renderAsideTags(allPosts);

      // Render aside archives
      renderAsideArchives(allPosts);

      // Initial render of posts
      renderPosts(allPosts);

    } catch (err) {
      console.error('Error loading posts:', err);
      postList.innerHTML = '<div class="post-empty"><i class="far fa-folder-open"></i><p>暂无文章，敬请期待</p></div>';
    }
  };

  // ==================== Render Aside Recent Posts ====================
  const renderAsideRecentPosts = (posts) => {
    const asideList = document.getElementById('aside-recent-posts');
    if (!asideList) return;
    asideList.innerHTML = posts.slice(0, 5).map(p => `
      <div class="aside-list-item">
        <div class="content">
          <a class="title" href="${p.url || '#'}" title="${p.title}">${p.title}</a>
          <time>${p.date}</time>
        </div>
      </div>
    `).join('');
  };

  // ==================== Render Aside Categories ====================
  const renderAsideCategories = (posts) => {
    const catList = document.getElementById('aside-cat-list');
    if (!catList) return;
    const catCounts = {};
    posts.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    catList.innerHTML = Object.entries(catCounts).map(([name, count]) => `
      <li class="card-category-list-item">
        <a class="card-category-list-link${activeCategory === name ? ' active' : ''}" href="javascript:void(0)" data-category="${name}">
          <span class="card-category-list-name">${name}</span>
          <span class="card-category-list-count">${count}</span>
        </a>
      </li>
    `).join('');

    // Bind click events
    catList.querySelectorAll('.card-category-list-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.dataset.category;
        if (activeCategory === cat) {
          activeCategory = null;
        } else {
          activeCategory = cat;
          activeTag = null;
        }
        applyFilters();
      });
    });
  };

  // ==================== Render Aside Tags ====================
  const renderAsideTags = (posts) => {
    const tagList = document.getElementById('aside-tag-list');
    if (!tagList) return;
    const tagCounts = {};
    posts.forEach(p => (p.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const maxCount = Math.max(...Object.values(tagCounts), 1);

    tagList.innerHTML = Object.entries(tagCounts).map(([name, count]) => {
      const size = Math.max(1, Math.min(4, Math.ceil((count / maxCount) * 4)));
      return `<a href="javascript:void(0)" data-tag="${name}" data-size="${size}" class="${activeTag === name ? 'active' : ''}">${name}</a>`;
    }).join('');

    // Bind click events
    tagList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = link.dataset.tag;
        if (activeTag === tag) {
          activeTag = null;
        } else {
          activeTag = tag;
          activeCategory = null;
        }
        applyFilters();
      });
    });
  };

  // ==================== Render Aside Archives ====================
  const renderAsideArchives = (posts) => {
    const archiveList = document.querySelector('.card-archive-list');
    if (!archiveList) return;
    const monthCounts = {};
    posts.forEach(p => {
      const d = p.date.substring(0, 7); // YYYY-MM
      monthCounts[d] = (monthCounts[d] || 0) + 1;
    });
    const sorted = Object.entries(monthCounts).sort((a, b) => b[0].localeCompare(a[0]));
    archiveList.innerHTML = sorted.map(([month, count]) => {
      const [y, m] = month.split('-');
      return `
        <li class="card-archive-list-item">
          <a class="card-archive-list-link" href="javascript:void(0)" data-month="${month}">
            <span class="card-archive-list-date">${y} 年 ${parseInt(m)} 月</span>
            <span class="card-archive-list-count">${count}</span>
          </a>
        </li>`;
    }).join('');
  };

  // ==================== Apply Filters ====================
  const applyFilters = () => {
    // Update filter indicator
    const indicator = document.getElementById('filter-indicator');
    const filterText = document.getElementById('filter-text');

    if (activeCategory || activeTag) {
      indicator.classList.add('show');
      if (activeCategory) {
        filterText.textContent = `分类: ${activeCategory}`;
      } else if (activeTag) {
        filterText.textContent = `标签: ${activeTag}`;
      }
    } else {
      indicator.classList.remove('show');
    }

    // Update sidebar active states
    document.querySelectorAll('.card-category-list-link').forEach(link => {
      link.classList.toggle('active', link.dataset.category === activeCategory);
    });
    document.querySelectorAll('.card-tag-cloud a').forEach(link => {
      link.classList.toggle('active', link.dataset.tag === activeTag);
    });

    // Filter posts
    let filtered = allPosts;
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (activeTag) {
      filtered = filtered.filter(p => (p.tags || []).includes(activeTag));
    }

    renderPosts(filtered);
  };

  // ==================== Render Posts ====================
  const renderPosts = (posts) => {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    if (posts.length === 0) {
      postList.innerHTML = '<div class="post-empty"><i class="far fa-folder-open"></i><p>没有找到匹配的文章</p></div>';
      return;
    }

    postList.innerHTML = posts.map((post, i) => {
      const coverHtml = post.cover ? `
        <div class="post_cover">
          <a href="${post.url || '#'}" title="${post.title}">
            <img class="post-bg" src="${post.cover}" alt="${post.title}" onerror="this.style.display='none'">
          </a>
        </div>` : '';

      const stickyIcon = post.sticky ? '<i class="fas fa-thumbtack sticky"></i>' : '';
      const tagsHtml = (post.tags || []).map(t =>
        `<a class="article-meta__categories" href="javascript:void(0)" data-tag="${t}">${t}</a>`
      ).join('');

      const wordCount = countWords(post.excerpt || '');
      const wordBadge = wordCount > 0 ? `<span class="post-word-count"><i class="fas fa-file-word"></i> ${wordCount} 字</span>` : '';

      return `
        <div class="recent-post-item" style="animation-delay: ${0.1 + i * 0.05}s">
          ${coverHtml}
          <div class="recent-post-info">
            <a class="article-title" href="${post.url || '#'}" title="${post.title}">${stickyIcon}${post.title}</a>
            <div class="article-meta-wrap">
              <span class="post-meta-date">
                <i class="far fa-calendar-alt"></i>
                <span class="article-meta-label">发表于</span>
                <time>${post.date}</time>
                ${post.updated && post.updated !== post.date ? `
                  <span class="article-meta-separator">|</span>
                  <i class="fas fa-history"></i>
                  <span class="article-meta-label">更新于</span>
                  <time>${post.updated}</time>
                ` : ''}
              </span>
              <span class="article-meta">
                <span class="article-meta-separator">|</span>
                <i class="fas fa-inbox"></i>
                <a class="article-meta__categories" href="javascript:void(0)" data-category="${post.category}">${post.category}</a>
                ${tagsHtml ? '<span class="article-meta-separator">|</span>' + tagsHtml : ''}
                ${wordBadge}
              </span>
            </div>
            <div class="content">${post.excerpt || ''}</div>
          </div>
        </div>`;
    }).join('');

    // Bind inline tag/category clicks
    postList.querySelectorAll('.article-meta__categories[data-tag]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = el.dataset.tag;
        activeTag = activeTag === tag ? null : tag;
        activeCategory = null;
        applyFilters();
        window.scrollTo({ top: document.getElementById('content-inner').offsetTop - 70, behavior: 'smooth' });
      });
    });

    postList.querySelectorAll('.article-meta__categories[data-category]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = el.dataset.category;
        activeCategory = activeCategory === cat ? null : cat;
        activeTag = null;
        applyFilters();
        window.scrollTo({ top: document.getElementById('content-inner').offsetTop - 70, behavior: 'smooth' });
      });
    });
  };

  // ==================== Clear Filter ====================
  const clearFilter = document.getElementById('filter-clear');
  if (clearFilter) {
    clearFilter.addEventListener('click', () => {
      activeCategory = null;
      activeTag = null;
      applyFilters();
    });
  }

  // ==================== Init Posts ====================
  loadPosts();

  // ==================== Navigation Scroll Effect ====================
  const pageHeader = document.getElementById('page-header');
  let lastScrollTop = 0;
  let navFixed = false;
  let navVisible = true;

  const handleNavScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 100) {
      if (!navFixed) { pageHeader.classList.add('nav-fixed'); navFixed = true; }
    } else {
      if (navFixed) { pageHeader.classList.remove('nav-fixed'); navFixed = false; }
    }
    if (navFixed) {
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        if (navVisible) { pageHeader.classList.remove('nav-visible'); pageHeader.classList.add('nav-hidden'); navVisible = false; }
      } else {
        if (!navVisible) { pageHeader.classList.remove('nav-hidden'); pageHeader.classList.add('nav-visible'); navVisible = true; }
      }
    }
    lastScrollTop = scrollTop;
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ==================== Scroll Down ====================
  const scrollDown = document.getElementById('scroll-down');
  if (scrollDown) {
    scrollDown.addEventListener('click', () => {
      const ci = document.getElementById('content-inner');
      if (ci) window.scrollTo({ top: ci.offsetTop - 70, behavior: 'smooth' });
    });
  }

  // ==================== Right Side Controls ====================
  const rightside = document.getElementById('rightside');
  const rightsideConfig = document.getElementById('rightside-config');

  rightsideConfig?.addEventListener('click', () => {
    rightside?.classList.toggle('open');
  });

  const goUpBtn = document.getElementById('go-up');
  const scrollPercent = document.querySelector('.scroll-percent');

  goUpBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const updateScrollPercent = () => {
    const st = window.scrollY;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    const p = dh > 0 ? Math.round(st / dh * 100) : 0;

    if (scrollPercent) {
      scrollPercent.textContent = st > 100 ? p + '%' : '';
    }

    if (goUpBtn) {
      if (st > 100) {
        goUpBtn.classList.add('show');
      } else {
        goUpBtn.classList.remove('show');
      }
    }
  };

  window.addEventListener('scroll', updateScrollPercent, { passive: true });
  updateScrollPercent();

  // ==================== Aside Toggle ====================
  const hideAsideBtn = document.getElementById('hide-aside-btn');
  const layout = document.querySelector('.layout');

  hideAsideBtn?.addEventListener('click', () => {
    if (layout) {
      layout.classList.toggle('hide-aside');
      saveToLocal.set('aside-status', layout.classList.contains('hide-aside') ? 'hide' : 'show', 365);
    }
  });

  if (saveToLocal.get('aside-status') === 'hide') {
    layout?.classList.add('hide-aside');
  }

  // ==================== Mobile Sidebar ====================
  const toggleMenu = document.getElementById('toggle-menu');
  const menuMask = document.getElementById('menu-mask');
  const sidebarMenus = document.getElementById('sidebar-menus');

  const openSidebar = () => {
    if (menuMask) {
      menuMask.style.display = 'block';
      menuMask.style.animation = 'to_show 0.5s';
    }
    if (sidebarMenus) sidebarMenus.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    if (menuMask) {
      menuMask.style.animation = 'to_hide 0.5s';
      setTimeout(() => { menuMask.style.display = 'none'; }, 500);
    }
    if (sidebarMenus) sidebarMenus.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggleMenu?.addEventListener('click', openSidebar);
  menuMask?.addEventListener('click', closeSidebar);

  // ==================== Parallax Effect for Hero ====================
  const heroHeader = document.getElementById('page-header');
  if (heroHeader?.classList.contains('full_page')) {
    window.addEventListener('scroll', () => {
      const st = window.scrollY;
      if (st < window.innerHeight) {
        const bgEl = document.getElementById('web_bg');
        if (bgEl) bgEl.style.transform = `scale(1.1) translateY(${st * 0.3}px)`;
        const si = document.getElementById('site-info');
        if (si) {
          si.style.transform = `translate(-50%, calc(-50% + ${st * 0.15}px))`;
          si.style.opacity = Math.max(0, 1 - st / (window.innerHeight * 0.7));
        }
      }
    }, { passive: true });
  }

  // ==================== Keyboard Shortcuts ====================
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 't' || e.key === 'T') {
      const t = document.documentElement.getAttribute('data-theme');
      document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
      t === 'light' ? (activateDarkMode(), saveToLocal.set('theme', 'dark', 365)) : (activateLightMode(), saveToLocal.set('theme', 'light', 365));
      setTimeout(() => { document.body.style.transition = ''; }, 600);
    }
    // Escape to clear filter
    if (e.key === 'Escape' && (activeCategory || activeTag)) {
      activeCategory = null;
      activeTag = null;
      applyFilters();
    }
  });

  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeSidebar(); });

  // ==================== Smooth Scroll for All Internal Links ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==================== Reading Progress Bar ====================
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      const p = dh > 0 ? (st / dh) * 100 : 0;
      progressBar.style.width = p + '%';
    }, { passive: true });
  }

  // ==================== Card Entrance Animation Observer ====================
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card-widget').forEach(card => {
    cardObserver.observe(card);
  });
});
