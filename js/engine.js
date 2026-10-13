(() => {
const $ = s => document.querySelector(s);
const S = window.SCENES, A = window.ASSETS, U = window.UI_COPY, M = window.MUSIC;
let st, busy = false, log = [], auto = false, autoT = null;
const charOf = id => id.replace(/_age\d+$/, "");
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = s => esc(s).replace(/\[([^\]]+)\]/g, "<i>[$1]</i>");
const sid = () => S[st.scene].id;

function fresh(scene = 0) { return { scene, stack: [{ i: 0 }], flags: { ...window.FLAGS_INIT }, bg: null, sprites: [], speaker: null, cg: null, musicTag: 0, track: null }; }
function opsAt(depth) { let ops = S[st.scene].ops; for (let d = 1; d <= depth; d++) { const f = st.stack[d]; ops = ops[f.ci].options.find(o => o.key === f.key).ops; } return ops; }

// ---------- images ----------
const imgCache = {};
function firstLoadable(urls) {
  const key = urls.join("|"); if (key in imgCache) return imgCache[key];
  return imgCache[key] = new Promise(res => { let i = 0; const next = () => { if (i >= urls.length) return res(null);
    const u = urls[i++], im = new Image(); im.onload = () => res(u); im.onerror = next; im.src = u; }; next(); });
}
const D = A.dirs, F = window.ASSET_FILES || {};
const has = (kind, f) => (F[kind] || []).includes(f);
function resolve(kind, name) { // filename, or base name -> newest _vN version present
  if (!name) return null; if (/\.[a-z0-9]+$/i.test(name)) { if (has(kind, name)) return D[kind] + name; name = name.replace(/\.[a-z0-9]+$/i, ""); }
  let best = null, bv = -1; for (const f of F[kind] || []) { const m = f.match(/^(.*?)(?:_v(\d+))?\.(png|jpe?g|webp|ogg|mp3|wav)$/i);
    if (m && m[1] === name) { const v = m[2] ? +m[2] : 0, pin = (A.preferVersion || {})[kind];
      const score = pin != null && v === pin ? 1e9 : v; if (score > bv) { bv = score; best = f; } } }
  return best ? D[kind] + best : null; }
window.__resolve = resolve;
const bgCandidates = id => [resolve("bg", "bg_" + id), resolve("bg", A.bg[id])].filter(Boolean);
const moodOf = e => Object.keys(window.EXPR_MOOD).find(m => window.EXPR_MOOD[m].includes(e)) || "neutral";
function spriteCandidates(id, expr) { const ch = charOf(id), c = [];
  for (const k of [id, ch]) if (A.sprites[k]) c.push(D.sprites + A.sprites[k].replace("{expr}", expr));
  if (A.probeSprites) for (const k of [...new Set([id, ch])]) c.push(`${D.sprites}${k}/${expr}.png`, `${D.sprites}${k}/${k}_${expr}.png`, `${D.sprites}${k}/${moodOf(expr)}.png`, `${D.sprites}${k}/neutral.png`);
  return [...new Set(c.map(u => resolve("sprites", u.slice(D.sprites.length))).filter(Boolean))]; }
function bgPlaceholder(id, desc) { const p = id + " " + desc, g =
  /dusk|sunset|orange/.test(p) ? ["#2a2238","#c8794a"] : /night|storm|monsoon/.test(p) ? ["#2a2238","#14121c"] :
  /morning/.test(p) ? ["#e3c79a","#8a98a8"] : /noon|day|afternoon/.test(p) ? ["#8fb8d8","#c8a878"] : ["#6b4a6e","#2b1d18"];
  return `linear-gradient(180deg,${g[0]},${g[1]})`; }
async function setBg(id, desc) {
  st.bg = { id, desc }; const el = $("#bg"); el.className = ""; el.innerHTML = ""; el.style.background = bgPlaceholder(id, desc);
  const ph = document.createElement("div"); ph.className = "ph"; ph.textContent = `[placeholder BG] ${id}`; el.appendChild(ph);
  const url = await firstLoadable(bgCandidates(id));
  if (url && st.bg?.id === id) { const exact = url === resolve("bg", "bg_" + id), tint = !exact && (A.bgTint || {})[id];
    el.style.background = (tint ? tint + "," : "") + `center/cover url("${url}")`; ph.remove(); }
}
function silhouette(ch, expr) {
  const col = window.CHAR_COLORS[ch] || "#888", kid = /azriel|zeke|neil|lacy|devin|michael|big_kid/.test(ch), hr = kid ? 26 : 30, by = kid ? 120 : 100;
  return `<svg viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg"><g fill="${col}" stroke="#0006" stroke-width="3">
  <circle cx="100" cy="${by-hr-8}" r="${hr}"/><path d="M${kid?60:50} ${by} Q100 ${by-14} ${kid?140:150} ${by} L${kid?150:162} ${kid?330:300} L${kid?132:140} 500 L68 500 L${kid?50:38} ${kid?330:300} Z"/></g>
  <text x="100" y="${kid?360:330}" font-family="system-ui" font-size="17" font-weight="700" text-anchor="middle" fill="#fff">${esc(ch)}</text>
  <text x="100" y="${kid?382:352}" font-family="system-ui" font-size="14" text-anchor="middle" fill="#fffc">${esc(expr)}</text></svg>`;
}
function renderSprites() { const box = $("#sprites"); box.innerHTML = "";
  st.sprites.forEach(s => { const d = document.createElement("div"); d.className = "sprite"; d.dataset.ch = charOf(s.id); d.innerHTML = silhouette(charOf(s.id), s.expr); box.appendChild(d);
    firstLoadable(spriteCandidates(s.id, s.expr)).then(u => { if (u) d.innerHTML = `<img alt="${esc(s.id)}" src="${u}">`; }); });
  dim(); }
function dim() { const sp = st.speaker && window.SPEAKER_SPRITE[st.speaker];
  document.querySelectorAll(".sprite").forEach(d => d.classList.toggle("dim", !!sp && d.dataset.ch !== sp)); }
function setSprite(id, expr) { const ch = charOf(id); st.sprites = st.sprites.filter(s => charOf(s.id) !== ch);
  st.sprites.push({ id, expr: (expr || "neutral").split(",")[0].trim() }); if (st.sprites.length > 3) st.sprites.shift(); renderSprites(); }
function setCg(cg) { st.cg = cg ? cg.id : null; const el = $("#cg");
  const url = cg && resolve("cg", cg.file); if (url) { el.src = url; el.alt = cg.id; el.hidden = false; } else { el.hidden = true; el.removeAttribute("src"); } }
function cgCheck(text) { // called before each line is shown
  const cur = window.CGS.find(c => c.id === st.cg);
  if (cur && cur.hide && text.includes(cur.hide)) setCg(null);
  const nx = window.CGS.find(c => c.scene === sid() && resolve("cg", c.file) && [].concat(c.show).some(x => text.includes(x))); if (nx) setCg(nx);
}

// ---------- music (Web Audio, unlocked on first tap/key) ----------
const audio = { ctx: null, master: null, buffers: {}, cur: null, want: null, status: {}, unlocked: false };
window.__AUDIO = audio;
function unlockAudio() {
  if (audio.unlocked) return; audio.unlocked = true;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  audio.ctx = new AC(); audio.master = audio.ctx.createGain(); audio.master.gain.value = +($("#m-vol").value); audio.master.connect(audio.ctx.destination);
  audio.ctx.resume(); M.tracks.forEach(loadTrack); if (audio.want !== null) playTrack(audio.want, true);
}
function loadTrack(name) {
  if (audio.buffers[name]) return audio.buffers[name];
  const tryFmt = ext => (has("music", name + "." + ext) ? fetch(D.music + name + "." + ext) : Promise.reject(new Error("not in manifest"))).then(r => { audio.status[name + "." + ext] = r.status; if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(b => audio.ctx.decodeAudioData(b));
  return audio.buffers[name] = tryFmt("ogg").catch(() => tryFmt("mp3")).then(b => { audio.status[name] = "decoded"; return b; })
    .catch(e => { audio.status[name] = "failed: " + e; return null; });
}
async function playTrack(name, force) {
  audio.want = name; if (st) st.track = name;
  if (!audio.ctx) return; if (!force && audio.cur && audio.cur.name === name) return;
  const t = audio.ctx.currentTime, old = audio.cur;
  if (old) { const f = name ? M.crossfade : M.stopFade; old.gain.gain.cancelScheduledValues(t); old.gain.gain.setValueAtTime(old.gain.gain.value, t); old.gain.gain.linearRampToValueAtTime(0, t + f); old.src.stop(t + f + 0.05); audio.cur = null; }
  if (!name) return;
  const buf = await loadTrack(name); if (!buf || audio.want !== name) return;
  const src = audio.ctx.createBufferSource(), g = audio.ctx.createGain(); src.buffer = buf; src.loop = true;
  src.connect(g).connect(audio.master); const n = audio.ctx.currentTime;
  g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(1, n + M.crossfade); src.start(n);
  audio.cur = { name, src, gain: g };
}
["pointerdown", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, unlockAudio, { capture: true, passive: true }));
$("#m-vol").oninput = e => { if (audio.master) audio.master.gain.value = +e.target.value; };

const sfxSlug = d => d.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 60);
const sfxFound = {};
function sfxPlay(desc) {
  const slug = sfxSlug(desc), mapped = A.sfx[slug];
  const urls = [mapped ? resolve("sfx", mapped) : resolve("sfx", slug)].filter(Boolean);
  if (!urls.length || !audio.ctx) return;
  const p = sfxFound[slug] ??= (async () => { for (const u of urls) { try { const r = await fetch(u); if (r.ok) return await audio.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) {} } return null; })();
  p.then(buf => { if (!buf) return; const s = audio.ctx.createBufferSource(); s.buffer = buf; s.connect(audio.master); s.start(); });
}
function sfxCaption(desc) { sfxPlay(desc); const el = $("#sfx"); el.textContent = "🔊 " + desc; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, 3500); }

// ---------- runner ----------
function sceneStart() { st.stack = [{ i: 0 }]; st.sprites = []; st.musicTag = 0; setCg(null); renderSprites(); title();
  const m = M.sceneStart[sid()]; if (m) playTrack(m); }
function step() {
  if (busy) return; clearTimeout(autoT); $("#choices").hidden = true; $("#choices").innerHTML = "";
  for (;;) {
    const depth = st.stack.length - 1, ops = opsAt(depth), f = st.stack[depth];
    if (f.i >= ops.length) {
      if (depth > 0) { st.stack.pop(); st.stack[st.stack.length - 1].i++; continue; }
      if (st.scene + 1 < S.length) { st.scene++; sceneStart(); continue; }
      return endChapter();
    }
    const op = ops[f.i];
    switch (op.op) {
      case "bg": st.sprites = []; renderSprites(); setBg(op.id, op.desc); f.i++; break;
      case "sprite": setSprite(op.id, op.desc); f.i++; break;
      case "sfx": sfxCaption(op.desc); f.i++; break;
      case "music": { const tags = M.tags[sid()] || []; const tr = tags[st.musicTag++]; if (tr !== undefined) playTrack(tr); f.i++; break; }
      case "fade": f.i++; busy = true; $("#fade").classList.add("on"); setTimeout(() => { $("#fade").classList.remove("on"); busy = false; step(); }, 900); return;
      case "say": f.i++; cgCheck(op.text); show(op.who, op.text); return;
      case "choice": showChoice(op, f.i); return;
      default: f.i++;
    }
  }
}
function title() { /* scene name kept in state for Log; Juno's layout has no top bar */ }
function show(who, text) {
  st.speaker = who === "NARRATION" ? null : who;
  $("#textbox").classList.toggle("narration", who === "NARRATION");
  $("#name").textContent = U.names[who] ?? (who.charAt(0) + who.slice(1).toLowerCase());
  $("#text").innerHTML = fmt(text); $("#textbox").hidden = false; dim();
  log.push((who === "NARRATION" ? "" : (U.names[who] || who) + ": ") + text); if (log.length > 300) log.shift();
  if (auto) autoT = setTimeout(advance, 1800 + text.length * 45);
}
function showChoice(op, ci) {
  $("#textbox").hidden = true; const box = $("#choices"); box.hidden = false;
  box.innerHTML = `<p class="choices__prompt">${esc(U.choicePrompt)}</p>`;
  const copy = U.choices[sid()] || {};
  op.options.forEach(o => { const b = document.createElement("button"); b.className = "btn choice"; b.textContent = copy[o.key] ?? o.text; b.dataset.key = o.key;
    b.onclick = e => { e.stopPropagation(); pick(o.key, ci); }; box.appendChild(b); });
  box.querySelector("button").focus({ preventScroll: true });
}
function pick(key, ci) {
  const delta = (window.FLAG_MAP[sid()] || {})[key] || {};
  for (const k in delta) st.flags[k] = (st.flags[k] || 0) + delta[k];
  log.push(`› ${(U.choices[sid()] || {})[key] || key}`); st.stack.push({ ci, key, i: 0 }); step();
}
function endChapter() { $("#textbox").hidden = true; $("#end").hidden = false; $("#end-flags").textContent = JSON.stringify(st.flags, null, 2); window.__VN_DONE = true; }
function start(scene = 0, saved) {
  st = saved || fresh(scene); log = []; window.__VN_DONE = false;
  ["#title", "#end"].forEach(s => $(s).hidden = true);
  if (saved) { setBg(st.bg?.id || "", st.bg?.desc || ""); renderSprites(); setCg(window.CGS.find(c => c.id === st.cg)); playTrack(st.track);
    const top = st.stack[st.stack.length - 1], ops = opsAt(st.stack.length - 1); if (top.i > 0 && ops[top.i - 1]?.op === "say") top.i--; step(); }
  else { const m = M.sceneStart[S[scene].id]; if (scene === 0) chapterCard(); else { playTrack(m || null); step(); } }
}
function chapterCard() {
  const c = $("#chapter"); $("#ch-num").textContent = U.chapter.num; $("#ch-title").textContent = U.chapter.title; $("#ch-meta").textContent = U.chapter.meta;
  c.hidden = false; $("#textbox").hidden = true; playTrack(M.title);
  const go = () => { if (c.hidden) return; c.hidden = true; clearTimeout(t); step(); };
  const t = setTimeout(go, 2900); c.onclick = e => { e.stopPropagation(); go(); };
}
function advance() {
  if (!$("#chapter").hidden || !$("#choices").hidden || !$("#title").hidden || !$("#end").hidden || document.querySelector(".overlay:not([hidden])")) return;
  step();
}

// ---------- UI ----------
$("#textbox").addEventListener("click", e => { if (!e.target.closest(".dialogue__controls")) advance(); });
$("#game").addEventListener("click", e => { if (e.target.id === "bg" || e.target.id === "cg" || e.target.closest("#sprites") || e.target.classList.contains("scrim") && !e.target.closest("#title") || e.target.id === "game") advance(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { document.querySelectorAll(".overlay").forEach(o => o.hidden = true); return; }
  const btns = $("#choices").querySelectorAll("button"); if (btns.length && /^[1-9]$/.test(e.key) && btns[e.key - 1]) return btns[e.key - 1].click();
  if ((e.key === " " || e.key === "Enter") && !btns.length && e.target.tagName !== "BUTTON") { e.preventDefault(); advance(); }
});
$("#title-h1").textContent = U.title; $("#tagline").textContent = U.tagline;
$("#btn-start").textContent = U.menu.begin; $("#btn-continue").textContent = U.menu.cont; $("#btn-settings").textContent = U.menu.settings;
if (resolve("cg", A.titleArt)) firstLoadable([resolve("cg", A.titleArt)]).then(u => { if (u) { const k = $("#keyart"); k.src = u; k.alt = U.title; k.hidden = false; $("#title").classList.add("has-art"); } });
const sel = $("#scene-jump"); sel.innerHTML = `<option value="">Scene select (dev)…</option>` + S.map((s, i) => `<option value="${i}">${i + 1}. ${s.title}</option>`).join("");
sel.onchange = () => sel.value !== "" && start(+sel.value);
const open = id => { $(id).hidden = false; };
const toTitle = () => { document.querySelectorAll(".overlay").forEach(o => o.hidden = true); $("#end").hidden = true; $("#textbox").hidden = true; $("#title").hidden = false; setCg(null);
  $("#btn-continue").hidden = !localStorage.getItem("tmwr_save"); playTrack(M.title); };
$("#btn-start").onclick = () => start(0);
$("#btn-continue").hidden = !localStorage.getItem("tmwr_save");
$("#btn-continue").onclick = () => { const s = JSON.parse(localStorage.getItem("tmwr_save")); start(s.scene, s); };
$("#btn-settings").onclick = () => { $("#m-flags").textContent = st ? JSON.stringify(st.flags, null, 2) : ""; open("#menu"); };
document.querySelectorAll(".help-open").forEach(b => b.onclick = e => { e.stopPropagation(); open("#help"); });
$("#btn-menu").onclick = e => { e.stopPropagation(); $("#m-flags").textContent = st ? JSON.stringify(st.flags, null, 2) : ""; open("#menu"); };
$("#btn-log").onclick = e => { e.stopPropagation(); $("#log-body").innerHTML = log.map(l => `<p>${fmt(l)}</p>`).join(""); open("#log"); };
$("#btn-auto").onclick = e => { e.stopPropagation(); auto = !auto; e.currentTarget.setAttribute("aria-pressed", auto); e.currentTarget.classList.toggle("btn--primary", auto); if (auto) autoT = setTimeout(advance, 1500); else clearTimeout(autoT); };
document.querySelectorAll(".overlay .close").forEach(b => b.onclick = e => { e.stopPropagation(); b.closest(".overlay").hidden = true; });
$("#m-save").onclick = () => { localStorage.setItem("tmwr_save", JSON.stringify(st)); $("#m-save").textContent = "Saved ✓"; setTimeout(() => $("#m-save").textContent = "Save", 1200); };
$("#m-load").onclick = () => { const s = localStorage.getItem("tmwr_save"); if (s) { $("#menu").hidden = true; const o = JSON.parse(s); start(o.scene, o); } };
$("#m-title").onclick = $("#btn-end-title").onclick = toTitle;
audio.want = M.title; // title theme starts on first tap (mobile autoplay policy)
window.VN = { get state() { return st; }, start, advance };
})();
