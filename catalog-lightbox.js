(() => {
  const links = [...document.querySelectorAll('[data-catalog-zoom]')];
  if (!links.length || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  const en = document.documentElement.lang === 'en';
  const words = en ? {
    title: 'Image viewer', close: 'Close', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    fit: 'Fit', original: 'Open original', loading: 'Loading image…',
    help: 'Use + / − to zoom; scroll to see details.', error: 'Unable to load image. Please open the original.'
  } : {
    title: '圖片放大檢視', close: '關閉', zoomIn: '放大', zoomOut: '縮小',
    fit: '全圖', original: '開啟原圖', loading: '圖片載入中…',
    help: '使用 ＋／－ 放大縮小，滑動查看細節。', error: '圖片無法載入，請開啟原圖。'
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'catalog-viewer';
  dialog.setAttribute('aria-label', words.title);
  const toolbar = document.createElement('div');
  toolbar.className = 'catalog-viewer-toolbar';
  const title = document.createElement('p');
  title.className = 'catalog-viewer-title';
  const controls = document.createElement('div');
  controls.className = 'catalog-viewer-controls';
  function button(text, label, action) {
    const el = document.createElement('button');
    el.type = 'button'; el.textContent = text; el.setAttribute('aria-label', label);
    el.addEventListener('click', action); controls.append(el); return el;
  }
  const minus = button('−', words.zoomOut, () => zoom(scale / 2));
  const plus = button('+', words.zoomIn, () => zoom(scale * 2));
  const fit = button(words.fit, words.fit, () => zoom(1));
  const original = document.createElement('a');
  original.textContent = words.original; original.target = '_blank'; original.rel = 'noopener';
  controls.append(original);
  const close = button(words.close + ' ×', words.close, () => dialog.close());
  toolbar.append(title, controls);
  const stage = document.createElement('div');
  stage.className = 'catalog-viewer-stage'; stage.tabIndex = 0;
  stage.setAttribute('aria-label', words.help);
  const picture = document.createElement('img');
  picture.className = 'catalog-viewer-picture'; stage.append(picture);
  const status = document.createElement('p');
  status.className = 'catalog-viewer-status'; status.setAttribute('role', 'status');
  dialog.append(toolbar, stage, status); document.body.append(dialog);
  let scale = 1, ready = false, opener;
  function zoom(next) {
    if (!ready) return;
    const previousWidth = picture.getBoundingClientRect().width;
    const x = stage.scrollLeft + stage.clientWidth / 2;
    const y = stage.scrollTop + stage.clientHeight / 2;
    scale = Math.min(8, Math.max(1, next));
    const base = Math.min(stage.clientWidth - 32, (stage.clientHeight - 32) * picture.naturalWidth / picture.naturalHeight);
    const width = Math.max(1, Math.round(base * scale));
    picture.style.width = width + 'px';
    minus.disabled = scale === 1; plus.disabled = scale === 8;
    fit.disabled = scale === 1;
    const ratio = previousWidth ? width / previousWidth : 1;
    stage.scrollLeft = scale === 1 ? 0 : x * ratio - stage.clientWidth / 2;
    stage.scrollTop = scale === 1 ? 0 : y * ratio - stage.clientHeight / 2;
    status.textContent = words.help + ' ' + Math.round(scale * 100) + '%';
  }
  picture.addEventListener('load', () => {
    ready = true; picture.hidden = false; zoom(1);
  });
  picture.addEventListener('error', () => {
    ready = false; status.textContent = words.error;
  });
  for (const link of links) {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); opener = link; ready = false; scale = 1;
      const thumbnail = link.querySelector('img');
      title.textContent = thumbnail.alt; picture.alt = thumbnail.alt;
      original.href = link.href; status.textContent = words.loading;
      minus.disabled = plus.disabled = fit.disabled = true;
      picture.hidden = true; picture.removeAttribute('style');
      document.documentElement.classList.add('catalog-viewer-open');
      dialog.showModal(); close.focus();
      picture.src = link.href;
    });
  }
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('catalog-viewer-open');
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(scale * 2); }
    if (event.key === '-') { event.preventDefault(); zoom(scale / 2); }
    if (event.key === '0') { event.preventDefault(); zoom(1); }
  });
  addEventListener('resize', () => { if (dialog.open) zoom(1); });
})();
