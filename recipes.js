(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadRecipes() {
    return fetch('recipes.json')
      .then(function (res) {
        if (!res.ok) throw new Error('加载 recipes.json 失败：' + res.status);
        return res.json();
      });
  }

  function renderToc(recipes) {
    var toc = document.createElement('div');
    toc.className = 'recipe-toc';
    toc.innerHTML = '<h2>目录</h2>';
    var wrap = document.createElement('div');
    wrap.className = 'recipe-toc-links';
    recipes.forEach(function (r, i) {
      var a = document.createElement('a');
      a.href = '#r' + (i + 1);
      a.textContent = (i + 1) + ' ' + r.name;
      wrap.appendChild(a);
    });
    toc.appendChild(wrap);
    return toc;
  }

  function renderRecipe(r, index) {
    var sec = document.createElement('section');
    sec.className = 'recipe-card';
    sec.id = 'r' + (index + 1);

    // 标题
    var h2 = document.createElement('h2');
    h2.innerHTML = '<span class="idx">' + (index + 1) + '</span>' + escapeHtml(r.name);
    sec.appendChild(h2);

    // 日期
    if (r.date) {
      var d = document.createElement('div');
      d.className = 'recipe-date';
      d.textContent = r.date;
      sec.appendChild(d);
    }

    // 标签
    if (r.tags && r.tags.length) {
      var meta = document.createElement('div');
      meta.className = 'recipe-meta';
      r.tags.forEach(function (t) {
        meta.innerHTML += '<span class="recipe-tag">' + escapeHtml(t) + '</span>';
      });
      sec.appendChild(meta);
    }

    // 配料表
    if (r.ingredients && r.ingredients.length) {
      var ingWrap = document.createElement('div');
      ingWrap.className = 'recipe-block';
      ingWrap.innerHTML = '<h4>配料</h4>';
      var table = document.createElement('table');
      table.className = 'recipe-table';
      r.ingredients.forEach(function (ing) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td class="name">' + escapeHtml(ing.name) + '</td>' +
          '<td class="amt">' + escapeHtml(ing.amount) + '</td>';
        table.appendChild(tr);
      });
      ingWrap.appendChild(table);
      sec.appendChild(ingWrap);
    }

    // 做法步骤
    if (r.steps && r.steps.length) {
      var stWrap = document.createElement('div');
      stWrap.className = 'recipe-block';
      stWrap.innerHTML = '<h4>做法</h4>';
      var ol = document.createElement('ol');
      ol.className = 'recipe-steps';
      r.steps.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        ol.appendChild(li);
      });
      stWrap.appendChild(ol);
      sec.appendChild(stWrap);
    }

    // 备注
    if (r.note) {
      var note = document.createElement('div');
      note.className = 'recipe-note';
      note.textContent = r.note;
      sec.appendChild(note);
    }

    // 图片
    if (r.images && r.images.length) {
      var imgWrap = document.createElement('div');
      imgWrap.className = 'recipe-imgs';
      r.images.forEach(function (im) {
        var fig = document.createElement('figure');
        fig.innerHTML =
          '<img loading="lazy" src="' + escapeHtml(im.src) + '" alt="' + escapeHtml(im.caption || r.name) + '">' +
          '<figcaption>' + escapeHtml(im.caption || '') + '</figcaption>';
        imgWrap.appendChild(fig);
      });
      sec.appendChild(imgWrap);
    }

    return sec;
  }

  function render(recipes) {
    var root = document.getElementById('recipes-root');
    root.innerHTML = '';

    // 顶部说明
    var header = document.createElement('div');
    header.className = 'recipes-head';
    header.innerHTML =
      '<p class="recipes-sub">整理自微信聊天记录 · 共 <span>' + recipes.length + '</span> 项配方</p>';
    root.appendChild(header);

    root.appendChild(renderToc(recipes));

    recipes.forEach(function (r, i) {
      root.appendChild(renderRecipe(r, i));
    });
  }

  loadRecipes()
    .then(function (data) {
      render(data.recipes);
    })
    .catch(function (err) {
      document.getElementById('recipes-root').innerHTML =
        '<div class="empty">配方加载失败：' + escapeHtml(err.message) + '</div>';
    });
})();
