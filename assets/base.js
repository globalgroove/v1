/* BASE SCRIPT - shared by every page. Builds the site title and the menu from assets/site.js.
   Each page only needs an empty <nav class="site" id="site"></nav> and PAGE.root. No need to edit.
   The menu is open by default (closed on phones) and changes only with the arrow next to the
   title; the choice is remembered from page to page. On the landing page (PAGE.menuFixed) it is always open, without arrow. */
(function(){
  try {
    var S = (typeof SITE !== 'undefined') ? SITE : {}, P = (typeof PAGE !== 'undefined') ? PAGE : {}, root = P.root || '';
    var nav = document.getElementById('site'); if (!nav) return;
    function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
    function norm(p){ return p.replace(/index\.html$/, ''); }
    var here = norm(location.pathname);
    nav.setAttribute('aria-label', 'Site');

    // logo: only when SITE.logo.src points to a file (for now the site title stands alone)
    var lg = S.logo || {};
    if (lg.src) {
      var logo = el('a', 'logo'), im = new Image();
      logo.href = root + 'index.html'; logo.setAttribute('aria-label', lg.alt || 'Home');
      im.src = root + lg.src; im.alt = ''; im.onerror = function(){ logo.remove(); };
      logo.appendChild(im); nav.appendChild(logo);
    }

    // site title (links home) + the arrow that opens and closes the menu
    var head = el('div', 'site-head'), title = el('a', 'site-title', S.title || ''), btn = el('button', 'site-btn'), menu = el('ul', 'site-menu');
    title.href = root + 'index.html';
    btn.type = 'button';
    menu.id = 'site-menu';
    head.appendChild(title); head.appendChild(btn);
    nav.appendChild(head); nav.appendChild(menu);

    function link(l){
      var a = el('a', null, l[0]), hash = l[1].charAt(0) === '#';
      a.href = hash ? l[1] : root + l[1];
      // marked when you are on that page or anywhere inside its folder (Work stays marked on every project page)
      var target = hash ? null : norm(new URL(a.href).pathname);
      if (target && (target === here || (target.slice(-1) === '/' && target !== norm(new URL(root || './', location.href).pathname) && here.indexOf(target) === 0))) a.setAttribute('aria-current', 'page');
      return a;
    }
    var subN = 0, api = {};
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

    /* ---- search: first item of the menu. Looks through the projects, releases and catalog in site.js ---- */
    function fold(x){ return String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
    var items = (S.projects || []).map(function(p){
      return { title:p.title, meta:[p.year, p.type].filter(Boolean).join(' · '), link:p.link, text:fold([p.title, p.year, p.type, p.keywords].join(' ')) };
    }).concat((S.releases || []).map(function(r, i){
      return { title:r.artist + (r.title ? ' — ' + r.title : ''), meta:[r.year, r.role].filter(Boolean).join(' · '), link:'discography/index.html#r' + (i + 1), text:fold([r.artist, r.title, r.role, r.format, r.label, r.year, 'discography'].join(' ')) };
    })).concat((S.catalog || []).map(function(r, i){
      if (r.hide) return null;                     // hidden releases stay out of the search too
      return { title:r.artist + ': ' + r.title, meta:[r.year, r.cat].filter(Boolean).join(' · '), link:'catalog/index.html#c' + (i + 1), text:fold([r.artist, r.title, r.cat, r.type, r.format, r.status, r.year, 'catalog'].join(' ')) };
    }).filter(Boolean));
    if (items.length && S.navSearch !== false){
      // label + field + a blinking block cursor (as on the landing page); results drop below
      var sli = el('li', 'nav-search'), lab = el('label', 'nav-label', S.navSearchLabel || 'Search'), wrap = el('span', 'nq-wrap');
      var q = el('input'), meas = el('span', 'nq-measure'), cur = el('span', 'nq-cursor'), hits = el('ul', 'nav-hits'), act = -1, pause = null;
      q.type = 'search'; q.id = 'nav-q'; q.autocomplete = 'off'; q.spellcheck = false;
      lab.htmlFor = 'nav-q'; q.setAttribute('aria-controls', 'nav-hits');
      meas.setAttribute('aria-hidden', 'true'); cur.setAttribute('aria-hidden', 'true');
      hits.id = 'nav-hits'; hits.hidden = true; hits.setAttribute('role', 'listbox');
      wrap.appendChild(q); wrap.appendChild(meas); wrap.appendChild(cur);
      sli.appendChild(lab); sli.appendChild(wrap); sli.appendChild(hits);
      menu.appendChild(sli);                                   // after the sections, filling the row to the right edge
      var place = function(){
        var atEnd = q.selectionStart === q.value.length && q.selectionEnd === q.value.length;
        wrap.classList.toggle('native', !atEnd); cur.hidden = !atEnd;
        meas.textContent = q.value;
        cur.style.left = Math.min(meas.offsetWidth + 1, Math.max(0, q.clientWidth - 8)) + 'px';
      };
      var links = function(){ return [].slice.call(hits.querySelectorAll('a')); };
      var mark = function(i){ var ls = links(); if (!ls.length) return; act = (i + ls.length) % ls.length; ls.forEach(function(a, k){ a.classList.toggle('active', k === act); }); ls[act].scrollIntoView({ block:'nearest' }); };
      var run = function(){
        sli.classList.toggle('filled', q.value.length > 0);    // the word Search steps back once something is typed
        var words = fold(q.value).split(/\s+/).filter(Boolean); hits.textContent = ''; act = -1;
        if (!words.length){ hits.hidden = true; return; }
        var found = items.filter(function(it){ return words.every(function(w){ return it.text.indexOf(w) > -1; }); }).slice(0, 8);
        if (!found.length) hits.appendChild(el('li', 'none', 'No match'));
        found.forEach(function(it){
          var li = el('li'), x = el(it.link ? 'a' : 'span', it.link ? null : 'soon');
          if (it.link) x.href = root + it.link;
          x.appendChild(el('b', null, it.title)); if (it.meta) x.appendChild(el('span', null, it.meta));
          li.appendChild(x); hits.appendChild(li);
        });
        hits.hidden = false;
      };
      q.addEventListener('input', function(){
        run(); cur.classList.add('typing'); clearTimeout(pause);
        pause = setTimeout(function(){ cur.classList.remove('typing'); }, 600);
        place();
      });
      ['keyup', 'click', 'select', 'focus'].forEach(function(ev){ q.addEventListener(ev, place); });
      q.addEventListener('keydown', function(e){
        if (e.key === 'ArrowDown'){ e.preventDefault(); mark(act + 1); }
        else if (e.key === 'ArrowUp'){ e.preventDefault(); mark(act < 0 ? -1 : act - 1); }
        else if (e.key === 'Enter'){ var a = links()[act < 0 ? 0 : act]; if (a) location.href = a.href; }
        else if (e.key === 'Escape' && q.value){ e.stopPropagation(); q.value = ''; run(); place(); }
      });
      window.addEventListener('resize', place);
      api.searchOpened = function(focus){ place(); if (focus && window.matchMedia && window.matchMedia('(min-width: 761px) and (pointer: fine)').matches) q.focus({ preventScroll:true }); };
    }

    if (!menu.children.length) { btn.remove(); menu.remove(); return; }

    // wide screens: open by default. Phones: closed by default. Either way it changes only with
    // the arrow, and the choice is remembered across pages (phones and wide screens separately)
    var fixed = !!P.menuFixed, phone = !!(window.matchMedia && window.matchMedia('(max-width: 760px)').matches);
    var KEY = phone ? 'gog-menu-phone' : 'gog-menu';
    function remembered(){ try { var v = localStorage.getItem(KEY); return v ? v === 'open' : !phone; } catch (e) { return !phone; } }
    function setOpen(o, byUser){
      menu.hidden = !o; btn.setAttribute('aria-expanded', o); nav.classList.toggle('menu-open', o);
      btn.setAttribute('aria-label', o ? 'Close the menu' : 'Open the menu');
      if (byUser){ try { localStorage.setItem(KEY, o ? 'open' : 'closed'); } catch (e) {} }
      if (o && api.searchOpened) api.searchOpened(byUser || fixed);
      if (!o){ var nq = document.getElementById('nav-q'); if (nq && nq.value){ nq.value = ''; nq.dispatchEvent(new Event('input')); } }
    }
    if (fixed){ btn.remove(); nav.classList.add('menu-fixed'); setOpen(true); }
    else {
      btn.setAttribute('aria-controls', 'site-menu');
      btn.addEventListener('click', function(){ setOpen(menu.hidden, true); });
      setOpen(remembered());
    }
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:12px;font:14px monospace">Menu error: check the quotation marks and commas in assets/site.js.</p>');
  }
})();

/* PROJECT INDEX - on a project page (any page listed in "projects" in assets/site.js) the side tab
   shows its number, 001, 002 ... in the order of that list, and an outlined box under it leads to
   the next project with a page (after the last one, back to the first). No need to edit. */
(function(){
  try {
    var S = (typeof SITE !== 'undefined') ? SITE : {}, P = (typeof PAGE !== 'undefined') ? PAGE : {}, root = P.root || '';
    var tabs = document.getElementById('tabs-side'), tab = document.getElementById('tab-side');
    if (!tabs || !tab || !S.projects) return;
    function key(href){ return new URL(href, location.href).pathname.replace(/index\.html$/, ''); }
    function pad(n){ return String(n).padStart(3, '0'); }
    var here = key(location.href), list = S.projects, n = -1;
    list.forEach(function(p, i){ if (p.link && key(root + p.link) === here) n = i; });
    if (n < 0) return;
    window.GOG_PROJECT = { number: n + 1 };
    tabs.classList.add('idx');
    tab.textContent = pad(n + 1);
    for (var k = 1; k < list.length; k++){
      var j = (n + k) % list.length;
      if (!list[j].link) continue;
      var a = document.createElement('a');
      a.className = 'tab-side'; a.href = root + list[j].link; a.textContent = pad(j + 1);
      a.setAttribute('aria-label', 'Next project, ' + pad(j + 1) + ': ' + list[j].title); a.title = list[j].title;
      tabs.appendChild(a);
      break;
    }
  } catch (e) { console.error(e); }
})();
