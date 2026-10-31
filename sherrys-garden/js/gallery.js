/* =================================================================
   gallery.js — photos.js の一覧からギャラリーを組み立てる
   （index / gallery1 / gallery2 共通。以前の home.js の役割もここに統合）

   HTML側の書き方：
     <div class="gallery-grid" data-lightbox data-gallery="landscape"></div>

   data属性：
     data-gallery    … photos.js のどの一覧を使うか（landscape / portrait）【必須】
     data-random="8" … ランダムに指定枚数だけ選んで表示（index 用）
     data-eager="8"  … 先頭の何枚を遅延読み込みしないか（画面上部に見える分）
     data-item-class … 各写真のリンクに追加するクラス（例："v-item"、"fade-in"）

   ※ photos.js を先に読み込むこと。lightbox.js / site.js と組み合わせて使う
================================================================= */
(() => {
  'use strict';

  const data = window.SITE_PHOTOS;
  const containers = document.querySelectorAll('[data-gallery]');
  if (containers.length === 0) return;

  if (!data) {
    console.warn('photos.js が読み込まれていないため、ギャラリーを表示できません。');
    return;
  }

  // photos.js の1件（文字列 or { file, alt }）を表示用の情報に変換
  function toPhoto(group, entry, number) {
    const file = typeof entry === 'string' ? entry : entry.file;
    const alt = (typeof entry === 'object' && entry.alt) || `${group.altPrefix || ''}${number}`;
    return { full: group.fullDir + file, thumb: group.thumbDir + file, alt };
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function render(container) {
    const key = container.dataset.gallery;
    const group = data[key];
    if (!group || !Array.isArray(group.files)) {
      console.warn(`photos.js に「${key}」の一覧がありません。`);
      return;
    }

    // alt の番号は photos.js 上の順番で振る（ランダム表示でも同じ写真には同じ alt）
    let photos = group.files.map((entry, i) => toPhoto(group, entry, i + 1));

    const randomCount = parseInt(container.dataset.random, 10);
    if (randomCount > 0) photos = shuffle(photos).slice(0, randomCount);

    const eagerCount = parseInt(container.dataset.eager, 10) || 0;
    const extraClasses = (container.dataset.itemClass || '').split(/\s+/).filter(Boolean);

    const fragment = document.createDocumentFragment();
    photos.forEach((photo, i) => {
      const link = document.createElement('a');
      link.className = 'gallery-item';
      link.classList.add(...extraClasses);
      link.href = photo.full;

      const img = document.createElement('img');
      img.src = photo.thumb;
      img.alt = photo.alt;
      if (i >= eagerCount) img.loading = 'lazy';

      link.append(img);
      fragment.append(link);
    });

    container.replaceChildren(fragment);
    window.Site?.observeFadeIn(container);
  }

  containers.forEach(render);
})();
