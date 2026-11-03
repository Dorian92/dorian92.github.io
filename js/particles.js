/* Subtle WebGL particle field. Static SVG fallback covers reduced-motion,
   save-data, low-memory, and software-rendered devices. */
(function () {
  const cv = document.getElementById("field");
  const root = document.documentElement;
  if (!cv || root.classList.contains("reduce")) return;

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g")) return;
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) return;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return;

  let gl;
  try {
    gl = cv.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true,
    });
  } catch (err) {
    gl = null;
  }
  if (!gl) return;

  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  if (dbg) {
    const renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
    if (/swiftshader|llvmpipe|softpipe|software/i.test(renderer)) return;
  }

  const small = matchMedia("(max-width: 820px)").matches;
  const N = small ? 1100 : 2800;
  const R = (a, b) => a + Math.random() * (b - a);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  function tree() {
    const levels = [1, 2, 4, 7, 11];
    const nodes = [];
    levels.forEach((c, l) => {
      for (let k = 0; k < c; k++) {
        nodes.push({
          x: (c === 1 ? 0 : (k / (c - 1)) * 2 - 1) * (0.22 + l * 0.18),
          y: 0.9 - l * 0.42,
          z: R(-0.12, 0.12),
          l,
        });
      }
    });
    const edges = [];
    let off = 0;
    for (let l = 1; l < levels.length; l++) {
      const p0 = off;
      off += levels[l - 1];
      for (let k = 0; k < levels[l]; k++) {
        const parent = p0 + Math.min(levels[l - 1] - 1, Math.floor((k * levels[l - 1]) / levels[l]));
        edges.push([parent, off + k]);
      }
    }
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      let x;
      let y;
      let z;
      if (i % 3 === 0) {
        const n = nodes[i % nodes.length];
        const s = 0.045 + (4 - n.l) * 0.01;
        x = n.x + gauss() * s;
        y = n.y + gauss() * s;
        z = n.z + gauss() * s;
      } else if (i % 3 === 1) {
        const e = edges[i % edges.length];
        const A = nodes[e[0]];
        const B = nodes[e[1]];
        const t = Math.random();
        x = A.x + (B.x - A.x) * t + gauss() * 0.008;
        y = A.y + (B.y - A.y) * t + gauss() * 0.008;
        z = A.z + (B.z - A.z) * t;
      } else {
        const r = 1.5 * Math.cbrt(Math.random());
        const th = R(0, 6.283);
        const ph = Math.acos(R(-1, 1));
        x = r * Math.sin(ph) * Math.cos(th) * 1.15;
        y = r * Math.cos(ph) * 0.85;
        z = r * Math.sin(ph) * Math.sin(th);
      }
      a.set([x, y, z], i * 3);
    }
    return a;
  }

  function galaxy() {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const arm = i % 3;
      const r = Math.pow(Math.random(), 0.7) * 1.2;
      const ang = r * 3.2 + arm * 2.094 + gauss() * 0.16;
      a.set([Math.cos(ang) * r, gauss() * 0.045 * (1.2 - r), Math.sin(ang) * r], i * 3);
    }
    return a;
  }

  const posA = tree();
  const posB = galaxy();
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) seed[i] = Math.random();

  const vs = `
    attribute vec3 aA;
    attribute vec3 aB;
    attribute float aSeed;
    uniform mat4 uM;
    uniform float uAspect, uTime, uDpr, uSize, uMix, uMouseOn;
    uniform vec2 uMouse, uOff;
    varying float vSeed;
    varying float vGlow;
    void main() {
      vec3 pos = mix(aA, aB, uMix);
      vec4 p = uM * vec4(pos, 1.0);
      float persp = 1.0 / (2.6 - p.z);
      vec2 sp = p.xy * persp * 2.15;
      sp.x /= uAspect;
      sp += uOff;
      vec2 d = sp - uMouse;
      d.x *= uAspect;
      float dist = length(d);
      float push = uMouseOn * smoothstep(0.32, 0.0, dist);
      sp += normalize(d + 1e-4) * push * 0.045 * vec2(1.0 / uAspect, 1.0);
      gl_Position = vec4(sp, 0.0, 1.0);
      float tw = 0.7 + 0.3 * sin(uTime * 1.15 + aSeed * 40.0);
      gl_PointSize = (uSize + aSeed * 1.35) * uDpr * persp * 2.15 * (1.0 + push);
      vSeed = aSeed * tw;
      vGlow = push;
    }`;
  const fs = `
    precision mediump float;
    varying float vSeed;
    varying float vGlow;
    uniform float uAlpha;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float a = smoothstep(0.5, 0.0, d);
      a *= a;
      vec3 deep = vec3(0.027, 0.231, 0.149);
      vec3 green = vec3(0.106, 0.561, 0.380);
      vec3 lime = vec3(0.839, 0.973, 0.494);
      vec3 white = vec3(0.96, 1.0, 0.92);
      vec3 col = mix(deep, green, smoothstep(0.0, 0.45, vSeed));
      col = mix(col, lime, smoothstep(0.4, 0.88, vSeed));
      col = mix(col, white, step(0.94, vSeed) * 0.6 + vGlow * 0.4);
      gl_FragColor = vec4(col * a * (0.32 + vSeed * 0.5) * uAlpha, 1.0);
    }`;

  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    return shader;
  }
  const vsh = compile(gl.VERTEX_SHADER, vs);
  const fsh = compile(gl.FRAGMENT_SHADER, fs);
  if (!vsh || !fsh) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  function buffer(loc, data, size) {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }
  buffer(gl.getAttribLocation(prog, "aA"), posA, 3);
  buffer(gl.getAttribLocation(prog, "aB"), posB, 3);
  buffer(gl.getAttribLocation(prog, "aSeed"), seed, 1);

  const U = (n) => gl.getUniformLocation(prog, n);
  const uM = U("uM");
  const uAspect = U("uAspect");
  const uTime = U("uTime");
  const uDpr = U("uDpr");
  const uSize = U("uSize");
  const uMix = U("uMix");
  const uMouse = U("uMouse");
  const uMouseOn = U("uMouseOn");
  const uOff = U("uOff");
  const uAlpha = U("uAlpha");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(10 / 255, 10 / 255, 10 / 255, 1);
  gl.uniform1f(uAlpha, small ? 0.72 : 0.85);
  gl.uniform1f(uSize, small ? 2.3 : 2.7);
  gl.uniform2f(uOff, small ? 0.05 : 0.46, small ? 0.12 : 0.02);

  let dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.max(1, Math.floor(innerWidth * dpr));
    cv.height = Math.max(1, Math.floor(innerHeight * dpr));
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform1f(uAspect, innerWidth / Math.max(1, innerHeight));
    gl.uniform1f(uDpr, dpr);
  }
  resize();
  addEventListener("resize", resize, { passive: true });

  const mouse = { x: 9, y: 9, tx: 9, ty: 9, on: 0, ton: 0 };
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => {
      mouse.tx = (e.clientX / innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / innerHeight) * 2 - 1);
      mouse.ton = 1;
    }, { passive: true });
    addEventListener("pointerleave", () => { mouse.ton = 0; });
  }

  let running = false;
  let last = performance.now();
  let spin = 0;
  function paused() {
    return document.hidden || root.classList.contains("motion-paused");
  }
  function frame(now) {
    if (paused()) {
      running = false;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const mix = 0.5 + 0.5 * Math.sin(t * 0.13);
    spin += dt * 0.08;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    mouse.on += (mouse.ton - mouse.on) * 0.08;
    const ry = spin + Math.sin(t * 0.22) * 0.35 + mouse.x * 0.18 * mouse.on;
    const rx = 0.18 - mouse.y * 0.1 * mouse.on;
    const cy = Math.cos(ry);
    const sy = Math.sin(ry);
    const cx = Math.cos(rx);
    const sx = Math.sin(rx);
    const sc = small ? 0.82 : 1;
    const m = [
      cy * sc, sx * sy * sc, -cx * sy * sc, 0,
      0, cx * sc, sx * sc, 0,
      sy * sc, -sx * cy * sc, cx * cy * sc, 0,
      0, 0, 0, 1,
    ];
    gl.uniformMatrix4fv(uM, false, new Float32Array(m));
    gl.uniform1f(uTime, t);
    gl.uniform1f(uMix, mix);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uMouseOn, mouse.on);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
    requestAnimationFrame(frame);
  }
  function start() {
    if (running || paused()) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  root.classList.add("gl-on");
  start();
  document.addEventListener("visibilitychange", start);
  document.addEventListener("motion-toggle", start);
})();
