(() => {
  const intro = document.getElementById('intro');
  const header = document.querySelector('.site-header');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const creatorButton = document.getElementById('creatorButton');
  const creatorShow = document.getElementById('creatorShow');
  const creatorBurst = document.getElementById('creatorBurst');
  const cursorGlow = document.getElementById('cursorGlow');
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  window.addEventListener('load', () => {
    setTimeout(() => intro.classList.add('hide'), 900);
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuBtn.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    menuBtn.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.setProperty('--delay', `${delay}ms`);
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...navLinks.querySelectorAll('a')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -48% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  if (matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    }, { passive: true });

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .10}px, ${y * .12}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = 'translate(0,0)');
    });

    const tilt = document.querySelector('.tilt-card');
    tilt.addEventListener('mousemove', e => {
      const r = tilt.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `rotateY(${px * 10}deg) rotateX(${py * -10}deg) translateZ(0)`;
    });
    tilt.addEventListener('mouseleave', () => tilt.style.transform = 'rotateY(0) rotateX(0)');
  }

  function showCreatorAnimation() {
    creatorBurst.innerHTML = '';
    creatorShow.classList.add('active');
    creatorShow.setAttribute('aria-hidden', 'false');
    const colors = ['#58b6ff', '#8775ff', '#56edcf', '#ffffff'];
    for (let i = 0; i < 70; i++) {
      const spark = document.createElement('i');
      spark.className = 'spark';
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * Math.min(innerWidth, innerHeight) * .55;
      spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      spark.style.color = colors[Math.floor(Math.random() * colors.length)];
      spark.style.background = 'currentColor';
      spark.style.animationDelay = `${Math.random() * .25}s`;
      creatorBurst.appendChild(spark);
    }
    setTimeout(() => {
      creatorShow.classList.remove('active');
      creatorShow.setAttribute('aria-hidden', 'true');
    }, 2450);
  }
  creatorButton.addEventListener('click', showCreatorAnimation);
  creatorShow.addEventListener('click', () => {
    creatorShow.classList.remove('active');
    creatorShow.setAttribute('aria-hidden', 'true');
  });

  let dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, particles = [];
  let mouse = { x: -9999, y: -9999 };
  const particleCount = () => Math.min(72, Math.max(32, Math.floor(innerWidth / 22)));

  function resizeCanvas() {
    W = innerWidth; H = innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: particleCount() }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.2 + .4
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 120) { p.x -= mdx * .0007; p.y -= mdy * .0007; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(132,187,255,.45)'; ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 105) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(87,145,221,${(1 - dist / 105) * .09})`;
          ctx.lineWidth = .7; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) drawParticles();
})();
