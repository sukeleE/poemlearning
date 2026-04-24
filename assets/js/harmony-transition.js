(function () {
  var transitionNonce = 0;
  var FLY_PREP_MS = 70;
  var FLY_TRAVEL_MS = 640;
  var SWITCH_GAP_MS = 120;
  var FLY_FADE_OUT_MS = 220;
  var CARD_COLLAPSE_MS = 320;

  function createViewTransition() {
    var transition = document.createElement('div');
    transition.className = 'view-transition';
    document.body.appendChild(transition);
    requestAnimationFrame(function () {
      transition.classList.add('is-active');
    });
    return transition;
  }

  function getElementRect(element) {
    var rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  }

  /**
   * 飞字落点：知识文本框出现区域（主栏内、导读卡片下方；无卡片时为主栏顶部内容区）
   */
  function getKnowledgeTargetRect(section) {
    var inner = section.querySelector('.snap-section__inner');
    if (!inner) return getElementRect(section);
    var ir = inner.getBoundingClientRect();
    var padLeft = parseFloat(getComputedStyle(inner).paddingLeft) || 0;
    var padTop = parseFloat(getComputedStyle(inner).paddingTop) || 0;
    var firstDetail = inner.querySelector('.poem-line-detail');
    var article = inner.querySelector('article.card, article');
    var top;

    if (article && firstDetail && firstDetail.compareDocumentPosition(article) & Node.DOCUMENT_POSITION_FOLLOWING) {
      top = ir.top + padTop + 48;
    } else if (article) {
      top = article.getBoundingClientRect().bottom + 12;
    } else {
      top = ir.top + padTop + 48;
    }

    var left = ir.left + padLeft;

    return {
      left: left,
      top: top,
      width: 220,
      height: 56,
      centerX: left + 110,
      centerY: top + 28
    };
  }

  function createAnchorElement(titleText) {
    var anchor = document.createElement('div');
    anchor.className = 'view-transition__anchor';
    anchor.textContent = titleText;
    return anchor;
  }

  function readTypography(el) {
    if (!el) return null;
    var cs = window.getComputedStyle(el);
    return {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
      color: cs.color,
      textShadow: cs.textShadow,
      writingMode: cs.writingMode,
      textOrientation: cs.textOrientation,
      textAlign: cs.textAlign,
      whiteSpace: cs.whiteSpace,
      padding: cs.padding
    };
  }

  function applyTypography(anchor, typo) {
    if (!anchor || !typo) return;
    anchor.style.fontFamily = typo.fontFamily || '';
    anchor.style.fontSize = typo.fontSize || '';
    anchor.style.fontWeight = typo.fontWeight || '';
    anchor.style.letterSpacing = typo.letterSpacing || '';
    anchor.style.lineHeight = typo.lineHeight || '';
    anchor.style.color = typo.color || '';
    anchor.style.textShadow = typo.textShadow || 'none';
    anchor.style.writingMode = typo.writingMode || '';
    anchor.style.textOrientation = typo.textOrientation || '';
    anchor.style.textAlign = typo.textAlign || 'left';
    anchor.style.whiteSpace = typo.whiteSpace === 'nowrap' ? 'normal' : (typo.whiteSpace || 'normal');
    anchor.style.padding = typo.padding || '0';
  }

  function measureFlyTarget(contentInner, isPoemLine, targetDetail, fallbackText) {
    var probe = document.createElement('h2');
    var text = fallbackText || '';
    if (isPoemLine && targetDetail) {
      var heading = targetDetail.querySelector('h3.hero-title');
      text = (heading && heading.textContent) || fallbackText || '';
      probe.className = 'hero-title detail-outer-title detail-anchor-proxy';
      probe.setAttribute('data-fly-anchor', 'detail-title');
      probe.textContent = text;
      contentInner.insertBefore(probe, targetDetail);
    } else {
      probe.className = 'hero-title section-fly-title detail-anchor-proxy';
      probe.setAttribute('data-fly-anchor', 'section-title');
      probe.textContent = text;
      contentInner.insertBefore(probe, contentInner.firstChild);
    }

    var rect = probe.getBoundingClientRect();
    var typo = readTypography(probe);
    probe.remove();
    return {
      rect: rect,
      typo: typo,
      text: text
    };
  }


  function hideDetail(detail, immediate) {
    if (!detail) return;
    if (immediate) {
      detail.style.display = 'none';
      detail.classList.remove('is-visible');
      detail.classList.remove('is-hiding');
      return;
    }
    if (detail.style.display === 'none' || (!detail.classList.contains('is-visible') && !detail.classList.contains('is-hiding'))) {
      detail.style.display = 'none';
      detail.classList.remove('is-visible');
      detail.classList.remove('is-hiding');
      return;
    }
    detail.classList.remove('is-visible');
    detail.classList.add('is-hiding');
    var onEnd = function () {
      detail.style.display = 'none';
      detail.classList.remove('is-hiding');
    };
    detail.addEventListener('transitionend', onEnd, { once: true });
  }

  function hideAllDetails(contentInner, immediate) {
    var allDetails = contentInner.querySelectorAll('.poem-line-detail');
    allDetails.forEach(function (detail) {
      hideDetail(detail, immediate);
    });
  }

  function removeTransientTitles(contentInner, immediate) {
    var titles = contentInner.querySelectorAll(':scope > .detail-outer-title, :scope > .section-fly-title');
    titles.forEach(function (title) {
      if (!immediate) {
        title.classList.add('is-hiding');
        setTimeout(function () {
          if (title.parentNode) title.remove();
        }, 320);
        return;
      }
      title.remove();
    });
  }

  function createOuterDetailTitle(contentInner, targetDetail, fallbackText) {
    var detailHeading = targetDetail.querySelector('h3.hero-title');
    var titleText = (detailHeading && detailHeading.textContent) || fallbackText || '';
    if (!titleText) return;
    var title = document.createElement('h2');
    title.className = 'hero-title detail-outer-title';
    title.textContent = titleText;
    contentInner.insertBefore(title, targetDetail);
  }

  function collapseSection(contentInner, section, immediate) {
    hideAllDetails(contentInner, immediate);
    removeTransientTitles(contentInner, immediate);
    contentInner.classList.remove('is-visible');
    contentInner.classList.remove('is-showing-detail');
    section.classList.remove('is-interactive-content-open');
    section.removeAttribute('data-active-mode');
    section.removeAttribute('data-active-key');
  }

  // 仅收起“解析卡/导读卡”，保留古诗正文展开态（不动 is-interactive-content-open）
  function collapseDetailOnly(contentInner, section, immediate) {
    hideAllDetails(contentInner, immediate);
    removeTransientTitles(contentInner, immediate);
    contentInner.classList.remove('is-showing-detail');

    // 保持主容器仍可见（避免正文随之收回）
    contentInner.classList.add('is-visible');
    section.classList.add('is-interactive-content-open');

    // 标记为标题态，便于后续“再次点标题”执行总收回
    section.setAttribute('data-active-mode', 'title');
    section.setAttribute('data-active-key', (section.getAttribute('data-center-title') || section.getAttribute('data-center-label') || '').trim());
  }

  function dismissSectionDetails(section, immediate) {
    if (!section) return;
    var inner = section.querySelector('.snap-section__inner');
    if (!inner) return;
    collapseSection(inner, section, immediate !== false);
  }

  function collapseAllOtherSections(currentSection) {
    var opened = document.querySelectorAll('.snap-section[data-active-mode], .snap-section--knowledge[data-active-mode], .snap-section--poem[data-active-mode]');
    opened.forEach(function (sec) {
      if (sec === currentSection) return;
      var inner = sec.querySelector('.snap-section__inner');
      if (!inner) return;
      collapseSection(inner, sec, true);
    });

    // 兜底：即使缺少 data-active-mode，也仅保留当前 section 的一个主内容容器
    var visibleInners = document.querySelectorAll('.snap-section .snap-section__inner.is-visible');
    visibleInners.forEach(function (inner) {
      var sec = inner.closest('.snap-section');
      if (!sec || sec === currentSection) return;
      collapseSection(inner, sec, true);
    });
  }

  function revealDetailPanel(targetDetail, afterVisible) {
    targetDetail.style.display = 'block';
    targetDetail.classList.remove('is-visible');
    targetDetail.offsetHeight;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        targetDetail.classList.add('is-visible');
        try {
          targetDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
        if (typeof afterVisible === 'function') {
          afterVisible();
        }
      });
    });
  }

  function syncAuthorCardIntoTitleDetail(section, targetDetail, isPoemLine) {
    if (!section || !targetDetail || isPoemLine) return;
    if (!section.classList.contains('snap-section--poem')) return;
    if (targetDetail.getAttribute('data-detail') !== '0') return;

    var authorCard = section.querySelector('.author-card[id^="author-card-"]');
    if (!authorCard) return;

    var authorHeader = authorCard.querySelector('.author-card__header');
    var authorContent = authorCard.querySelector('.author-card__content');
    if (!authorHeader || !authorContent) return;

    var host = targetDetail.querySelector('[data-author-title-card-content]');
    if (!host) {
      host = document.createElement('div');
      host.setAttribute('data-author-title-card-content', 'true');
      targetDetail.appendChild(host);
    }

    host.innerHTML = '';

    var clonedHeader = authorHeader.cloneNode(true);
    var clonedContent = authorContent.cloneNode(true);
    host.appendChild(clonedHeader);
    host.appendChild(clonedContent);
  }

  function animateTransition(element, section, isPoemLine) {
    var contentInner = section.querySelector('.snap-section__inner');
    if (!contentInner) return;
    ++transitionNonce;

    var clickedKey = isPoemLine ? element.getAttribute('data-line') : (element.textContent || '').trim();
    if (!clickedKey) return;
    var activeMode = section.getAttribute('data-active-mode');
    var activeKey = section.getAttribute('data-active-key');
    var nextMode = isPoemLine ? 'detail' : 'title';
    var shouldCollapse = false;

    if (isPoemLine) {
      shouldCollapse = activeMode === 'detail' && activeKey === clickedKey;
    } else {
      // 再次点击子页标题时，无论当前展开的是标题总览卡、诗句解析卡、作者卡还是视频卡，
      // 只要当前 section 已处于以该标题激活的展开态，就统一收回全部内容。
      shouldCollapse =
        activeKey === clickedKey &&
        (activeMode === 'title' || activeMode === 'detail' || contentInner.classList.contains('is-visible'));
    }

    if (shouldCollapse) {
      // 诗句再次点击：只收起解析卡，不收回古诗正文
      if (isPoemLine) {
        collapseDetailOnly(contentInner, section, true);
        if (typeof window.dismissActiveInfoCard === 'function') {
          window.dismissActiveInfoCard();
        }
        return;
      }

      // 标题再次点击：总收回（正文 + 各种卡片）
      collapseSection(contentInner, section, true);
      if (typeof window.dismissActiveInfoCard === 'function') {
        window.dismissActiveInfoCard();
      }
      if (!isPoemLine && section.classList.contains('snap-section--poem') && typeof window.closeVideoCollection === 'function') {
        window.closeVideoCollection();
      }
      return;
    }

    // 全局互斥：任意时刻仅允许一个知识框/标题展开（无飞字动效）
    collapseAllOtherSections(section);
    hideAllDetails(contentInner, true);
    removeTransientTitles(contentInner, true);
    if (typeof window.dismissActiveInfoCard === 'function') {
      window.dismissActiveInfoCard();
    }

    // 标题点击后再展开“可交互内容文本”（诗句/知识条）
    if (!isPoemLine) {
      section.classList.add('is-interactive-content-open');
    }

    var targetDetail = null;
    if (isPoemLine) {
      var lineNumber = element.getAttribute('data-line');
      if (!lineNumber) return;
      targetDetail = contentInner.querySelector('.poem-line-detail[data-detail="' + lineNumber + '"]');
      if (!targetDetail) {
        return;
      }
    } else {
      // 知识页标题点击：默认展示 data-detail="0" 的总览教学卡，避免出现空白页
      if (section.classList.contains('snap-section--knowledge')) {
        targetDetail = contentInner.querySelector('.poem-line-detail[data-detail="0"]');
        if (!targetDetail) {
          contentInner.classList.add('is-visible');
          section.setAttribute('data-active-mode', 'title');
          section.setAttribute('data-active-key', clickedKey);
          return;
        }
      } else {
        // 诗页标题点击：优先展示整首导读卡 data-detail="0"，无则回退到首条 data-detail="1"
        targetDetail = contentInner.querySelector('.poem-line-detail[data-detail="0"]')
          || contentInner.querySelector('.poem-line-detail[data-detail="1"]');
        if (!targetDetail) {
          // 若无讲解卡则回退为展开 section 主内容
          contentInner.classList.add('is-visible');
          section.setAttribute('data-active-mode', 'title');
          section.setAttribute('data-active-key', clickedKey);
          return;
        }
      }
    }

    if (targetDetail) {
      syncAuthorCardIntoTitleDetail(section, targetDetail, isPoemLine);
      contentInner.classList.add('is-visible');
      contentInner.classList.add('is-showing-detail');
      createOuterDetailTitle(contentInner, targetDetail, element.textContent);
      section.setAttribute('data-active-mode', 'detail');
      section.setAttribute('data-active-key', clickedKey);
      // 使用revealDetailPanel函数来显示targetDetail元素，确保CSS过渡动画正确触发
      revealDetailPanel(targetDetail);
      if (!isPoemLine && typeof window.openVideoCollectionByKey === 'function') {
        if (section.classList.contains('snap-section--poem')) {
          var poemName = section.getAttribute('data-center-title') || clickedKey;
          window.openVideoCollectionByKey(poemName, { trigger: 'title', section: section });
        } else if (section.classList.contains('snap-section--knowledge')) {
          var knowledgeKey = (section.getAttribute('data-center-label') || clickedKey || '').trim();
          if (knowledgeKey) {
            window.openVideoCollectionByKey(knowledgeKey, { trigger: 'title', section: section });
          }
        }
      }
      return;
    }

    // 不再把标题插入正文区；标题本体保持在左上可交互区
    section.setAttribute('data-active-mode', 'detail');
    section.setAttribute('data-active-key', clickedKey);
  }

  function initEventListeners() {
    var poemTitles = document.querySelectorAll('.poem-vertical-script__title');
    poemTitles.forEach(function (title) {
      title.addEventListener('click', function (e) {
        e.stopPropagation();
        var section = title.closest('.snap-section--poem');
        if (section) {
          animateTransition(title, section, false);
        }
      });
    });

    var heroTitles = document.querySelectorAll('.hero-title');
    heroTitles.forEach(function (title) {
      title.addEventListener('click', function (e) {
        e.stopPropagation();
        var section = title.closest('.snap-section--poem');
        if (section) {
          // 找到对应的poem-vertical-script__title元素
          var poemTitle = section.querySelector('.poem-vertical-script__title');
          if (poemTitle) {
            animateTransition(poemTitle, section, false);
          }
        }
      });
    });

    var interactiveLines = document.querySelectorAll(
      '.poem-vertical-script .poem-line, .knowledge-script .knowledge-line'
    );
    interactiveLines.forEach(function (line) {
      line.addEventListener('click', function (e) {
        e.stopPropagation();
        var section = line.closest('.snap-section--poem, .snap-section--knowledge');
        if (section) {
          animateTransition(line, section, true);
        }
      });
    });
  }

  function removeExistingTitles() {
    var poemSections = document.querySelectorAll('.snap-section--poem');
    poemSections.forEach(function (section) {
      var inner = section.querySelector('.snap-section__inner');
      if (!inner) return;
      var existingTitle = inner.querySelector(':scope > .hero-title');
      if (existingTitle) {
        existingTitle.remove();
      }
    });
  }

  function removeSectionInteractiveTitles() {
    var sectionTitles = document.querySelectorAll('.section-interactive-title');
    sectionTitles.forEach(function (el) { el.remove(); });
  }

  function removeCenterTitleHits() {
    var hits = document.querySelectorAll('.center-title-hit');
    hits.forEach(function (el) { el.remove(); });
  }

  function ensureCenterTitleHits() {
    var sections = document.querySelectorAll('.snap-section--poem, .snap-section--knowledge');
    sections.forEach(function (section) {
      if (section.querySelector('.center-title-hit')) return;

      function makeHit(text, kind) {
        if (!text) return null;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'center-title-hit center-title-hit--' + kind;
        btn.textContent = text;
        btn.addEventListener('mouseenter', function () {
          section.classList.toggle('is-center-title-hover', kind === 'main');
          section.classList.toggle('is-center-sub-hover', kind === 'sub');
        });
        btn.addEventListener('mouseleave', function () {
          section.classList.remove('is-center-title-hover');
          section.classList.remove('is-center-sub-hover');
        });
        btn.addEventListener('click', function () {
          animateTransition(btn, section, false);
        });
        return btn;
      }

      if (section.classList.contains('snap-section--poem')) {
        var mainTitle = section.getAttribute('data-center-title');
        var subTitle = section.getAttribute('data-center-author');
        var hitMain = makeHit(mainTitle, 'main');
        var hitSub = makeHit(subTitle, 'sub');
        if (hitMain) section.appendChild(hitMain);
        if (hitSub) section.appendChild(hitSub);
      } else {
        var label = section.getAttribute('data-center-label');
        var hitLabel = makeHit(label, 'main');
        if (hitLabel) section.appendChild(hitLabel);
      }
    });
  }

  function boot() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        removeSectionInteractiveTitles();
        removeCenterTitleHits();
        ensureCenterTitleHits();
        // 默认隐藏：可交互内容文本需在点击子页标题后展开
        document.querySelectorAll('.snap-section--poem, .snap-section--knowledge').forEach(function (sec) {
          sec.classList.remove('is-interactive-content-open');
        });
        removeExistingTitles();
        initEventListeners();
      });
    } else {
      removeSectionInteractiveTitles();
      removeCenterTitleHits();
      ensureCenterTitleHits();
      document.querySelectorAll('.snap-section--poem, .snap-section--knowledge').forEach(function (sec) {
        sec.classList.remove('is-interactive-content-open');
      });
      removeExistingTitles();
      initEventListeners();
    }
  }

  boot();

  window.dismissSectionDetails = dismissSectionDetails;
})();