/* =====================================================================
   FRIDGE DRAWING  -  the exploded view used by the C-Pentane archive.
   No need to edit. It draws the refrigeration circuit and the electrical
   system of a domestic fridge as an engineering wireframe on a canvas.

   Use:  var view = FridgeView(canvas, { onHover: fn(id), onPick: fn(id) });
         view.setLit(['R-01','E-03'])   components that hold a track (drawn solid, the rest faint)
         view.setActive('R-01')         component playing now (drawn heavy)
         view.setRunning(true)          refrigerant moves while music plays
         view.setHover(id), view.setExplode(0..1), view.view('iso'|'front'|'side'|'rear'|'top'),
         view.set('labels'|'cab'|'spin', true/false), view.COMPONENTS (list of {id, name, sys})
         view.configure({ pose:'upright'|'side', doors:1|2 })   how the unit stands and how many doors it has;
                                        'side' = lying on its side, top to the right, doors open flat on the ground

   Units: cm. x right, y up, z towards the front. Cabinet 60 x 180 x 60, back wall at z = 0.
   ===================================================================== */
(function(){
  var TAU = Math.PI * 2;
  function ring(c, r, axis, n, a0, a1){
    n = n || 28; a0 = a0 || 0; a1 = (a1 == null) ? TAU : a1;
    var out = [];
    for (var i = 0; i <= n; i++){
      var a = a0 + (a1 - a0) * i / n, ca = Math.cos(a) * r, sa = Math.sin(a) * r;
      out.push(axis === 'y' ? [c[0] + ca, c[1], c[2] + sa] : axis === 'z' ? [c[0] + ca, c[1] + sa, c[2]] : [c[0], c[1] + ca, c[2] + sa]);
    }
    return out;
  }
  function box(c, w, h, d){
    var x0 = c[0] - w/2, x1 = c[0] + w/2, y0 = c[1] - h/2, y1 = c[1] + h/2, z0 = c[2] - d/2, z1 = c[2] + d/2;
    return [
      [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y0,z0]],
      [[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[x0,y1,z0]],
      [[x0,y0,z0],[x0,y1,z0]], [[x1,y0,z0],[x1,y1,z0]], [[x1,y0,z1],[x1,y1,z1]], [[x0,y0,z1],[x0,y1,z1]]
    ];
  }
  function rect(pts){ return pts.concat([pts[0]]); }
  function add(a, o){ return [a[0] + o[0], a[1] + o[1], a[2] + o[2]]; }

  /* ---- part drawings ---- */
  function compressor(){
    var c = [14, 0, -12], L = [], i, a, t;
    [[1,9],[4,10],[8,10],[12,10],[14,10]].forEach(function(r){ L.push(ring([c[0], r[0], c[2]], r[1], 'y', 32)); });
    for (t = 0.35; t < 1.4; t += 0.35) L.push(ring([c[0], 14 + 8*Math.sin(t), c[2]], 10*Math.cos(t), 'y', 28));
    for (i = 0; i < 8; i++){
      a = i / 8 * TAU; var m = [[c[0] + 9*Math.cos(a), 1, c[2] + 9*Math.sin(a)], [c[0] + 10*Math.cos(a), 4, c[2] + 10*Math.sin(a)], [c[0] + 10*Math.cos(a), 14, c[2] + 10*Math.sin(a)]];
      for (t = 0.15; t <= Math.PI/2 + 0.001; t += 0.15) m.push([c[0] + 10*Math.cos(t)*Math.cos(a), 14 + 8*Math.sin(t), c[2] + 10*Math.cos(t)*Math.sin(a)]);
      L.push(m);
    }
    L.push(rect([[2,0,-23],[26,0,-23],[26,0,-1],[2,0,-1]]));
    L.push([[9,20,-12],[9,23,-12]], [[21,11,-8],[24,12,-7]]);
    L.push(rect([[23.6,10,-14],[23.6,14,-14],[23.6,14,-10],[23.6,10,-10]]));
    return L;
  }
  function condenserPath(){
    var p = [], rows = 13, i, y;
    for (i = 0; i < rows; i++){
      y = 150 - i * 10;
      var right = (i % 2 === 0);
      p.push([right ? 24 : -24, y, -4], [right ? -24 : 24, y, -4]);
      if (i < rows - 1){
        var xb = right ? -24 : 24, s = right ? -1 : 1;
        for (var k = 1; k < 6; k++){ var a = k / 6 * Math.PI; p.push([xb + s*5*Math.sin(a), y - 5 + 5*Math.cos(a), -4]); }
      }
    }
    return p;
  }
  function condenser(){ var L = [condenserPath()]; for (var x = -21; x <= 21; x += 3.5) L.push([[x, 27, -3], [x, 153, -3]]); return L; }
  function drier(){
    var c = [-24, 23, -4], L = [];
    for (var y = 19; y <= 27; y += 2) L.push(ring([c[0], y, c[2]], 1.7, 'y', 14));
    for (var i = 0; i < 4; i++){ var a = i/4*TAU; L.push([[c[0], 30, c[2]], [c[0] + 1.7*Math.cos(a), 27, c[2] + 1.7*Math.sin(a)], [c[0] + 1.7*Math.cos(a), 19, c[2] + 1.7*Math.sin(a)], [c[0], 16, c[2]]]); }
    return L;
  }
  function capillaryPath(){
    var p = [], turns = 9, n = turns * 18;
    for (var i = 0; i <= n; i++){ var a = i / 18 * TAU; p.push([-17 + 2.4*Math.cos(a), 24 + 32 * i / n, -8 + 2.4*Math.sin(a)]); }
    p.push([-17, 70, -8], [-17, 160, -8], [-17, 166, -4], [-17, 166, -1]);
    return p;
  }
  function evaporatorPath(){
    var p = [];
    [[142, 10, 50], [150, 50, 10], [158, 10, 50], [166, 50, 10]].forEach(function(r){ p.push([-24, r[0], r[1]], [-24, r[0], r[2]]); });
    [10, 20, 30, 40, 50].forEach(function(zz, i){ p.push(i % 2 === 0 ? [-22, 172, zz] : [22, 172, zz], i % 2 === 0 ? [22, 172, zz] : [-22, 172, zz]); });
    [[166, 50, 10], [158, 10, 50], [150, 50, 10], [142, 10, 50]].forEach(function(r){ p.push([24, r[0], r[1]], [24, r[0], r[2]]); });
    return p;
  }
  function evaporator(){
    return [
      rect([[-24,172,6],[24,172,6],[24,172,54],[-24,172,54]]),
      rect([[-24,138,6],[-24,172,6],[-24,172,54],[-24,138,54]]),
      rect([[24,138,6],[24,172,6],[24,172,54],[24,138,54]]),
      evaporatorPath()
    ];
  }
  function suctionPath(){ return [[24, 140, -6], [24, 30, -6], [24, 18, -7], [22, 12, -8]]; }
  function cord(){
    var L = [[[-10,8,-2],[-10,8,-14],[-12,5,-24],[-14,1.5,-32],[-16,1.5,-41]]];
    return L.concat(box([-16,1.5,-44], 5, 3, 6), [[[-17.2,1.5,-47],[-17.2,1.5,-50]], [[-14.8,1.5,-47],[-14.8,1.5,-50]]]);
  }
  function thermostat(){
    var L = box([-16,128,46], 10, 4, 7);
    L.push(ring([-16,128,49.6], 2.4, 'z', 20), [[-16,128,49.6],[-16,130,49.6]]);
    L.push([[-16,130,42],[-16,131,22],[-22,137,14],[-22,146,12]]);
    return L;
  }
  function relay(){ var L = box([27.5,12,-12], 3, 6, 6); L.push([[26,10,-13],[26,10,-11]]); return L; }
  function overload(){
    return [ring([26,5,-12], 2.6, 'x', 20), ring([28,5,-12], 2.6, 'x', 20),
      [[26,7.6,-12],[28,7.6,-12]], [[26,2.4,-12],[28,2.4,-12]], [[26,5,-9.4],[28,5,-9.4]], [[26,5,-14.6],[28,5,-14.6]]];
  }
  function doorSwitch(){ var L = box([27,118,57], 3, 5, 3); L.push([[27,118,58.5],[27,118,61]]); return L; }
  function lamp(){ var c = [8,127,38]; return [ring(c, 2.6, 'x', 20), ring(c, 2.6, 'y', 20), ring(c, 2.6, 'z', 20)].concat(box([8,130.6,38], 4, 2.4, 4)); }
  function cabinet(){
    var L = box([0,90,30], 60, 180, 60);
    L.push(rect([[-28,132,2],[28,132,2],[28,132,58],[-28,132,58]]));
    L.push(rect([[-28,2,2],[28,2,2],[28,178,2],[-28,178,2]]));
    return L;
  }
  function door(y0, y1){ var L = box([0,(y0+y1)/2,62.5], 60, y1 - y0, 5); L.push(rect([[-27,y0+4,60],[27,y0+4,60],[27,y1-4,60],[-27,y1-4,60]])); return L; }
  function doorParts(n){
    if (n === 2) return [
      { id:'C-02', name:'Fridge door', sys:'Housing', lines:door(0,131), ex:[0,0,40], anchor:[30,110,65], ghost:true, door:true },
      { id:'C-03', name:'Freezer door', sys:'Housing', lines:door(133,180), ex:[0,0,40], anchor:[30,176,65], ghost:true, door:true }
    ];
    return [{ id:'C-02', name:'Door', sys:'Housing', lines:door(0,180), ex:[0,0,48], anchor:[30,180,65], ghost:true, door:true }];
  }

  var PARTS = [
    { id:'R-01', name:'Compressor', sys:'Refrigerant', lines:compressor(), ex:[28,-8,-38], anchor:[14,22,-12], ports:{ in:[22,12,-8], out:[9,23,-12] }, terms:{ e:[23.6,12,-12] } },
    { id:'R-02', name:'Condenser', sys:'Refrigerant', lines:condenser(), ex:[0,0,-60], anchor:[0,152,-4], path:condenserPath() },
    { id:'R-03', name:'Filter-drier', sys:'Refrigerant', lines:drier(), ex:[-34,-6,-44], anchor:[-24,30,-4], ports:{ in:[-24,30,-4], out:[-24,16,-4] } },
    { id:'R-04', name:'Capillary tube', sys:'Refrigerant', lines:[capillaryPath()], ex:[-48,0,-26], anchor:[-17,90,-8], path:capillaryPath() },
    { id:'R-05', name:'Evaporator', sys:'Refrigerant', lines:evaporator(), ex:[0,48,0], anchor:[0,172,30], path:evaporatorPath() },
    { id:'R-06', name:'Suction line', sys:'Refrigerant', lines:[suctionPath()], ex:[44,0,-26], anchor:[24,85,-6], path:suctionPath() },
    { id:'E-01', name:'Power cord, plug', sys:'Electrical', lines:cord(), ex:[-34,-6,-58], anchor:[-16,3,-44], terms:{ t:[-10,8,-2] } },
    { id:'E-02', name:'Thermostat', sys:'Electrical', lines:thermostat(), ex:[-48,10,42], anchor:[-16,130,46], terms:{ t:[-16,126,44] } },
    { id:'E-03', name:'Start relay (PTC)', sys:'Electrical', lines:relay(), ex:[58,6,-20], anchor:[27.5,15,-12], terms:{ t:[26,12,-12] } },
    { id:'E-04', name:'Overload protector', sys:'Electrical', lines:overload(), ex:[58,-16,-4], anchor:[27,7.6,-12], terms:{ t:[26,5,-12] } },
    { id:'E-05', name:'Door switch', sys:'Electrical', lines:doorSwitch(), ex:[50,0,40], anchor:[27,120.5,57], terms:{ t:[27,118,55.5] } },
    { id:'E-06', name:'Lamp', sys:'Electrical', lines:lamp(), ex:[16,-26,36], anchor:[8,124.4,38], terms:{ t:[8,131.8,38] } },
    { id:'C-01', name:'Cabinet', sys:'Housing', lines:cabinet(), ex:[0,0,0], anchor:[-30,180,0], ghost:true }
  ];
  var BY = {}; PARTS.forEach(function(p){ BY[p.id] = p; });
  var LOOP = [
    { p:'R-01', path:function(o){ return [add(BY['R-01'].ports.in, o), add([14,14,-12], o), add(BY['R-01'].ports.out, o)]; }, t0:0.15, t1:1 },
    { p:'R-02', t0:1, t1:0.75 },
    { p:'R-03', path:function(o){ return [add(BY['R-03'].ports.in, o), add(BY['R-03'].ports.out, o)]; }, t0:0.75, t1:0.72 },
    { p:'R-04', t0:0.72, t1:0 },
    { p:'R-05', t0:0, t1:0.05 },
    { p:'R-06', t0:0.05, t1:0.15 }
  ];
  var WIRES = [['E-01','t','E-02','t'], ['E-02','t','E-03','t'], ['E-03','t','R-01','e'], ['E-01','t','E-04','t'], ['E-04','t','R-01','e'], ['E-01','t','E-05','t'], ['E-05','t','E-06','t']];

  // lying on its side: the fridge's top points right, its right side rests on the ground
  function sideways(p){ return [p[1] - 90, 30 - p[0], p[2]]; }
  // a door of the lying unit, swung open on its ground-side hinge so it lies flat in front
  function doorOpen(p){ return [p[1] - 90, p[2] - 60, 60 + (30 - p[0])]; }

  window.FridgeView = function(cv, opts){
    opts = opts || {};
    var pose = 'upright', parts = PARTS.concat(doorParts(1));
    var g = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
    var VIEWS = { iso:[-0.75, 0.32], front:[0, 0.02], side:[-Math.PI/2, 0.02], rear:[Math.PI, 0.08], top:[0, Math.PI/2 - 0.02] };
    var HOME = 375, cam = { yaw:-0.75, pitch:0.32, dist:HOME, panX:0, panY:0 }, camGoal = null, target = [0, 108, 0];
    function pw(p){ return pose === 'side' ? sideways(p) : p; }
    // where a point of part p ends up: explode in the unit's own frame, then the pose
    function place(q, p){ return (p.door && pose === 'side') ? add(doorOpen(q), off(p)) : pw(add(q, off(p))); }
    var explode = 0.7, exGoal = 0.7;
    var show = { labels:true, cab:true, spin:true };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) show.spin = false;
    var lit = null, active = null, running = false, hover = null, drawn = {}, labelBoxes = [], tFlow = 0;
    var css = getComputedStyle(document.documentElement);
    var INK = (css.getPropertyValue('--ink') || '#121313').trim(), PAPER = (css.getPropertyValue('--paper') || '#D9DAD8').trim();
    var MONO = (css.getPropertyValue('--list-mono') || 'monospace').trim();
    var HOT = [180, 68, 28], COLD = [45, 106, 166];

    function size(){ var r = cv.getBoundingClientRect(); dpr = window.devicePixelRatio || 1; W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    function proj(p){
      var x = p[0] - target[0], y = p[1] - target[1], z = p[2] - target[2];
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var x1 = cy*x - sy*z, z1 = sy*x + cy*z, y2 = cp*y - sp*z1, z2 = sp*y + cp*z1;
      var depth = cam.dist - z2, f = Math.min(W, H * 1.15) * 1.25;
      return [W/2 + cam.panX + x1 * f / depth, H/2 + cam.panY - y2 * f / depth, depth];
    }
    function off(p){ return [p.ex[0]*explode, p.ex[1]*explode, p.ex[2]*explode]; }
    function poly(sp, w, a, dash){ g.globalAlpha = a; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath(); g.moveTo(sp[0][0], sp[0][1]); for (var i = 1; i < sp.length; i++) g.lineTo(sp[i][0], sp[i][1]); g.stroke(); }
    function depthA(d){ return Math.max(0.28, Math.min(1, 1.15 - (d - (cam.dist - 120)) / 420)); }
    function isLit(id){ return !lit || lit.indexOf(id) > -1; }
    function stagePath(s){ var p = BY[s.p], o = off(p); return s.path ? s.path(o) : p.path.map(function(q){ return add(q, o); }); }

    function draw(){
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK;
      drawn = {}; labelBoxes = [];
      var focus = hover || active;

      g.globalAlpha = 0.18; g.lineWidth = 1; g.setLineDash([]);
      for (var k = -120; k <= 120; k += 20){
        var a1 = proj([k,0,-120]), b1 = proj([k,0,120]), a2 = proj([-120,0,k]), b2 = proj([120,0,k]);
        g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke();
      }

      parts.forEach(function(p){
        if (p.ghost && !show.cab) return;
        var segs = [], on = focus === p.id, has = p.ghost || isLit(p.id);
        p.lines.forEach(function(line){
          var sp = line.map(function(q){ return proj(place(q, p)); }), d = 0;
          sp.forEach(function(s){ d += s[2]; }); d /= sp.length;
          var alpha = p.ghost ? 0.22 : depthA(d);
          if (!has) alpha *= 0.5;                     // no track on this component: lighter, and dashed
          if (focus && !on) alpha *= 0.45;
          if (on) alpha = 1;
          poly(sp, on ? 1.7 : (p.ghost ? 0.8 : 1), alpha, p.ghost ? [3,4] : (has ? null : [2,3]));
          segs.push(sp);
        });
        drawn[p.id] = segs;
      });

      var fade = focus ? 0.3 : 0.6;
      for (var i = 0; i < LOOP.length; i++){
        var pa = stagePath(LOOP[i]), pb = stagePath(LOOP[(i + 1) % LOOP.length]);
        poly([proj(pw(pa[pa.length - 1])), proj(pw(pb[0]))], 0.9, fade, [5,3,1,3]);
      }
      WIRES.forEach(function(w){
        var A = BY[w[0]], B = BY[w[2]], pa = proj(place(A.terms[w[1]], A)), pb = proj(place(B.terms[w[3]], B));
        var on = focus === w[0] || focus === w[2];
        poly([pa, pb], on ? 1.2 : 0.8, on ? 0.95 : fade, [2,3]);
        g.setLineDash([]); g.globalAlpha = on ? 1 : fade; g.fillStyle = INK;
        [pa, pb].forEach(function(s){ g.beginPath(); g.arc(s[0], s[1], 1.6, 0, TAU); g.fill(); });
      });

      flow();

      if (show.labels) parts.forEach(function(p){
        if (p.ghost && !show.cab) return;
        var s = proj(place(p.anchor, p));
        var dx = s[0] - (W/2 + cam.panX), dy = s[1] - (H/2 + cam.panY), len = Math.hypot(dx, dy) || 1;
        var lx = s[0] + dx / len * 26, ly = s[1] + dy / len * 22, right = dx >= 0;
        var txt = p.id + ' ' + p.name.toUpperCase();
        g.font = '500 10px ' + MONO;
        var tw = g.measureText(txt).width, bx = right ? lx + 4 : lx - tw - 4, by = ly - 6;
        var step = dy >= 0 ? 15 : -15, tries = 0;
        while (tries++ < 12 && labelBoxes.some(function(L){ return bx - 3 < L.x + L.w && bx + tw + 3 > L.x && by - 2 < L.y + L.h && by + 12 > L.y; })){ by += step; ly += step; }
        var on = focus === p.id, has = p.ghost || isLit(p.id), dim = (focus && !on) || !has;
        g.setLineDash([]); g.globalAlpha = dim ? 0.3 : (p.ghost ? 0.45 : 0.9); g.lineWidth = 0.8; g.strokeStyle = INK;
        g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(lx, ly); g.lineTo(right ? lx + 2 : lx - 2, ly); g.stroke();
        if (on){ g.globalAlpha = 1; g.fillStyle = INK; g.fillRect(bx - 3, by - 2, tw + 6, 14); g.fillStyle = PAPER; }
        else { g.fillStyle = PAPER; g.globalAlpha = dim ? 0.3 : 0.85; g.fillRect(bx - 3, by - 2, tw + 6, 14); g.globalAlpha = dim ? 0.38 : (p.ghost ? 0.55 : 1); g.fillStyle = INK; }
        g.fillText(txt, bx, by + 9);
        if (!p.ghost) labelBoxes.push({ id:p.id, x:bx - 3, y:by - 2, w:tw + 6, h:14 });
      });
      g.globalAlpha = 1; g.setLineDash([]);
    }

    // refrigerant: dots round the loop; they move only while music plays, otherwise they rest in place
    function flow(){
      var pts = [], temps = [];
      LOOP.forEach(function(s){ var sp = stagePath(s), n = sp.length; sp.forEach(function(q, k){ pts.push(q); temps.push(s.t0 + (s.t1 - s.t0) * (n > 1 ? k / (n - 1) : 0)); }); });
      pts.push(pts[0]); temps.push(temps[0]);
      var cum = [0];
      for (var i = 1; i < pts.length; i++){ var a = pts[i-1], b = pts[i]; cum.push(cum[i-1] + Math.hypot(b[0]-a[0], b[1]-a[1], b[2]-a[2])); }
      var total = cum[cum.length - 1], spacing = 9, count = Math.floor(total / spacing), j = 0;
      var alpha = running ? 0.95 : 0.4;
      for (var n = 0; n < count; n++){
        var d = (n * spacing + tFlow) % total;
        while (j > 0 && cum[j] > d) j--;
        while (j < cum.length - 2 && cum[j+1] < d) j++;
        var f = (d - cum[j]) / ((cum[j+1] - cum[j]) || 1), A = pts[j], B = pts[j+1];
        var t = temps[j] + (temps[j+1] - temps[j]) * f;
        var c = [0,1,2].map(function(k){ return Math.round(COLD[k] + (HOT[k] - COLD[k]) * t); });
        var s = proj(pw([A[0] + (B[0]-A[0])*f, A[1] + (B[1]-A[1])*f, A[2] + (B[2]-A[2])*f]));
        g.globalAlpha = alpha; g.fillStyle = 'rgb(' + c.join(',') + ')';
        g.beginPath(); g.arc(s[0], s[1], 2, 0, TAU); g.fill();
      }
    }

    function pick(mx, my){
      for (var b = 0; b < labelBoxes.length; b++){ var L = labelBoxes[b]; if (mx >= L.x && mx <= L.x + L.w && my >= L.y && my <= L.y + L.h) return L.id; }
      var best = null, bd = 9;
      parts.forEach(function(p){
        if (p.ghost) return;
        (drawn[p.id] || []).forEach(function(sp){ for (var i = 1; i < sp.length; i++){ var d = segDist(mx, my, sp[i-1], sp[i]); if (d < bd){ bd = d; best = p.id; } } });
      });
      return best;
    }
    function segDist(px, py, a, b){ var vx = b[0]-a[0], vy = b[1]-a[1], l = vx*vx + vy*vy, t = l ? ((px-a[0])*vx + (py-a[1])*vy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - (a[0] + t*vx), py - (a[1] + t*vy)); }
    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    var ptrs = {}, last = null, moved = 0, pinch = null;
    function pinchState(){ var v = Object.keys(ptrs).map(function(k){ return ptrs[k]; }); return { d: Math.hypot(v[0][0]-v[1][0], v[0][1]-v[1][1]) || 1, cx:(v[0][0]+v[1][0])/2, cy:(v[0][1]+v[1][1])/2 }; }
    cv.addEventListener('pointerdown', function(e){
      cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY];
      last = [e.offsetX, e.offsetY]; moved = 0; show.spin = false; camGoal = null;
      if (opts.onSpin) opts.onSpin(false);
      if (Object.keys(ptrs).length === 2) pinch = pinchState();
      cv.classList.add('drag');
    });
    cv.addEventListener('pointermove', function(e){
      if (!ptrs[e.pointerId]){ var id = pick(e.offsetX, e.offsetY); cv.classList.toggle('hot', !!id); if (id !== hover){ hover = id; if (opts.onHover) opts.onHover(id); } return; }
      ptrs[e.pointerId] = [e.offsetX, e.offsetY];
      if (Object.keys(ptrs).length === 2 && pinch){ var now = pinchState(); cam.dist = clamp(cam.dist * pinch.d / now.d, 160, 900); cam.panX += now.cx - pinch.cx; cam.panY += now.cy - pinch.cy; pinch = now; return; }
      var dx = e.offsetX - last[0], dy = e.offsetY - last[1]; last = [e.offsetX, e.offsetY]; moved += Math.abs(dx) + Math.abs(dy);
      if (e.shiftKey || e.buttons === 2){ cam.panX += dx; cam.panY += dy; }
      else { cam.yaw += dx * 0.008; cam.pitch = clamp(cam.pitch + dy * 0.008, -1.45, 1.55); }
      if (opts.onView) opts.onView(null);
    });
    function endPtr(e){
      delete ptrs[e.pointerId]; pinch = Object.keys(ptrs).length === 2 ? pinchState() : null;
      if (!Object.keys(ptrs).length){ cv.classList.remove('drag'); if (moved < 4 && opts.onPick) opts.onPick(pick(e.offsetX, e.offsetY)); }
    }
    cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
    cv.addEventListener('pointerleave', function(){ if (!Object.keys(ptrs).length && hover){ hover = null; cv.classList.remove('hot'); if (opts.onHover) opts.onHover(null); } });
    cv.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    cv.addEventListener('wheel', function(e){ e.preventDefault(); cam.dist = clamp(cam.dist * Math.exp(e.deltaY * 0.0012), 160, 900); }, { passive:false });
    cv.addEventListener('dblclick', function(){ api.view('iso'); cam.panX = 0; cam.panY = 0; camGoal.dist = HOME; });

    var prev = performance.now();
    function frame(now){
      var dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      explode += (exGoal - explode) * Math.min(1, dt * 6);
      if (camGoal){
        var k = Math.min(1, dt * 5);
        cam.yaw += (camGoal.yaw - cam.yaw) * k; cam.pitch += (camGoal.pitch - cam.pitch) * k; cam.dist += (camGoal.dist - cam.dist) * k;
        if (Math.abs(camGoal.yaw - cam.yaw) < 0.001 && Math.abs(camGoal.pitch - cam.pitch) < 0.001) camGoal = null;
      }
      if (show.spin && !Object.keys(ptrs).length) cam.yaw += dt * 0.12;
      if (running && !reduce) tFlow += dt * 22;
      draw();
      requestAnimationFrame(frame);
    }
    size(); window.addEventListener('resize', size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    requestAnimationFrame(frame);

    var api = {
      COMPONENTS: PARTS.filter(function(p){ return !p.ghost; }).map(function(p){ return { id:p.id, name:p.name, sys:p.sys }; }),
      setLit: function(ids){ lit = ids; },
      setActive: function(id){ active = id; },
      setRunning: function(on){ running = !!on; },
      setHover: function(id){ hover = id; },
      setExplode: function(v){ exGoal = v; },
      set: function(k, v){ show[k] = v; },
      get: function(k){ return show[k]; },
      resize: size,
      configure: function(cfg){
        cfg = cfg || {};
        pose = cfg.pose === 'side' ? 'side' : 'upright';
        parts = PARTS.concat(doorParts(cfg.doors === 2 ? 2 : 1));
        if (pose === 'side'){ target = [0, 28, 30]; HOME = 330; VIEWS.iso = [-0.42, 0.42]; }   // close to the photo: from the front, a little left, looking down
        else { target = [0, 108, 0]; HOME = 375; VIEWS.iso = [-0.75, 0.32]; }
        cam.yaw = VIEWS.iso[0]; cam.pitch = VIEWS.iso[1];
        cam.dist = HOME; cam.panX = 0; cam.panY = 0; camGoal = null;
      },
      view: function(name){
        var v = VIEWS[name], gy = v[0] + Math.round((cam.yaw - v[0]) / TAU) * TAU;
        camGoal = { yaw:gy, pitch:v[1], dist:cam.dist }; show.spin = false;
        if (opts.onSpin) opts.onSpin(false);
        if (opts.onView) opts.onView(name);
      }
    };
    return api;
  };
})();
