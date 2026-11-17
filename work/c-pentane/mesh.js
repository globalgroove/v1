/* =====================================================================
   PHOTO MESH  -  the C-Pentane unit view. No need to edit.
   Turns a unit's photo into a wire grid: the photo is sampled on a
   regular grid and each point is raised by its brightness, so the
   picture becomes a relief that can be turned and zoomed.
   While a track plays, the grid moves with the level of the sound.

   Use:  var mesh = PhotoMesh(canvas);
         mesh.load('imgs/cp-003.jpg')    "" = a flat grid
         mesh.setLevel(0..1)             sound level, read from the player
         mesh.set('spin', true/false), mesh.get('spin'), mesh.reset(), mesh.resize()
   ===================================================================== */
(function(){
  window.PhotoMesh = function(cv, opts){
    opts = opts || {};
    var g = cv.getContext('2d'), CW = 0, CH = 0, dpr = 1;
    var N = 72, SIZE = 100, RELIEF = 16;                 // grid points per side, plane size, height of white
    var heights = null, level = 0, lvl = 0, t = 0;
    var HOME = { yaw:0, pitch:0.95, dist:190 };
    var cam = { yaw:HOME.yaw, pitch:HOME.pitch, dist:HOME.dist, panX:0, panY:0 }, goal = null;
    var show = { spin:true };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) show.spin = false;
    var INK = (getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#121313').trim();

    function size(){ var r = cv.getBoundingClientRect(); dpr = window.devicePixelRatio || 1; CW = r.width; CH = r.height; cv.width = Math.round(CW * dpr); cv.height = Math.round(CH * dpr); }

    // sample the photo: brightness on an N x N grid, lightly smoothed
    function sample(img){
      var c = document.createElement('canvas'); c.width = c.height = N;
      var x = c.getContext('2d'), s = Math.min(img.naturalWidth, img.naturalHeight);
      x.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, N, N);
      var d = x.getImageData(0, 0, N, N).data, L = new Float32Array(N * N), H = new Float32Array(N * N);
      for (var i = 0; i < N * N; i++) L[i] = (0.2126 * d[i*4] + 0.7152 * d[i*4+1] + 0.0722 * d[i*4+2]) / 255;
      for (var r = 0; r < N; r++) for (var q = 0; q < N; q++){
        var sum = 0, n = 0;
        for (var dr = -1; dr <= 1; dr++) for (var dq = -1; dq <= 1; dq++){ var rr = r + dr, qq = q + dq; if (rr >= 0 && rr < N && qq >= 0 && qq < N){ sum += L[rr * N + qq]; n++; } }
        H[r * N + q] = sum / n;
      }
      return H;
    }

    function proj(x, y, z){
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var x1 = cy*x - sy*z, z1 = sy*x + cy*z, y2 = cp*y - sp*z1, z2 = sp*y + cp*z1;
      var depth = cam.dist - z2, f = Math.min(CW, CH) * 1.25;
      return [CW/2 + cam.panX + x1 * f / depth, CH/2 + cam.panY - y2 * f / depth, depth];
    }

    // height of a grid point: brightness relief + a ripple driven by the sound level
    function hAt(r, q){
      var base = heights ? heights[r * N + q] * RELIEF : 0;
      if (lvl < 0.002) return base;
      var u = q / (N - 1) - 0.5, v = r / (N - 1) - 0.5, d = Math.sqrt(u*u + v*v);
      return base + lvl * 9 * Math.sin(d * 26 - t * 5) * (1 - d);
    }

    function draw(){
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, CW, CH);
      g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 0.7;
      var step = SIZE / (N - 1), half = SIZE / 2, pts = new Array(N * N);
      for (var r = 0; r < N; r++) for (var q = 0; q < N; q++) pts[r * N + q] = proj(-half + q * step, hAt(r, q), -half + r * step);
      var near = cam.dist - SIZE * 0.6, far = cam.dist + SIZE * 0.6;
      function line(get){
        var d = 0; g.beginPath();
        for (var k = 0; k < N; k++){ var p = get(k); if (k) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); d += p[2]; }
        d /= N; g.globalAlpha = Math.max(0.18, Math.min(0.85, 0.85 - (d - near) / (far - near) * 0.6)); g.stroke();
      }
      for (var i = 0; i < N; i++){
        line(function(k){ return pts[i * N + k]; });       // rows
        line(function(k){ return pts[k * N + i]; });       // columns
      }
      g.globalAlpha = 1;
    }

    // drag to turn, scroll / pinch to zoom, shift-drag to move, double-click to reset
    var ptrs = {}, last = null, pinch = null;
    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
    function pinchState(){ var v = Object.keys(ptrs).map(function(k){ return ptrs[k]; }); return { d: Math.hypot(v[0][0]-v[1][0], v[0][1]-v[1][1]) || 1, cx:(v[0][0]+v[1][0])/2, cy:(v[0][1]+v[1][1])/2 }; }
    cv.addEventListener('pointerdown', function(e){ cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY]; last = [e.offsetX, e.offsetY]; goal = null; show.spin = false; if (opts.onSpin) opts.onSpin(false); if (Object.keys(ptrs).length === 2) pinch = pinchState(); cv.classList.add('drag'); });
    cv.addEventListener('pointermove', function(e){
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = [e.offsetX, e.offsetY];
      if (Object.keys(ptrs).length === 2 && pinch){ var now = pinchState(); cam.dist = clamp(cam.dist * pinch.d / now.d, 80, 500); cam.panX += now.cx - pinch.cx; cam.panY += now.cy - pinch.cy; pinch = now; return; }
      var dx = e.offsetX - last[0], dy = e.offsetY - last[1]; last = [e.offsetX, e.offsetY];
      if (e.shiftKey || e.buttons === 2){ cam.panX += dx; cam.panY += dy; }
      else { cam.yaw += dx * 0.008; cam.pitch = clamp(cam.pitch + dy * 0.008, 0.05, 1.5); }
    });
    function up(e){ delete ptrs[e.pointerId]; pinch = Object.keys(ptrs).length === 2 ? pinchState() : null; if (!Object.keys(ptrs).length) cv.classList.remove('drag'); }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    cv.addEventListener('wheel', function(e){ e.preventDefault(); cam.dist = clamp(cam.dist * Math.exp(e.deltaY * 0.0012), 80, 500); }, { passive:false });
    cv.addEventListener('dblclick', function(){ api.reset(); });

    var prev = performance.now(), sway = 0;
    function frame(now){
      var dt = Math.min(0.05, (now - prev) / 1000); prev = now; t += dt;
      lvl += (level - lvl) * Math.min(1, dt * 10);                      // smooth the sound level
      if (goal){ var k = Math.min(1, dt * 5); cam.yaw += (goal.yaw - cam.yaw) * k; cam.pitch += (goal.pitch - cam.pitch) * k; cam.dist += (goal.dist - cam.dist) * k; cam.panX *= 1 - k; cam.panY *= 1 - k; if (Math.abs(goal.yaw - cam.yaw) < 0.001 && Math.abs(goal.pitch - cam.pitch) < 0.001) goal = null; }
      if (show.spin && !Object.keys(ptrs).length && !goal){ sway += dt * 0.25; cam.yaw = HOME.yaw + Math.sin(sway) * 0.45; }   // a slow sway, the photo stays readable
      draw();
      requestAnimationFrame(frame);
    }
    size(); window.addEventListener('resize', size);
    requestAnimationFrame(frame);

    var api = {
      load: function(src){
        heights = null;
        if (!src) return;
        var im = new Image();
        im.onload = function(){ try { heights = sample(im); } catch (e) { heights = null; } };
        im.src = src;
      },
      setLevel: function(v){ level = Math.max(0, Math.min(1, v || 0)); },
      set: function(k, v){ show[k] = v; if (k === 'spin' && v){ sway = Math.asin(Math.max(-1, Math.min(1, (cam.yaw - HOME.yaw) / 0.45))); } },
      get: function(k){ return show[k]; },
      reset: function(){ goal = { yaw:HOME.yaw, pitch:HOME.pitch, dist:HOME.dist }; },
      resize: size
    };
    return api;
  };
})();
