/* =================================================================
   lightbox.js — 写真ビューア（index / gallery1 / gallery2 共通）

   使い方：
     <div data-lightbox>
       <a class="gallery-item" href="拡大画像.jpg"><img src="サムネイル.jpg" alt="..."></a>
       ...
     </div>
   ・[data-lightbox] の中のリンクをクリックするとビューアで開く
   ・同じ [data-lightbox] 内の写真が「前へ／次へ」の対象になる
   ・JSが無効な環境では、リンク先の画像がそのまま開く
   ・ビューアの部品はページに1つだけ生成し、写真を差し替えて使う
     （以前のように全写真分のモーダルを持たないので、拡大画像は開いた時だけ読み込む）

   操作：← → で前後、Esc で閉じる、背景・写真クリックで閉じる
   ※ site.js（window.Site）を先に読み込むこと
================================================================= */
(() => {
  'use strict';

  /* --- 設定 ----------------------------------------------------------- */
  const IDLE_DELAY = 3000;   // 再生中、無操作でUIを隠すまでの時間（ミリ秒）
  const DEFAULT_SEC = 5;     // スライドショーの初期秒数
  const MIN_SEC = 1;
  const MAX_SEC = 60;
  const ITEM_SELECTOR = '[data-lightbox] a[href]';

  /* --- アイコン ------------------------------------------------------- */
  const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  const ICON = {
    play: `<svg class="icon-play" ${SVG} stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg class="icon-pause" ${SVG} stroke-width="2"><line x1="10" y1="5" x2="10" y2="19"></line><line x1="14" y1="5" x2="14" y2="19"></line></svg>`,
    fullscreen: `<svg ${SVG} stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`,
    close: `<svg ${SVG} stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    prev: `<svg ${SVG} stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    next: `<svg ${SVG} stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  };

  /* --- 状態 ----------------------------------------------------------- */
  let box = null;        // ビューア本体（初回に生成）
  let ui = {};           // ビューア内の要素
  let items = [];        // 現在開いているグループのリンク一覧
  let index = 0;         // 表示中の写真の番号
  let opener = null;     // 開く前にフォーカスしていた要素（閉じたら戻す）
  let playing = false;
  let sec = DEFAULT_SEC;
  let slideTimer = null;
  let idleTimer = null;
  let tappedWhileIdle = false;

  const isOpen = () => !!box && box.classList.contains('is-open');
  const lock = locked => window.Site?.setScrollLock('lightbox', locked);

  /* --- ビューアの生成 ------------------------------------------------- */
  function build() {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '写真ビューア');
    box.innerHTML = `
      <div class="lightbox-progress"></div>
      <div class="lightbox-header">
        <div class="lightbox-counter"><span data-ui="current">1</span> / <span data-ui="total">1</span></div>
        <div class="lightbox-controls">
          <div class="slideshow-settings">
            <button type="button" class="lb-btn lb-play" data-action="play" data-ui="play" aria-pressed="false" aria-label="スライドショーを再生">${ICON.play}${ICON.pause}</button>
            <button type="button" class="sec-btn" data-action="sec-down" aria-label="秒数を減らす">−</button>
            <span class="sec-display"><span data-ui="sec">${DEFAULT_SEC}</span>秒</span>
            <button type="button" class="sec-btn" data-action="sec-up" aria-label="秒数を増やす">＋</button>
          </div>
          <button type="button" class="lb-btn" data-action="fullscreen" data-ui="fullscreen" aria-label="全画面表示の切り替え">${ICON.fullscreen}</button>
          <button type="button" class="lb-btn" data-action="close" data-ui="close" aria-label="閉じる">${ICON.close}</button>
        </div>
      </div>
      <button type="button" class="lightbox-nav prev" data-action="prev" aria-label="前の写真">${ICON.prev}</button>
      <figure class="lightbox-stage"><img class="lightbox-img" data-ui="img" alt=""></figure>
      <button type="button" class="lightbox-nav next" data-action="next" aria-label="次の写真">${ICON.next}</button>
    `;
    document.body.append(box);

    box.querySelectorAll('[data-ui]').forEach(el => { ui[el.dataset.ui] = el; });
    ui.progress = box.querySelector('.lightbox-progress');

    // 全画面表示に対応していない環境（iPhone の Safari など）ではボタンを隠す
    if (!(document.fullscreenEnabled && box.requestFullscreen)) ui.fullscreen.hidden = true;

    const markLoaded = () => ui.img.classList.add('is-loaded');
    ui.img.addEventListener('load', markLoaded);
    ui.img.addEventListener('error', markLoaded);

    box.addEventListener('click', onBoxClick);
    box.addEventListener('pointerdown', () => {
      tappedWhileIdle = box.classList.contains('is-idle');
      showControls();
    });
    box.addEventListener('mousemove', showControls);

    void box.offsetWidth; // 初回オープン時もフェードのトランジションが効くように
  }

  /* --- 開く・閉じる --------------------------------------------------- */
  function open(link) {
    if (!box) build();
    const group = link.closest('[data-lightbox]');
    items = [...group.querySelectorAll('a[href]')];
    opener = link;
    ui.total.textContent = items.length;

    show(items.indexOf(link));
    box.classList.add('is-open');
    lock(true);
    // 表示が反映された次のフレームでフォーカスを移す（初回生成直後は即時だと効かないため）
    requestAnimationFrame(() => ui.close.focus({ preventScroll: true }));
  }

  function close() {
    stop();
    box.classList.remove('is-open', 'is-idle');
    lock(false);
    if (document.fullscreenElement === box) document.exitFullscreen().catch(() => {});
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  }

  /* --- 写真の表示・切り替え ------------------------------------------- */
  function show(i) {
    index = (i + items.length) % items.length;
    const link = items[index];
    const thumb = link.querySelector('img');
    const img = ui.img;

    img.classList.remove('is-loaded');
    img.alt = thumb ? thumb.alt : '';
    if (img.src === link.href && img.complete) {
      void img.offsetWidth;           // 同じ写真を開き直した時は load が発生しないため
      img.classList.add('is-loaded');
    } else {
      img.src = link.href;            // 読み込み完了で .is-loaded が付く
    }

    ui.current.textContent = index + 1;
    preload(index + 1);
  }

  // 次の写真を先読みしておく（スライドショーや「次へ」で待たされないように）
  function preload(i) {
    const next = items[i % items.length];
    if (next) new Image().src = next.href;
  }

  function step(dir) {
    show(index + dir);
    if (playing) restartTimer(); // 手動で切り替えたらタイマーを仕切り直す
  }

  /* --- スライドショー ------------------------------------------------- */
  function play() {
    playing = true;
    updatePlayButton();
    restartTimer();
    scheduleIdle();
  }

  function stop() {
    playing = false;
    updatePlayButton();
    clearTimeout(slideTimer);
    resetProgress();
    clearTimeout(idleTimer);
    box.classList.remove('is-idle');
  }

  function restartTimer() {
    clearTimeout(slideTimer);
    startProgress();
    slideTimer = setTimeout(() => step(1), sec * 1000);
  }

  function changeSec(diff) {
    sec = Math.min(MAX_SEC, Math.max(MIN_SEC, sec + diff));
    ui.sec.textContent = sec;
    if (playing) restartTimer();
  }

  function updatePlayButton() {
    ui.play.setAttribute('aria-pressed', String(playing));
    ui.play.setAttribute('aria-label', playing ? 'スライドショーを一時停止' : 'スライドショーを再生');
  }

  function startProgress() {
    const bar = ui.progress;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth; // 0% を即座に反映させてからアニメーションを開始
    bar.style.transition = `width ${sec}s linear`;
    bar.style.width = '100%';
  }

  function resetProgress() {
    ui.progress.style.transition = 'none';
    ui.progress.style.width = '0%';
  }

  /* --- 再生中のUI自動非表示 ------------------------------------------- */
  function scheduleIdle() {
    clearTimeout(idleTimer);
    if (!playing) return;
    idleTimer = setTimeout(() => box.classList.add('is-idle'), IDLE_DELAY);
  }

  function showControls() {
    box.classList.remove('is-idle');
    scheduleIdle();
  }

  /* --- 全画面表示 ----------------------------------------------------- */
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      box.requestFullscreen().catch(err => console.warn('全画面表示に切り替えられませんでした', err));
    }
  }

  /* --- イベント ------------------------------------------------------- */
  const ACTIONS = {
    prev: () => step(-1),
    next: () => step(1),
    play: () => (playing ? stop() : play()),
    'sec-down': () => changeSec(-1),
    'sec-up': () => changeSec(1),
    fullscreen: toggleFullscreen,
    close: close,
  };

  function onBoxClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (btn) {
      ACTIONS[btn.dataset.action]();
      return;
    }
    // 再生中にUIが隠れている時のタップは、UIを再表示するだけにする
    if (tappedWhileIdle) {
      tappedWhileIdle = false;
      return;
    }
    close(); // 背景・写真のクリックで閉じる
  }

  function onKeydown(e) {
    if (!isOpen()) return;
    showControls();
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); step(1); break;
      case 'ArrowLeft':  e.preventDefault(); step(-1); break;
      case 'Escape':     close(); break;
      case 'Tab':        trapFocus(e); break;
    }
  }

  // ビューアを開いている間、Tab キーのフォーカスをビューア内に閉じ込める
  function trapFocus(e) {
    const focusables = [...box.querySelectorAll('button:not([hidden])')];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // サムネイルのクリック（Ctrl/⌘クリックなどの「新しいタブで開く」はそのまま通す）
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest(ITEM_SELECTOR);
    if (!link) return;
    e.preventDefault();
    open(link);
  });

  document.addEventListener('keydown', onKeydown);

  // ギャラリーがあるページでは先に生成しておく（初回オープン時の表示・フォーカスを安定させる）
  if (document.querySelector('[data-lightbox]')) build();
})();
