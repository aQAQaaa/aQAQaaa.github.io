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
  };

  const activateLightMode = () => {
    document.documentElement.setAttribute('data-theme', 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#ffffff');
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
      if (currentTheme === 'light') {
        activateDarkMode();
        saveToLocal.set('theme', 'dark', 365);
      } else {
        activateLightMode();
        saveToLocal.set('theme', 'light', 365);
      }
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
      // Fallback: simple typing animation
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

        if (!isDeleting && charIndex === current.length) {
          delay = 2000;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % strings.length;
          delay = 300;
        }

        setTimeout(type, delay);
      };

      setTimeout(type, 300);
    }
  };

  // Load Typed.js then init
  if (typeof Typed !== 'undefined') {
    initTyped();
  } else {
    // Typed.js should load from CDN
    const checkTyped = setInterval(() => {
      if (typeof Typed !== 'undefined') {
        clearInterval(checkTyped);
        initTyped();
      }
    }, 100);
    // Stop checking after 5 seconds, use fallback
    setTimeout(() => {
      clearInterval(checkTyped);
      if (typeof Typed === 'undefined') {
        initTyped(); // Will use fallback
      }
    }, 5000);
  }

  // ==================== Navigation Scroll Effect ====================
  const pageHeader = document.getElementById('page-header');
  const nav = document.getElementById('nav');
  let lastScrollTop = 0;
  let navFixed = false;
  let navVisible = true;

  const handleNavScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Fix nav after hero
    if (scrollTop > 100) {
      if (!navFixed) {
        pageHeader.classList.add('nav-fixed');
        navFixed = true;
      }
    } else {
      if (navFixed) {
        pageHeader.classList.remove('nav-fixed');
        navFixed = false;
      }
    }

    // Show/hide nav on scroll direction
    if (navFixed) {
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        // Scrolling down - hide nav
        if (navVisible) {
          pageHeader.classList.remove('nav-visible');
          pageHeader.classList.add('nav-hidden');
          navVisible = false;
        }
      } else {
        // Scrolling up - show nav
        if (!navVisible) {
          pageHeader.classList.remove('nav-hidden');
          pageHeader.classList.add('nav-visible');
          navVisible = true;
        }
      }
    }

    lastScrollTop = scrollTop;
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ==================== Scroll Down ====================
  const scrollDown = document.getElementById('scroll-down');
  if (scrollDown) {
    scrollDown.addEventListener('click', () => {
      const contentInner = document.getElementById('content-inner');
      if (contentInner) {
        const targetTop = contentInner.offsetTop - 70;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  }

  // ==================== Right Side Controls ====================
  const rightsideConfig = document.getElementById('rightside-config');
  const rightside = document.getElementById('rightside');

  if (rightsideConfig && rightside) {
    rightsideConfig.addEventListener('click', () => {
      rightside.classList.toggle('open');
    });
  }

  // Go up button
  const goUpBtn = document.getElementById('go-up');
  const scrollPercent = document.querySelector('.scroll-percent');

  if (goUpBtn) {
    goUpBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Update scroll percent
  const updateScrollPercent = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

    if (scrollPercent) {
      scrollPercent.textContent = scrollTop > 100 ? percent + '%' : '';
    }

    // Show/hide go-up button
    if (goUpBtn) {
      if (scrollTop > 100) {
        goUpBtn.style.display = 'block';
      } else {
        goUpBtn.style.display = 'none';
      }
    }
  };

  window.addEventListener('scroll', updateScrollPercent, { passive: true });
  updateScrollPercent();

  // ==================== Aside Toggle ====================
  const hideAsideBtn = document.getElementById('hide-aside-btn');
  if (hideAsideBtn) {
    hideAsideBtn.addEventListener('click', () => {
      const layout = document.querySelector('.layout');
      if (layout) {
        layout.classList.toggle('hide-aside');
        const isHidden = layout.classList.contains('hide-aside');
        saveToLocal.set('aside-status', isHidden ? 'hide' : 'show', 365);
      }
    });

    // Restore aside state
    const asideStatus = saveToLocal.get('aside-status');
    if (asideStatus === 'hide') {
      const layout = document.querySelector('.layout');
      if (layout) layout.classList.add('hide-aside');
    }
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
      setTimeout(() => {
        menuMask.style.display = 'none';
      }, 500);
    }
    if (sidebarMenus) sidebarMenus.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (toggleMenu) {
    toggleMenu.addEventListener('click', openSidebar);
  }

  if (menuMask) {
    menuMask.addEventListener('click', closeSidebar);
  }

  // ==================== Scroll Reveal Animation ====================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe post items for reveal animation
  document.querySelectorAll('.recent-post-item, .card-widget').forEach(el => {
    el.style.animationPlayState = 'paused';
    revealObserver.observe(el);
  });

  // ==================== Parallax Effect for Hero ====================
  const heroHeader = document.getElementById('page-header');
  if (heroHeader && heroHeader.classList.contains('full_page')) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      if (scrollTop < window.innerHeight) {
        const bgEl = document.getElementById('web_bg');
        if (bgEl) {
          bgEl.style.transform = `scale(1.1) translateY(${scrollTop * 0.3}px)`;
        }
        const siteInfo = document.getElementById('site-info');
        if (siteInfo) {
          siteInfo.style.transform = `translate(-50%, calc(-50% + ${scrollTop * 0.15}px))`;
          siteInfo.style.opacity = Math.max(0, 1 - scrollTop / (window.innerHeight * 0.7));
        }
      }
    }, { passive: true });
  }

  // ==================== Keyboard Shortcuts ====================
  document.addEventListener('keydown', (e) => {
    // 'T' or 't' for theme toggle
    if (e.key === 't' || e.key === 'T') {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
          activateDarkMode();
          saveToLocal.set('theme', 'dark', 365);
        } else {
          activateLightMode();
          saveToLocal.set('theme', 'light', 365);
        }
      }
    }
  });

  // ==================== Performance: requestAnimationFrame ====================
  let ticking = false;
  const scrollHandlers = [handleNavScroll, updateScrollPercent];

  // Already attached individually, but ensure smooth performance
  window.addEventListener('resize', () => {
    // Close sidebar on resize to desktop
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
});
