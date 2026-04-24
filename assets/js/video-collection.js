(function () {
  var activeKey = '';
  var activeTrigger = '';
  var activePlaylist = [];
  var activeIndex = 0;
  var dockEl = null;
  var modalEl = null;
  var currentHostSection = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function getVideoMap() {
    if (typeof videoData !== 'undefined') return videoData;
    return {};
  }

  function getPoemMap() {
    if (typeof poemData !== 'undefined') return poemData;
    return {};
  }

  function getAuthorMap() {
    if (typeof authorData !== 'undefined') return authorData;
    return {};
  }

  function ensureShell() {
    if (!dockEl) {
      dockEl = document.createElement('section');
      dockEl.id = 'video-collection-dock';
      dockEl.className = 'video-collection-dock';
      dockEl.innerHTML = [
        '<div class="video-collection-dock__header">',
        '  <div class="video-collection-dock__titles">',
        '    <p class="video-collection-dock__eyebrow">视频集</p>',
        '    <h3 class="video-collection-dock__title" id="videoCollectionTitle">古诗视频</h3>',
        '  </div>',
        '  <button class="video-collection-dock__close" type="button" id="videoCollectionClose" aria-label="关闭视频集">×</button>',
        '</div>',
        '<button class="video-collection-dock__stage" type="button" id="videoCollectionStage">',
        '  <div class="video-collection-dock__frame-wrap">',
        '    <iframe id="videoCollectionFrame" title="古诗视频预览" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>',
        '  </div>',
        '  <span class="video-collection-dock__hint">点击居中播放</span>',
        '</button>',
        '<div class="video-collection-dock__toolbar">',
        '  <button class="video-collection-dock__arrow" type="button" id="videoCollectionPrev" aria-label="上一个视频">←</button>',
        '  <div class="video-collection-dock__meta">',
        '    <p class="video-collection-dock__label" id="videoCollectionLabel"></p>',
        '    <div class="video-collection-dock__chips" id="videoCollectionChips"></div>',
        '  </div>',
        '  <button class="video-collection-dock__arrow" type="button" id="videoCollectionNext" aria-label="下一个视频">→</button>',
        '</div>'
      ].join('');
      document.body.appendChild(dockEl);

      byId('videoCollectionClose').addEventListener('click', function (e) {
        e.stopPropagation();
        closeCollection();
      });
      byId('videoCollectionPrev').addEventListener('click', function (e) {
        e.stopPropagation();
        stepVideo(-1);
      });
      byId('videoCollectionNext').addEventListener('click', function (e) {
        e.stopPropagation();
        stepVideo(1);
      });
      byId('videoCollectionStage').addEventListener('click', function () {
        openModal();
      });
    }

    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'video-collection-modal';
      modalEl.className = 'video-collection-modal';
      modalEl.innerHTML = [
        '<div class="video-collection-modal__scrim" data-video-modal-close></div>',
        '<div class="video-collection-modal__panel" role="dialog" aria-modal="true" aria-label="视频播放">',
        '  <div class="video-collection-modal__header">',
        '    <div>',
        '      <p class="video-collection-dock__eyebrow">播放中</p>',
        '      <h3 class="video-collection-modal__title" id="videoCollectionModalTitle">古诗视频</h3>',
        '    </div>',
        '    <button class="video-collection-dock__close" type="button" id="videoCollectionModalClose" aria-label="关闭播放">×</button>',
        '  </div>',
        '  <div class="video-collection-modal__stage">',
        '    <iframe id="videoCollectionModalFrame" title="古诗视频播放" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>',
        '  </div>',
        '  <div class="video-collection-modal__toolbar">',
        '    <button class="video-collection-dock__arrow" type="button" id="videoCollectionModalPrev" aria-label="上一个视频">←</button>',
        '    <p class="video-collection-dock__label" id="videoCollectionModalLabel"></p>',
        '    <button class="video-collection-dock__arrow" type="button" id="videoCollectionModalNext" aria-label="下一个视频">→</button>',
        '  </div>',
        '  <div class="video-collection-dock__chips video-collection-modal__chips" id="videoCollectionModalChips"></div>',
        '</div>'
      ].join('');
      document.body.appendChild(modalEl);

      modalEl.querySelectorAll('[data-video-modal-close]').forEach(function (node) {
        node.addEventListener('click', closeModal);
      });
      byId('videoCollectionModalClose').addEventListener('click', closeModal);
      byId('videoCollectionModalPrev').addEventListener('click', function () {
        stepVideo(-1);
      });
      byId('videoCollectionModalNext').addEventListener('click', function () {
        stepVideo(1);
      });
    }
  }

  function mountDock(section) {
    if (!dockEl) return;
    var hostSection = section || null;
    var hostInner = hostSection && hostSection.classList && hostSection.classList.contains('snap-section')
      ? hostSection
      : (hostSection && hostSection.closest ? hostSection.closest('.snap-section--poem, .snap-section--knowledge') : null);

    if (hostInner) {
      if (dockEl.parentNode !== hostInner) {
        hostInner.appendChild(dockEl);
      }
      dockEl.classList.add('is-anchored');
      dockEl.classList.remove('is-floating');
    } else {
      if (dockEl.parentNode !== document.body) {
        document.body.appendChild(dockEl);
      }
      dockEl.classList.add('is-floating');
      dockEl.classList.remove('is-anchored');
    }
    currentHostSection = hostSection;
  }

  function buildPlaylist(key, options) {
    var videos = getVideoMap();
    var poems = getPoemMap();
    var authors = getAuthorMap();
    var playlist = [];
    var poemName = key;
    var authorName = '';

    if (authors[key]) {
      poemName = options && options.poemName ? options.poemName : '';
      authorName = key;
    } else if (poems[key]) {
      poemName = key;
      authorName = poems[key].author;
    }

    if (poemName && videos[poemName]) {
      Object.keys(videos[poemName]).forEach(function (type) {
        playlist.push({
          owner: poemName,
          label: type,
          title: poemName + ' · ' + type,
          src: videos[poemName][type]
        });
      });
    }

    if (authorName && videos[authorName] && videos[authorName].iframe) {
      playlist.push({
        owner: authorName,
        label: '作者介绍',
        title: authorName + ' · 作者介绍',
        src: videos[authorName].iframe
      });
    }

    if (!playlist.length && authors[key] && videos[key] && videos[key].iframe) {
      playlist.push({
        owner: key,
        label: '作者介绍',
        title: key + ' · 作者介绍',
        src: videos[key].iframe
      });
    }

    if (options && options.preferredType) {
      playlist.sort(function (a, b) {
        if (a.label === options.preferredType && b.label !== options.preferredType) return -1;
        if (a.label !== options.preferredType && b.label === options.preferredType) return 1;
        return 0;
      });
    }

    return {
      key: poemName || authorName || key,
      playlist: playlist
    };
  }

  function renderChips(containerId, isModal) {
    var container = byId(containerId);
    if (!container) return;
    container.innerHTML = '';
    activePlaylist.forEach(function (item, index) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'video-collection-chip' + (index === activeIndex ? ' is-active' : '');
      chip.textContent = item.label;
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        setActiveIndex(index, isModal && true);
      });
      container.appendChild(chip);
    });
  }

  function render() {
    if (!dockEl || !activePlaylist.length) return;
    var current = activePlaylist[activeIndex];
    byId('videoCollectionTitle').textContent = activeKey || '古诗视频';
    byId('videoCollectionLabel').textContent = current.title;
    byId('videoCollectionFrame').src = current.src;
    renderChips('videoCollectionChips', false);

    var prevBtn = byId('videoCollectionPrev');
    var nextBtn = byId('videoCollectionNext');
    var disabled = activePlaylist.length <= 1;
    prevBtn.disabled = disabled;
    nextBtn.disabled = disabled;

    if (modalEl.classList.contains('is-visible')) {
      byId('videoCollectionModalTitle').textContent = activeKey || '古诗视频';
      byId('videoCollectionModalLabel').textContent = current.title;
      byId('videoCollectionModalFrame').src = current.src;
      renderChips('videoCollectionModalChips', true);
      byId('videoCollectionModalPrev').disabled = disabled;
      byId('videoCollectionModalNext').disabled = disabled;
    }
  }

  function setActiveIndex(index, syncModal) {
    if (!activePlaylist.length) return;
    activeIndex = (index + activePlaylist.length) % activePlaylist.length;
    render();
    if (syncModal && !modalEl.classList.contains('is-visible')) {
      openModal();
    }
  }

  function stepVideo(step) {
    setActiveIndex(activeIndex + step, false);
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-visible');
    var frame = byId('videoCollectionModalFrame');
    if (frame) frame.src = '';
  }

  function openModal() {
    if (!activePlaylist.length) return;
    modalEl.classList.add('is-visible');
    render();
  }

  function closeCollection() {
    if (!dockEl) return;
    dockEl.classList.remove('is-visible');
    activeKey = '';
    activeTrigger = '';
    activePlaylist = [];
    activeIndex = 0;
    byId('videoCollectionFrame').src = '';
    closeModal();
  }

  function openCollection(key, options) {
    ensureShell();
    var pack = buildPlaylist(key, options || {});
    if (!pack.playlist.length) {
      closeCollection();
      return;
    }

    if (dockEl.classList.contains('is-visible') && activeKey === pack.key && activeTrigger === ((options && options.trigger) || 'title')) {
      closeCollection();
      return;
    }

    activeKey = pack.key;
    activeTrigger = (options && options.trigger) || 'title';
    activePlaylist = pack.playlist;
    activeIndex = 0;
    mountDock((options && options.section) || currentHostSection);
    dockEl.classList.add('is-visible');
    render();
  }

  window.openVideoCollectionByKey = function (key, options) {
    openCollection(key, options || {});
  };

  window.closeVideoCollection = closeCollection;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modalEl && modalEl.classList.contains('is-visible')) {
        closeModal();
        return;
      }
      if (dockEl && dockEl.classList.contains('is-visible')) {
        closeCollection();
      }
    }
  });
})();
