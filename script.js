(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ① モーションタイポグラフィ：文字を1文字ずつ分割し、表示時に順番にせり上げる */
  $$('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? '\u00a0' : c;
      s.style.setProperty('--i', i);
      el.append(s);
    });
    if (!el.closest('h1')) el.setAttribute('aria-label', text);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.4 });
  $$('[data-split]').forEach(el => io.observe(el));

  /* ② ハンバーガーメニュー */
  const burger = $('.burger');
  const setMenu = open => {
    document.body.classList.toggle('open', open);
    document.body.classList.toggle('lock', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('.gnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 980) setMenu(false); });

  /* ③ パララックス：data-speed の値 × スクロール量だけ縦に動かす */
  const layers = $$('[data-speed]');
  let ticking = false;
  const parallax = () => {
    layers.forEach(l => { l.style.transform = `translate3d(0,${scrollY * l.dataset.speed}px,0)`; });
    ticking = false;
  };
  if (!reduce) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }

  /* ④ スライドショー：自動再生・矢印・ドット・スワイプ */
  const slider = $('.slider');
  if (slider) {
  const slides = $$('.slide', slider);
  const dotsBox = $('.dots', slider);
  let now = 0, timer;
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `${i + 1}枚目を表示`);
    b.addEventListener('click', () => { go(i); play(); });
    dotsBox.append(b);
    return b;
  });
  const go = i => {
    now = (i + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle('on', k === now); s.setAttribute('aria-hidden', k !== now); });
    dots.forEach((d, k) => d.setAttribute('aria-current', k === now));
  };
  const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(now + 1), 5000); };
  $('.prev', slider).addEventListener('click', () => { go(now - 1); play(); });
  $('.next', slider).addEventListener('click', () => { go(now + 1); play(); });
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', play);
  let sx = 0;
  slider.addEventListener('pointerdown', e => { sx = e.clientX; });
  slider.addEventListener('pointerup', e => {
    const d = e.clientX - sx;
    if (Math.abs(d) > 50) { go(now + (d < 0 ? 1 : -1)); play(); }
  });
  go(0); play();
  }

  /* ⑤ モーダルウィンドウ：data-modal を付けたボタンで開く */
  const modal = $('#modal');
  $$('[data-modal]').forEach(b => b.addEventListener('click', () => {
    $('#modal-title').textContent = b.dataset.title;
    $('.mb', modal).textContent = b.dataset.body;
    modal.showModal();
    document.body.classList.add('lock');
  }));
  $('.x', modal).addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', () => document.body.classList.remove('lock'));

  /* ⑥ アコーディオン：1つだけ開く。#food などのリンクで該当項目を開く */
  const btns = $$('.acc-btn');
  const toggle = (btn, open = btn.getAttribute('aria-expanded') !== 'true') =>
    btns.forEach(b => b.setAttribute('aria-expanded', b === btn && open));
  btns.forEach(b => b.addEventListener('click', () => toggle(b)));
  const openByHash = () => {
    const b = location.hash && document.getElementById(location.hash.slice(1))?.querySelector('.acc-btn');
    if (b) toggle(b, true);
  };
  addEventListener('hashchange', openByHash);
  openByHash();

  /* ニュース一覧：カテゴリ絞り込み */
  /* カテゴリ絞り込み（NEWS / FOOD & MARKET 共通） */
  const filters = $$('[data-filter]');
  filters.forEach(b => b.addEventListener('click', () => {
    filters.forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('[data-cat]').forEach(item => {
      item.hidden = b.dataset.filter !== 'all' && item.dataset.cat !== b.dataset.filter;
    });
  }));
  /* 補助：現在地のメニュー表示 / プレイヤーの再生ボタン */
  const navLinks = $$('.gnav a');
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('cur', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  if ($('.hero')) ['top', 'news', 'lineup', 'info'].forEach(id => { const s = document.getElementById(id); if (s) so.observe(s); });
  const playBtn = $('.play');
  playBtn?.addEventListener('click', () => {
    const on = playBtn.getAttribute('aria-pressed') !== 'true';
    playBtn.setAttribute('aria-pressed', on);
    playBtn.closest('.player').classList.toggle('on', on);
  });
})();
