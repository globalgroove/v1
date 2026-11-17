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
        if ((menu && !menu.hidden) || (dlg && dlg.open) || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        location.href = close.href;
      }, true);
    }
    $('foot-index').textContent = 'Index ' + pad(C.number);
    // side tabs: current page number; with nextPage set, a second outlined box (number+1) links to the next page
    $('tab-side').textContent = pad(C.number);
      if (C.nextPage) {
        var next = el('a', 'tab-side', pad(C.number + 1));
        next.href = C.nextPage;
        next.setAttribute('aria-label', 'Next page, ' + pad(C.number + 1));
        $('tabs-side').appendChild(next);
        }

    // section headings
    $('h-main').textContent = C.headings.main;
    $('h-audio').textContent = C.headings.audio;
    $('h-sheet').textContent = C.headings.sheet;

    // info lines (top right)
    C.info.forEach(function(r){ $('info').appendChild(el('dt', null, r[0])); $('info').appendChild(el('dd', null, r[1])); });

    // main table: label | unit | value
    C.mainData.forEach(function(r){
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

    // audio track list (the player script below turns these rows into the player)
    if (!C.tracks.length) { $('audio-block').hidden = true; document.querySelector('[data-strip]').hidden = true; }
    C.tracks.forEach(function(t){
      var tr = el('tr'), th = el('th', 'tight'), b = el('button', 'play', 'Play'), nm = el('td', 'name', t.title);
      th.scope = 'row'; tr.dataset.src = t.src; tr.dataset.title = t.title;
      b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Play ' + t.title);
      th.appendChild(b); tr.appendChild(th); tr.appendChild(nm); tr.appendChild(el('td', 'u dur', '--:--'));
      $('tracks').appendChild(tr);
    });

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

/* ---- PART 2 of 3: AUDIO PLAYER ---- */
(function(){
  var p=document.querySelector('[data-player]'), strip=document.querySelector('[data-strip]');
  if(!p||!strip) return;
  var a=p.querySelector('audio'), rows=[].slice.call(p.querySelectorAll('tr[data-src]'));
  var title=strip.querySelector('.s-title'), btn=strip.querySelector('.play'), c=strip.querySelector('.wave'), tm=strip.querySelector('.time');
  var cur=null, peaks={}, ctx=null, N=240;

  function fmt(s){ if(!isFinite(s)) return '0:00'; var m=Math.floor(s/60), r=Math.floor(s%60); return m+':'+(r<10?'0':'')+r; }
  function mark(){
    var playing=!a.paused;
    rows.forEach(function(r){
      var b=r.querySelector('button'), on=(r===cur&&playing);
      b.setAttribute('aria-pressed',on); b.textContent=on?'Pause':'Play';
      r.classList.toggle('on',r===cur);
    });
    btn.setAttribute('aria-pressed',playing); btn.textContent=playing?'Pause':'Play';
  }

  function getPeaks(src){
    if(src in peaks) return Promise.resolve(peaks[src]);
    return fetch(src).then(function(r){ if(!r.ok) throw new Error('missing'); return r.arrayBuffer(); })
    .then(function(buf){
      ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
      return new Promise(function(res,rej){ ctx.decodeAudioData(buf,res,rej); });
    })
    .then(function(ab){
      var d=ab.getChannelData(0), step=Math.max(1,Math.floor(d.length/N)), skip=Math.max(1,step>>6), out=[], i, j, v, m;
      for(i=0;i<N;i++){
        m=0;
        for(j=i*step;j<(i+1)*step&&j<d.length;j+=skip){ v=Math.abs(d[j]); if(v>m) m=v; }
        out.push(m);
      }
      var top=Math.max.apply(null,out)||1;
      peaks[src]=out.map(function(x){ return x/top; });
      return peaks[src];
    })
    .catch(function(){ peaks[src]=null; return null; });
  }

  function draw(){
    var cs=getComputedStyle(document.documentElement), ink=cs.getPropertyValue('--ink').trim(), rule=cs.getPropertyValue('--rule').trim();
    var pk=cur?peaks[cur.dataset.src]:null, prog=(a.duration?a.currentTime/a.duration:0), dpr=window.devicePixelRatio||1;
    var w=c.clientWidth, h=c.clientHeight; if(!w||!h) return;
    if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){ c.width=Math.round(w*dpr); c.height=Math.round(h*dpr); }
    var g=c.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
    if(!pk){
      g.fillStyle=rule; g.fillRect(0,h/2-1,w,2);
      g.fillStyle=ink; g.fillRect(0,h/2-1,w*prog,2);
      return;
    }
    var bw=w/pk.length, gap=Math.min(1.5,bw*0.3);
    for(var i=0;i<pk.length;i++){
      var bh=Math.max(2,pk[i]*h*0.92);
      g.fillStyle=(i/pk.length<prog)?ink:rule;
      g.fillRect(i*bw,(h-bh)/2,Math.max(1,bw-gap),bh);
    }
  }

  function play(r){
    if(r===cur){ if(a.paused){ a.play().catch(function(){}); } else { a.pause(); } return; }
    cur=r; a.src=r.dataset.src; title.textContent=r.dataset.title;
    a.play().catch(function(){});
    mark(); draw();
    getPeaks(r.dataset.src).then(draw);
  }

  var dragging=false;
  function at(e){ var b=c.getBoundingClientRect(); if(a.duration) a.currentTime=Math.min(1,Math.max(0,(e.clientX-b.left)/b.width))*a.duration; }
  c.addEventListener('pointerdown',function(e){ dragging=true; c.setPointerCapture(e.pointerId); at(e); });
  c.addEventListener('pointermove',function(e){ if(dragging) at(e); });
  c.addEventListener('pointerup',function(){ dragging=false; });
  c.addEventListener('pointercancel',function(){ dragging=false; });
  c.addEventListener('keydown',function(e){
    if(!a.duration) return;
    if(e.key==='ArrowRight'){ a.currentTime=Math.min(a.duration,a.currentTime+5); e.preventDefault(); }
    else if(e.key==='ArrowLeft'){ a.currentTime=Math.max(0,a.currentTime-5); e.preventDefault(); }
    else if(e.key==='Home'){ a.currentTime=0; e.preventDefault(); }
  });

  rows.forEach(function(r){ r.querySelector('button').addEventListener('click',function(){ play(r); }); });
  btn.addEventListener('click',function(){ if(cur) play(cur); else if(rows[0]) play(rows[0]); });

  a.addEventListener('play',mark); a.addEventListener('pause',mark);
  a.addEventListener('loadedmetadata',function(){ if(cur) cur.querySelector('.dur').textContent=fmt(a.duration); });
  a.addEventListener('timeupdate',function(){
    tm.textContent=fmt(a.currentTime)+' / '+fmt(a.duration);
    c.setAttribute('aria-valuenow',a.duration?Math.round(a.currentTime/a.duration*100):0);
    draw();
  });
  a.addEventListener('ended',function(){
    var i=rows.indexOf(cur);
    if(rows[i+1]) play(rows[i+1]); else { mark(); title.textContent='Stopped'; }
  });
  a.addEventListener('error',function(){ title.textContent='File not found: '+(cur?cur.dataset.src:''); });

  window.addEventListener('resize',draw);
  if(window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
  draw();
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
