/* =================================================================
   home.js — index.html 専用：ランダムギャラリー
   gallery1.html に掲載中の写真から、ランダムに8枚を選んで表示する。
   → gallery1.html に写真を追加・削除すると、ここにも自動で反映される。
   取得できない環境（file:// で開いた時など）では、HTMLに書いてある初期表示のまま。
   ※ 写真の一覧を共通データ化する Phase 2 で、gallery1.html の取得は不要になる予定
================================================================= */
(() => {
  'use strict';

  const SOURCE = 'gallery1.html';
  const COUNT = 8;
  const container = document.getElementById('random-gallery');
  if (!container) return;

  // gallery1.html のギャラリー（[data-lightbox] 内のリンク）から写真の一覧を作る
  async function fetchPhotos() {
    const res = await fetch(SOURCE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    return [...doc.querySelectorAll('[data-lightbox] a[href]')]
      .map(a => {
        const img = a.querySelector('img');
        return { full: a.getAttribute('href'), thumb: img?.getAttribute('src'), alt: img?.alt || '' };
      })
      .filter(photo => photo.full && photo.thumb);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function render(photos) {
    const fragment = document.createDocumentFragment();
    photos.forEach(photo => {
      const link = document.createElement('a');
      link.className = 'gallery-item fade-in';
      link.href = photo.full;

      const img = document.createElement('img');
      img.src = photo.thumb;
      img.alt = photo.alt;
      img.loading = 'lazy';

      link.append(img);
      fragment.append(link);
    });
    container.replaceChildren(fragment);
    window.Site?.observeFadeIn(container);
  }

  fetchPhotos()
    .then(photos => {
      if (photos.length > 0) render(shuffle(photos).slice(0, COUNT));
    })
    .catch(err => {
      console.warn(`${SOURCE} から写真の一覧を取得できなかったため、初期表示のままにします。`, err);
    });
})();
