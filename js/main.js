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
    // Count Chinese chars + English/numeric words
    const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const english = (text.match(/[a-zA-Z0-9]+/g) || []).length;
    return chinese + english;
  };

  // Fetch and count full article body words from post HTML
  const fetchPostWordCount = async (post) => {
    if (!post.url) return post.words || countWords(post.excerpt || '');
    try {
      const res = await fetch(post.url);
      if (!res.ok) throw new Error('Fetch failed');
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const postBody = doc.querySelector('.post-body') || doc.querySelector('article') || doc.querySelector('main');
      if (!postBody) return post.words || countWords(post.excerpt || '');

      const clone = postBody.cloneNode(true);
      // Exclude scripts, styles, top metadata line, and bottom return-home button
      clone.querySelectorAll('script, style').forEach(el => el.remove());
      const firstP = clone.querySelector('p');
      if (firstP && firstP.querySelector('.fa-calendar-alt')) {
        firstP.remove();
      }
      clone.querySelectorAll('a[href="/"]').forEach(el => el.remove());

      const fullCount = countWords(clone.textContent || '');
      if (fullCount > 0) {
        post.words = fullCount;
      }
    } catch {
      // Fallback to pre-configured words in posts.json or excerpt
      if (!post.words) {
        post.words = countWords(post.excerpt || '');
      }
    }
    return post.words || 0;
  };

  // ==================== Format Number ====================
  const formatNumber = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    return num.toLocaleString('zh-CN');
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
  let activeMonth = null;
  let runTimeInterval = null;

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

      // Ensure initial word count uses post.words (full article count) with fallback
      allPosts.forEach(p => {
        if (typeof p.words !== 'number' || p.words <= 0) {
          p.words = countWords(p.excerpt || '');
        }
      });

      const updateWordStatsUI = () => {
        const totalWords = allPosts.reduce((sum, p) => sum + (p.words || 0), 0);
        const webinfoWords = document.getElementById('webinfo-words');
        if (webinfoWords) webinfoWords.textContent = formatNumber(totalWords) + ' 字';

        // Update any rendered post card word count badges in-place
        document.querySelectorAll('.post-word-count[data-post-url]').forEach(badge => {
          const url = badge.getAttribute('data-post-url');
          const matched = allPosts.find(p => p.url === url);
          if (matched && matched.words > 0) {
            badge.innerHTML = `<i class="fas fa-file-word"></i> ${matched.words} 字`;
          }
        });
      };

      const lastUpdate = allPosts.reduce((latest, p) => {
        const d = p.updated || p.date;
        return d > latest ? d : latest;
      }, '');

      // Update web info
      const webinfoPosts = document.getElementById('webinfo-posts');
      const webinfoLastUpdate = document.getElementById('webinfo-last-update');
      const webinfoRunDays = document.getElementById('webinfo-run-days');

      if (webinfoPosts) webinfoPosts.textContent = allPosts.length;
      if (webinfoLastUpdate) webinfoLastUpdate.textContent = lastUpdate;
      if (webinfoRunDays) {
        webinfoRunDays.textContent = formatRunTime();
        if (runTimeInterval) clearInterval(runTimeInterval);
        runTimeInterval = setInterval(() => { webinfoRunDays.textContent = formatRunTime(); }, 1000);
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

      // Initial render of posts & word stats
      renderPosts(allPosts);
      updateWordStatsUI();

      // Dynamically verify/compute full article word counts from each post's HTML
      await Promise.all(allPosts.map(p => fetchPostWordCount(p)));
      updateWordStatsUI();

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
          <a class="card-archive-list-link${activeMonth === month ? ' active' : ''}" href="javascript:void(0)" data-month="${month}">
            <span class="card-archive-list-date">${y} 年 ${parseInt(m)} 月</span>
            <span class="card-archive-list-count">${count}</span>
          </a>
        </li>`;
    }).join('');

    // Bind click events: filter by month
    archiveList.querySelectorAll('.card-archive-list-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const month = link.dataset.month;
        if (activeMonth === month) {
          activeMonth = null;
        } else {
          activeMonth = month;
          activeCategory = null;
          activeTag = null;
        }
        applyFilters();
      });
    });
  };

  // ==================== Apply Filters ====================
  const applyFilters = () => {
    // Update filter indicator
    const indicator = document.getElementById('filter-indicator');
    const filterText = document.getElementById('filter-text');

    if (activeCategory || activeTag || activeMonth) {
      indicator.classList.add('show');
      if (activeCategory) {
        filterText.textContent = `分类: ${activeCategory}`;
      } else if (activeTag) {
        filterText.textContent = `标签: ${activeTag}`;
      } else if (activeMonth) {
        filterText.textContent = `归档: ${activeMonth}`;
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
    document.querySelectorAll('.card-archive-list-link').forEach(link => {
      link.classList.toggle('active', link.dataset.month === activeMonth);
    });

    // Filter posts
    let filtered = allPosts;
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (activeTag) {
      filtered = filtered.filter(p => (p.tags || []).includes(activeTag));
    }
    if (activeMonth) {
      filtered = filtered.filter(p => (p.date || '').substring(0, 7) === activeMonth);
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

      const wordCount = post.words || countWords(post.excerpt || '');
      const wordBadge = wordCount > 0 ? `<span class="post-word-count" data-post-url="${post.url || ''}"><i class="fas fa-file-word"></i> ${wordCount} 字</span>` : '';

      return `
        <div class="recent-post-item">
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

    // Re-init scroll reveal for newly rendered cards
    initReveal(postList);
    // Clean up spring nodes for removed cards & let new ones register via reveal
    springNodes = springNodes.filter(n => document.body.contains(n.el));
  };

  // ==================== Clear Filter ====================
  const clearFilter = document.getElementById('filter-clear');
  if (clearFilter) {
    clearFilter.addEventListener('click', () => {
      activeCategory = null;
      activeTag = null;
      activeMonth = null;
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
    if (scrollTop > 10) {
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
    if (e.key === 'Escape' && (activeCategory || activeTag || activeMonth)) {
      activeCategory = null;
      activeTag = null;
      activeMonth = null;
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

  // ==================== Scroll Reveal (transition-based entrance) ====================
  const revealObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.add('animate-in');
            revealObserver.unobserve(el);

            // After entrance transition, hand off to spring physics
            const onEnd = (e) => {
              if (e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;
              el.removeEventListener('transitionend', onEnd);
              activateSpring(el);
            };
            el.addEventListener('transitionend', onEnd);

            // Fallback if transitionend doesn't fire
            setTimeout(() => {
              if (!el.classList.contains('spring-active')) activateSpring(el);
            }, 900);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -10px 0px' })
    : null;

  const initReveal = (root) => {
    if (!revealObserver) return;
    root.querySelectorAll('.recent-post-item:not(.js-anim), .card-fortune:not(.js-anim)').forEach(el => {
      el.classList.add('js-anim');
      revealObserver.observe(el);
    });
    root.querySelectorAll('.aside-content .card-widget:not(.js-anim)').forEach(el => {
      el.classList.add('js-anim');
      revealObserver.observe(el);
    });
  };

  initReveal(document);

  // ==================== Coupled Inter-Card Spring Physics Engine ====================
  // HarmonyOS-style spring chain:
  // 1. Detects which card is closest to the user's mouse cursor (or viewport center).
  // 2. When scrolling, the card closest to the mouse moves FIRST.
  // 3. Adjacent cards (above & below) are connected by virtual springs (kCouple),
  //    so the moving card pushes/pulls its neighbors — creating an attract-then-repel
  //    elastic wave up and down the card stack before settling back to rest.

  const SPRING = {
    kAnchor: 95,       // Restoring spring pulling each card back to its natural slot (offset -> 0)
    cAnchor: 11,       // Damping relative to natural slot
    kCouple: 165,      // Inter-card spring stiffness connecting card[i] <-> card[i-1], card[i+1]
    cCouple: 6.5,      // Inter-card relative velocity damping
    mass: 1,           // Card mass
    maxOffset: 65,     // Maximum displacement clamp (px)
    impulseScale: 0.9, // Scroll impulse multiplier for the lead card
    restThreshold: 0.12 // Stop simulation when all cards settle below this threshold
  };

  let springNodes = [];
  let animating = false;
  let mouseClientY = window.innerHeight * 0.45;
  let mouseClientX = window.innerWidth * 0.5;

  window.addEventListener('mousemove', (e) => {
    mouseClientX = e.clientX;
    mouseClientY = e.clientY;
  }, { passive: true });

  window.addEventListener('wheel', (e) => {
    if (typeof e.clientY === 'number' && e.clientY > 0) {
      mouseClientX = e.clientX;
      mouseClientY = e.clientY;
    }
  }, { passive: true });

  class SpringNode {
    constructor(el, group) {
      this.el = el;
      this.group = group; // 'post' | 'aside'
      this.offset = 0;    // Current Y displacement (px)
      this.vel = 0;       // Current Y velocity (px/s)
      this.nextVel = 0;
      this.nextOffset = 0;
    }

    reset() {
      this.offset = 0;
      this.vel = 0;
      this.el.style.transform = '';
    }
  }

  /** Register a card into the coupled spring system after entrance completes */
  const activateSpring = (el) => {
    if (el.classList.contains('spring-active')) return;
    el.classList.add('spring-active');

    const group = (el.classList.contains('recent-post-item') || el.classList.contains('card-fortune')) ? 'post' : 'aside';
    springNodes.push(new SpringNode(el, group));
  };

  /** Get ordered chain of active SpringNodes for a column ('post' or 'aside') */
  const getChain = (group) => {
    return springNodes
      .filter(n => n.group === group && document.body.contains(n.el))
      .sort((a, b) => a.el.offsetTop - b.el.offsetTop);
  };

  /** Apply scroll impulse led by the card closest to the mouse cursor */
  const applyChainImpulse = (chain, scrollDelta) => {
    if (chain.length === 0) return;

    // Find the card in this chain whose vertical center is closest to mouseClientY
    let leadIdx = 0;
    let minDist = Infinity;
    chain.forEach((node, i) => {
      const rect = node.el.getBoundingClientRect();
      const centerY = rect.top + rect.height * 0.5;
      const dist = Math.abs(centerY - mouseClientY);
      if (dist < minDist) {
        minDist = dist;
        leadIdx = i;
      }
    });

    // The card closest to the mouse moves FIRST with strong immediate impulse.
    // Neighboring cards above & below get a much smaller initial impulse (or slight counter-lag)
    // so the inter-card coupling springs (kCouple) visibly push and pull them!
    chain.forEach((node, i) => {
      const distSteps = Math.abs(i - leadIdx);
      if (distSteps === 0) {
        // Lead card (closest to mouse): moves immediately
        node.vel += -scrollDelta * SPRING.impulseScale;
      } else if (distSteps === 1) {
        // Immediate neighbors: slight delay/contrast so spring compression/stretch is pronounced
        node.vel += -scrollDelta * SPRING.impulseScale * 0.22;
      } else {
        // Further cards: driven primarily by the propagating inter-card spring wave
        node.vel += -scrollDelta * SPRING.impulseScale * Math.pow(0.15, distSteps);
      }
    });
  };

  // --- Scroll velocity tracking ---
  let lastScrollY = window.scrollY;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('scroll', () => {
    if (reducedMotion) return;
    const currentY = window.scrollY;
    const rawDelta = currentY - lastScrollY;
    lastScrollY = currentY;

    // Clamp extreme jump deltas (e.g. page-down / anchor jump)
    const scrollDelta = Math.max(-120, Math.min(120, rawDelta));
    if (Math.abs(scrollDelta) < 0.5 || springNodes.length === 0) return;

    applyChainImpulse(getChain('post'), scrollDelta);
    applyChainImpulse(getChain('aside'), scrollDelta * 0.8);

    if (!animating) {
      animating = true;
      lastFrameTime = performance.now();
      requestAnimationFrame(physicsTick);
    }
  }, { passive: true });

  // --- Coupled spring physics step for a 1D chain of cards ---
  const stepChain = (chain, dt) => {
    let moving = false;
    const len = chain.length;

    // 1. Compute forces & next velocities for each card in the chain
    for (let i = 0; i < len; i++) {
      const node = chain[i];

      // Anchor restoring force (pulls card back toward its layout origin 0)
      let force = -SPRING.kAnchor * node.offset - SPRING.cAnchor * node.vel;

      // Upper spring (connecting node[i] <-> node[i - 1])
      if (i > 0) {
        const upper = chain[i - 1];
        const diffX = upper.offset - node.offset;
        const diffV = upper.vel - node.vel;
        force += SPRING.kCouple * diffX + SPRING.cCouple * diffV;
      }

      // Lower spring (connecting node[i] <-> node[i + 1])
      if (i < len - 1) {
        const lower = chain[i + 1];
        const diffX = lower.offset - node.offset;
        const diffV = lower.vel - node.vel;
        force += SPRING.kCouple * diffX + SPRING.cCouple * diffV;
      }

      const accel = force / SPRING.mass;
      node.nextVel = node.vel + accel * dt;
      node.nextOffset = node.offset + node.nextVel * dt;

      // Soft elastic boundary clamp
      if (node.nextOffset > SPRING.maxOffset) {
        node.nextOffset = SPRING.maxOffset;
        node.nextVel *= -0.4;
      } else if (node.nextOffset < -SPRING.maxOffset) {
        node.nextOffset = -SPRING.maxOffset;
        node.nextVel *= -0.4;
      }
    }

    // 2. Commit states & apply transforms
    for (let i = 0; i < len; i++) {
      const node = chain[i];
      node.vel = node.nextVel;
      node.offset = node.nextOffset;
      node.el.style.transform = `translate3d(0, ${node.offset.toFixed(2)}px, 0)`;

      if (Math.abs(node.offset) > SPRING.restThreshold || Math.abs(node.vel) > SPRING.restThreshold) {
        moving = true;
      }
    }

    return moving;
  };

  let lastFrameTime = 0;

  const physicsTick = (now) => {
    const dt = Math.min((now - lastFrameTime) / 1000, 0.025);
    lastFrameTime = now;

    const postMoving = stepChain(getChain('post'), dt);
    const asideMoving = stepChain(getChain('aside'), dt);

    if (postMoving || asideMoving) {
      requestAnimationFrame(physicsTick);
    } else {
      animating = false;
      springNodes.forEach(n => n.reset());
    }
  };

  /** Rebuild spring nodes (called after posts re-render) */
  const collectSprings = () => {
    springNodes = springNodes.filter(n => document.body.contains(n.el));
  };

  // ==================== Daily Fortune & Check-in (洛谷风格签到系统) ====================
  const initFortuneCard = () => {
    const card = document.getElementById('card-fortune');
    if (!card) return;

    // All results are 100% positive, cheerful & auspicious
    const RANKS = ['特大吉', '超级大吉', '大吉', '中吉', '诸事顺遂', '福星高照'];

    // Non-programming daily life activities
    const GOOD_THINGS = [
      { name: '听首老歌', desc: '温柔旋律唤醒美好回忆' },
      { name: '出去走走', desc: '偶遇路边的小猫和小花' },
      { name: '早点睡觉', desc: '做一个香香甜甜的好梦' },
      { name: '吃顿好的', desc: '美食能治愈一切疲惫' },
      { name: '喝杯热奶茶', desc: '甜度刚好，温暖一整天' },
      { name: '看一场晚霞', desc: '抬头看看天边的橘子海' },
      { name: '发呆十分钟', desc: '给忙碌的心情放个小长假' },
      { name: '整理书桌', desc: '整洁空间带来明亮心情' },
      { name: '晒晒太阳', desc: '吸收大自然赠送的正能量' },
      { name: '联系好友', desc: '一句简单的问候也是温暖' },
      { name: '买束鲜花', desc: '生活需要触手可及的浪漫' },
      { name: '读几页闲书', desc: '在平静文字中享受独处时光' },
      { name: '拍下沿途风景', desc: '定格今天独一无二的瞬间' },
      { name: '对自己微笑', desc: '今天也是值得被善待的一天' },
      { name: '泡热水脚', desc: '卸下一整天的困倦与疲惫' },
      { name: '大口深呼吸', desc: '吐出压力，吸入清新空气' }
    ];

    // Caring & humorous gentle reminders (no bad omens, purely positive tips)
    const BAD_THINGS = [
      { name: '生闷气', desc: '气出皱纹不划算，开心最重要' },
      { name: '熬夜刷手机', desc: '眼睛会酸，明早起不来床' },
      { name: '忘记喝水', desc: '多补水，身体代谢更健康' },
      { name: '胡思乱想', desc: '很多烦恼其实都是自己脑补的' },
      { name: '低头太久', desc: '颈椎抗议啦，记得转动脖子' },
      { name: '吃太撑', desc: '肚子圆滚滚容易犯困' },
      { name: '不吃早饭', desc: '肠胃会抗议，没精神开启新一天' },
      { name: '犹豫不决', desc: '想做的事就勇敢迈出第一步' },
      { name: '自我否定', desc: '你其实比自己想象中要优秀很多' },
      { name: '宅着不动', desc: '站起来伸个懒腰，活动筋骨' },
      { name: '变天不加衣', desc: '多带件外套，别着凉感冒' },
      { name: '纠结琐事', desc: '大事化小小事化了，向前看是晴天' }
    ];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const dateDisplay = `${month}月${date}日 ${weekDays[today.getDay()]}`;

    const dateEl = document.getElementById('fortune-date');
    if (dateEl) dateEl.textContent = dateDisplay;

    // Simple deterministic hash based on date string
    const hashStr = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    const getDailyFortune = (seedDate) => {
      const h = hashStr(seedDate + '_fortune_v3');
      const rank = RANKS[h % RANKS.length];
      const g1 = GOOD_THINGS[(h >> 2) % GOOD_THINGS.length];
      const b1 = BAD_THINGS[(h >> 8) % BAD_THINGS.length];

      return {
        rank,
        good1: g1,
        bad1: b1
      };
    };

    const fortune = getDailyFortune(dateStr);

    // Populate fortune DOM
    const rankEl = document.getElementById('fortune-rank');
    const g1Name = document.getElementById('fortune-good-1-name');
    const g1Desc = document.getElementById('fortune-good-1-desc');
    const b1Name = document.getElementById('fortune-bad-1-name');
    const b1Desc = document.getElementById('fortune-bad-1-desc');
    const streakEl = document.getElementById('fortune-streak');

    if (rankEl) rankEl.textContent = fortune.rank;
    if (g1Name) g1Name.textContent = fortune.good1.name;
    if (g1Desc) g1Desc.textContent = fortune.good1.desc;
    if (b1Name) b1Name.textContent = fortune.bad1.name;
    if (b1Desc) b1Desc.textContent = fortune.bad1.desc;

    // Streak calculation
    const lastCheckDate = localStorage.getItem('blog_fortune_last_date');
    let streak = parseInt(localStorage.getItem('blog_fortune_streak') || '0', 10);

    const uncheckWrap = document.getElementById('fortune-uncheck');
    const contentWrap = document.getElementById('fortune-content');
    const checkBtn = document.getElementById('fortune-check-btn');

    const showCheckedUI = (s) => {
      if (streakEl) streakEl.textContent = s;
      if (uncheckWrap) uncheckWrap.style.display = 'none';
      if (contentWrap) contentWrap.style.display = 'block';
    };

    // If already checked in today
    if (lastCheckDate === dateStr) {
      showCheckedUI(streak > 0 ? streak : 1);
    } else {
      if (uncheckWrap) uncheckWrap.style.display = 'block';
      if (contentWrap) contentWrap.style.display = 'none';
    }

    checkBtn?.addEventListener('click', () => {
      // Calculate new streak
      const yDate = new Date(today);
      yDate.setDate(today.getDate() - 1);
      const yStr = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`;

      if (lastCheckDate === yStr) {
        streak += 1;
      } else if (lastCheckDate === dateStr) {
        // Same day
      } else {
        streak = 1;
      }

      localStorage.setItem('blog_fortune_last_date', dateStr);
      localStorage.setItem('blog_fortune_streak', String(streak));

      showCheckedUI(streak);
    });
  };

  initFortuneCard();

  window._collectSprings = collectSprings;
});


