(function () {
  const SITE = window.SITE;
  if (!SITE) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const out = $("#out");
  const input = $("#cmd");
  const term = $("#term");
  const drawerH = $("#drawerH");
  const lastLine = $("#lastLine");
  const scrRoot = $("#scrRoot");
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const isMobile = () => matchMedia("(max-width: 820px)").matches;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
  const tag = (t) => `<span class="ph">${esc(t || "placeholder")}</span>`;
  const DEVICE = "dorian-phone";

  function safeUrl(url) {
    if (!url) return "";
    try {
      const u = new URL(url, location.href);
      if (u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:") return u.href;
    } catch (err) { /* ignore bad placeholder values */ }
    return "";
  }
  function words(text) {
    let i = 0;
    const html = String(text).split(/(\s+)/).map((tok) => {
      if (!tok) return "";
      if (/^\s+$/.test(tok)) return esc(tok);
      return `<span class="w" style="--i:${i++}">${esc(tok)}</span>`;
    }).join("");
    return `<span class="words play">${html}</span>`;
  }
  function cmdLink(cmd) {
    return `<button type="button" class="cmdlink" data-cmd="${esc(cmd)}">${esc(cmd)}</button>`;
  }
  function fieldText(field) {
    if (!field) return "";
    const bits = [];
    if (field.text) bits.push(esc(field.text));
    if (field.placeholder) bits.push(tag(field.tag));
    return bits.join(" ");
  }
  function linkOrTag(href, label, placeholder, ph) {
    const url = !placeholder ? safeUrl(href) : "";
    if (url) {
      const external = !url.startsWith("mailto:");
      return `<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)}</a>`;
    }
    return `${esc(label)} ${tag(ph)}`;
  }
  function action(field, label) {
    const href = field && !field.placeholder ? safeUrl(field.href || "") : "";
    if (href) {
      return `<a class="btnp" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
    }
    return `<span class="btnp ghost">${esc(label)} ${tag(field && field.tag)}</span>`;
  }

  const pulse = SITE.projects.find((p) => p.id === "pulse");
  const pulseRn = SITE.projects.find((p) => p.id === "pulse-rn");
  const ICONS = {
    "open pulse": ["P", "Pulse", "pulse"],
    "open pulse-rn": ["RN", "Pulse RN", "rn"],
    whoami: ["DS", "About", "about"],
    experience: ["≡", "Work", "work"],
    plugins: ["⇄", "Plugins", "plugins"],
    oss: ["{ }", "OSS", "oss"],
    contact: ["@", "Contact", "contact"],
    help: [">_", "Terminal", "help"],
  };

  function appButton(cmd, dock) {
    const spec = ICONS[cmd];
    if (!spec) return "";
    const [glyph, label, kind] = spec;
    return `<button type="button" class="pico" data-cmd="${esc(cmd)}" ${dock ? `aria-label="${esc(label)}"` : ""}><span class="ico ${kind}" aria-hidden="true">${esc(glyph)}</span><span class="lbl">${esc(label)}</span></button>`;
  }

  function pills(list) {
    return list.map((t) => `<span class="pill">${esc(t)}</span>`).join("");
  }

  function renderScreens() {
    const photoUrl = !SITE.photo.placeholder ? safeUrl(SITE.photo.src) : "";
    const photoBlock = photoUrl
      ? `<img class="avatar-img" src="${esc(photoUrl)}" alt="${esc(SITE.photo.alt || SITE.name)}" width="160" height="160"><p class="card" style="margin-top:3cqw">${esc(SITE.photo.intro || "")}</p>`
      : `<div class="avatar" aria-hidden="true">DS</div>`;
    const photoCard = photoUrl
      ? ""
      : `<div class="card">${tag(SITE.photo.tag)}<p style="margin-top:1.6cqw">${esc(SITE.photo.intro)}</p></div>`;

    const jobs = SITE.experience.map((job) => `
      <article class="card">
        <span class="yr">${esc(job.range)}</span>
        <h3>${esc(job.company)}</h3>
        <p>${esc(job.summary)}${job.extra && (job.extra.text || job.extra.placeholder) ? " " + fieldText(job.extra) : ""}</p>
        <div>${pills(job.tags)}</div>
      </article>`).join("");

    const stills = (pulse.media.stills || []).map((s) =>
      `<img data-src="${esc(s.src)}" alt="${esc(s.alt)}" width="${s.w}" height="${s.h}" decoding="async">`
    ).join("");

    const ossCards = SITE.oss.length
      ? SITE.oss.map((pr) => {
          const title = `${pr.repo} #${pr.number}`;
          const body = `<span class="yr">● ${esc(pr.state || "merged")}</span> ${pr.placeholder ? tag(pr.tag) : ""}<h3>${esc(title)}</h3><p>${esc(pr.summary)}</p>`;
          const url = !pr.placeholder ? safeUrl(pr.href) : "";
          return url
            ? `<a class="card" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${body}</a>`
            : `<article class="card">${body}</article>`;
        }).join("")
      : `<article class="card"><p>No pull requests listed yet.</p></article>`;

    scrRoot.innerHTML = `
      <div class="scr wall on" data-s="home">
        <div class="clock"><div class="t" id="bigclock">--:--</div><div class="dt" id="bigdate"></div></div>
        <div class="apps">${["open pulse", "open pulse-rn", "whoami", "experience", "plugins", "oss", "contact", "help"].map((c) => appButton(c)).join("")}</div>
        <div class="dock">${["open pulse", "whoami", "contact"].map((c) => appButton(c, true)).join("")}</div>
      </div>
      <div class="scr wall" data-s="about"><div class="pad">
        ${photoBlock}
        <div class="sub">whoami</div>
        <p class="hdr">${words(SITE.name)}</p>
        <div class="card"><h2>${esc(SITE.role)}</h2><p>${esc(SITE.summary)}</p>${pills(["8+ yrs", "Flutter/Dart", "iOS", "Android"])}</div>
        <div class="card"><span class="yr">📍 ${esc(SITE.location)}</span><p>Remote · ${esc(SITE.timezone)}</p></div>
        ${photoCard}
        <div class="card"><p>${esc(SITE.availability.detail)} ${SITE.availability.placeholder ? tag(SITE.availability.tag) : ""}</p></div>
      </div></div>
      <div class="scr" data-s="experience" style="background:#0A0A0A"><div class="pad">
        <div class="sub">experience</div>
        <p class="hdr">${esc(SITE.years)} years</p>
        ${jobs}
      </div></div>
      <div class="scr" data-s="projects" style="background:#0A0A0A"><div class="pad">
        <div class="sub">projects</div>
        <p class="hdr">Pulse</p>
        <article class="card">
          <span class="yr">${esc(pulse.stack)}</span>
          <h2>${esc(pulse.name)}</h2>
          <p>${esc(pulse.summary)}</p>
          <div class="stills">${stills}</div>
          <button type="button" class="btnp" data-cmd="open pulse">▶ open pulse</button>
          ${action(pulse.demo, "Open live demo")}
          <a class="btnp ghost" href="${esc(pulse.repo)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </article>
        <article class="card">
          <span class="yr">${esc(pulseRn.stack)} ${pulseRn.stackNote && pulseRn.stackNote.placeholder ? tag(pulseRn.stackNote.tag) : ""}</span>
          <h2>${esc(pulseRn.name)}</h2>
          <p>${esc(pulseRn.summary)} ${fieldText(pulseRn.detail)}</p>
          <button type="button" class="btnp ghost" data-cmd="open pulse-rn">▶ open pulse-rn</button>
          ${action(pulseRn.demo, "Open live demo")}
          ${pulseRn.repo && !pulseRn.repo.placeholder && safeUrl(pulseRn.repo.href) ? `<a class="btnp ghost" href="${esc(safeUrl(pulseRn.repo.href))}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : `<span class="btnp ghost">GitHub ${tag(pulseRn.repo.tag)}</span>`}
        </article>
      </div></div>
      <div class="scr" data-s="pulse" style="background:#0A0A0A">
        <img id="pulsePoster" class="pulse-poster" alt="Pulse markets screen. The reel uses fixture data, not a live market. The terminal build log is illustrative." width="${pulse.media.width}" height="${pulse.media.height}" data-src="${esc(pulse.media.poster)}">
        <video id="pulseVideo" class="pulse-video" muted loop playsinline preload="none" aria-hidden="true"></video>
        <div class="boot" id="bootPulse"><div class="lg"><b>Pulse</b><div class="bar"><i></i></div><span>flutter run · debug</span></div></div>
        <button type="button" class="pulse-ctrl" id="pulseCtrl" hidden>Play</button>
      </div>
      <div class="scr stripes" data-s="pulse-rn"><div class="pad" style="display:grid;place-items:center;text-align:center">
        <div>
          <p class="hdr" style="font-size:6.4cqw">Pulse · React Native</p>
          <p class="lbl">${tag(pulseRn.detail.tag)}<br>screen recording or web build<br>goes here</p>
        </div>
      </div></div>
      <div class="scr" data-s="plugins" style="background:#0A0A0A"><div class="pad">
        <div class="sub">plugins &amp; native</div>
        <p class="hdr">Platform channels</p>
        <div class="diag">
          <div class="node dart"><b>Flutter · Dart</b>MethodChannel('app/battery')
.invokeMethod('getBatteryLevel')</div>
          <div class="chan"><span>⇅ MethodChannel / EventChannel</span></div>
          <div class="natives">
            <div class="node ios"><b>iOS · Swift</b>FlutterMethodChannel
handler → result(level)</div>
            <div class="node and"><b>Android · Kotlin</b>MethodCallHandler
result.success(level)</div>
          </div>
        </div>
        <p class="lbl">${esc(SITE.plugins.diagramNote)}</p>
        <div class="card" style="margin-top:3cqw"><p>${esc(SITE.plugins.summary)} ${fieldText(SITE.plugins.real)}</p></div>
      </div></div>
      <div class="scr" data-s="oss" style="background:#0A0A0A"><div class="pad">
        <div class="sub">open source</div>
        <p class="hdr">Pull requests</p>
        ${ossCards}
        <a class="btnp" href="${esc(SITE.github)}" target="_blank" rel="me noopener noreferrer">${esc(SITE.githubLabel)} ↗</a>
      </div></div>
      <div class="scr wall" data-s="contact"><div class="pad">
        <div class="sub">contact</div>
        <p class="hdr">${words(SITE.contactHeadline)}</p>
        <div class="card"><p>${esc(SITE.availability.detail)} ${SITE.availability.placeholder ? tag(SITE.availability.tag) : ""}</p></div>
        <div class="card"><p>${linkOrTag(SITE.email.placeholder ? "" : "mailto:" + SITE.email.value, SITE.email.value, SITE.email.placeholder, SITE.email.tag)}</p></div>
        ${action(SITE.cv, "Download CV")}
        <a class="btnp ghost" href="${esc(SITE.github)}" target="_blank" rel="me noopener noreferrer">GitHub ↗</a>
        ${action(SITE.linkedin, SITE.linkedin.label)}
        ${action(SITE.x, SITE.x.label)}
      </div></div>`;

    $$(".scr").forEach((el) => {
      if (!el.classList.contains("on")) el.setAttribute("inert", "");
    });
  }

  function renderChrome() {
    const brand = $("#brand");
    if (brand) {
      brand.innerHTML = `<i class="dot" aria-hidden="true"></i>${esc(SITE.user)}<span>@${esc(SITE.host)}:~</span>`;
    }
    $("#navLinks").innerHTML = SITE.nav.map((item) =>
      `<button type="button" data-cmd="${esc(item.cmd)}">${esc(item.label)}</button>`
    ).join("");
    const cvHost = $("#cvSlot");
    const cvUrl = !SITE.cv.placeholder ? safeUrl(SITE.cv.href) : "";
    if (cvUrl) {
      cvHost.innerHTML = `<a class="cv" href="${esc(cvUrl)}" target="_blank" rel="noopener">CV ↓</a>`;
    } else {
      cvHost.innerHTML = `<button type="button" class="cv" data-cmd="contact">CV ↓ ${tag(SITE.cv.tag)}</button>`;
    }
    $("#chips").innerHTML = ["whoami", "experience", "projects", "open pulse", "open pulse-rn", "plugins", "oss", "contact", "help", "clear"]
      .map((c) => `<button type="button" class="chip" data-cmd="${esc(c)}">${esc(c)}</button>`).join("");
    const track = $("#track");
    const items = SITE.ticker.concat(SITE.ticker);
    track.replaceChildren();
    for (const [k, v, tone] of items) {
      const el = document.createElement("span");
      el.className = "tk";
      const b = document.createElement("b");
      b.textContent = k;
      const val = document.createElement("span");
      val.className = "v" + (tone ? " " + tone : "");
      val.textContent = v;
      el.append(b, val);
      track.append(el);
    }
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* clock + ticker flash */
  function tickClock() {
    const d = new Date();
    const t = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const time = $("#ptime");
    const big = $("#bigclock");
    const date = $("#bigdate");
    if (time) time.textContent = t;
    if (big) big.textContent = t;
    if (date) date.textContent = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }
  if (!reduce) {
    setInterval(() => {
      if (document.documentElement.classList.contains("motion-paused")) return;
      const els = $$(".tk");
      if (!els.length) return;
      const el = els[Math.floor(Math.random() * els.length)];
      const up = Math.random() > 0.35;
      el.classList.add(up ? "flash-up" : "flash-down");
      setTimeout(() => el.classList.remove("flash-up", "flash-down"), 700);
    }, 900);
  }

  /* cable */
  const canOffset = CSS.supports("offset-path", 'path("M 0 0 L 10 10")') || CSS.supports("-webkit-offset-path", 'path("M 0 0 L 10 10")');
  function layoutCable() {
    const cable = $(".cable");
    if (!cable || isMobile()) return;
    const cr = cable.getBoundingClientRect();
    const tr = term.getBoundingClientRect();
    const pr = $("#phone").getBoundingClientRect();
    if (!cr.width || !cr.height || !tr.height || !pr.height) return;
    const W = cr.width;
    const H = cr.height;
    const y0 = tr.top - cr.top + tr.height * 0.38;
    const y1 = pr.top - cr.top + pr.height * 0.62;
    const x1 = pr.left - cr.left - 2;
    const d = `M -2 ${y0.toFixed(1)} C ${(W * 0.75).toFixed(1)} ${y0.toFixed(1)}, ${(W * 0.2).toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    $("#cableSvg").setAttribute("viewBox", `0 0 ${W} ${H}`);
    $("#wire").setAttribute("d", d);
    $("#glowp").setAttribute("d", d);
    const packetEl = $("#packet");
    packetEl.style.offsetPath = `path('${d}')`;
    packetEl.style.webkitOffsetPath = `path('${d}')`;
    const plug = $("#plug");
    plug.style.left = (x1 - 14) + "px";
    plug.style.top = (y1 - 8) + "px";
  }
  function packet(dir) {
    if (reduce || isMobile() || !canOffset || document.documentElement.classList.contains("motion-paused")) return;
    const p = $("#packet");
    p.classList.remove("go", "back");
    void p.offsetWidth;
    p.classList.add(dir === "back" ? "back" : "go");
  }
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => layoutCable());
    ro.observe(document.querySelector(".stage"));
    ro.observe(document.getElementById("phone"));
    ro.observe(term);
  }
  addEventListener("resize", layoutCable);
  matchMedia("(max-width: 820px)").addEventListener("change", (e) => {
    if (!e.matches) {
      term.classList.remove("open");
      drawerH.setAttribute("aria-expanded", "false");
    }
    layoutCable();
  });

  /* phone navigation */
  let cur = "home";
  let pulseArmed = false;
  function setMode(mode) {
    $("#statusText").textContent = `adb connected · device: ${DEVICE} · ${mode}`;
  }
  function hydrate(scope) {
    scope.querySelectorAll("img[data-src]").forEach((img) => {
      if (!img.getAttribute("src")) img.src = img.dataset.src;
    });
  }
  function syncPulseCtrl() {
    const btn = $("#pulseCtrl");
    const video = $("#pulseVideo");
    if (!btn || !video) return;
    if (cur !== "pulse") {
      btn.hidden = true;
      return;
    }
    const playing = pulseArmed && !video.paused && !video.ended;
    btn.hidden = false;
    btn.textContent = playing ? "Pause" : "Play";
    btn.setAttribute("aria-label", playing ? "Pause Pulse demo" : "Play Pulse demo");
  }
  function armPulse() {
    const video = $("#pulseVideo");
    hydrate(document.querySelector('.scr[data-s="pulse"]'));
    if (!pulseArmed) {
      const webm = document.createElement("source");
      webm.src = pulse.media.webm;
      webm.type = "video/webm";
      const mp4 = document.createElement("source");
      mp4.src = pulse.media.mp4;
      mp4.type = "video/mp4";
      video.append(webm, mp4);
      video.load();
      pulseArmed = true;
      video.addEventListener("playing", () => {
        video.classList.add("is-playing");
        syncPulseCtrl();
      });
      video.addEventListener("pause", syncPulseCtrl);
      video.addEventListener("ended", syncPulseCtrl);
    }
    return video;
  }
  function show(screen, { flash = true } = {}) {
    if (screen === cur) {
      if (flash) hot();
      return;
    }
    $$(".scr").forEach((el) => {
      const on = el.dataset.s === screen;
      el.classList.toggle("on", on);
      el.toggleAttribute("inert", !on);
      if (on) hydrate(el);
    });
    $("#sbar").style.opacity = screen === "pulse" ? "0" : "1";
    cur = screen;
    if (flash) hot();
    const video = $("#pulseVideo");
    if (screen !== "pulse" && video && !video.paused) video.pause();
    if (screen === "home") setMode("idle");
    else if (screen === "pulse" || screen === "pulse-rn") setMode("running " + screen);
    else setMode("route: /" + screen);
    syncPulseCtrl();
  }
  function hot(ms) {
    const f = $("#flash");
    const t = $("#toast");
    if (!f || !t) return;
    t.textContent = `Hot reload · ${ms || (180 + Math.floor(Math.random() * 90))}ms`;
    f.classList.remove("go");
    void f.offsetWidth;
    if (!reduce) f.classList.add("go");
    t.classList.add("on");
    clearTimeout(hot._t);
    hot._t = setTimeout(() => t.classList.remove("on"), reduce ? 0 : 1100);
    const island = $("#island");
    island.classList.add("act");
    clearTimeout(hot._i);
    hot._i = setTimeout(() => island.classList.remove("act"), reduce ? 0 : 1300);
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#pulseCtrl")) return;
    e.stopPropagation();
    const video = armPulse();
    if (!video.paused) video.pause();
    else video.play().catch(() => {});
    syncPulseCtrl();
  });
  $("#tickerToggle").addEventListener("click", () => {
    const paused = document.documentElement.classList.toggle("motion-paused");
    const btn = $("#tickerToggle");
    btn.setAttribute("aria-pressed", String(paused));
    btn.setAttribute("aria-label", paused ? "Resume animations" : "Pause animations");
    const video = $("#pulseVideo");
    if (paused && video && !video.paused) video.pause();
    document.dispatchEvent(new CustomEvent("motion-toggle"));
    syncPulseCtrl();
  });

  /* terminal */
  function line(html, cls) {
    const d = document.createElement("div");
    d.className = "ln" + (cls ? " " + cls : "");
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
    const text = d.textContent.replace(/\s+/g, " ").trim();
    if (text) lastLine.textContent = text;
    return d;
  }
  async function lines(arr, gap) {
    for (const html of arr) {
      line(html);
      await sleep(gap == null ? 55 : gap);
    }
  }
  async function typeCmd(cmd) {
    const d = line('<span class="p">❯</span> <span class="pu">~</span> <span class="w"></span><span class="cursor" aria-hidden="true"></span>');
    const w = d.querySelector(".w");
    if (reduce) w.textContent = cmd;
    else {
      for (const ch of cmd) {
        w.textContent += ch;
        await sleep(28 + Math.random() * 26);
      }
    }
    const caret = d.querySelector(".cursor");
    if (caret) caret.remove();
    lastLine.textContent = cmd;
  }
  function announce(text) {
    const el = $("#announcer");
    if (!el || !text) return;
    el.textContent = "";
    setTimeout(() => { el.textContent = text; }, 40);
  }

  const COMMANDS = {
    async help() {
      line('<span class="m">available commands</span>');
      for (const c of SITE.commands) {
        line(`<div class="help-row"><button type="button" class="cmdlink" data-cmd="${esc(c.cmd)}">${esc(c.cmd)}</button><span class="m">${esc(c.help)}</span></div>`, "plain");
        await sleep(16);
      }
      line('<span class="d">⌘K or Ctrl+K opens the palette. Tap an app on the phone. ↑↓ walks history, Tab completes.</span>', "plain");
    },
    async whoami() {
      show("about");
      await lines([
        `<span class="big">${words(SITE.name)}</span>`,
        `<span class="p">${esc(SITE.role)}</span> <span class="m">·</span> Flutter · iOS · Android <span class="m">·</span> ${esc(SITE.years)} yrs`,
        `<span class="m">${esc(SITE.summary)}</span>`,
        `<span class="m">📍 ${esc(SITE.location)} · remote · ${esc(SITE.timezone)}</span>`,
        `<span class="m">${esc(SITE.availability.text)}</span> ${SITE.availability.placeholder ? tag(SITE.availability.tag) : ""}`,
      ], 70);
    },
    async experience() {
      show("experience");
      line('<span class="m">YEARS          COMPANY            WHAT</span>');
      for (const job of SITE.experience) {
        const extra = job.extra && (job.extra.text || job.extra.placeholder) ? " " + fieldText(job.extra) : "";
        line(`<div class="row"><span class="a">${esc(job.range)}</span><span class="w">${esc(job.company)}</span><span>${esc(job.summary)}${extra}</span></div>`, "plain");
        await sleep(60);
      }
    },
    async projects() {
      show("projects");
      await lines([
        `<span class="g">pulse</span>      ${esc(pulse.summary)}`,
        `<span class="m">repo</span>      <a href="${esc(pulse.repo)}" target="_blank" rel="noopener noreferrer">${esc(pulse.repoLabel)}</a>`,
        `<span class="m">demo</span>      ${linkOrTag(pulse.demo.href, "live demo", pulse.demo.placeholder, pulse.demo.tag)}`,
        `<span class="g">pulse-rn</span>   ${esc(pulseRn.summary)} ${fieldText(pulseRn.detail)} ${pulseRn.stackNote && pulseRn.stackNote.placeholder ? tag(pulseRn.stackNote.tag) : ""}`,
        `<span class="m">repo</span>      ${linkOrTag(pulseRn.repo.href, pulseRn.repo.label || "GitHub", pulseRn.repo.placeholder, pulseRn.repo.tag)}`,
        `<span class="m">demo</span>      ${linkOrTag(pulseRn.demo.href, "live demo", pulseRn.demo.placeholder, pulseRn.demo.tag)}`,
        `<span class="m">→ run</span> ${cmdLink("open pulse")} <span class="m">or</span> ${cmdLink("open pulse-rn")}`,
      ], 55);
    },
    async "open pulse"() {
      setMode("building…");
      packet("go");
      const boot = $("#bootPulse");
      line(`<span class="a">illustrative log</span> <span class="d">— not a real device build</span>`);
      await lines([
        '<span class="m">$ flutter run -d dorian-phone</span>',
        "Launching lib/main.dart on dorian-phone in debug mode...",
        "Running Xcode build...",
      ], 220);
      await sleep(420);
      line('<span class="g">✓</span> Xcode build done.                                   <span class="m">14.8s</span>');
      show("pulse", { flash: false });
      boot.classList.remove("hide", "run");
      void boot.offsetWidth;
      boot.classList.add("run");
      await lines([
        'Syncing files to device dorian-phone...                <span class="m">318ms</span>',
        '<span class="m">Pulse: CoinGecko metadata + Binance public ticker stream (reel is fixture data)</span>',
      ], 240);
      await sleep(reduce ? 0 : 640);
      boot.classList.add("hide");
      hot(212);
      const video = $("#pulseVideo");
      if (!reduce && !document.documentElement.classList.contains("motion-paused")) {
        const node = armPulse();
        node.play().catch(() => syncPulseCtrl());
      } else {
        hydrate(document.querySelector('.scr[data-s="pulse"]'));
        syncPulseCtrl();
      }
      await lines([
        '<span class="p">⚡ Performing hot reload...</span>',
        '<span class="g">Reloaded 1 of 812 libraries in 212ms.</span>',
        '<span class="m">r Hot reload · R Hot restart · q Quit</span> <span class="a">(log is illustrative)</span>',
        `<span class="m">source →</span> <a href="${esc(pulse.repo)}" target="_blank" rel="noopener noreferrer">${esc(pulse.repoLabel)}</a>`,
      ], 90);
      if (video && video.paused) syncPulseCtrl();
    },
    async "open pulse-rn"() {
      setMode("building…");
      packet("go");
      await lines([
        `<span class="a">illustrative log</span> <span class="d">— not a real device build</span> ${tag("confirm toolchain")}`,
        '<span class="m">$ npx react-native run-ios</span>',
        'info Building (using "xcodebuild")...',
      ], 200);
      show("pulse-rn");
      await lines([
        '<span class="g">✓</span> Placeholder screen is on dorian-phone',
        `<span class="m">repo</span> ${linkOrTag(pulseRn.repo.href, "add the repository", pulseRn.repo.placeholder, pulseRn.repo.tag)}`,
        `<span class="m">demo</span> ${linkOrTag(pulseRn.demo.href, "screen recording or web build", pulseRn.demo.placeholder, pulseRn.demo.tag)}`,
      ], 120);
    },
    async plugins() {
      show("plugins");
      await lines([
        `<span class="w">Flutter plugins with native code</span>`,
        `Dart  <span class="p">⇄ MethodChannel / EventChannel ⇄</span>  Swift (iOS) · Kotlin (Android)`,
        `<span class="m">${esc(SITE.plugins.summary)}</span>`,
        `<span class="d">${esc(SITE.plugins.diagramNote)}</span> ${fieldText(SITE.plugins.real)}`,
      ], 70);
    },
    async oss() {
      show("oss");
      if (!SITE.oss.length) line("<span class=\"m\">No pull requests listed yet.</span>");
      for (const pr of SITE.oss) {
        const url = !pr.placeholder ? safeUrl(pr.href) : "";
        const title = url
          ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(pr.repo)} #${esc(pr.number)}</a>`
          : `${esc(pr.repo)} #${esc(pr.number)}`;
        line(`<span class="g">● ${esc(pr.state || "merged")}</span>  ${title}  ${esc(pr.summary)} ${pr.placeholder ? tag(pr.tag) : ""}`);
        await sleep(70);
      }
      line(`<span class="m">all →</span> <a href="${esc(SITE.github)}" target="_blank" rel="me noopener noreferrer">${esc(SITE.githubLabel)}</a>`);
    },
    async contact() {
      show("contact");
      await lines([
        `<span class="m">status  </span> ${esc(SITE.availability.detail)} ${SITE.availability.placeholder ? tag(SITE.availability.tag) : ""}`,
        `<span class="m">email   </span> ${linkOrTag(SITE.email.placeholder ? "" : "mailto:" + SITE.email.value, SITE.email.value, SITE.email.placeholder, SITE.email.tag)}`,
        `<span class="m">github  </span> <a href="${esc(SITE.github)}" target="_blank" rel="me noopener noreferrer">${esc(SITE.githubLabel)}</a>`,
        `<span class="m">linkedin</span> ${linkOrTag(SITE.linkedin.href, SITE.linkedin.label, SITE.linkedin.placeholder, SITE.linkedin.tag)}`,
        `<span class="m">x       </span> ${linkOrTag(SITE.x.href, SITE.x.label, SITE.x.placeholder, SITE.x.tag)}`,
        `<span class="m">cv      </span> ${linkOrTag(SITE.cv.href, "resume PDF", SITE.cv.placeholder, SITE.cv.tag)}`,
      ], 60);
    },
    async home() {
      show("home");
      line('<span class="m">phone → home</span>');
    },
    async clear() {
      out.replaceChildren();
      lastLine.textContent = "terminal cleared";
    },
  };
  const ALIAS = { work: "experience", about: "whoami", ls: "help", cv: "contact", "?": "help" };
  const SCREEN = {
    whoami: "about",
    experience: "experience",
    projects: "projects",
    "open pulse": "pulse",
    "open pulse-rn": "pulse-rn",
    plugins: "plugins",
    oss: "oss",
    contact: "contact",
    home: "home",
  };
  const LIST = SITE.commands.map((c) => c.cmd);

  function summary(cmd) {
    switch (cmd) {
      case "whoami": return `${SITE.name}, ${SITE.role}. ${SITE.location}, remote.`;
      case "experience": return "Experience. " + SITE.experience.map((j) => `${j.company}, ${j.dates}.`).join(" ");
      case "projects": return "Projects. Pulse is a Flutter market tracker. Pulse RN details are still placeholders.";
      case "open pulse": return "Pulse is on the phone. The build log is illustrative and the reel uses fixture data.";
      case "open pulse-rn": return "Pulse React Native placeholder is on the phone.";
      case "plugins": return SITE.plugins.summary;
      case "oss": return "Open source placeholders and the GitHub profile.";
      case "contact": return "Contact details. Placeholder links are marked.";
      case "home": return "Phone home screen.";
      case "help": return "Commands listed in the terminal.";
      case "clear": return "Terminal cleared.";
      default: return "";
    }
  }

  let busy = false;
  let booting = true;
  const hist = [];
  let hi = 0;

  function openDrawer() {
    term.classList.add("open");
    drawerH.setAttribute("aria-expanded", "true");
    setTimeout(() => { out.scrollTop = out.scrollHeight; }, reduce ? 0 : 420);
  }
  async function run(raw, { typed = false, from = "terminal" } = {}) {
    let cmd = String(raw || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!cmd || busy) return;
    cmd = ALIAS[cmd] || cmd;
    busy = true;
    try {
      if (isMobile() && !booting) openDrawer();
      if (typed) await typeCmd(cmd);
      else line(`<span class="p">❯</span> <span class="pu">~</span> <span class="w">${esc(cmd)}</span>`);
      if (from === "phone") {
        packet("back");
        line('<span class="d">↳ from dorian-phone (tap)</span>');
      } else packet("go");
      hist.push(cmd);
      hi = hist.length;
      $$(".chip").forEach((c) => c.classList.toggle("on", c.dataset.cmd === cmd));
      const fn = COMMANDS[cmd];
      if (fn) await fn();
      else line(`<span class="r">zsh: command not found: ${esc(cmd)}</span> <span class="m">— try</span> ${cmdLink("help")}`);
      line("");
      if (SCREEN[cmd]) history.replaceState(null, "", "#" + encodeURIComponent(cmd));
      announce(summary(cmd) || (fn ? "" : `Unknown command ${cmd}.`));
    } finally {
      busy = false;
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const v = input.value;
      input.value = "";
      run(v, { typed: false });
    } else if (e.key === "ArrowUp") {
      if (hi > 0) { hi -= 1; input.value = hist[hi]; }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (hi < hist.length - 1) { hi += 1; input.value = hist[hi]; }
      else { hi = hist.length; input.value = ""; }
      e.preventDefault();
    } else if (e.key === "Tab") {
      const q = input.value.toLowerCase();
      const match = LIST.find((c) => c.startsWith(q));
      if (match) input.value = match;
      e.preventDefault();
    }
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-cmd]");
    if (!el || el.closest("#palBg")) return;
    const fromPhone = !!el.closest("#phone");
    if (el.tagName === "A") e.preventDefault();
    run(el.dataset.cmd, { typed: true, from: fromPhone ? "phone" : "terminal" });
  });
  $("#homebar").addEventListener("click", (e) => {
    e.stopPropagation();
    run("home", { typed: true, from: "phone" });
  });
  drawerH.addEventListener("click", () => {
    const open = term.classList.toggle("open");
    drawerH.setAttribute("aria-expanded", String(open));
    if (open) {
      setTimeout(() => out.scrollTop = out.scrollHeight, reduce ? 0 : 420);
      if (!reduce) input.focus({ preventScroll: true });
    }
  });
  $("#skip").addEventListener("click", () => { if (isMobile()) openDrawer(); });

  /* palette */
  const palBg = $("#palBg");
  const palIn = $("#palIn");
  const palList = $("#palList");
  const shell = $("#shell");
  let sel = 0;
  let filtered = SITE.commands;
  let lastFocus = null;
  function renderPal() {
    const q = palIn.value.toLowerCase();
    filtered = SITE.commands.filter((c) => (c.cmd + " " + c.label + " " + c.help).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, filtered.length - 1));
    palList.innerHTML = filtered.map((c, i) =>
      `<li role="option" id="pal-opt-${i}" aria-selected="${i === sel}" data-i="${i}"><span>${esc(c.label)}</span><span>$ ${esc(c.cmd)}</span></li>`
    ).join("") || '<li role="presentation"><span class="m">no match</span></li>';
    palIn.setAttribute("aria-activedescendant", filtered.length ? `pal-opt-${sel}` : "");
    const current = palList.querySelector('[aria-selected="true"]');
    if (current) current.scrollIntoView({ block: "nearest" });
  }
  function openPal() {
    lastFocus = document.activeElement;
    shell.setAttribute("inert", "");
    palBg.classList.add("on");
    palIn.value = "";
    sel = 0;
    renderPal();
    palIn.focus();
  }
  function closePal() {
    palBg.classList.remove("on");
    shell.removeAttribute("inert");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus({ preventScroll: true });
  }
  $("#palBtn").addEventListener("click", openPal);
  addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && key === "k") {
      e.preventDefault();
      palBg.classList.contains("on") ? closePal() : openPal();
    } else if (e.key === "Escape") {
      if (palBg.classList.contains("on")) closePal();
      else if (isMobile() && term.classList.contains("open")) {
        term.classList.remove("open");
        drawerH.setAttribute("aria-expanded", "false");
      }
    }
  });
  palIn.addEventListener("input", () => { sel = 0; renderPal(); });
  palIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, Math.max(0, filtered.length - 1)); renderPal(); e.preventDefault(); }
    if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderPal(); e.preventDefault(); }
    if (e.key === "Enter" && filtered[sel]) {
      const cmd = filtered[sel].cmd;
      closePal();
      run(cmd, { typed: true });
    }
    if (e.key === "Tab") { e.preventDefault(); palIn.focus(); }
  });
  palList.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li || !filtered[+li.dataset.i]) return;
    const cmd = filtered[+li.dataset.i].cmd;
    closePal();
    run(cmd, { typed: true });
  });
  palBg.addEventListener("click", (e) => { if (e.target === palBg) closePal(); });

  /* boot */
  renderChrome();
  renderScreens();
  tickClock();
  setInterval(tickClock, 15000);
  setMode("idle");
  layoutCable();
  document.fonts && document.fonts.ready.then(layoutCable);
  setTimeout(layoutCable, 300);

  (async function boot() {
    const when = new Date().toDateString();
    busy = true;
    try {
    await lines([
      `<span class="d">Last login: ${esc(when)} on ttys001</span>`,
      `<span class="g">●</span> <span class="m">device connected:</span> ${DEVICE} <span class="d">(usb)</span>`,
      "",
    ], 90);
    } finally {
      busy = false;
    }
    let start = "whoami";
    try {
      const hash = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim().toLowerCase().replace(/\s+/g, " ");
      const normalized = ALIAS[hash] || hash;
      if (normalized && (COMMANDS[normalized] || ALIAS[normalized])) start = normalized;
    } catch (err) { /* keep whoami */ }
    await sleep(180);
    await run(start, { typed: true });
    if (start === "whoami") {
      line(`<span class="m">try:</span> ${["experience", "projects", "open pulse", "plugins", "contact"].map(cmdLink).join("  ")} <span class="m">· or tap an app on the phone</span>`, "plain");
    }
    booting = false;
    layoutCable();
    if (!isMobile()) input.focus({ preventScroll: true });
  })();
})();
