/* =====================================================================
   FRIDGE MESH  -  the C-Pentane unit view. No need to edit.
   Draws the volume of the fridge as found, as a subdivided wire grid:
   outer shell, inner liner, freezer divider and doors, standing upright
   or lying on its side, doors closed or open. Faces turned away from
   the viewer are drawn lighter, so the volume reads as a solid.
   While a track plays, the surfaces move with the level of the sound.

   Use:  var mesh = FridgeMesh(canvas);
         mesh.configure({ pose:'upright'|'side', doors:1|2, open:true|false })
         mesh.setLevel(0..1), mesh.set('spin', true/false), mesh.get('spin'), mesh.reset(), mesh.resize()

   Units: cm. Upright: x across (-30..30), y up (0..180), z depth (back 0, front 60).
   ===================================================================== */
(function(){
  var STEP = 10;                                     // grid spacing on every surface

  // one flat face, subdivided into a grid: origin o, edge vectors u and v, outward normal n
  function face(o, u, v, n, tag){
    var lu = Math.hypot(u[0], u[1], u[2]), lv = Math.hypot(v[0], v[1], v[2]);
    var nu = Math.max(1, Math.round(lu / STEP)), nv = Math.max(1, Math.round(lv / STEP)), L = [], i, k;
    function pt(a, b){ return [o[0] + u[0]*a + v[0]*b, o[1] + u[1]*a + v[1]*b, o[2] + u[2]*a + v[2]*b]; }
    for (i = 0; i <= nu; i++){ var p = []; for (k = 0; k <= nv; k++) p.push(pt(i/nu, k/nv)); L.push(p); }
    for (k = 0; k <= nv; k++){ var q = []; for (i = 0; i <= nu; i++) q.push(pt(i/nu, k/nv)); L.push(q); }
    return L.map(function(pts, j){ return { pts:pts, n:n, tag:tag, edge: j === 0 || j === nu || j === nu + 1 || j === nu + nv + 1 }; });
  }
  // a box as six faces (with optional faces left out)
  function boxFaces(x0, x1, y0, y1, z0, z1, tag, skip){
    skip = skip || {}; var F = [];
    if (!skip.back)   F = F.concat(face([x0,y0,z0], [x1-x0,0,0], [0,y1-y0,0], [0,0,-1], tag));
    if (!skip.front)  F = F.concat(face([x0,y0,z1], [x1-x0,0,0], [0,y1-y0,0], [0,0,1], tag));
    if (!skip.left)   F = F.concat(face([x0,y0,z0], [0,0,z1-z0], [0,y1-y0,0], [-1,0,0], tag));
    if (!skip.right)  F = F.concat(face([x1,y0,z0], [0,0,z1-z0], [0,y1-y0,0], [1,0,0], tag));
    if (!skip.bottom) F = F.concat(face([x0,y0,z0], [x1-x0,0,0], [0,0,z1-z0], [0,-1,0], tag));
    if (!skip.top)    F = F.concat(face([x0,y1,z0], [x1-x0,0,0], [0,0,z1-z0], [0,1,0], tag));
    return F;
  }
  function build(cfg){
    var L = [];
    // outer shell, open at the front
    L = L.concat(boxFaces(-30, 30, 0, 180, 0, 60, 'shell', { front:true }));
    // inner liner: the compartments seen through the opening, normals facing into the opening
    var inner = boxFaces(-27, 27, 3, 177, 3, 60, 'liner', { front:true });
    inner.forEach(function(f){ f.n = [-f.n[0], -f.n[1], -f.n[2]]; });
    L = L.concat(inner);
    // front rim between shell and liner
    L = L.concat(face([-30,0,60], [3,0,0], [0,180,0], [0,0,1], 'rim'), face([27,0,60], [3,0,0], [0,180,0], [0,0,1], 'rim'),
                 face([-27,0,60], [54,0,0], [0,3,0], [0,0,1], 'rim'), face([-27,177,60], [54,0,0], [0,3,0], [0,0,1], 'rim'));
    // freezer divider
    L = L.concat(face([-27,131,3], [54,0,0], [0,0,57], [0,1,0], 'liner'), face([-27,134,3], [54,0,0], [0,0,57], [0,-1,0], 'liner'),
                 face([-27,131,60], [54,0,0], [0,3,0], [0,0,1], 'rim'));
    // doors: one full door, or a fridge door and a freezer door
    var spans = cfg.doors === 2 ? [[0, 131], [133, 180]] : [[0, 180]];
    spans.forEach(function(s){
      var d = boxFaces(-30, 30, s[0], s[1], 60, 65, 'door');
      d.forEach(function(f){ f.door = true; });
      L = L.concat(d);
    });
    return L;
  }

  // a door swung open on its hinge (the x = +30 edge)
  function swing(p){ return [30 - (p[2] - 60), p[1], 60 + (30 - p[0])]; }
  function swingN(n){ return [-n[2], n[1], -n[0]]; }
  // lying on its side: the top points right, the hinge side rests on the ground
  function side(p){ return [p[1] - 90, 30 - p[0], p[2]]; }
  function sideN(n){ return [n[1], -n[0], n[2]]; }

  window.FridgeMesh = function(cv, opts){
    opts = opts || {};
    var g = cv.getContext('2d'), CW = 0, CH = 0, dpr = 1;
    var cfg = { pose:'upright', doors:1, open:false }, lines = [], target = [0, 90, 30];
    var HOME = { yaw:-0.6, pitch:0.25, dist:360 }, cam = { yaw:-0.6, pitch:0.25, dist:360, panX:0, panY:0 }, goal = null;
    var show = { spin:true }, level = 0, lvl = 0, t = 0, sway = 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) show.spin = false;
    var INK = (getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#121313').trim();

    function size(){ var r = cv.getBoundingClientRect(); dpr = window.devicePixelRatio || 1; CW = r.width; CH = r.height; cv.width = Math.round(CW * dpr); cv.height = Math.round(CH * dpr); }

    // place every line of the model in the scene once per configuration
    function place(){
      lines = build(cfg).map(function(l){
        var pts = l.pts, n = l.n;
        if (l.door && cfg.open){ pts = pts.map(swing); n = swingN(n); }
        if (cfg.pose === 'side'){ pts = pts.map(side); n = sideN(n); }
        return { pts:pts, n:n, tag:l.tag, edge:l.edge };
      });
    }

    function view(x, y, z){
      x -= target[0]; y -= target[1]; z -= target[2];
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var x1 = cy*x - sy*z, z1 = sy*x + cy*z, y2 = cp*y - sp*z1, z2 = sp*y + cp*z1;
      var depth = cam.dist - z2, f = Math.min(CW, CH) * 1.3;
      return [CW/2 + cam.panX + x1 * f / depth, CH/2 + cam.panY - y2 * f / depth, depth];
    }
    // does a normal face the viewer? (rotate it like the scene; positive z points at the camera)
    function facing(n){
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var z1 = sy*n[0] + cy*n[2];
      return sp*n[1] + cp*z1;
    }

    function draw(){
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, CW, CH);
      g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round';
      // ground: a few faint lines under the unit
      g.lineWidth = 0.6; g.globalAlpha = 0.16;
      var R = 140;
      for (var k = -R; k <= R; k += 20){
        var a = view(k + target[0], 0, -R + target[2]), b = view(k + target[0], 0, R + target[2]), c = view(-R + target[0], 0, k + target[2]), d = view(R + target[0], 0, k + target[2]);
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.moveTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.stroke();
      }
      var amp = lvl * 3.2;
      lines.forEach(function(l){
        var f = facing(l.n), toward = f > 0.02;
        var alpha = toward ? (l.tag === 'liner' ? 0.55 : 0.85) : 0.12;
        if (l.edge) alpha = Math.max(alpha, toward ? 0.95 : 0.3);
        g.globalAlpha = alpha; g.lineWidth = l.edge ? 1 : 0.6;
        g.beginPath();
        l.pts.forEach(function(p, i){
          var w = amp ? amp * Math.sin(t * 7 + (p[0] + p[1] * 0.7 + p[2] * 0.4) * 0.09) : 0;   // surfaces move with the sound
          var s = view(p[0] + l.n[0]*w, p[1] + l.n[1]*w, p[2] + l.n[2]*w);
          if (i) g.lineTo(s[0], s[1]); else g.moveTo(s[0], s[1]);
        });
        g.stroke();
      });
      g.globalAlpha = 1;
    }

    var ptrs = {}, last = null, pinch = null;
    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
    function pinchState(){ var v = Object.keys(ptrs).map(function(k){ return ptrs[k]; }); return { d: Math.hypot(v[0][0]-v[1][0], v[0][1]-v[1][1]) || 1, cx:(v[0][0]+v[1][0])/2, cy:(v[0][1]+v[1][1])/2 }; }
    cv.addEventListener('pointerdown', function(e){ cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY]; last = [e.offsetX, e.offsetY]; goal = null; show.spin = false; if (opts.onSpin) opts.onSpin(false); if (Object.keys(ptrs).length === 2) pinch = pinchState(); cv.classList.add('drag'); });
    cv.addEventListener('pointermove', function(e){
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = [e.offsetX, e.offsetY];
      if (Object.keys(ptrs).length === 2 && pinch){ var now = pinchState(); cam.dist = clamp(cam.dist * pinch.d / now.d, 140, 900); cam.panX += now.cx - pinch.cx; cam.panY += now.cy - pinch.cy; pinch = now; return; }
      var dx = e.offsetX - last[0], dy = e.offsetY - last[1]; last = [e.offsetX, e.offsetY];
      if (e.shiftKey || e.buttons === 2){ cam.panX += dx; cam.panY += dy; }
      else { cam.yaw += dx * 0.008; cam.pitch = clamp(cam.pitch + dy * 0.008, -0.2, 1.5); }
    });
    function up(e){ delete ptrs[e.pointerId]; pinch = Object.keys(ptrs).length === 2 ? pinchState() : null; if (!Object.keys(ptrs).length) cv.classList.remove('drag'); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    cv.addEventListener('wheel', function(e){ e.preventDefault(); cam.dist = clamp(cam.dist * Math.exp(e.deltaY * 0.0012), 140, 900); }, { passive:false });
    cv.addEventListener('dblclick', function(){ api.reset(); });

    var prev = performance.now();
    function frame(now){
      var dt = Math.min(0.05, (now - prev) / 1000); prev = now; t += dt;
      lvl += (level - lvl) * Math.min(1, dt * 10);
      if (goal){ var k = Math.min(1, dt * 5); cam.yaw += (goal.yaw - cam.yaw) * k; cam.pitch += (goal.pitch - cam.pitch) * k; cam.dist += (goal.dist - cam.dist) * k; cam.panX *= 1 - k; cam.panY *= 1 - k; if (Math.abs(goal.yaw - cam.yaw) < 0.001 && Math.abs(goal.pitch - cam.pitch) < 0.001) goal = null; }
      if (show.spin && !Object.keys(ptrs).length && !goal){ sway += dt * 0.25; cam.yaw = HOME.yaw + Math.sin(sway) * 0.5; }
      draw();
      requestAnimationFrame(frame);
    }
    size(); window.addEventListener('resize', size);
    place(); requestAnimationFrame(frame);

    var api = {
      configure: function(c){
        c = c || {};
        cfg = { pose: c.pose === 'side' ? 'side' : 'upright', doors: c.doors === 2 ? 2 : 1, open: !!c.open };
        place();
        // frame the unit, and start from roughly where a photo of it would be taken
        if (cfg.pose === 'side'){ target = [0, 30, cfg.open ? 55 : 32]; HOME = { yaw:-0.42, pitch:0.42, dist:cfg.open ? 300 : 260 }; }
        else { target = [cfg.open ? 15 : 0, 90, cfg.open ? 50 : 32]; HOME = { yaw:-0.6, pitch:0.22, dist:345 }; }
        cam.yaw = HOME.yaw; cam.pitch = HOME.pitch; cam.dist = HOME.dist; cam.panX = 0; cam.panY = 0; goal = null; sway = 0;
      },
      setLevel: function(v){ level = Math.max(0, Math.min(1, v || 0)); },
      set: function(k, v){ show[k] = v; if (k === 'spin' && v) sway = Math.asin(Math.max(-1, Math.min(1, (cam.yaw - HOME.yaw) / 0.5))); },
      get: function(k){ return show[k]; },
      reset: function(){ goal = { yaw:HOME.yaw, pitch:HOME.pitch, dist:HOME.dist }; },
      resize: size
    };
    return api;
  };
})();
