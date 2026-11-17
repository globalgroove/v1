/* WORK PAGE SCRIPT - shared by every project page (loaded after base.js).
   Part 1 builds the page from the PAGE block, part 2 is the audio player, part 3 the image viewer.
   No need to edit: change a project in its own index.html, the menu in assets/site.js. */

/* ---- PART 1 of 3: BUILDER ---- */
(function(){
  try {
    var C = PAGE;
    function $(id){ return document.getElementById(id); }
    function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
    function pad(n){ return String(n).padStart(3,'0'); }

    // page identity: browser tab title, big title, tabs, footer
    document.title = C.browserTitle;
    $('title-main').textContent = C.title;
    $('title-variant').textContent = C.variant;
    if ($('tab-top')) $('tab-top').textContent = pad(C.number);

    // close (×, top right) and the Esc key: back to the Work page.
    // Esc first closes the menu or an enlarged image if one is open.
    var close = $('close');
    if (close) {
      close.href = (C.root || '') + (C.back || 'work/index.html');
      close.setAttribute('aria-label', 'Close, back to Work');
      close.title = 'Back to Work';
      document.addEventListener('keydown', function(e){
        if (e.key !== 'Escape') return;
        var menu = document.getElementById('site-menu'), dlg = document.querySelector('.lightbox');
        if ((dlg && dlg.open) || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        location.href = close.href;
      }, true);
    }
    // number: from the order of "projects" in assets/site.js (assets/base.js also draws the side index);
    // a page not listed there falls back to its own number and nextPage
    var G = window.GOG_PROJECT, num = G ? G.number : C.number;
    $('foot-index').textContent = 'Index ' + pad(num);
    if (!G) {
      $('tab-side').textContent = pad(C.number);
      if (C.nextPage) {
        var next = el('a', 'tab-side', pad(C.number + 1));
        next.href = C.nextPage;
        next.setAttribute('aria-label', 'Next page, ' + pad(C.number + 1));
        $('tabs-side').appendChild(next);
      }
    }

    // section headings
    $('h-main').textContent = C.headings.main;
    $('h-audio').textContent = C.headings.audio;
    $('h-sheet').textContent = C.headings.sheet;

    // info lines (top right)
    C.info.forEach(function(r){ $('info').appendChild(el('dt', null, r[0])); $('info').appendChild(el('dd', null, r[1])); });

    // main table: label | unit | value. An empty list [] hides it
    if (!C.mainData || !C.mainData.length) $('main-data').closest('.scroll').hidden = true;
    (C.mainData || []).forEach(function(r){
      var tr = el('tr'), th = el('th', null, r[0]); th.scope = 'row';
      tr.appendChild(th); tr.appendChild(el('td', 'u', r[1])); tr.appendChild(el('td', C.mainValuesLeft ? 'left' : null, r[2]));
      $('main-data').appendChild(tr);
    });

    // materials: small technical text under the table; an empty list hides it
    var mat = $('materials');
    if (!C.materials || !C.materials.length) { mat.hidden = true; }
    else {
      mat.appendChild(el('p', 'tech-label', C.headings.materials));
      C.materials.forEach(function(t){ var p = el('p'); p.innerHTML = t; mat.appendChild(p); });
    }

    // text boxes (paragraphs may contain simple HTML); an empty list hides the box
    function fillText(id, paras){
      var box = $(id);
      if (!paras || !paras.length) { box.hidden = true; return; }
      paras.forEach(function(t){ var p = el('p'); p.innerHTML = t; box.appendChild(p); });
    }
    fillText('text-1', C.texts.one); fillText('text-2', C.texts.two); fillText('text-3', C.texts.three);

    // images: a frame with the picture; if the file is missing the dotted placeholder stays visible
    function image(src, alt){
      var im = new Image(); im.src = src; im.alt = alt || ''; im.loading = 'lazy';
      im.onerror = function(){ im.hidden = true; };
      return im;
    }
    function figure(id, n, f, halftone){
      var box = $(id);
      if (!f.src && halftone) {             // figure 1 with no image: the original halftone block
        var h = el('div', 'halftone'); h.setAttribute('role', 'img'); h.setAttribute('aria-label', f.alt || 'Image placeholder');
        box.appendChild(h);
      } else {
        var fr = el('div', 'frame'); if (f.src) fr.appendChild(image(f.src, f.alt)); box.appendChild(fr);
      }
      box.appendChild(el('figcaption', null, 'Fig. ' + n + (f.caption ? ' \u2014 ' + f.caption : '')));
    }
    figure('fig-1', 1, C.figure1, true);
    figure('fig-2', 2, C.figure2, false);

    // audio: the track table and the player are built by part 2 below

    // small images: contact sheet (Fig. numbers continue from 3)
    if (!C.sheet.length) $('sheet-block').hidden = true;
    if (C.sheetGray) $('sheet').classList.add('gray');
    C.sheet.forEach(function(s, i){
      var n = i + 3, fg = el('figure', 'cell'), b = el('button', 'frame sq zoom');
      b.type = 'button'; b.setAttribute('aria-label', 'Enlarge Fig. ' + n);
      b.appendChild(image(s.src, s.alt)); fg.appendChild(b);
      fg.appendChild(el('figcaption', null, 'Fig. ' + n + (s.caption ? ' \u2014 ' + s.caption : '')));
      $('sheet').appendChild(fg);
    });
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:12px;font:14px monospace">Content error: check the quotation marks and commas in the content block at the top of the file.</p>');
  }
})();

/* ---- PART 2 of 3: TRACKS AND PLAYER ----
   The same table and player as in C-Pentane: No. / Track / Time, and a bar fixed to the bottom
   with previous / play / next, the track name and a position line. Tracks play through in order. */
(function(){
  try {
    var C = (typeof PAGE !== 'undefined') ? PAGE : {}, list = C.tracks || [];
    function $(id){ return document.getElementById(id); }
    function el(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function fmt(s){ if (!isFinite(s)) return '—'; var m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; }
    function pad2(n){ return (n < 10 ? '0' : '') + n; }
    function name(t, i){ return t.title || ('Track ' + pad2(i + 1)); }
    var tb = $('tracks'), pl = $('player'), audio = $('audio');
    if (!tb || !pl) return;
    if (!list.length){ $('audio-block').hidden = true; pl.hidden = true; return; }
    document.body.classList.add('has-player'); pl.hidden = false;
    var order = [], cur = -1;

    list.forEach(function(t, i){
      var tr = el('tr', t.src ? null : 'none'); tr.dataset.i = i;
      tr.appendChild(el('td', 'no', pad2(i + 1)));
      tr.appendChild(el('td', null, name(t, i)));
      var tm = el('td', 'tm', '—'); tr.appendChild(tm);
      if (t.src){
        order.push(i); tr.tabIndex = 0;
        var probe = new Audio(); probe.preload = 'metadata'; probe.src = t.src;
        probe.addEventListener('loadedmetadata', function(){ tm.textContent = fmt(probe.duration); });
        tr.addEventListener('click', function(){ play(i); });
        tr.addEventListener('keydown', function(ev){ if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); play(i); } });
      }
      tb.appendChild(tr);
    });

    function markRow(i){ [].forEach.call(tb.children, function(r){ var on = +r.dataset.i === i; r.classList.toggle('playing', on); r.classList.toggle('on', on); }); }
    function play(i){
      var k = order.indexOf(i); if (k < 0) return;
      if (k === cur && audio.getAttribute('src')){ toggle(); return; }
      cur = k; var t = list[i];
      audio.src = t.src; audio.play().catch(function(){});
      $('p-now').textContent = ''; $('p-now').appendChild(document.createTextNode(name(t, i) + ' '));
      $('p-now').appendChild(el('span', null, C.browserTitle || ''));
      markRow(i); updateButtons();
    }
    function toggle(){ if (!audio.getAttribute('src')){ if (order.length) play(order[0]); return; } if (audio.paused) audio.play().catch(function(){}); else audio.pause(); }
    function updateButtons(){ $('p-prev').disabled = cur <= 0; $('p-next').disabled = cur < 0 || cur >= order.length - 1; $('p-play').disabled = !order.length; }
    $('p-play').addEventListener('click', toggle);
    $('p-prev').addEventListener('click', function(){ if (cur > 0) play(order[cur - 1]); });
    $('p-next').addEventListener('click', function(){ if (cur < order.length - 1) play(order[cur + 1]); });
    audio.addEventListener('play', function(){ $('p-play').textContent = 'Pause'; $('p-play').setAttribute('aria-pressed', 'true'); });
    audio.addEventListener('pause', function(){ $('p-play').textContent = 'Play'; $('p-play').setAttribute('aria-pressed', 'false'); });
    audio.addEventListener('timeupdate', function(){
      var d = audio.duration, p = d ? audio.currentTime / d : 0;
      $('p-fill').style.width = (p * 100) + '%'; $('p-time').textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
      $('p-track').setAttribute('aria-valuenow', Math.round(p * 100));
    });
    audio.addEventListener('ended', function(){ if (cur < order.length - 1) play(order[cur + 1]); });
    audio.addEventListener('error', function(){ if (audio.getAttribute('src')) $('p-now').textContent = 'File not found: ' + audio.getAttribute('src'); });
    var seeking = false;
    function seekAt(x){ var r = $('p-track').getBoundingClientRect(); if (audio.duration) audio.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * audio.duration; }
    $('p-track').addEventListener('pointerdown', function(e){ seeking = true; this.setPointerCapture(e.pointerId); seekAt(e.clientX); });
    $('p-track').addEventListener('pointermove', function(e){ if (seeking) seekAt(e.clientX); });
    $('p-track').addEventListener('pointerup', function(){ seeking = false; });
    $('p-track').addEventListener('keydown', function(e){ if (!audio.duration) return; if (e.key === 'ArrowRight') audio.currentTime += 5; if (e.key === 'ArrowLeft') audio.currentTime -= 5; });
    document.addEventListener('keydown', function(e){
      var t = document.activeElement && document.activeElement.tagName, dlg = document.querySelector('.lightbox');
      if (e.key === ' ' && order.length && !(dlg && dlg.open) && !/INPUT|BUTTON|TEXTAREA|TR|A/.test(t)){ e.preventDefault(); toggle(); }
    });
    $('p-time').textContent = '0:00 / 0:00'; $('p-now').textContent = '';
    updateButtons();
  } catch (e) { console.error(e); }
})();

/* ---- PART 3 of 3: IMAGE VIEWER ---- */
(function(){
  var dlg=document.querySelector('.lightbox'), cells=[].slice.call(document.querySelectorAll('.sheet .zoom'));
  if(!dlg||!cells.length||!dlg.showModal) return;
  var img=dlg.querySelector('img'), cap=dlg.querySelector('figcaption'), count=dlg.querySelector('.lb-count'), cur=0;
  function ok(i){ var m=cells[i].querySelector('img'); return m&&!m.hidden; }
  function show(i){
    var m=cells[i].querySelector('img'); cur=i;
    img.src=m.currentSrc||m.src; img.alt=m.alt;
    cap.textContent=cells[i].closest('figure').querySelector('figcaption').textContent;
    count.textContent=(i+1)+' / '+cells.length;
  }
  function step(d){
    var i=cur, n=cells.length, k;
    for(k=0;k<n;k++){ i=(i+d+n)%n; if(ok(i)){ show(i); return; } }
  }
  cells.forEach(function(b,i){ b.addEventListener('click',function(){ if(!ok(i)) return; show(i); dlg.showModal(); }); });
  dlg.addEventListener('click',function(e){
    var a=e.target.getAttribute&&e.target.getAttribute('data-lb');
    if(a==='prev') step(-1); else if(a==='next') step(1); else if(a==='close'||e.target===dlg) dlg.close();
  });
  dlg.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){ step(1); e.preventDefault(); }
    else if(e.key==='ArrowLeft'){ step(-1); e.preventDefault(); }
  });
})();
