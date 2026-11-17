/* BASE SCRIPT - shared by every page. Builds the logo and the site menu from assets/site.js.
   Each page only needs an empty <nav class="site" id="site"></nav> and PAGE.root. No need to edit. */
(function(){
  try {
    var S = (typeof SITE !== 'undefined') ? SITE : {}, P = (typeof PAGE !== 'undefined') ? PAGE : {}, root = P.root || '';
    var nav = document.getElementById('site'); if (!nav) return;
    function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
    function norm(p){ return p.replace(/index\.html$/, ''); }
    var here = norm(location.pathname);
    nav.setAttribute('aria-label', 'Site');

    // drawn logo marks
    var marks = {
      globe:
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.2">' +
        '<circle cx="12" cy="12" r="10.5"/><ellipse cx="12" cy="12" rx="4.6" ry="10.5"/><path d="M1.5 12h21"/></svg>',
      registration:
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x=".5" y=".5" width="23" height="23" fill="none" stroke="currentColor" vector-effect="non-scaling-stroke"/>' +
        '<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" vector-effect="non-scaling-stroke"/>' +
        '<path d="M12 0v7M12 17v7M0 12h7M17 12h7" stroke="currentColor" vector-effect="non-scaling-stroke"/></svg>',
      lens:
        '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false"><ellipse class="ink" cx="14" cy="14" rx="10.5" ry="13.2"/>' +
        '<ellipse class="cutl" cx="14" cy="14" rx="3.2" ry="12.2" stroke-width="1.5"/>' +
        '<path class="cutl" stroke-width="1.4" d="M10.9 16.4H17.1M17.1 12.4H15.4"/>' +
        '<path class="cut" d="M0 12.2 7 15.2 0 18.4Z"/><path class="cut" d="M28 12 21 15 28 18.2Z"/></svg>'
    };

    // logo: links to the site root
    var lg = S.logo || {}, logo = el('a', 'logo');
    logo.href = root + 'index.html';
    logo.setAttribute('aria-label', lg.alt || 'Home');
    function drawMark(){ logo.innerHTML = marks[lg.mark] || marks.globe; }
    if (lg.src) { var im = new Image(); im.src = root + lg.src; im.alt = ''; im.onerror = drawMark; logo.appendChild(im); }
    else drawMark();
    nav.appendChild(logo);

    // menu title button + list
    var btn = el('button', 'site-btn'), menu = el('ul', 'site-menu');
    btn.type = 'button'; btn.appendChild(el('span', null, S.title || ''));
    menu.id = 'site-menu'; menu.hidden = true;
    nav.appendChild(btn); nav.appendChild(menu);

    function link(l){
      var a = el('a', null, l[0]), hash = l[1].charAt(0) === '#';
      a.href = hash ? l[1] : root + l[1];
      // marked when you are on that page or anywhere inside its folder (Work stays marked on every project page)
      var target = hash ? null : norm(new URL(a.href).pathname);
      if (target && (target === here || (target.slice(-1) === '/' && target !== norm(new URL(root || './', location.href).pathname) && here.indexOf(target) === 0))) a.setAttribute('aria-current', 'page');
      return a;
    }
    var subN = 0;
    (S.menu || []).forEach(function(l){
      var li = el('li'), kids = l[2] === 'projects'
        ? (S.projects || []).map(function(p){ return [p.title, p.link]; })
        : (l[2] || []);
      if (!kids.length) { li.appendChild(link(l)); menu.appendChild(li); return; }
      var row = el('div', 'sub-row'), sub = el('ul'), id = 'sub-' + (++subN);
      var sb = el('button', 'sub-btn' + (l[1] ? '' : ' only'), l[1] ? null : l[0]);
      sb.type = 'button'; sb.setAttribute('aria-controls', id);
      if (l[1]) { row.appendChild(link(l)); sb.setAttribute('aria-label', 'Show ' + l[0]); }
      row.appendChild(sb);
      sub.id = id;
      kids.forEach(function(s){ var sli = el('li'); sli.appendChild(link(s)); sub.appendChild(sli); });
      var open = !!sub.querySelector('[aria-current]');        // the section of the page you are on starts open
      sub.hidden = !open; sb.setAttribute('aria-expanded', open);
      sb.addEventListener('click', function(){ sub.hidden = !sub.hidden; sb.setAttribute('aria-expanded', !sub.hidden); });
      li.appendChild(row); li.appendChild(sub); menu.appendChild(li);
    });

    if (!menu.children.length) { btn.classList.add('static'); return; }
    btn.setAttribute('aria-controls', 'site-menu'); btn.setAttribute('aria-expanded', 'false');
    function setOpen(o){ menu.hidden = !o; btn.setAttribute('aria-expanded', o); }
    btn.addEventListener('click', function(){ setOpen(menu.hidden); });
    menu.addEventListener('click', function(e){ if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function(e){ if (!nav.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); } });
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:12px;font:14px monospace">Menu error: check the quotation marks and commas in assets/site.js.</p>');
  }
})();
