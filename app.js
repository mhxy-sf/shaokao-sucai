(function () {
  'use strict';

  var IMG_EXT = /\.(jpe?g|png|webp|gif|bmp|svg|avif)$/i;

  function isImage(file) {
    return IMG_EXT.test(file);
  }

  function extOf(file) {
    var m = file.match(/\.([^.]+)$/);
    return m ? m[1].toUpperCase() : 'FILE';
  }

  function loadData() {
    return fetch('data.json')
      .then(function (res) {
        if (!res.ok) throw new Error('加载 data.json 失败：' + res.status);
        return res.json();
      });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderTabs(categories) {
    var tabs = document.getElementById('tabs');
    tabs.innerHTML = '';
    categories.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.className = 'tab';
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;
      btn.addEventListener('click', function () {
        var target = document.getElementById('cat-' + cat.id);
        if (target) {
          expandCategory(target);
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setActiveTab(cat.id);
      });
      tabs.appendChild(btn);
    });
  }

  function setActiveTab(id) {
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.id === id);
    });
  }

  function expandCategory(section) {
    var body = section.querySelector('.category-body');
    var head = section.querySelector('.category-head');
    if (body && body.hidden) {
      body.hidden = false;
      head.setAttribute('aria-expanded', 'true');
      section.classList.add('open');
    }
  }

  function renderCategory(cat) {
    var section = document.createElement('section');
    section.className = 'category';
    section.id = 'cat-' + cat.id;

    var imgItems = cat.items.filter(function (it) { return isImage(it.file); });
    var fileItems = cat.items.filter(function (it) { return !isImage(it.file); });

    var head = document.createElement('button');
    head.className = 'category-head';
    head.type = 'button';
    head.setAttribute('aria-expanded', 'false');
    head.innerHTML =
      '<span class="chevron" aria-hidden="true"></span>' +
      '<h2>' + escapeHtml(cat.name) + '</h2>' +
      '<span class="count">' + cat.items.length + ' 个</span>';
    section.appendChild(head);

    var body = document.createElement('div');
    body.className = 'category-body';
    body.hidden = true;

    var desc = document.createElement('p');
    desc.className = 'category-desc';
    desc.textContent = cat.desc || '';
    body.appendChild(desc);

    if (imgItems.length > 0) {
      var grid = document.createElement('div');
      grid.className = 'grid';
      imgItems.forEach(function (it) {
        grid.appendChild(renderImageCard(it));
      });
      body.appendChild(grid);
    }

    if (fileItems.length > 0) {
      var list = document.createElement('div');
      list.className = 'file-list';
      fileItems.forEach(function (it) {
        list.appendChild(renderFileCard(it));
      });
      body.appendChild(list);
    }

    if (cat.items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = '该分组暂无素材';
      body.appendChild(empty);
    }

    section.appendChild(body);

    head.addEventListener('click', function () {
      var collapsed = body.hidden;
      body.hidden = !collapsed;
      head.setAttribute('aria-expanded', String(!collapsed));
      section.classList.toggle('open', !collapsed);
    });

    return section;
  }

  function renderImageCard(it) {
    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<img class="card-img" loading="lazy" src="' + escapeHtml(it.file) + '" alt="' + escapeHtml(it.name) + '">' +
      '<div class="card-body">' +
        '<span class="card-name">' + escapeHtml(it.name) + '</span>' +
        '<a class="dl-icon" href="' + escapeHtml(it.file) + '" download title="下载">&darr;</a>' +
      '</div>';

    card.querySelector('.card-img').addEventListener('click', function () {
      openLightbox(it);
    });
    card.querySelector('.dl-icon').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    return card;
  }

  function renderFileCard(it) {
    var a = document.createElement('a');
    a.className = 'file-card';
    a.href = it.file;
    a.setAttribute('download', '');
    a.innerHTML =
      '<div class="file-icon">' + escapeHtml(extOf(it.file)) + '</div>' +
      '<div class="file-meta">' +
        '<div class="file-name">' + escapeHtml(it.name) + '</div>' +
        '<div class="file-type">' + escapeHtml(it.file) + '</div>' +
      '</div>' +
      '<span class="file-dl">下载</span>';
    return a;
  }

  // ---------- Lightbox ----------
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxName = document.getElementById('lightboxName');
  var lightboxDownload = document.getElementById('lightboxDownload');

  function openLightbox(it) {
    lightboxImg.src = it.file;
    lightboxImg.alt = it.name;
    lightboxName.textContent = it.name;
    lightboxDownload.href = it.file;
    lightboxDownload.setAttribute('download', it.name || '');
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  lightbox.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  // ---------- 滚动高亮当前分组 ----------
  var sectionObserver;
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    var sections = Array.prototype.slice.call(document.querySelectorAll('.category'));
    sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id.replace('cat-', ''));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  // ---------- 板块切换 ----------
  function initBoardSwitch() {
    var boards = document.querySelectorAll('.board-btn');
    var tabsNav = document.getElementById('tabs');
    boards.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.dataset.board;
        boards.forEach(function (b) { b.classList.toggle('active', b === btn); });
        document.getElementById('board-recipes').hidden = (target !== 'recipes');
        document.getElementById('board-gallery').hidden = (target !== 'gallery');
        // 切到图片素材时显示分组导航，切到配方时隐藏
        tabsNav.style.display = (target === 'gallery') ? '' : 'none';
        window.scrollTo({ top: 0 });
      });
    });
  }

  // ---------- 启动 ----------
  loadData()
    .then(function (data) {
      document.getElementById('siteName').textContent = data.site.name || '素材库';
      document.getElementById('siteSubtitle').textContent = data.site.subtitle || '';
      document.title = (data.site.name || '素材库') + ' · 配方与图片素材库';

      renderTabs(data.categories);

      var main = document.getElementById('main');
      main.innerHTML = '';
      data.categories.forEach(function (cat) {
        main.appendChild(renderCategory(cat));
      });

      // 默认激活第一个分组
      if (data.categories.length > 0) setActiveTab(data.categories[0].id);
      initScrollSpy();
      initBoardSwitch();
    })
    .catch(function (err) {
      document.getElementById('main').innerHTML =
        '<div class="empty">数据加载失败：' + escapeHtml(err.message) + '</div>';
    });
})();
