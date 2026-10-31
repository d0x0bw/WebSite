/* =================================================================
   site.js — 全ページ共通
   01. スクロールロック（メニュー・写真ビューア共通）
   02. ハンバーガーメニュー
   03. トップへ戻るボタン
   04. スクロール連動フェードイン
   ※ <head> 内のインラインスクリプトで <html> に .js クラスを付けている前提
================================================================= */
(() => {
  'use strict';

  const root = document.documentElement;

  /* --- 01. スクロールロック ----------------------------------------
     ロックの「理由」を Set で管理し、1つでも残っていればロックする。
     （メニューと写真ビューアが互いのロックを解除してしまうのを防ぐ）
     ※ html に overflow-x: clip があるため、body ではなく html に付ける。 */
  const lockReasons = new Set();

  function setScrollLock(reason, locked) {
    if (locked) lockReasons.add(reason);
    else lockReasons.delete(reason);
    root.classList.toggle('is-locked', lockReasons.size > 0);
  }

  /* --- 02. ハンバーガーメニュー --------------------------------------- */
  const menuCheck = document.getElementById('menu-btn-check');

  if (menuCheck) {
    const syncMenu = () => setScrollLock('menu', menuCheck.checked);
    const closeMenu = () => {
      menuCheck.checked = false;
      syncMenu();
    };

    menuCheck.addEventListener('change', syncMenu);

    // メニュー内のリンク・背景をタップしたら閉じる
    document.querySelectorAll('.menu-content a, .menu-background').forEach(el => {
      el.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuCheck.checked) closeMenu();
    });

    // 開いたままPC幅に広げた場合、ロックが残らないよう閉じる
    window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
      if (e.matches) closeMenu();
    });
  }

  /* --- 03. トップへ戻るボタン ----------------------------------------- */
  const GOTOP_THRESHOLD = 300;
  const goTopBtn = document.querySelector('.gotop');

  if (goTopBtn) {
    const updateGoTop = () => {
      goTopBtn.classList.toggle('is-show', window.scrollY > GOTOP_THRESHOLD);
    };
    window.addEventListener('scroll', updateGoTop, { passive: true });
    updateGoTop();
  }

  /* --- 04. スクロール連動フェードイン --------------------------------- */
  const fadeObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 一度表示したら監視をやめる
        });
      }, { rootMargin: '0px 0px -10% 0px' })
    : null;

  // 後から追加した要素（index のランダムギャラリーなど）にも使えるよう公開する
  function observeFadeIn(scope = document) {
    scope.querySelectorAll('.fade-in:not(.is-visible)').forEach(el => {
      if (fadeObserver) fadeObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  observeFadeIn();

  /* --- 他のスクリプトから使う機能 ------------------------------------- */
  window.Site = { setScrollLock, observeFadeIn };
})();
