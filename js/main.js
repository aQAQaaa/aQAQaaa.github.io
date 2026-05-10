/**
 * FanYiyang's World - Main JavaScript
 * Replicating CXPLAY World Butterfly Theme Effects
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
      const { value, expiry } = JSON.parse(itemStr);
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return undefined;
      }
      return value;
    }
  };

  const activateDarkMode = () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#1a1a1a');
    // Update button icon
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

  // Dark mode toggle with smooth transition
  const darkmodeBtn = document.getElementById('darkmode');
  if (darkmodeBtn) {
    darkmodeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      // Add transition class for smooth color change
      document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
      if (currentTheme === 'light') {
        activateDarkMode();
        saveToLocal.set('theme', 'dark', 365);
      } else {
        activateLightMode();
        saveToLocal.set('theme', 'light', 365);
      }
      // Remove transition after animation
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

  // ==================== Load Posts from JSON ====================
  const loadPosts = async () => {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    try {
      const res = await fetch('data/posts.json');
      if (!res.ok) throw new Error('Failed to load posts');
      const posts = await res.json();

      if (posts.length === 0) {
        postList.innerHTML = '<div class="post-empty"><i class="far fa-folder-open"></i><p>暂无文章，敬请期待</p></div>';
        return;
      }

      // Sort: sticky first, then by date desc
      posts.sort((a, b) => {
        if (a.sticky && !b.sticky) return -1;
        if (!a.sticky && b.sticky) return 1;
        return new Date(b.date) - new Date(a.date);
      });

      // Update sidebar stats
      const categories = new Set(posts.map(p => p.category));
      const tags = new Set(posts.flatMap(p => p.tags || []));

      document.querySelectorAll('.site-data').forEach(el => {
        const nums = el.querySelectorAll('.length-num');
        if (nums[0]) nums[0].textContent = posts.length;
        if (nums[1]) nums[1].textContent = tags.size;
        if (nums[2]) nums[2].textContent = categories.size;
      });

      // Update aside recent posts
      const asideList = document.getElementById('aside-recent-posts');
      if (asideList) {
        asideList.innerHTML = posts.slice(0, 5).map(p => `
          <div class="aside-list-item">
            <div class="content">
              <a class="title" href="${p.url || '#'}" title="${p.title}">${p.title}</a>
              <time>${p.date}</time>
            </div>
          </div>
        `).join('');
      }

      // Update aside categories
      const catList = document.getElementById('aside-cat-list');
      if (catList) {
        const catCounts = {};
        posts.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
        catList.innerHTML = Object.entries(catCounts).map(([name, count]) => `
          <li class="card-category-list-item">
            <a class="card-category-list-link" href="#">
              <span class="card-category-list-name">${name}</span>
              <span class="card-category-list-count">${count}</span>
            </a>
          </li>
        `).join('');
      }

      // Update aside tags
      const tagList = document.getElementById('aside-tag-list');
      if (tagList) {
        const tagArr = [...tags];
        tagList.innerHTML = tagArr.map(t => `<a href="#">${t}</a>`).join('');
      }

      // Render post cards
      postList.innerHTML = posts.map((post, i) => {
        const coverHtml = post.cover ? `
          <div class="post_cover">
            <a href="${post.url || '#'}" title="${post.title}">
              <img class="post-bg" src="${post.cover}" alt="${post.title}" onerror="this.style.display='none'">
            </a>
          </div>` : '';

        const stickyIcon = post.sticky ? '<i class="fas fa-thumbtack sticky"></i>' : '';
        const tagsHtml = (post.tags || []).map(t => `<a class="article-meta__categories" href="#">${t}</a>`).join('');

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
                  <a class="article-meta__categories" href="#">${post.category}</a>
                  ${tagsHtml ? '<span class="article-meta-separator">|</span>' + tagsHtml : ''}
                </span>
              </div>
              <div class="content">${post.excerpt || ''}</div>
            </div>
          </div>`;
      }).join('');

      // Re-observe new elements for animation
      postList.querySelectorAll('.recent-post-item').forEach(el => {
        el.style.animationPlayState = 'running';
      });

    } catch (err) {
      console.error('Error loading posts:', err);
      postList.innerHTML = '<div class="post-empty"><i class="far fa-folder-open"></i><p>暂无文章，敬请期待</p></div>';
    }
  };

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
  const rightsideConfigHide = document.getElementById('rightside-config-hide');

  // Toggle settings panel
  rightsideConfig?.addEventListener('click', () => {
    rightside?.classList.toggle('open');
  });

  // Go Up button with smooth scroll
  const goUpBtn = document.getElementById('go-up');
  const scrollPercent = document.querySelector('.scroll-percent');

  goUpBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Update scroll percentage and button visibility
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
    // T = toggle theme
    if (e.key === 't' || e.key === 'T') {
      const t = document.documentElement.getAttribute('data-theme');
      document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
      t === 'light' ? (activateDarkMode(), saveToLocal.set('theme', 'dark', 365)) : (activateLightMode(), saveToLocal.set('theme', 'light', 365));
      setTimeout(() => { document.body.style.transition = ''; }, 600);
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
});
