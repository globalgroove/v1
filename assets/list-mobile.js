/* LIST PAGES ON PHONES - shared by Work, Discography, Catalog and Contact. No need to edit.
   On a narrow screen the side panel (image + details) has no room next to the list,
   so a tap on a row opens the panel right under that row. Tap another row and it moves
   there; tap the same row again to close it. On Work, a second tap on an open row (or
   the Open link in the panel) goes to the project. On a wide screen nothing changes. */
(function(){
  var rows = document.getElementById('rows'), panel = document.querySelector('.preview');
  if (!rows || !panel) return;
  var home = panel.parentNode, homeNext = panel.nextSibling, drawer = null, openRow = null;
  var narrow = window.matchMedia('(max-width: 760px)');

  function close(){
    if (drawer){ drawer.remove(); drawer = null; }
    if (openRow){ openRow.classList.remove('open'); openRow = null; }
    if (panel.parentNode !== home) home.insertBefore(panel, homeNext);   // back to its place beside the list
  }
  function open(tr){
    close();
    tr.dispatchEvent(new MouseEvent('mouseenter'));    // the page fills the panel for this row, as on hover
    drawer = document.createElement('tr'); drawer.className = 'drawer';
    var td = document.createElement('td'); td.colSpan = tr.children.length;
    td.appendChild(panel); drawer.appendChild(td);
    tr.parentNode.insertBefore(drawer, tr.nextSibling);
    tr.classList.add('open'); openRow = tr;
    var r = drawer.getBoundingClientRect();
    if (r.bottom > window.innerHeight) window.scrollBy({ top: Math.min(r.bottom - window.innerHeight + 12, r.top - 70), behavior: 'smooth' });
  }

  rows.addEventListener('click', function(e){
    if (!narrow.matches) return;
    var tr = e.target.closest('tr');
    if (!tr || tr.classList.contains('drawer') || tr.parentNode !== rows) return;
    if (tr === openRow){
      if (e.target.closest('a')) return;                // second tap on an open row's link: go there
      e.preventDefault(); close(); return;
    }
    e.preventDefault(); e.stopPropagation();          // first tap: show the panel instead of leaving the page
    open(tr);
  }, true);
  narrow.addEventListener('change', function(){ if (!narrow.matches) close(); });
})();
