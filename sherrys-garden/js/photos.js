/* =================================================================
   photos.js — 写真の一覧（サイト全体でここだけを編集する）

   ■ 写真を追加する
     1. 拡大画像を fullDir、サムネイルを thumbDir に同じファイル名で置く
     2. 下の files に、そのファイル名を1つ足す
     → ギャラリーページにも、index のランダム表示（landscape のみ）にも反映される

   ■ 写真を外す … files からファイル名を消す
   ■ 並び順 …… files の順番がそのままギャラリーの表示順
   ■ 説明文（alt）を付けたい時は、文字列の代わりに次の形で書ける：
       { file: 'photo-69.jpg', alt: '窓辺で日向ぼっこするラム' }
     書かなければ「Gallery 番号」が自動で入る
================================================================= */
window.SITE_PHOTOS = {

  /* 横長の写真（gallery1.html ／ index のランダム表示） */
  landscape: {
    fullDir: './photos/',
    thumbDir: './photos-thumb/',
    altPrefix: 'Gallery ',
    files: [
      'photo-01.jpg', 'photo-02.jpg', 'photo-03.jpg', 'photo-04.jpg',
      'photo-05.jpg', 'photo-06.jpg', 'photo-07.jpg', 'photo-08.jpg',
      'photo-09.jpg', 'photo-10.jpg', 'photo-11.jpg', 'photo-12.jpg',
      'photo-13.jpg', 'photo-14.jpg', 'photo-15.jpg', 'photo-16.jpg',
      'photo-17.jpg', 'photo-18.jpg', 'photo-19.jpg', 'photo-20.jpg',
      'photo-21.jpg', 'photo-22.jpg', 'photo-23.jpg', 'photo-24.jpg',
      'photo-25.jpg', 'photo-26.jpg', 'photo-27.jpg', 'photo-28.jpg',
      'photo-29.jpg', 'photo-30.jpg', 'photo-31.jpg', 'photo-32.jpg',
      'photo-33.jpg', 'photo-34.jpg', 'photo-35.jpg', 'photo-36.jpg',
      'photo-37.jpg', 'photo-38.jpg', 'photo-39.jpg', 'photo-40.jpg',
      'photo-41.jpg', 'photo-42.jpg', 'photo-43.jpg', 'photo-44.jpg',
      'photo-45.jpg', 'photo-46.jpg', 'photo-47.jpg', 'photo-48.jpg',
      'photo-49.jpg', 'photo-50.jpg', 'photo-51.jpg', 'photo-52.jpg',
      'photo-53.jpg', 'photo-54.jpg', 'photo-55.jpg', 'photo-56.jpg',
      'photo-57.jpg', 'photo-58.jpg', 'photo-59.jpg', 'photo-60.jpg',
      'photo-61.jpg', 'photo-62.jpg', 'photo-63.jpg', 'photo-64.jpg',
      'photo-65.jpg', 'photo-66.jpg', 'photo-67.jpg', 'photo-68.jpg',
    ],
  },

  /* 縦長の写真（gallery2.html） */
  portrait: {
    fullDir: './photos-portrait/',
    thumbDir: './photos-portrait-thumb/',
    altPrefix: 'Gallery 2-',
    files: [
      'portrait-01.jpg', 'portrait-02.jpg', 'portrait-03.jpg', 'portrait-04.jpg',
      'portrait-05.jpg', 'portrait-06.jpg', 'portrait-07.jpg', 'portrait-08.jpg',
      'portrait-09.jpg', 'portrait-10.jpg', 'portrait-11.jpg', 'portrait-12.jpg',
      'portrait-13.jpg', 'portrait-14.jpg', 'portrait-15.jpg', 'portrait-16.jpg',
      'portrait-17.jpg', 'portrait-18.jpg', 'portrait-19.jpg', 'portrait-20.jpg',
      'portrait-21.jpg', 'portrait-22.jpg', 'portrait-23.jpg', 'portrait-24.jpg',
      'portrait-25.jpg', 'portrait-26.jpg', 'portrait-27.jpg', 'portrait-28.jpg',
      'portrait-29.jpg', 'portrait-30.jpg', 'portrait-31.jpg', 'portrait-32.jpg',
      'portrait-33.jpg',
    ],
  },

};
