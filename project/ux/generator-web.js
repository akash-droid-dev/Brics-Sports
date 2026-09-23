// Builds the UI/UX spec SVGs. Run via run_script: reads ux/photos.json, writes ux/*.svg
const PH = {"sumo":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Asashoryu_fight_Jan08.JPG/500px-Asashoryu_fight_Jan08.JPG","kabaddi":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Iran_men%27s_national_kabaddi_team_13970602000432636707284535394012_98208.jpg/500px-Iran_men%27s_national_kabaddi_team_13970602000432636707284535394012_98208.jpg","sepak":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Incheon_AsianGames_Sepaktakraw_09_%2815291705581%29.jpg/500px-Incheon_AsianGames_Sepaktakraw_09_%2815291705581%29.jpg","hurling":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/David_Collins_and_Eoin_Kelly_%28Tipperary%29.jpg/500px-David_Collins_and_Eoin_Kelly_%28Tipperary%29.jpg","oil":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Yagli_gures3.JPG/500px-Yagli_gures3.JPG","capoeira":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Rugendasroda.jpg/500px-Rugendasroda.jpg","bokh":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Men_Traditional_Wrestling_Outfits_Stage_a_Display_as_Secretary_Kerry_Attends_a_%22Mini-Nadaam%22_in_a_Field_Outside_Ulaanbaatar_%2826934055503%29.jpg/500px-Men_Traditional_Wrestling_Outfits_Stage_a_Display_as_Secretary_Kerry_Attends_a_%22Mini-Nadaam%22_in_a_Field_Outside_Ulaanbaatar_%2826934055503%29.jpg","kendo":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/2022_All_Japan_Kendo_Championship_Tetsuhiko_Murakami4.jpg/500px-2022_All_Japan_Kendo_Championship_Tetsuhiko_Murakami4.jpg","mallakhamb":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Malakhambha_pradarshana_Nudisir_2015_02.JPG/500px-Malakhambha_pradarshana_Nudisir_2015_02.JPG","ssireum":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Danwon-Ssireum.jpg/500px-Danwon-Ssireum.jpg","caber":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Caber_2.jpg/500px-Caber_2.jpg","gaelic":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Aidan_O%27Mahony_%26_Eoin_Bradley.jpg/500px-Aidan_O%27Mahony_%26_Eoin_Bradley.jpg","khokho":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Kho_Kho_game_at_a_Government_school_in_Haryana%2C_India.jpg/500px-Kho_Kho_game_at_a_Government_school_in_Haryana%2C_India.jpg","krabi":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Krabi_Krabong_Buddhai_Swan_1.jpg/500px-Krabi_Krabong_Buddhai_Swan_1.jpg","silat":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/DSC_3099_wikimedia2020_deni_dahniel_atraksi_silek_minagkabau.jpg/500px-DSC_3099_wikimedia2020_deni_dahniel_atraksi_silek_minagkabau.jpg"};
const xa = (u) => u.replace(/&/g, '&amp;');
const INK = '#16120E', SAND = '#F4EEE4', CARD = '#FFFCF6', NIGHT = '#13100D', RED = '#E1302A', SAF = '#F3A53A', TERRA = '#B8411A', MUTED = '#6A6056', PAPER = '#EAE3D7';
const DISP = "'Big Shoulders Display','Oswald','Arial Narrow',sans-serif", BODY = "'Instrument Sans','Helvetica Neue',Arial,sans-serif", MONO = "'JetBrains Mono',Menlo,monospace";
const C = { IND: '#E8871E', JPN: '#C8243B', MNG: '#2B6CB0', TUR: '#0F8B8D', THA: '#6B3FA0', IDN: '#B5452C', KOR: '#D64F79', SCO: '#1B3A6B', IRL: '#2F8F46', BRA: '#D9A60B' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function Doc(prefix) {
  let n = 0; const used = new Set(); const defs = [];
  const id = (k) => `${prefix}-${k}-${n++}`;
  const d = {
    P: prefix,
    t: (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.f || BODY}" font-size="${o.s || 14}" font-weight="${o.w || 400}" fill="${o.c || INK}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}>${esc(o.up ? String(s).toUpperCase() : s)}</text>`,
    r: (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 0}" fill="${o.fill || 'none'}"${o.st ? ` stroke="${o.st}" stroke-width="${o.sw || 1}"` : ''}${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}/>`,
    c: (x, y, rr, fill, o = {}) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${fill}"${o.st ? ` stroke="${o.st}" stroke-width="${o.sw || 1}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}/>`,
    photo: (x, y, w, h, key, color, rr = 0, shade = true) => {
      const cid = id('clip'); defs.push(`<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rr}"/></clipPath>`);
      let inner = PH[key] ? `<image href="${xa(PH[key])}" xlink:href="${xa(PH[key])}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${prefix}-hatch)"/>`;
      if (PH[key]) used.add(key);
      if (shade) inner += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${prefix}-shade)"/>`;
      return `<g clip-path="url(#${cid})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color || '#333'}"/>${inner}</g>`;
    },
    defs, id,
  };
  return d;
}
const wrap = (s, max) => { const out = []; let line = ''; for (const w of String(s).split(' ')) { if ((line + ' ' + w).trim().length > max) { if (line) out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; };

// ---------- phone parts ----------
function statusBar(D, dark = true) { return D.r(0, 0, 390, 47, { fill: NIGHT }) + D.t(34, 31, '14:42', { s: 15, w: 600, c: '#fff' }) + D.r(136, 10, 118, 33, { r: 17, fill: '#000' }) + D.r(318, 18, 20, 11, { r: 2, fill: '#fff' }) + D.r(342, 17, 24, 12, { r: 3, st: 'rgba(255,255,255,.5)' }) + D.r(344, 19, 18, 8, { r: 2, fill: '#fff' }); }
function nav(D, y, active) {
  const items = ['Live', 'Schedule', 'Map', 'Explore', 'Updates']; let s = D.r(0, y, 390, 74, { fill: 'rgba(255,252,246,.97)' }) + `<line x1="0" y1="${y}" x2="390" y2="${y}" stroke="rgba(22,18,14,.1)"/>`;
  items.forEach((it, i) => { const cx = 39 + i * 78; const col = it === active ? TERRA : MUTED; s += icon(it, cx, y + 24, col) + D.t(cx, y + 50, it, { s: 10.5, w: 700, c: col, a: 'middle' }); });
  s += D.c(47, y + 14, 3.5, RED) + D.r(349, y + 8, 18, 15, { r: 7.5, fill: RED }) + D.t(358, y + 19, '3', { s: 9.5, w: 700, c: '#fff', a: 'middle' });
  return s;
}
function icon(k, cx, cy, col) {
  const g = (p) => `<g transform="translate(${cx - 12},${cy - 12})" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</g>`;
  if (k === 'Live') return g(`<circle cx="12" cy="12" r="2.6" fill="${col}"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/>`);
  if (k === 'Schedule') return g(`<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>`);
  if (k === 'Map') return g(`<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>`);
  if (k === 'Explore') return g(`<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="${col}"/>`);
  return g(`<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>`);
}
function liveTag(D, x, y, small) { const w = small ? 40 : 52, h = small ? 18 : 23; return D.r(x, y, w, h, { r: 5, fill: RED }) + D.c(x + (small ? 9 : 11), y + h / 2, small ? 2.6 : 3.2, '#fff') + D.t(x + (small ? 16 : 20), y + h / 2 + (small ? 3.5 : 4.3), 'LIVE', { s: small ? 9.5 : 11.5, w: 700, c: '#fff', ls: 1 }); }
function secTitle(D, y, s, link, dark) { return D.t(16, y, s, { f: DISP, s: 22, w: 800, up: true, c: dark ? '#fff' : INK, ls: .4 }) + (link ? D.t(374, y, link, { s: 13, w: 600, c: dark ? SAF : TERRA, a: 'end' }) : ''); }
function row(D, y, o) {
  let s = D.r(16, y, 358, 58, { r: 14, fill: CARD, st: o.live ? RED : o.changed ? SAF : 'rgba(22,18,14,.08)', sw: o.live || o.changed ? 1.5 : 1 }) + D.r(27, y + 10, 4, 38, { r: 2, fill: o.color });
  s += D.t(42, y + 27, o.time, { f: MONO, s: 14.5, w: 700, c: o.done ? MUTED : INK }) + D.t(42, y + 43, o.sub2 || '', { s: 11, c: MUTED });
  s += D.t(o.tx || 100, y + 26, o.title, { s: 15, w: 700, c: o.done ? MUTED : INK }) + D.t(o.tx || 100, y + 43, o.sub, { s: 12, c: MUTED });
  const vw = o.venue.length * 7 + 14; s += D.r(362 - vw, y + 10, vw, 20, { r: 6, fill: o.done ? 'rgba(22,18,14,.07)' : INK }) + D.t(362 - vw / 2, y + 24, o.venue, { s: 11.5, w: 700, c: o.done ? MUTED : '#fff', a: 'middle' });
  if (o.status) { const sw = o.status.length * 6.2 + 12; const bg = o.status === 'LIVE' ? RED : o.status === 'CHANGED' ? '#FBE3BD' : 'rgba(22,18,14,.07)'; const fg = o.status === 'LIVE' ? '#fff' : o.status === 'CHANGED' ? '#8A4B00' : MUTED; s += D.r(362 - sw, y + 34, sw, 16, { r: 4, fill: bg }) + D.t(362 - sw / 2, y + 45.5, o.status, { s: 9.5, w: 700, c: fg, a: 'middle' }); }
  return s;
}
function darkHeader(D, y, h, eyebrow, title) { return D.r(0, y, 390, h, { fill: NIGHT }) + D.r(0, y, 390, h, { fill: `url(#${D.P}-kilim)`, op: .09 }) + D.t(16, y + 24, eyebrow, { f: MONO, s: 10.5, w: 600, c: SAF, ls: 1.5, up: true }) + D.t(16, y + 56, title, { f: DISP, s: 32, w: 800, c: '#fff', up: true }); }
function chips(D, x, y, list, activeIdx, dark) { let s = '', cx = x; list.forEach((l, i) => { const w = l.length * 7 + 26; const act = i === activeIdx; s += D.r(cx, y, w, 32, { r: 16, fill: act ? (dark ? SAF : INK) : dark ? 'transparent' : CARD, st: dark ? 'rgba(255,255,255,.2)' : 'rgba(22,18,14,.12)' }) + D.t(cx + w / 2, y + 20.5, l, { s: 12.5, w: 600, c: act ? (dark ? INK : '#fff') : dark ? '#fff' : INK, a: 'middle' }); cx += w + 6; }); return s; }
function emblem(D, cx, cy) { const cols = Object.values(C); let s = ''; const R = 22, r = 12.5; cols.forEach((col, i) => { const a0 = ((i / 10) * 360 + 2) * Math.PI / 180, a1 = (((i + 1) / 10) * 360 - 2) * Math.PI / 180; const p = (rad, a) => `${(cx + rad * Math.sin(a)).toFixed(2)} ${(cy - rad * Math.cos(a)).toFixed(2)}`; s += `<path d="M${p(R, a0)} A${R} ${R} 0 0 1 ${p(R, a1)} L${p(r, a1)} A${r} ${r} 0 0 0 ${p(r, a0)} Z" fill="${col}"/>`; }); return s + D.c(cx, cy, 9, NIGHT) + D.c(cx, cy, 3.2, RED); }
function qr(D, x, y, size) { const N = 29, u = size / N; let s = D.r(x, y, size, size, { fill: '#fff' }); let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; const cell = (i, j) => { s += `<rect x="${(x + i * u).toFixed(2)}" y="${(y + j * u).toFixed(2)}" width="${u.toFixed(2)}" height="${u.toFixed(2)}" fill="${INK}"/>`; }; const fin = (a, b) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) cell(a + i, b + j); } }; const inF = (i, j) => (i < 8 && j < 8) || (i > N - 9 && j < 8) || (i < 8 && j > N - 9); fin(0, 0); fin(N - 7, 0); fin(0, N - 7); for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { if (inF(i, j) || (i >= 10 && i <= 18 && j >= 10 && j <= 18)) continue; if (i === 6 || j === 6) { if ((i + j) % 2 === 0) cell(i, j); continue; } if (rnd() > .52) cell(i, j); } s += D.r(x + 11.4 * u, y + 11.4 * u, 6.2 * u, 6.2 * u, { r: u, fill: RED }) + D.c(x + 14.5 * u, y + 14.5 * u, 1.2 * u, '#fff'); return s; }

// ---------- page composition ----------
let W = 1640; const PX = 625, PY = 250;
function page(D, meta, phoneH, drawPhone, notes, flow, opts = {}) {
  const phoneW = opts.phoneW || 390; const px = opts.px ?? PX;
  let body = '';
  // header
  body += D.t(60, 62, 'FESTIVAL OF TRADITIONAL SPORTS  ·  UNIVERSAL QR LIVE HUB  ·  UI/UX SPECIFICATION', { f: MONO, s: 12, w: 600, c: TERRA, ls: 1.5 });
  body += D.t(60, 150, meta.n, { f: DISP, s: 96, w: 900, c: INK }) + D.t(meta.n.length * 44 + 80, 112, meta.title, { f: DISP, s: 44, w: 800, c: INK, up: true });
  wrap(meta.purpose, 110).forEach((l, i) => { body += D.t(meta.n.length * 44 + 80, 142 + i * 22, l, { s: 16, c: '#3D352D' }); });
  let tx = 60; (meta.tags || []).forEach((tg) => { const w = tg.length * 7.4 + 28; body += D.r(tx, 190, w, 30, { r: 15, fill: CARD, st: 'rgba(22,18,14,.12)' }) + D.t(tx + w / 2, 210, tg, { s: 12.5, w: 600, c: INK, a: 'middle' }); tx += w + 8; });
  // phone
  const ph = opts.desktop ? drawPhone(D, px, PY) : phoneFrame(D, px, PY, phoneW, phoneH, drawPhone);
  // notes
  const placed = placeNotes(D, [...notes].sort((a, b) => a.ay - b.ay).map((n, i) => ({ ...n, k: 'ABCDEFGHIJ'[i] })), px, phoneW, PY);
  const phoneBottom = PY + phoneH + 20;
  let fy = Math.max(phoneBottom, placed.bottom) + 60;
  const fl = flowBand(D, fy, flow);
  const H = fy + fl.h + 60;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
<linearGradient id="${D.P}-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A0806" stop-opacity=".35"/><stop offset=".4" stop-color="#0A0806" stop-opacity="0"/><stop offset="1" stop-color="#0A0806" stop-opacity=".9"/></linearGradient>
<pattern id="${D.P}-hatch" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="20" fill="#000" opacity=".16"/></pattern>
<pattern id="${D.P}-kilim" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M14 2 L26 14 L14 26 L2 14 Z" fill="none" stroke="${SAF}" stroke-width="1.2"/><path d="M14 9 L19 14 L14 19 L9 14 Z" fill="${SAF}"/></pattern>
<pattern id="${D.P}-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#16120E" opacity=".08"/></pattern>
<marker id="${D.P}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${TERRA}"/></marker>
<radialGradient id="${D.P}-glow"><stop offset="0" stop-color="${SAF}" stop-opacity=".45"/><stop offset="1" stop-color="${SAF}" stop-opacity="0"/></radialGradient>
${D.defs.join('\n')}
</defs>
<rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#${D.P}-dots)"/>
${body}${ph}${placed.svg}${fl.svg}
${D.t(60, H - 28, 'Mockup content is illustrative. Countries, sports, times and venues are managed in Admin and update live on the public site.', { s: 12, c: MUTED })}
${D.t(W - 60, H - 28, meta.n + ' / 10', { f: MONO, s: 12, c: MUTED, a: 'end' })}
</svg>`;
  return svg;
}
function phoneFrame(D, x, y, w, h, draw) {
  const cid = D.id('screen'); D.defs.push(`<clipPath id="${cid}"><rect x="0" y="0" width="${w}" height="${h}" rx="46"/></clipPath>`);
  return `<g transform="translate(${x},${y})"><rect x="-12" y="-12" width="${w + 24}" height="${h + 24}" rx="58" fill="#0B0908"/><rect x="-12" y="-12" width="${w + 24}" height="${h + 24}" rx="58" fill="none" stroke="#3B332B" stroke-width="1.5"/><g clip-path="url(#${cid})"><rect width="${w}" height="${h}" fill="${SAND}"/>${draw(D)}</g></g>`;
}
function placeNotes(D, notes, px, pw, py) {
  let svg = ''; const colY = { L: py, R: py }; let bottom = 0;
  const NW = 440;
  for (const n of notes) {
    const side = n.side; const bx = side === 'L' ? 60 : px + pw + 125; const w = NW;
    const bodyL = wrap(n.body, 62); const feats = (n.feats || []).map((f) => wrap(f, 56));
    let h = 58 + bodyL.length * 19 + (feats.length ? 14 + feats.reduce((a, f) => a + f.length * 19 + 4, 0) : 0) + (n.flow ? 44 : 0) + 18;
    const target = (n.y ?? (py + n.ay)) - 32; const by = Math.max(target, colY[side]);
    colY[side] = by + h + 18; bottom = Math.max(bottom, colY[side]);
    let s = D.r(bx, by, w, h, { r: 16, fill: '#fff', st: 'rgba(22,18,14,.1)' }) + D.r(bx, by, 6, h, { r: 3, fill: n.color || TERRA });
    s += D.c(bx + 36, by + 32, 15, INK) + D.t(bx + 36, by + 37, n.k, { f: MONO, s: 12, w: 700, c: '#fff', a: 'middle' });
    s += D.t(bx + 62, by + 38, n.title, { f: DISP, s: 22, w: 800, up: true });
    let cy = by + 66; bodyL.forEach((l) => { s += D.t(bx + 24, cy, l, { s: 14, c: '#3D352D' }); cy += 19; });
    if (feats.length) { cy += 10; s += D.t(bx + 24, cy, 'FEATURES', { f: MONO, s: 10.5, w: 700, c: TERRA, ls: 1.2 }); cy += 18; feats.forEach((fl) => { s += D.c(bx + 29, cy - 4.5, 2.6, TERRA); fl.forEach((l) => { s += D.t(bx + 40, cy, l, { s: 13.5, c: INK }); cy += 19; }); cy += 4; }); }
    if (n.flow) { cy += 8; s += D.r(bx + 20, cy - 16, w - 40, 34, { r: 8, fill: SAND }) + D.t(bx + 32, cy + 5, '↳ ' + n.flow, { f: MONO, s: 11.5, w: 600, c: INK }); }
    // arrow
    const ax = px + n.ax, ay = py + n.ay; const sx = side === 'L' ? bx + w : bx, sy = by + 32;
    const dx = Math.abs(ax - sx) * 0.5;
    s += `<path d="M${sx} ${sy} C ${side === 'L' ? sx + dx : sx - dx} ${sy}, ${side === 'L' ? ax - dx : ax + dx} ${ay}, ${ax} ${ay}" fill="none" stroke="${TERRA}" stroke-width="2" marker-end="url(#${D.P}-arrow)"/>`;
    s += D.c(sx, sy, 5, TERRA) + D.c(ax, ay, 11, 'none', { st: TERRA, sw: 2 });
    svg += s;
  }
  return { svg, bottom };
}
function flowBand(D, y, flow) {
  const x = 60, w = W - 120; const rows = Math.max(flow.in.length, flow.out.length); const h = 90 + rows * 50;
  let s = D.r(x, y, w, h, { r: 22, fill: INK }) + D.t(x + 30, y + 42, 'SCREEN WORKFLOW', { f: MONO, s: 12, w: 700, c: SAF, ls: 1.5 }) + D.t(x + 230, y + 42, flow.note || '', { s: 13.5, c: 'rgba(244,238,228,.7)' });
  const colIn = x + 30, colMid = x + w / 2 - 150, colOut = x + w - 380; const top = y + 70;
  const midY = top + (rows * 50) / 2 - 25;
  flow.in.forEach((l, i) => { const yy = top + i * 50; s += D.r(colIn, yy, 350, 38, { r: 10, fill: 'rgba(255,255,255,.07)', st: 'rgba(255,255,255,.14)' }) + D.t(colIn + 16, yy + 24, l, { s: 13.5, w: 600, c: '#F4EEE4' }); s += `<path d="M${colIn + 350} ${yy + 19} C ${colIn + 420} ${yy + 19}, ${colMid - 70} ${midY + 25}, ${colMid - 6} ${midY + 25}" fill="none" stroke="${SAF}" stroke-width="1.6" stroke-dasharray="5 5" marker-end="url(#${D.P}-arrow)"/>`; });
  s += D.r(colMid, midY, 300, 50, { r: 12, fill: RED }) + D.t(colMid + 150, midY + 31, flow.self, { f: DISP, s: 20, w: 800, c: '#fff', a: 'middle', up: true });
  flow.out.forEach((l, i) => { const yy = top + i * 50; s += `<path d="M${colMid + 300} ${midY + 25} C ${colMid + 370} ${midY + 25}, ${colOut - 70} ${yy + 19}, ${colOut - 6} ${yy + 19}" fill="none" stroke="${SAF}" stroke-width="1.6" marker-end="url(#${D.P}-arrow)"/>` + D.r(colOut, yy, 350, 38, { r: 10, fill: 'rgba(255,255,255,.07)', st: 'rgba(255,255,255,.14)' }) + D.t(colOut + 16, yy + 24, l, { s: 13.5, w: 600, c: '#F4EEE4' }); });
  s += D.t(colIn, top - 12, 'ARRIVES FROM', { f: MONO, s: 10, w: 700, c: 'rgba(244,238,228,.5)', ls: 1.2 }) + D.t(colOut, top - 12, 'CAN GO TO', { f: MONO, s: 10, w: 700, c: 'rgba(244,238,228,.5)', ls: 1.2 });
  return { svg: s, h };
}

function isoMap(D, ox, oy, sel) {
  const P = (x, y, z) => [ox + (x - y) * 0.78, oy + (x + y) * 0.4 - z];
  const poly = (pts, fill) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}"/>`;
  let s = poly([P(-10, -10, 0), P(310, -10, 0), P(310, 310, 0), P(-10, 310, 0)], '#2A241C') + poly([P(0, 0, 0), P(300, 0, 0), P(300, 300, 0), P(0, 300, 0)], '#3B4A2E');
  [[150, 0, 150, 300], [0, 120, 300, 120], [0, 205, 300, 205]].forEach(([a, b, c2, d]) => { const p1 = P(a, b, 0), p2 = P(c2, d, 0); s += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#C9B89A" stroke-width="6" opacity=".55"/>`; });
  const G = { main: [95, 18, 110, 84, 26, '#8C7A64', 'Arena'], fop1: [14, 132, 90, 62, 7, '#C0674A', 'FOP 1'], fop2: [118, 132, 92, 62, 5, '#5E8F52', 'FOP 2'], fop3: [224, 132, 62, 62, 7, '#C79A4A', 'FOP 3'], tsz: [14, 218, 128, 64, 11, '#7C6A9A', 'TS Zone'], cz: [158, 218, 128, 64, 16, '#4F8A8B', 'Culture'] };
  const sh = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`; };
  const labels = [];
  Object.entries(G).forEach(([k, [x, y, w, h, z0, col, lab]]) => { const on = k === sel; const z = on ? z0 + 10 : z0; const top = on ? SAF : col;
    s += poly([P(x, y + h, 0), P(x + w, y + h, 0), P(x + w, y + h, z), P(x, y + h, z)], sh(top, .78)) + poly([P(x, y, 0), P(x, y + h, 0), P(x, y + h, z), P(x, y, z)], sh(top, .62)) + poly([P(x, y, z), P(x + w, y, z), P(x + w, y + h, z), P(x, y + h, z)], top);
    const c2 = P(x + w / 2, y + h / 2, z); labels.push([c2, lab, on, ['main', 'fop1', 'fop2', 'fop3', 'tsz'].includes(k)]); });
  labels.forEach(([[lx, ly], lab, on, live]) => { const w = lab.length * 6.5 + (live ? 22 : 14); s += `<line x1="${lx}" y1="${ly}" x2="${lx}" y2="${ly - 14}" stroke="${on ? '#fff' : INK}" stroke-width="2"/>` + D.r(lx - w / 2, ly - 34, w, 20, { r: 8, fill: on ? '#fff' : INK }) + (live ? D.c(lx - w / 2 + 10, ly - 24, 3, RED) : '') + D.t(lx + (live ? 5 : 0), ly - 20, lab, { s: 10, w: 700, c: on ? INK : '#fff', a: 'middle' }); });
  return s;
}
function admin(D, x0, y0) {
  const w = 1000, h = 760; let s = `<g transform="translate(${x0},${y0})">`;
  s += D.r(-1, -1, w + 2, h + 2, { r: 18, fill: '#fff', st: 'rgba(22,18,14,.15)' }) + D.r(0, 0, w, 40, { r: 18, fill: '#E4DCCE' }) + D.r(0, 22, w, 18, { fill: '#E4DCCE' }) + D.c(22, 20, 6, '#E1302A', { op: .8 }) + D.c(42, 20, 6, SAF) + D.c(62, 20, 6, C.IRL) + D.r(300, 10, 400, 20, { r: 10, fill: '#fff' }) + D.t(500, 24, 'admin.traditionalsports.live/qr', { f: MONO, s: 11, c: MUTED, a: 'middle' });
  s += D.r(0, 40, 200, h - 40, { fill: NIGHT }) + emblem(D, 32, 74) + D.t(62, 72, 'EVENT ADMIN', { f: DISP, s: 16, w: 800, c: '#fff' }) + D.t(62, 88, 'Control room', { s: 11, c: 'rgba(255,255,255,.55)' });
  ['Dashboard', 'Live control', 'Schedule', 'Countries', 'Sports', 'Venues & FOPs', 'Updates', 'Announcements', 'Media', 'Partners', 'QR / Public access', 'Users'].forEach((it, i) => { const y = 122 + i * 40; const act = it.startsWith('QR'); s += (act ? D.r(10, y - 20, 180, 32, { r: 8, fill: 'rgba(243,165,58,.16)' }) + D.r(10, y - 20, 3, 32, { fill: SAF }) : '') + D.t(26, y, it, { s: 13, w: act ? 700 : 500, c: act ? SAF : 'rgba(255,255,255,.75)' }); });
  const X = 230; s += D.t(X, 84, 'ADMIN  /  QR / PUBLIC ACCESS', { f: MONO, s: 10.5, c: MUTED, ls: 1 }) + D.t(X, 118, 'QR / PUBLIC ACCESS', { f: DISP, s: 32, w: 800 }) + D.t(X, 140, 'One QR for the whole event. Content changes are made in the other sections, never here.', { s: 13, c: '#4E463D' });
  s += D.r(X, 160, 740, 250, { r: 16, fill: SAND }) + qr(D, X + 20, 180, 210);
  s += D.t(X + 256, 196, 'UNIVERSAL EVENT QR', { f: DISP, s: 24, w: 800 }) + D.r(X + 470, 178, 76, 24, { r: 12, fill: '#DDEFE0' }) + D.c(X + 484, 190, 4, C.IRL) + D.t(X + 515, 194.5, 'ACTIVE', { s: 11, w: 700, c: '#236B34', a: 'middle' });
  [['QR name', 'Universal Event QR'], ['Destination', 'Public Event Homepage / Live Hub'], ['Public URL', 'https://traditionalsports.live']].forEach(([a, b], i) => { const y = 228 + i * 44; s += D.t(X + 256, y, a.toUpperCase(), { s: 10.5, c: MUTED, ls: 1 }) + D.t(X + 256, y + 20, b, { s: 14.5, w: 600, f: i === 2 ? MONO : BODY }); });
  s += D.r(X + 256, 360, 130, 38, { r: 10, fill: INK }) + D.t(X + 321, 384, 'Download QR', { s: 13, w: 700, c: '#fff', a: 'middle' }) + D.r(X + 396, 360, 140, 38, { r: 10, fill: '#fff', st: 'rgba(22,18,14,.2)' }) + D.t(X + 466, 384, 'Copy public URL', { s: 13, w: 700, a: 'middle' }) + D.t(X + 552, 384, 'PNG · SVG · PDF (print)', { s: 12, c: MUTED });
  s += D.t(X, 446, 'ANALYTICS', { f: MONO, s: 11, w: 700, c: TERRA, ls: 1.2 }) + D.t(X + 740, 446, 'Sample data', { s: 11.5, c: MUTED, a: 'end' });
  [['Total visits', '48,210'], ['Visits today', '9,864'], ['Peak hour', '14:00–15:00']].forEach(([a, b], i) => { const x = X + i * 186; s += D.r(x, 460, 176, 84, { r: 14, fill: '#fff', st: 'rgba(22,18,14,.12)' }) + D.t(x + 16, 486, a, { s: 12, c: MUTED }) + D.t(x + 16, 526, b, { f: DISP, s: 30, w: 800 }); });
  s += D.r(X + 558, 460, 182, 250, { r: 14, fill: '#fff', st: 'rgba(22,18,14,.12)' }) + D.t(X + 574, 486, 'Device breakdown', { s: 12, c: MUTED });
  const cx = X + 649, cy = 580, R = 52; let a0 = -Math.PI / 2; [[.82, INK, 'Mobile 82%'], [.12, SAF, 'Tablet 12%'], [.06, '#C9B89A', 'Desktop 6%']].forEach(([f, col, lab], i) => { const a1 = a0 + f * Math.PI * 2; const L = f > .5 ? 1 : 0; s += `<path d="M${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 ${L} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}" fill="none" stroke="${col}" stroke-width="18"/>`; a0 = a1; s += D.r(X + 574, 652 + i * 18 - 8, 8, 8, { r: 2, fill: col }) + D.t(X + 588, 652 + i * 18, lab, { s: 11.5 }); });
  s += D.r(X, 556, 548, 154, { r: 14, fill: '#fff', st: 'rgba(22,18,14,.12)' }) + D.t(X + 16, 582, 'Traffic trend · visits per hour, Day 2', { s: 12, c: MUTED });
  const pts = [120, 380, 620, 900, 1150, 1480, 1320, 1600, 1760, 1210]; const mx = 1800; const gx = X + 30, gy = 690, gw = 500, gh = 90; const path = pts.map((v, i) => `${i ? 'L' : 'M'}${(gx + i * (gw / (pts.length - 1))).toFixed(1)} ${(gy - (v / mx) * gh).toFixed(1)}`).join(' ');
  s += `<path d="${path} L${gx + gw} ${gy} L${gx} ${gy} Z" fill="${SAF}" opacity=".18"/><path d="${path}" fill="none" stroke="${TERRA}" stroke-width="2.5"/>`; ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18'].forEach((hh, i) => { s += D.t(gx + i * (gw / 9), gy + 14, hh, { f: MONO, s: 9.5, c: MUTED, a: 'middle' }); });
  s += D.r(X, 724, 740, 26, { r: 8, fill: '#FBE3BD' }) + D.t(X + 14, 741, 'Only one QR record exists. Location-, hotel-, FOP-, country- or sport-specific QR codes are not supported by design.', { s: 11.5, w: 600, c: '#8A4B00' });
  return s + '</g>';
}

const adminScreen = ({ file: 'w10-admin-qr', n: '10', title: 'Admin · QR / Public access', purpose: 'The only QR screen in Admin. It shows the single universal QR, its destination, download and URL actions, and visit analytics. There are no per-location QR records.', tags: ['Admin web app', 'Desktop', 'Single QR record'], h: 780, desktop: true, draw: (D, x, y) => admin(D, x, y),
  notes: [
    { side: 'L', k: 'A', ax: 20, ay: 518, title: 'Admin navigation', body: 'QR / Public access sits alongside the content sections. Live control, Schedule, Countries, Sports, Venues, Updates and Announcements are where content is changed.', feats: [] },
    { side: 'L', k: 'B', ax: 320, ay: 250, title: 'Universal Event QR', body: 'QR name, status ACTIVE, destination Event Live Hub and the public URL. One record only.', feats: ['Download QR as PNG, SVG or print PDF', 'Copy public URL'] },
    { side: 'L', k: 'C', ax: 300, ay: 500, title: 'Analytics', body: 'Total visits, visits today, device breakdown and traffic trend for the public site.', feats: [] },
    { side: 'L', k: 'D', ax: 300, ay: 736, color: SAF, title: 'By design', body: 'No location-, hotel-, FOP-, country- or sport-specific QR codes and no contextual redirection.', feats: [] },
  ],
  flow: { note: 'Admin changes the website content, not the QR.', in: ['Admin login', 'Admin sidebar: QR / Public access'], self: 'Admin · QR', out: ['Download QR artwork for print', 'Copy URL for promotion', 'Other Admin sections to edit content'] } });

// Desktop website screens. Concatenated after helpers from generator.js by the build script.
PH.sumoL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Asashoryu_fight_Jan08.JPG/960px-Asashoryu_fight_Jan08.JPG';
PH.sepakL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Incheon_AsianGames_Sepaktakraw_09_%2815291705581%29.jpg/960px-Incheon_AsianGames_Sepaktakraw_09_%2815291705581%29.jpg';
const SW = 1280, M = 48, CW = SW - M * 2;
function browserFrame(D, x, y, h, url, inner) {
  const cid = D.id('bw'); D.defs.push(`<clipPath id="${cid}"><rect x="0" y="0" width="${SW}" height="${h}"/></clipPath>`);
  return `<g transform="translate(${x},${y})">` + D.r(-2, -2, SW + 4, h + 48, { r: 16, fill: '#fff', st: 'rgba(22,18,14,.18)' }) + D.r(0, 0, SW, 44, { r: 14, fill: '#E4DCCE' }) + D.r(0, 26, SW, 18, { fill: '#E4DCCE' }) + D.c(22, 22, 6, '#E1302A', { op: .8 }) + D.c(42, 22, 6, SAF) + D.c(62, 22, 6, C.IRL) + D.r(390, 11, 500, 22, { r: 11, fill: '#fff' }) + D.t(640, 26, url, { f: MONO, s: 11.5, c: MUTED, a: 'middle' }) + `<g transform="translate(0,44)"><g clip-path="url(#${cid})">${D.r(0, 0, SW, h, { fill: SAND })}${inner}</g></g></g>`;
}
function webHeader(D, active) {
  let s = D.r(0, 0, SW, 72, { fill: NIGHT }) + emblem(D, M + 20, 36) + D.t(M + 52, 28, 'LIVE HUB · 2026', { f: MONO, s: 10, w: 600, c: SAF, ls: 1.4 }) + D.t(M + 52, 49, 'FESTIVAL OF TRADITIONAL SPORTS', { f: DISP, s: 20, w: 800, c: '#fff' });
  let x = 400; ['Live now', 'Schedule', 'Countries', '30 Sports', 'Venue map', 'Updates'].forEach((n) => { const w = n.length * 8.2 + 28; const on = n === active; if (n === 'Live now') s += D.c(x + 10, 36, 3.5, RED); s += D.t(x + (n === 'Live now' ? 20 : 12), 41, n, { s: 14, w: 600, c: on ? '#fff' : 'rgba(255,255,255,.66)' }); if (on) s += D.r(x + 10, 69, w - 20, 3, { r: 1.5, fill: SAF }); if (n === 'Updates') s += D.r(x + w - 8, 28, 20, 18, { r: 9, fill: RED }) + D.t(x + w + 2, 41, '3', { s: 10.5, w: 700, c: '#fff', a: 'middle' }); x += w + 6; });
  s += D.t(1140, 30, 'Day 2 of 3 · Fri 16 Oct', { s: 11, c: 'rgba(255,255,255,.6)', a: 'end' }) + D.t(1140, 50, '14:42:15', { f: MONO, s: 16, w: 600, c: '#fff', a: 'end' }) + D.r(1152, 20, 80, 32, { r: 8, fill: RED }) + D.c(1166, 36, 3.5, '#fff') + D.t(1200, 41, '6 LIVE', { s: 12.5, w: 700, c: '#fff', a: 'middle', ls: 1 });
  return s;
}
function band(D, y, h, eyebrow, title) { return D.r(0, y, SW, h, { fill: NIGHT }) + D.r(0, y, SW, h, { fill: `url(#${D.P}-kilim)`, op: .08 }) + D.t(M, y + 40, eyebrow, { f: MONO, s: 12, w: 600, c: SAF, ls: 1.6, up: true }) + D.t(M, y + 104, title, { f: DISP, s: 70, w: 900, c: '#fff', up: true }); }
function h2(D, x, y, t, link) { return D.t(x, y, t, { f: DISP, s: 34, w: 800, up: true }) + (link ? D.t(x === M ? SW - M : x + 460, y, link, { s: 14, w: 600, c: TERRA, a: 'end' }) : ''); }
function webFooter(D, y) { return D.r(0, y, SW, 180, { fill: NIGHT }) + D.r(M, y + 36, 110, 110, { r: 12, fill: CARD }) + qr(D, M + 8, y + 44, 94) + D.t(M + 136, y + 70, 'FESTIVAL OF TRADITIONAL SPORTS', { f: DISP, s: 24, w: 800, c: '#fff' }) + D.t(M + 136, y + 96, 'One event, one QR, one website. The same code at every location opens this page.', { s: 14, c: 'rgba(255,255,255,.72)' }) + D.t(M + 136, y + 116, 'Information updates live; no app download needed.', { s: 14, c: 'rgba(255,255,255,.72)' }) + D.t(M + 136, y + 142, 'traditionalsports.live', { f: MONO, s: 14, c: SAF }) + D.t(SW - M, y + 96, 'Live now   Schedule   Countries   30 Sports   Venue map   Updates', { s: 14, c: 'rgba(255,255,255,.8)', a: 'end' }); }
function adminFab(D, y) { return D.r(SW - 190, y, 170, 52, { r: 26, fill: SAF }) + D.c(SW - 162, y + 26, 14, INK) + D.t(SW - 162, y + 30.5, 'A', { f: MONO, s: 12, c: SAF, a: 'middle' }) + D.t(SW - 138, y + 31, 'Admin demo', { s: 14.5, w: 700 }); }
function wRow(D, x, y, w, o) {
  const dark = o.dark; let s = D.r(x, y, w, o.h || 76, { r: 16, fill: dark ? 'rgba(255,255,255,.06)' : CARD, st: o.live ? RED : o.changed ? SAF : dark ? 'rgba(255,255,255,.1)' : 'rgba(22,18,14,.08)', sw: o.live || o.changed ? 1.5 : 1 }) + D.r(x + 14, y + 14, 4, (o.h || 76) - 28, { r: 2, fill: o.color });
  const ink = dark ? '#fff' : o.done ? MUTED : INK, sub = dark ? 'rgba(255,255,255,.62)' : MUTED;
  if (o.timeCol) s += D.t(x + 32, y + 34, o.time, { f: MONO, s: 17, w: 700, c: ink }) + D.t(x + 32, y + 54, o.sub2, { s: 12, c: dark ? SAF : MUTED });
  const tx = o.timeCol ? x + 108 : x + 32;
  s += D.t(tx, y + 34, o.title, { s: 16.5, w: 700, c: ink }) + D.t(tx, y + 54, o.sub, { s: 13, c: sub });
  if (o.time2) s += D.t(tx, y + 72, o.time2, { f: MONO, s: 12, c: MUTED });
  const vw = o.venue.length * 7.4 + 18; s += D.r(x + w - 16 - vw, y + 16, vw, 24, { r: 7, fill: dark ? '#fff' : INK }) + D.t(x + w - 16 - vw / 2, y + 32.5, o.venue, { s: 12.5, w: 700, c: dark ? INK : '#fff', a: 'middle' });
  if (o.status) { const sw = o.status.length * 6.4 + 14; const bg = o.status === 'LIVE' ? RED : o.status === 'CHANGED' ? '#FBE3BD' : o.status.startsWith('in ') ? INK : 'rgba(22,18,14,.07)'; const fg = o.status === 'LIVE' || o.status.startsWith('in ') ? '#fff' : o.status === 'CHANGED' ? '#8A4B00' : MUTED; s += D.r(x + w - 16 - sw, y + 46, sw, 19, { r: 5, fill: bg }) + D.t(x + w - 16 - sw / 2, y + 59.5, o.status, { s: 10.5, w: 700, c: fg, a: 'middle' }); }
  return s;
}
function photoCard(D, x, y, w, h, key, col, top, name, live, big) { let s = D.photo(x, y, w, h, key, col, 18) + D.r(x, y, w, 6, { fill: col }); if (live) s += liveTag(D, x + 14, y + 18, true); s += D.t(x + 16, y + h - (big ? 52 : 40), top, { s: 12, c: '#fff', op: .85 }) + D.t(x + 16, y + h - 16, name, { f: DISP, s: big ? 52 : 28, w: 800, c: '#fff', up: true }); return s; }

// ---------- W01 first view ----------
function wHome1(D) {
  let s = webHeader(D, 'Live now') + D.r(0, 72, SW, 52, { fill: SAF }) + `<path d="M${M + 2} 94v8h5l8 6V88l-8 6h-5z" fill="${INK}"/>` + D.t(M + 34, 104, 'Gate B closed 15:00–15:30.', { s: 14.5, w: 700 }) + D.t(M + 226, 104, 'Use Gate A or South Gate while the Parade of Nations passes. Sessions run on time.', { s: 14.5 }) + D.t(SW - M, 105, '×', { s: 20, a: 'end' });
  s += D.r(0, 124, SW, 740, { fill: NIGHT }) + D.r(0, 124, SW, 740, { fill: `url(#${D.P}-kilim)`, op: .08 }) + D.c(1150, 130, 320, `url(#${D.P}-glow)`);
  s += D.c(M + 5, 166, 5, RED) + D.t(M + 20, 171, 'DAY 2 · FRI 16 OCT · EVENT GROUNDS', { f: MONO, s: 12, w: 600, c: SAF, ls: 1.6 }) + D.t(M, 236, 'LIVE NOW', { f: DISP, s: 76, w: 900, c: '#fff' }) + D.t(SW - M, 232, '6 locations live · 10 countries · 30 traditional sports', { s: 14, c: 'rgba(255,255,255,.65)', a: 'end' });
  s += D.photo(M, 262, 744, 440, 'sumoL', C.JPN, 24) + D.r(M + 22, 284, 64, 28, { r: 7, fill: RED }) + D.c(M + 36, 298, 4, '#fff') + D.t(M + 46, 303, 'LIVE', { s: 13, w: 700, c: '#fff', ls: 1.4 });
  s += D.r(M + 530, 282, 192, 34, { r: 17, fill: 'rgba(19,16,13,.65)', st: 'rgba(255,255,255,.25)' }) + D.t(M + 626, 304, '◉ FOP 1 · View on map', { s: 14, w: 600, c: '#fff', a: 'middle' });
  s += D.r(M + 28, 574, 12, 12, { r: 3, fill: C.JPN }) + D.t(M + 48, 585, 'Japan · Demonstration', { s: 14, w: 600, c: '#fff' }) + D.t(M + 28, 652, 'SUMO', { f: DISP, s: 88, w: 900, c: '#fff' });
  s += D.t(M + 28, 676, '14:30–15:00 · FOP 1', { f: MONO, s: 14, c: '#fff' }) + D.t(M + 716, 676, '17:45 left', { f: MONO, s: 14, c: SAF, a: 'end' }) + D.r(M + 28, 686, 688, 5, { r: 2.5, fill: 'rgba(255,255,255,.2)' }) + D.r(M + 28, 686, 275, 5, { r: 2.5, fill: RED });
  const rx = M + 764, rw = CW - 764;
  s += D.t(rx, 290, 'UP NEXT', { f: DISP, s: 28, w: 800, c: '#fff' }) + D.t(rx + rw, 290, 'Full schedule →', { s: 14, w: 600, c: SAF, a: 'end' });
  [['15:00', 'Kabaddi', 'India · Demonstration', 'FOP 2', C.IND], ['15:00', 'Kendo', 'Japan · Demonstration', 'FOP 1', C.JPN], ['15:00', 'Road Bowling', 'Ireland · Demonstration', 'FOP 3', C.IRL], ['15:00', 'Shagai', 'Mongolia · Showcase', 'Arena', C.MNG]].forEach(([t1, n, sub, v, col], i) => { s += wRow(D, rx, 308 + i * 100, rw, { dark: true, timeCol: true, time: t1, sub2: 'in 18 min', title: n, sub, venue: v, color: col, h: 88 }); });
  s += D.t(M, 740, 'ALSO LIVE AT OTHER LOCATIONS', { s: 12, w: 700, c: 'rgba(255,255,255,.55)', ls: 1.4 });
  [['sepak', 'Sepak Takraw', 'Thailand · 14:30–15:00', 'FOP 2', C.THA], ['caber', 'Stone Put', 'Scotland · 14:30–15:00', 'FOP 3', C.SCO], ['capoeira', 'Capoeira', 'Brazil · 14:00–14:45', 'Arena', C.BRA], ['x', 'Mongolian Archery', 'Mongolia · 14:00–15:00', 'TS Zone', C.MNG]].forEach(([k, n, sub, v, col], i) => { const x = M + i * 300; s += D.r(x, 756, 288, 84, { r: 16, fill: 'rgba(255,255,255,.06)', st: 'rgba(255,255,255,.1)' }) + D.photo(x + 10, 766, 64, 64, k, col, 11, false) + D.c(x + 88, 780, 3, RED) + D.t(x + 96, 784, 'LIVE', { s: 11, w: 700, c: '#FF6A5F' }) + D.t(x + 276, 784, v, { s: 11, w: 600, c: 'rgba(255,255,255,.7)', a: 'end' }) + D.t(x + 84, 804, n, { s: 15, w: 700, c: '#fff' }) + D.t(x + 84, 820, sub, { s: 12, c: 'rgba(255,255,255,.6)' }) + D.r(x + 84, 828, 192, 3, { r: 1.5, fill: 'rgba(255,255,255,.15)' }) + D.r(x + 84, 828, 90 + i * 20, 3, { r: 1.5, fill: RED }); });
  s += h2(D, M, 912, 'Quick access') + adminFab(D, 830);
  return s;
}
// ---------- W02 home sections ----------
function wHome2(D) {
  let s = webHeader(D, 'Live now');
  s += h2(D, M, 128, 'Quick access');
  const tw = (CW - 4 * 16) / 5; const tiles = [['Schedule', 'See every demonstration · 156 today', 1], ['Countries', 'Explore all 10 countries', 0], ['Sports', 'Discover every traditional sport', 0], ['Venue map', 'Find locations and facilities', 0], ['Updates', 'Schedule changes and notices', 0]];
  tiles.forEach(([t1, t2, dark], i) => { const x = M + i * (tw + 16), y = 148; s += D.r(x, y, tw, 180, { r: 20, fill: dark ? INK : CARD, st: dark ? null : 'rgba(22,18,14,.08)' });
    if (i === 0) s += D.r(x + 20, y + 20, 52, 52, { r: 14, fill: RED }) + icon('Schedule', x + 46, y + 46, '#fff');
    if (i === 1) Object.values(C).forEach((col, j) => { s += D.r(x + 20 + (j % 5) * 22, y + 22 + Math.floor(j / 5) * 22, 17, 17, { r: 5, fill: col }); });
    if (i === 2) s += D.t(x + 20, y + 76, '30', { f: DISP, s: 64, w: 900, c: TERRA });
    if (i === 3) s += `<path d="M${x + 22} ${y + 52} L${x + 58} ${y + 32} L${x + 94} ${y + 52} L${x + 58} ${y + 72} Z" fill="#E7DCCB"/><path d="M${x + 42} ${y + 50} L${x + 58} ${y + 41} L${x + 74} ${y + 50} L${x + 58} ${y + 59} Z" fill="${INK}"/><circle cx="${x + 86}" cy="${y + 32}" r="5" fill="${RED}"/>`;
    if (i === 4) s += icon('Updates', x + 36, y + 42, INK) + D.r(x + 58, y + 32, 56, 20, { r: 10, fill: RED }) + D.t(x + 86, y + 46, '3 new', { s: 12, w: 700, c: '#fff', a: 'middle' });
    s += D.t(x + 20, y + 138, t1, { f: DISP, s: 28, w: 800, up: true, c: dark ? '#fff' : INK }) + D.t(x + 20, y + 160, t2, { s: 13, c: dark ? 'rgba(255,255,255,.7)' : MUTED }); });
  s += h2(D, M, 396, "Today's programme", 'Full schedule →') + D.r(M, 416, CW, 364, { r: 20, fill: CARD, st: 'rgba(22,18,14,.08)' }) + `<line x1="${M + 150}" y1="416" x2="${M + 150}" y2="780" stroke="rgba(22,18,14,.08)"/>`;
  const venues = ['Main Arena', 'FOP 1', 'FOP 2', 'FOP 3', 'Trad. Sports Zone', 'Cultural Zone']; const gx = M + 160, hp = 114; venues.forEach((v, i) => { s += D.t(M + 16, 478 + i * 52, v, { s: 13.5, w: 700 }); });
  for (let h = 0; h < 10; h++) { const x = gx + h * hp; s += `<line x1="${x}" y1="426" x2="${x}" y2="776" stroke="rgba(22,18,14,.06)"/>` + D.t(x + 5, 440, String(9 + h).padStart(2, '0') + ':00', { f: MONO, s: 11, c: MUTED }); }
  const now = 5.7; const names = ['Sumo', 'Kendo', 'Bökh', 'Oil W.', 'Kabaddi', 'Hurling', 'Sepak T.', 'Tug of War', 'Kyūdō', 'Shagai', 'Caber', 'Egrang', 'Silat', 'Capoeira']; const cols = Object.values(C);
  venues.forEach((v, ri) => { const step = ri === 0 || ri >= 4 ? 1 : 0.5; const len = ri === 0 ? 0.75 : ri === 5 ? 0.5 : step; for (let t = ri === 5 ? 0.5 : 0; t < 9; t += step) { const x = gx + t * hp + 2, y = 452 + ri * 52, w = len * hp - 5; const st = t + len <= now ? -1 : t <= now ? 1 : 0; const k = Math.round(t * 2 + ri * 3) % names.length; s += D.r(x, y, w, 42, { r: 9, fill: st === 1 ? INK : st === -1 ? '#EFE8DC' : SAND, st: st === 1 ? RED : null, sw: 2 }) + D.r(x, y, w, 3, { fill: cols[k % 10] }) + D.t(x + 7, y + 22, ri === 5 ? 'Showcase' : names[k], { s: 11, w: 700, c: st === 1 ? '#fff' : INK }); } });
  s += D.r(gx + now * hp, 432, 2, 344, { fill: RED }) + D.c(gx + now * hp + 1, 432, 5, RED);
  s += h2(D, M, 848, 'Explore countries', 'All 10 countries →');
  [['IND', 'India', 'kabaddi', C.IND, 0], ['JPN', 'Japan', 'sumo', C.JPN, 1], ['MNG', 'Mongolia', 'bokh', C.MNG, 1], ['TUR', 'Türkiye', 'oil', C.TUR, 0], ['THA', 'Thailand', 'sepak', C.THA, 1]].forEach(([code, n, k, col, lv], i) => { s += photoCard(D, M + i * (tw + 16), 868, tw, 230, k, col, code, n, lv); });
  s += h2(D, M, 1166, 'Discover sports', 'All 30 sports →');
  const sw2 = (CW - 3 * 16) / 4; s += photoCard(D, M, 1186, sw2 * 2 + 16, 396, 'sumoL', C.JPN, 'Japan · Wrestling', 'Sumo', 1, true);
  [['kabaddi', 'India · Team', 'Kabaddi', C.IND], ['sepak', 'Thailand · Team', 'Sepak Takraw', C.THA], ['hurling', 'Ireland · Team', 'Hurling', C.IRL], ['oil', 'Türkiye · Wrestling', 'Oil Wrestling', C.TUR]].forEach(([k, top, n, col], i) => { s += photoCard(D, M + (sw2 + 16) * (2 + (i % 2)), 1186 + Math.floor(i / 2) * 206, sw2, 190, k, col, top, n, i === 1); });
  s += h2(D, M, 1650, 'Venue information') + D.r(M, 1670, CW, 300, { r: 24, fill: INK }) + D.t(M + 30, 1724, 'EVENT GROUNDS', { f: DISP, s: 40, w: 800, c: '#fff' }) + D.t(M + 30, 1754, '6 zones · 3 fields of play · gates open 08:00–19:00.', { s: 15, c: 'rgba(255,255,255,.7)' });
  let cx = M + 30; ['Main Arena', 'FOP 1', 'FOP 2', 'FOP 3', 'Trad. Sports Zone', 'Cultural Zone'].forEach((v, i) => { const w = v.length * 7.8 + 30; if (cx + w > M + 560) cx = cx; s += D.r(cx, i < 4 ? 1786 : 1832, w, 38, { r: 19, st: 'rgba(255,255,255,.22)' }) + D.t(cx + w / 2, (i < 4 ? 1786 : 1832) + 24, v, { s: 13.5, w: 600, c: '#fff', a: 'middle' }); cx += w + 8; if (i === 3) cx = M + 30; });
  s += D.r(M + 30, 1896, 200, 48, { r: 14, fill: SAF }) + D.t(M + 130, 1926, 'Open event map →', { s: 15, w: 700, a: 'middle' });
  s += D.r(M + 600, 1670, CW - 600, 300, { fill: 'rgba(255,255,255,.04)' }) + D.t(M + 630, 1710, 'FACILITIES', { s: 12, w: 700, c: 'rgba(255,255,255,.55)', ls: 1.4 });
  [['Registration', 'North Gate'], ['Information', 'Beside Main Arena'], ['Food', 'FOP 2 / Cultural Zone'], ['Medical', 'Behind FOP 1'], ['Transport', 'South Gate'], ['Toilets', '4 blocks'], ['Water points', 'Next to every FOP'], ['Prayer room', 'Cultural Zone']].forEach(([a, b], i) => { const x = M + 630 + (i % 3) * 180, y = 1726 + Math.floor(i / 3) * 76; s += D.r(x, y, 170, 64, { r: 12, fill: 'rgba(255,255,255,.07)' }) + D.t(x + 14, y + 27, a, { s: 14.5, w: 600, c: '#fff' }) + D.t(x + 14, y + 47, b, { s: 12, c: 'rgba(255,255,255,.6)' }); });
  s += h2(D, M, 2038, 'Latest updates') + D.t(M + 460, 2038, 'All updates →', { s: 14, w: 600, c: TERRA, a: 'end' }) + D.r(M, 2058, 460, 330, { r: 20, fill: CARD, st: 'rgba(22,18,14,.08)' });
  [['Schedule change', '14:20', 'Gaelic Football moved from FOP 3 to FOP 2', SAF], ['Notice', '13:55', 'Shuttle frequency increased', C.MNG], ['Highlight', '13:10', 'Record crowd for the Sumo showcase', RED], ['Facility', '12:40', 'Water point added beside FOP 3', C.IRL]].forEach(([tp, tm, ti, col], i) => { const y = 2092 + i * 76; s += D.c(M + 26, y + 2, 4.5, col) + D.t(M + 40, y + 6, tp + ' · ' + tm, { s: 12, w: 600, c: MUTED }) + D.t(M + 40, y + 30, ti, { s: 15.5, w: 600 }) + (i < 3 ? `<line x1="${M + 20}" y1="${y + 50}" x2="${M + 440}" y2="${y + 50}" stroke="rgba(22,18,14,.07)"/>` : ''); });
  s += D.t(M + 500, 2038, 'CULTURAL STORIES', { f: DISP, s: 34, w: 800 });
  const stw = (CW - 500 - 32) / 3; [['sumo', 'Japan · Sumo', 'Salt, stamp and clash: the', 'rituals before a sumo bout', '0:26'], ['kabaddi', 'India · Kabaddi', 'One breath, one raid: learning', 'kabaddi in a day', '0:11'], ['capoeira', 'Brazil · Capoeira', 'Inside the roda: music as', 'the referee in capoeira', '0:23']].forEach(([k, tg, a, b, len], i) => { const x = M + 500 + i * (stw + 16); s += D.r(x, 2058, stw, 330, { r: 20, fill: INK }) + D.photo(x, 2058, stw, 210, k, '#333', 20, false) + D.r(x, 2248, stw, 20, { fill: INK }) + D.c(x + stw / 2, 2150, 29, 'rgba(255,255,255,.92)') + `<path d="M${x + stw / 2 - 8} 2138 L${x + stw / 2 + 12} 2150 L${x + stw / 2 - 8} 2162 Z" fill="${INK}"/>` + D.r(x + stw - 52, 2226, 40, 20, { r: 5, fill: 'rgba(0,0,0,.6)' }) + D.t(x + stw - 32, 2240, len, { f: MONO, s: 11.5, c: '#fff', a: 'middle' }) + D.t(x + 16, 2294, tg, { s: 12, w: 600, c: SAF }) + D.t(x + 16, 2320, a, { s: 15.5, w: 600, c: '#fff' }) + D.t(x + 16, 2342, b, { s: 15.5, w: 600, c: '#fff' }); });
  s += h2(D, M, 2456, 'Partners'); for (let i = 0; i < 6; i++) { const w = (CW - 5 * 12) / 6, x = M + i * (w + 12); s += D.r(x, 2476, w, 84, { r: 14, st: 'rgba(22,18,14,.24)', dash: '4 4' }) + D.t(x + w / 2, 2523, 'Partner logo', { f: MONO, s: 11.5, c: MUTED, a: 'middle' }); }
  s += webFooter(D, 2610);
  return s;
}
// ---------- W03 schedule ----------
function wSchedule(D) {
  let s = webHeader(D, 'Schedule') + band(D, 72, 186, 'Full programme · 243 sessions', 'Schedule');
  [['Day 1', 'Thu 15 Oct'], ['Day 2', 'Fri 16 Oct'], ['Day 3', 'Sat 17 Oct']].forEach(([a, b], i) => { const x = 610 + i * 140, on = i === 1; s += D.r(x, 150, 130, 58, { r: 14, fill: on ? '#fff' : 'rgba(255,255,255,.07)' }) + D.t(x + 20, 176, a, { s: 15, w: 700, c: on ? INK : '#fff' }) + D.t(x + 20, 195, b, { s: 12, c: on ? MUTED : 'rgba(255,255,255,.6)' }); });
  s += D.r(1036, 150, 196, 58, { r: 14, fill: RED }) + D.c(1060, 179, 4, '#fff') + D.t(1142, 184, 'Jump to now', { s: 15, w: 700, c: '#fff', a: 'middle' });
  s += D.t(M, 300, 'LOCATION', { s: 12, w: 700, c: MUTED, ls: 1.4 }); ['All locations', 'Main Arena', 'FOP 1', 'FOP 2', 'FOP 3', 'Traditional Sports Zone', 'Cultural Zone'].forEach((v, i) => { const y = 314 + i * 48; if (i === 0) s += D.r(M, y, 250, 42, { r: 12, fill: INK }); s += D.t(M + 14, y + 26, v, { s: 14, w: 600, c: i === 0 ? '#fff' : INK }); });
  s += D.r(M, 666, 250, 84, { r: 14, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.t(M + 14, 694, 'Times update live. Sessions', { s: 13, c: '#4E463D' }) + D.t(M + 14, 713, 'changed by event control are', { s: 13, c: '#4E463D' }) + D.t(M + 14, 732, 'marked CHANGED.', { s: 13, w: 700, c: '#8A4B00' });
  const mx = M + 278, mw = CW - 278, cw = (mw - 20) / 3; let y = 300;
  const grp = (time, tag, items) => { s += D.t(mx, y, time, { f: MONO, s: 18, w: 700 }) + `<line x1="${mx + 64}" y1="${y - 6}" x2="${mx + mw - 110}" y2="${y - 6}" stroke="rgba(22,18,14,.12)"/>` + D.t(mx + mw, y, tag, { s: 11.5, w: 700, c: tag.includes('LIVE') ? RED : MUTED, a: 'end', ls: 1 }); y += 16; items.forEach((it, i) => { s += wRow(D, mx + (i % 3) * (cw + 10), y + Math.floor(i / 3) * 98, cw, { ...it, h: 88 }); }); y += Math.ceil(items.length / 3) * 98 + 26; };
  grp('14:00', 'ENDED', [{ title: 'Oil Wrestling', sub: 'Türkiye · Demonstration', time2: '14:00–14:30', venue: 'FOP 1', color: C.TUR, status: 'Ended', done: true }, { title: 'Tug of War', sub: 'Scotland · Demonstration', time2: '14:00–14:30', venue: 'FOP 2', color: C.SCO, status: 'Ended', done: true }, { title: 'Caber Toss', sub: 'Scotland · Demonstration', time2: '14:00–14:30', venue: 'FOP 3', color: C.SCO, status: 'Ended', done: true }]);
  grp('14:30', '● LIVE NOW', [{ title: 'Sumo', sub: 'Japan · Demonstration', time2: '14:30–15:00', venue: 'FOP 1', color: C.JPN, status: 'LIVE', live: true }, { title: 'Sepak Takraw', sub: 'Thailand · Demonstration', time2: '14:30–15:00', venue: 'FOP 2', color: C.THA, status: 'LIVE', live: true }, { title: 'Stone Put', sub: 'Scotland · Demonstration', time2: '14:30–15:00', venue: 'FOP 3', color: C.SCO, status: 'LIVE', live: true }, { title: 'Korea showcase', sub: 'Korea · Cultural performance', time2: '14:30–15:00', venue: 'Culture', color: C.KOR, status: 'LIVE', live: true }]);
  grp('15:00', 'UPCOMING', [{ title: 'Kabaddi', sub: 'India · Demonstration', time2: '15:00–15:30', venue: 'FOP 2', color: C.IND, status: 'in 18 min' }, { title: 'Kendo', sub: 'Japan · Demonstration', time2: '15:00–15:30', venue: 'FOP 1', color: C.JPN, status: 'in 18 min' }, { title: 'Hurling', sub: 'Ireland · Showcase', time2: '15:15–16:00', venue: 'Arena', color: C.IRL, status: 'CHANGED', changed: true }]);
  s += adminFab(D, 832);
  return s;
}
// ---------- W04 countries ----------
function wCountries(D) {
  let s = webHeader(D, 'Countries') + band(D, 72, 170, '10 delegations · 3 sports each', 'Countries');
  const cw = (CW - 32) / 3;
  [['India', 'IND', 'kabaddi', C.IND, 'Village-ground games of breath, pursuit and', 'pole gymnastics, played on packed earth.', ['Kabaddi', 'Kho Kho', 'Mallakhamb'], 0], ['Japan', 'JPN', 'sumo', C.JPN, 'Budō traditions where ritual, etiquette and', 'form matter as much as the result.', ['Sumo', 'Kendo', 'Kyūdō'], 1], ['Mongolia', 'MNG', 'bokh', C.MNG, 'The "three manly games" of Naadam: wrestling,', 'archery and horsemanship.', ['Bökh', 'Mongolian Archery', 'Shagai'], 1], ['Türkiye', 'TUR', 'oil', C.TUR, 'Kırkpınar oil wrestling has been held every', 'year since 1346.', ['Oil Wrestling', 'Cirit', 'Turkish Archery'], 0], ['Thailand', 'THA', 'sepak', C.THA, 'Weapon arts, ancestral boxing and the', 'acrobatic kick-volley game of rattan ball.', ['Muay Boran', 'Sepak Takraw', 'Krabi Krabong'], 1], ['Indonesia', 'IDN', 'silat', C.IDN, 'Silat schools from across the archipelago,', 'with stilt races and spinning-top duels.', ['Pencak Silat', 'Egrang', 'Gasing'], 0]].forEach(([n, code, k, col, l1, l2, sps, lv], i) => { const x = M + (i % 3) * (cw + 16), y = 270 + Math.floor(i / 3) * 410;
    s += D.r(x, y, cw, 394, { r: 20, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.photo(x, y, cw, 196, k, col, 20, false) + D.r(x, y + 176, cw, 20, { fill: 'none' }) + D.r(x, y + 190, cw, 6, { fill: col }) + (lv ? liveTag(D, x + 14, y + 16, true) : '');
    s += D.t(x + 20, y + 238, n, { f: DISP, s: 32, w: 800, up: true }) + D.t(x + cw - 20, y + 236, code, { f: MONO, s: 12, c: MUTED, a: 'end' }) + D.t(x + 20, y + 266, l1, { s: 14, c: '#4E463D' }) + D.t(x + 20, y + 286, l2, { s: 14, c: '#4E463D' });
    let cx2 = x + 20; sps.forEach((t) => { const w = t.length * 7 + 22; s += D.r(cx2, y + 312, w, 28, { r: 14, fill: SAND }) + D.t(cx2 + w / 2, y + 331, t, { s: 12.5, w: 600, a: 'middle' }); cx2 += w + 6; }); });
  s += adminFab(D, 1030);
  return s;
}
// ---------- W05 country detail ----------
function wCountry(D) {
  let s = webHeader(D, 'Countries') + D.photo(0, 72, SW, 440, 'sumoL', C.JPN, 0) + D.r(M, 96, 92, 40, { r: 20, fill: 'rgba(19,16,13,.6)' }) + D.t(M + 50, 121, '‹  Back', { s: 14, w: 600, c: '#fff', a: 'middle' });
  s += D.r(M, 396, 34, 7, { r: 3.5, fill: C.JPN }) + D.t(M + 44, 404, 'JPN', { f: MONO, s: 13, c: '#fff' }) + D.t(M, 488, 'JAPAN', { f: DISP, s: 110, w: 900, c: '#fff' });
  s += D.t(M, 572, 'Budō traditions where ritual, etiquette and form matter', { s: 19, c: '#2E2721' }) + D.t(M, 600, 'as much as the result.', { s: 19, c: '#2E2721' });
  s += D.t(M, 650, 'TRADITIONAL SPORTS', { s: 12.5, w: 700, ls: 1.4 });
  [['sumo', 'Sumo', 'Wrestling', '● Live now at FOP 1', 1], ['kendo', 'Kendo', 'Combat', 'Next 15:00 · FOP 1', 0], ['x', 'Kyūdō', 'Target', 'Next 16:30 · FOP 3', 0]].forEach(([k, n, tp, nx, lv], i) => { const x = M + i * 240; s += D.r(x, 664, 226, 250, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.photo(x, 664, 226, 150, k, C.JPN, 18, false) + D.r(x, 800, 226, 14, { fill: CARD }) + (lv ? liveTag(D, x + 12, 676, true) : '') + (k === 'x' ? D.t(x + 113, 760, 'KY', { f: DISP, s: 52, w: 900, c: 'rgba(255,255,255,.9)', a: 'middle' }) : '') + D.t(x + 16, 842, n, { s: 17, w: 700 }) + D.t(x + 16, 862, tp, { s: 13, c: MUTED }) + D.t(x + 16, 888, nx, { s: 12.5, w: 600, c: TERRA }); });
  const rx = M + 780, rw = CW - 780; s += D.t(rx, 562, 'TODAY AT THE EVENT', { s: 12.5, w: 700, ls: 1.4 }) + D.r(rx, 576, rw, 344, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' });
  [['10:30', 'Kendo', 'FOP 1', 'Ended'], ['12:00', 'Sumo', 'Arena', 'Ended'], ['13:30', 'Japan showcase', 'Culture', 'Ended'], ['14:30', 'Sumo', 'FOP 1', 'LIVE'], ['15:00', 'Kendo', 'FOP 1', 'in 18 min'], ['16:30', 'Kyūdō', 'FOP 3', 'Later today']].forEach(([t1, n, v, stt], i) => { const y = 612 + i * 52; const done = stt === 'Ended'; s += D.t(rx + 18, y, t1, { f: MONO, s: 13.5, w: 600, c: done ? MUTED : INK }) + D.t(rx + 80, y, n, { s: 15, w: 600, c: done ? MUTED : INK }) + D.t(rx + rw - 110, y, v, { s: 13, c: MUTED, a: 'end' }) + D.r(rx + rw - 98, y - 13, 80, 19, { r: 5, fill: stt === 'LIVE' ? RED : stt.startsWith('in') ? INK : 'rgba(22,18,14,.07)' }) + D.t(rx + rw - 58, y + 0.5, stt, { s: 10.5, w: 700, c: stt === 'LIVE' || stt.startsWith('in') ? '#fff' : MUTED, a: 'middle' }) + (i < 5 ? `<line x1="${rx + 18}" y1="${y + 20}" x2="${rx + rw - 18}" y2="${y + 20}" stroke="rgba(22,18,14,.06)"/>` : ''); });
  s += adminFab(D, 930);
  return s;
}
// ---------- W06 sports ----------
function wSports(D) {
  let s = webHeader(D, '30 Sports') + band(D, 72, 240, '30 of 30 sports shown', '30 Traditional sports');
  s += D.r(SW - M - 380, 136, 380, 50, { r: 14, fill: CARD }) + D.c(SW - M - 356, 160, 7, 'none', { st: MUTED, sw: 2.2 }) + D.t(SW - M - 336, 166, 'Search sports or countries', { s: 15, c: MUTED });
  let cx = M; ['All', 'Wrestling', 'Combat', 'Team', 'Target', 'Strength', 'Skill'].forEach((t, i) => { const w = t.length * 7.6 + 32; s += D.r(cx, 252, w, 36, { r: 18, fill: i === 0 ? SAF : 'transparent', st: 'rgba(255,255,255,.2)' }) + D.t(cx + w / 2, 275, t, { s: 13.5, w: 600, c: i === 0 ? INK : '#fff', a: 'middle' }); cx += w + 8; });
  const cw = (CW - 4 * 16) / 5;
  [['kabaddi', 'Kabaddi', 'India · Team', C.IND, 0, 'Next 15:00 · FOP 2'], ['khokho', 'Kho Kho', 'India · Team', C.IND, 0, 'Next 16:30 · FOP 2'], ['mallakhamb', 'Mallakhamb', 'India · Skill', C.IND, 0, 'Next 15:30 · FOP 3'], ['sumo', 'Sumo', 'Japan · Wrestling', C.JPN, 1, '● Live now at FOP 1'], ['kendo', 'Kendo', 'Japan · Combat', C.JPN, 0, 'Next 15:00 · FOP 1'], ['x', 'Kyūdō', 'Japan · Target', C.JPN, 0, 'Next 16:30 · FOP 3'], ['bokh', 'Bökh', 'Mongolia · Wrestling', C.MNG, 0, 'Next 15:00 · TS Zone'], ['x2', 'Mongolian Archery', 'Mongolia · Target', C.MNG, 1, '● Live now at TS Zone'], ['x3', 'Shagai', 'Mongolia · Skill', C.MNG, 0, 'Next 15:00 · Arena'], ['oil', 'Oil Wrestling', 'Türkiye · Wrestling', C.TUR, 0, 'Next 16:00 · FOP 1']].forEach(([k, n, sub, col, lv, nx], i) => { const x = M + (i % 5) * (cw + 16), y = 340 + Math.floor(i / 5) * 290; const key = k === 'x3' ? 'shagai' : k; s += D.r(x, y, cw, 272, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.photo(x, y, cw, 160, key, col, 18, false) + D.r(x, y + 146, cw, 14, { fill: CARD }) + (lv ? liveTag(D, x + 12, y + 12, true) : '') + (k.startsWith('x') && !PH[key] ? D.t(x + cw / 2, y + 96, n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(), { f: DISP, s: 56, w: 900, c: 'rgba(255,255,255,.9)', a: 'middle' }) : '') + D.t(x + 16, y + 190, n, { s: 17, w: 700 }) + D.r(x + 16, y + 202, 8, 8, { r: 2, fill: col }) + D.t(x + 30, y + 210, sub, { s: 13, c: MUTED }) + D.t(x + 16, y + 238, nx, { s: 12.5, w: 600, c: TERRA }); });
  s += adminFab(D, 870);
  return s;
}
// ---------- W07 sport detail ----------
function wSport(D) {
  let s = webHeader(D, '30 Sports') + D.photo(0, 72, SW, 480, 'sepakL', C.THA, 0) + D.r(M, 96, 92, 40, { r: 20, fill: 'rgba(19,16,13,.6)' }) + D.t(M + 50, 121, '‹  Back', { s: 14, w: 600, c: '#fff', a: 'middle' });
  s += D.r(M, 382, 12, 12, { r: 3, fill: C.THA }) + D.t(M + 20, 393, 'Thailand · Team', { s: 15, w: 600, c: '#fff' }) + D.t(M, 476, 'SEPAK TAKRAW', { f: DISP, s: 104, w: 900, c: '#fff' });
  s += D.r(M, 494, 160, 48, { r: 24, fill: '#fff' }) + D.c(M + 25, 518, 18, RED) + `<path d="M${M + 20} 511 L${M + 32} 518 L${M + 20} 525 Z" fill="#fff"/>` + D.t(M + 54, 523, 'Watch clip', { s: 15, w: 700 });
  s += D.r(M, 584, 700, 56, { r: 16, fill: INK }) + liveTag(D, M + 16, 603, true) + D.t(M + 66, 618, 'Happening now at FOP 2', { s: 15.5, w: 600, c: '#fff' }) + D.t(M + 684, 618, 'View on map →', { s: 14, w: 600, c: SAF, a: 'end' });
  s += D.t(M, 686, 'Volleyball played with the feet, knees and head over a net,', { s: 19, c: '#2E2721' }) + D.t(M, 714, 'using a woven rattan ball.', { s: 19, c: '#2E2721' });
  s += D.t(M, 766, 'RELATED SPORTS', { s: 12.5, w: 700, ls: 1.4 }); [['kabaddi', 'Kabaddi', 'India', C.IND], ['hurling', 'Hurling', 'Ireland', C.IRL], ['gaelic', 'Gaelic Football', 'Ireland', C.IRL], ['khokho', 'Kho Kho', 'India', C.IND]].forEach(([k, n, c2, col], i) => { const x = M + i * 178; s += D.photo(x, 780, 168, 150, k, col, 16) + D.t(x + 14, 900, c2, { s: 12, c: '#fff', op: .85 }) + D.t(x + 14, 920, n, { s: 16, w: 700, c: '#fff' }); });
  const rx = M + 780, rw = CW - 780; s += D.t(rx, 600, 'WHEN & WHERE', { s: 12.5, w: 700, ls: 1.4 }) + D.r(rx, 614, rw, 262, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' });
  [['Day 1', '11:00–11:30', 'FOP 2', 'Ended'], ['Day 1', '15:30–16:00', 'FOP 2', 'Ended'], ['Day 2', '14:30–15:00', 'FOP 2', 'LIVE'], ['Day 2', '17:00–17:30', 'FOP 2', 'Later today'], ['Day 3', '10:30–11:30', 'TS Zone', 'Day 3']].forEach(([d, t1, v, stt], i) => { const y = 650 + i * 50; const done = stt === 'Ended'; s += D.t(rx + 18, y, d, { s: 13, c: MUTED }) + D.t(rx + 76, y, t1, { f: MONO, s: 13.5, w: 600, c: done ? MUTED : INK }) + D.t(rx + rw - 110, y, v, { s: 13, w: 700, a: 'end' }) + D.r(rx + rw - 98, y - 13, 80, 19, { r: 5, fill: stt === 'LIVE' ? RED : 'rgba(22,18,14,.07)' }) + D.t(rx + rw - 58, y + 0.5, stt, { s: 10.5, w: 700, c: stt === 'LIVE' ? '#fff' : MUTED, a: 'middle' }); });
  s += adminFab(D, 930);
  return s;
}
// ---------- W08 venue map ----------
function wMap(D) {
  let s = webHeader(D, 'Venue map') + band(D, 72, 270, 'Event Grounds', 'Event map') + D.t(M, 206, 'Select a location to see what is on there.', { s: 15, c: 'rgba(255,255,255,.65)' });
  let cx = M, cy = 236; ['Main Arena', 'FOP 1', 'FOP 2', 'FOP 3', 'Traditional Sports Zone', 'Cultural Zone', 'Registration', 'Food', 'Medical', 'Information', 'Transport', 'Toilets', 'Other facilities'].forEach((t, i) => { const live = i < 6 && i !== 5 || i === 5; const w = t.length * 7.4 + (i < 6 ? 44 : 30); if (cx + w > SW - M) { cx = M; cy += 46; } s += D.r(cx, cy, w, 38, { r: 19, fill: i === 1 ? SAF : 'transparent', st: 'rgba(255,255,255,.2)' }) + (i < 6 ? D.c(cx + 18, cy + 19, 3.5, RED) : '') + D.t(cx + (i < 6 ? 28 : 15), cy + 24, t, { s: 13.5, w: 600, c: i === 1 ? INK : '#fff' }); cx += w + 8; });
  const mw = 680; s += D.r(M, 372, mw, 600, { r: 24, fill: NIGHT }) + D.r(M, 372, mw, 600, { r: 24, fill: `url(#${D.P}-kilim)`, op: .05 }) + D.c(M + mw / 2, 690, 260, `url(#${D.P}-glow)`) + D.t(M + 20, 398, 'EVENT MAP · TAP A ZONE', { f: MONO, s: 11, c: 'rgba(255,255,255,.5)', ls: 1.4 });
  s += `<g transform="translate(${M + mw / 2},540) scale(1.35) translate(${-(M + mw / 2)},-540)">${isoMap(D, M + mw / 2, 540, 'fop1')}</g>`;
  s += D.c(M + mw - 110, 950, 4, RED) + D.t(M + mw - 100, 954, 'Live now', { s: 12, c: 'rgba(255,255,255,.6)' });
  const rx = M + mw + 28, rw = CW - mw - 28;
  s += D.t(rx, 392, 'DEMONSTRATION · STANDING + 600 SEATS', { s: 12, w: 700, c: MUTED, ls: 1.2 }) + D.t(rx, 440, 'FOP 1', { f: DISP, s: 48, w: 900 }) + D.t(rx, 468, 'Wrestling and combat demonstrations on a 12 m mat.', { s: 15, c: '#4E463D' });
  s += D.c(rx + 5, 506, 4, RED) + D.t(rx + 16, 510, 'LIVE NOW', { s: 12.5, w: 700, ls: 1.2 }) + D.photo(rx, 524, rw, 150, 'sumo', C.JPN, 18) + liveTag(D, rx + 20, 540, true) + D.t(rx + 20, 610, 'SUMO', { f: DISP, s: 40, w: 900, c: '#fff' }) + D.t(rx + 20, 634, 'Japan · 14:30–15:00 · 17:45 left', { s: 14, c: '#fff', op: .85 }) + D.r(rx, 669, rw, 5, { fill: 'rgba(255,255,255,.2)' }) + D.r(rx, 669, rw * .4, 5, { fill: RED });
  s += D.t(rx, 712, 'UP NEXT', { s: 12.5, w: 700, ls: 1.2 }) + wRow(D, rx, 724, rw, { timeCol: true, time: '15:00', sub2: 'in 18 min', title: 'Kendo', sub: 'Japan · Demonstration', venue: 'FOP 1', color: C.JPN, h: 72 }) + wRow(D, rx, 804, rw, { timeCol: true, time: '15:30', sub2: 'in 48 min', title: 'Ssireum', sub: 'Korea · Demonstration', venue: 'FOP 1', color: C.KOR, h: 72 });
  s += D.t(rx, 910, 'FACILITIES NEARBY', { s: 12.5, w: 700, ls: 1.2 }); [['Medical', 'Behind FOP 1'], ['Water points', 'Next to every FOP'], ['Toilets', '4 blocks']].forEach(([a, b], i) => { const w = (rw - 16) / 3, x = rx + i * (w + 8); s += D.r(x, 922, w, 60, { r: 14, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.t(x + 14, 948, a, { s: 14.5, w: 700 }) + D.t(x + 14, 968, b, { s: 12, c: MUTED }); });
  s += D.t(rx, 1016, "TODAY'S PROGRAMME HERE · RELATED DEMONSTRATIONS ↓", { s: 12, w: 700, c: MUTED, ls: 1 });
  s += adminFab(D, 1040);
  return s;
}
// ---------- W09 updates ----------
function wUpdates(D) {
  let s = webHeader(D, 'Updates') + band(D, 72, 170, 'Updated live by event control', 'Live updates');
  s += D.t(M, 284, 'SHOW', { s: 12, w: 700, c: MUTED, ls: 1.4 }); ['All', 'Schedule changes', 'Notices', 'Highlights', 'Facilities'].forEach((v, i) => { const y = 298 + i * 48; if (i === 0) s += D.r(M, y, 280, 42, { r: 12, fill: INK }); s += D.t(M + 14, y + 26, v, { s: 14, w: 600, c: i === 0 ? '#fff' : INK }); });
  s += D.r(M, 556, 280, 140, { r: 16, fill: SAF }) + D.t(M + 16, 582, 'PINNED ANNOUNCEMENT', { s: 11, w: 700, ls: 1.2 }) + D.t(M + 16, 608, 'Gate B closed 15:00–15:30', { s: 17, w: 700 }) + D.t(M + 16, 632, 'Use Gate A or South Gate while', { s: 13.5 }) + D.t(M + 16, 651, 'the Parade of Nations passes.', { s: 13.5 }) + D.t(M + 16, 670, 'Sessions run on time.', { s: 13.5 });
  const fx = M + 308, fw = 820;
  [['Schedule change', '#8A4B00', SAF, '14:20 · 22 min ago', 'Gaelic Football moved from FOP 3 to FOP 2', 'The 16:00 demonstration now takes place on FOP 2 to allow a full-size pitch.'], ['Notice', '#1F4F84', C.MNG, '13:55 · 47 min ago', 'Shuttle frequency increased', 'Hotel shuttles now leave South Gate every 15 minutes until 21:00.'], ['Highlight', '#B3221D', RED, '13:10 · 1 h ago', 'Record crowd for the Sumo showcase', 'The Main Arena reached capacity for the 13:00 showcase. Repeat session at 16:30 on FOP 1.'], ['Facility', '#236B34', C.IRL, '12:40 · 2 h ago', 'Water point added beside FOP 3', 'A second refill station is open between FOP 3 and the Traditional Sports Zone.']].forEach(([tp, ink, dot, tm, ti, b1], i) => { const y = 270 + i * 142; s += D.r(fx, y, fw, 128, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.c(fx + 28, y + 30, 4.5, dot) + D.t(fx + 40, y + 34, tp.toUpperCase(), { s: 12, w: 700, c: ink, ls: .7 }) + D.t(fx + fw - 22, y + 34, tm, { f: MONO, s: 12, c: MUTED, a: 'end' }) + D.t(fx + 22, y + 68, ti, { s: 19, w: 700 }) + D.t(fx + 22, y + 96, b1, { s: 15, c: '#4E463D' }); });
  s += adminFab(D, 830);
  return s;
}

const webScreens = [
  { file: 'w01-live-hub-first-view', n: '01', title: 'Event Live Hub · First view', purpose: 'What every visitor sees after scanning the universal QR. The page answers four questions straight away: what is on now, what is next, where it is, and where the full programme is.', tags: ['Entry: universal QR scan', 'Responsive website', 'Opens in any browser · no app', 'Same for every visitor'], h: 960, draw: wHome1, url: 'traditionalsports.live',
    notes: [
      { k: 'A', ax: 200, ay: 80, title: 'Event identity & site navigation', body: 'Event name and ten-colour emblem confirm the official site. The top navigation reaches every section: Live now, Schedule, Countries, 30 Sports, Venue map and Updates.', feats: ['Sticky on scroll', 'Unread badge on Updates'] },
      { k: 'B', ax: 1150, ay: 80, title: 'Current event day / time', body: 'Day X of 3, the date and a live local clock. The red LIVE counter shows how many locations are live.', feats: ['Clock drives every Live / Next status on the site'] },
      { k: 'C', ax: 700, ay: 142, color: SAF, title: 'Important announcement', body: 'A full-width bar that appears only while Admin has an announcement published. The visitor can dismiss it; it stays pinned on Updates.', flow: 'Admin → Announcements → Publish' },
      { k: 'D', ax: 520, ay: 450, color: RED, title: 'Live now', body: 'The featured live demonstration in a large media card: LIVE badge, country, sport, time slot, venue, countdown and progress bar. A muted clip or photo plays behind it.', feats: ['Click card → Sport detail (07)', 'View on map → Venue map with that FOP selected (08)'] },
      { k: 'E', ax: 1100, ay: 400, title: 'Up next', body: 'The next four sessions across all locations with countdowns. CHANGED badge when Admin edits one.', flow: 'Full schedule → 03 Schedule' },
      { k: 'F', ax: 900, ay: 840, title: 'Also live', body: 'Every other location live at the same moment, each with a thumbnail and progress bar.', feats: [] },
    ],
    flow: { note: 'The QR never changes; only the content behind it does.', in: ['Scan universal QR (any location)', 'Type the public URL', 'Click "Live now" in the navigation'], self: 'Live Hub · first view', out: ['07 Sport detail', '08 Venue map', '03 Schedule', '09 Updates'] } },
  { file: 'w02-live-hub-sections', n: '02', title: 'Event Live Hub · Home sections', purpose: 'Below the live area, Quick Access routes to the five main tasks, followed by the day timeline, countries, sports, venue information, updates, cultural media and partners.', tags: ['Scroll section of 01', 'Quick access', 'Timeline', 'Photos & video'], h: 2790, draw: wHome2, url: 'traditionalsports.live',
    notes: [
      { k: 'A', ax: 640, ay: 280, color: RED, title: 'Quick access', body: 'Five large tiles in the order of the brief: Schedule, Countries, 30 Sports, Venue map, Updates. Each is one click to a primary task.', feats: ['Schedule shows the number of sessions today', 'Updates shows unread count'] },
      { k: 'B', ax: 900, ay: 620, title: "Today's programme timeline", body: 'One lane per location from 09:00 to 18:00. The red line is the current time and the view opens scrolled to it.', feats: ['Live block outlined red, past blocks faded', 'Click a block → detail', 'Click a location name → Venue map'] },
      { k: 'C', ax: 1100, ay: 1030, title: 'Explore countries', body: 'Photo cards with country colour and code. LIVE tag when that country is on now.', flow: 'All 10 countries → 04' },
      { k: 'D', ax: 1100, ay: 1400, title: 'Discover sports', body: 'A photo mosaic of featured sports, curated in Admin.', flow: 'All 30 sports → 06' },
      { k: 'E', ax: 1100, ay: 1850, title: 'Venue information', body: 'Key facts, one-click location buttons and all eight facilities with where they are.', feats: ['Open event map → 08'] },
      { k: 'F', ax: 400, ay: 2240, title: 'Latest updates', body: 'The four most recent feed items, colour-coded by type.', feats: [] },
      { k: 'G', ax: 1100, ay: 2240, title: 'Cultural stories / media', body: 'Short videos about the sports and countries. Click to play inline with sound.', feats: [] },
      { k: 'H', ax: 900, ay: 2560, title: 'Partners & footer', body: 'Partner logos from Admin, then a footer that repeats the QR and public URL for sharing.', feats: [] },
    ],
    flow: { note: 'Promotional content sits below live operational information.', in: ['Scrolling down from 01', 'Return from any detail page'], self: 'Home sections', out: ['03 Schedule', '04 Countries', '06 Sports', '08 Venue map', '09 Updates'] } },
  { file: 'w03-schedule', n: '03', title: 'Full schedule', purpose: 'Every demonstration across all three days and all locations. Opens on today and scrolls to the current time slot.', tags: ['Nav: Schedule', 'Day + location filters', 'Live statuses'], h: 900, draw: wSchedule, url: 'traditionalsports.live/schedule',
    notes: [
      { k: 'A', ax: 800, ay: 224, title: 'Day tabs', body: 'Switch between Day 1, 2 and 3. Past days show sessions as Ended.', feats: [] },
      { k: 'B', ax: 1130, ay: 224, color: RED, title: 'Jump to now', body: 'Scrolls straight to the time slot running now.', feats: [] },
      { k: 'C', ax: 170, ay: 460, title: 'Location filter', body: 'All locations or a single one: Main Arena, FOP 1–3, Traditional Sports Zone, Cultural Zone.', feats: [] },
      { k: 'D', ax: 900, ay: 540, title: 'Time-slot groups', body: 'Sessions grouped by start time in a three-column grid. Group tag reads LIVE NOW, UPCOMING or ENDED.', feats: ['Each card: sport, country, type, time, venue, status', 'Click venue badge → Venue map', 'Click card → Sport detail'] },
      { k: 'E', ax: 1100, ay: 760, color: SAF, title: 'Changed sessions', body: 'Admin edits to time or venue appear instantly with an amber outline and CHANGED badge.', feats: [] },
    ],
    flow: { note: 'Statuses come from the live clock and Admin session data.', in: ['Quick access: Schedule', 'Up next: Full schedule', 'Navigation: Schedule'], self: 'Schedule', out: ['07 Sport detail', '05 Country detail', '08 Venue map'] } },
  { file: 'w04-countries', n: '04', title: 'Countries', purpose: 'All ten participating countries with their story and three traditional sports.', tags: ['Nav: Countries', '10 countries'], h: 1100, draw: wCountries, url: 'traditionalsports.live/countries',
    notes: [
      { k: 'A', ax: 600, ay: 420, title: 'Country card', body: 'Photo, colour stripe, name, code, a one-line story and chips for its three sports.', feats: ['LIVE tag when any of its sports is on', 'All text is Admin-managed'], flow: 'Click → 05 Country detail' },
    ],
    flow: { in: ['Quick access: Countries', 'Home: All 10 countries', 'Navigation: Countries'], self: 'Countries', out: ['05 Country detail'] } },
  { file: 'w05-country-detail', n: '05', title: 'Country detail', purpose: "One country's story, its three sports and every session it has today.", tags: ['Detail page', 'Back returns to origin'], h: 1000, draw: wCountry, url: 'traditionalsports.live/countries/japan',
    notes: [
      { k: 'A', ax: 600, ay: 440, title: 'Country hero', body: 'Full-width photo with colour, code and name. Back returns to the previous page.', feats: [] },
      { k: 'B', ax: 500, ay: 630, title: 'Story', body: 'Short cultural context written by the organisers.', feats: [] },
      { k: 'C', ax: 500, ay: 800, title: 'Traditional sports', body: 'The three sports with their live or next session.', feats: ['Click → 07 Sport detail'] },
      { k: 'D', ax: 1100, ay: 760, title: 'Today at the event', body: 'All of this country\'s sessions today with venue and status.', feats: ['Click → 08 Venue map'] },
    ],
    flow: { in: ['04 Countries', 'Home country cards', 'Schedule (cultural showcases)'], self: 'Country detail', out: ['07 Sport detail', '08 Venue map', 'Back'] } },
  { file: 'w06-sports', n: '06', title: '30 Sports', purpose: 'All thirty traditional sports, searchable and filterable by discipline.', tags: ['Nav: 30 Sports', 'Search + filter'], h: 940, draw: wSports, url: 'traditionalsports.live/sports',
    notes: [
      { k: 'A', ax: 1100, ay: 206, title: 'Search', body: 'Filters by sport or country name as the visitor types.', feats: [] },
      { k: 'B', ax: 500, ay: 314, title: 'Discipline filter', body: 'All, Wrestling, Combat, Team, Target, Strength, Skill.', feats: [] },
      { k: 'C', ax: 1100, ay: 560, title: 'Sport card', body: 'Photo, name, country colour and discipline, plus its live or next session.', feats: ['Sports without a photo show a patterned tile in the country colour'], flow: 'Click → 07 Sport detail' },
    ],
    flow: { in: ['Quick access: 30 Sports', 'Home: All 30 sports', 'Navigation: 30 Sports'], self: '30 Sports', out: ['07 Sport detail'] } },
  { file: 'w07-sport-detail', n: '07', title: 'Sport detail', purpose: 'Explains one sport and lists every time and place it is demonstrated during the event.', tags: ['Detail page', 'Video', 'All three days'], h: 1000, draw: wSport, url: 'traditionalsports.live/sports/sepak-takraw',
    notes: [
      { k: 'A', ax: 400, ay: 560, title: 'Hero & video', body: 'Photo with country, discipline and name. Watch clip plays a short video in the hero.', feats: [] },
      { k: 'B', ax: 700, ay: 656, color: RED, title: 'Live banner', body: 'Only while the sport is live. Click → Venue map.', feats: [] },
      { k: 'C', ax: 1100, ay: 760, title: 'When & where', body: 'Every session of this sport on Day 1–3 with venue and status.', feats: ['Click → 08 Venue map'] },
      { k: 'D', ax: 500, ay: 900, title: 'About & related sports', body: 'A plain explanation for first-time spectators, then sports of the same discipline.', feats: [] },
    ],
    flow: { in: ['Live now card', 'Up next / Schedule', 'Sports list, Country detail'], self: 'Sport detail', out: ['08 Venue map', 'Related sport detail', 'Back'] } },
  { file: 'w08-venue-map', n: '08', title: 'Venue map', purpose: 'A 3D event map. The site does not know where the QR was scanned, so there is no "You are here". The visitor picks the location they want to inspect.', tags: ['Nav: Venue map', 'No "You are here"', 'Manual location select'], h: 1110, draw: wMap, url: 'traditionalsports.live/map',
    notes: [
      { k: 'A', ax: 900, ay: 300, title: 'Select a location', body: 'Main Arena, Traditional Sports Zone, Cultural Zone, FOP 1–3, Registration, Food, Medical, Information, Transport, Toilets, Other facilities.', feats: ['Red dot = live now'] },
      { k: 'B', ax: 380, ay: 700, title: '3D event map', body: 'Isometric map of all zones. The selected zone rises and glows; facilities show as pins.', feats: ['Click a zone to select it'] },
      { k: 'C', ax: 1100, ay: 640, color: RED, title: 'Live now · Up next', body: 'What is on at the selected location now and next.', feats: [] },
      { k: 'D', ax: 1100, ay: 990, title: 'Facilities, programme, related', body: 'Nearest facilities, the full day at this location, and related demonstrations elsewhere.', feats: ['Facility selected → card with where and opening hours'] },
    ],
    flow: { note: 'Selection is manual; location is never assumed.', in: ['Quick access: Venue map', 'View on map (Live now)', 'Venue badges', 'Navigation: Venue map'], self: 'Venue map', out: ['07 Sport detail', 'Facility card', 'Another location'] } },
  { file: 'w09-updates', n: '09', title: 'Live updates', purpose: 'The live feed from event control: schedule changes, notices, highlights and facility news.', tags: ['Nav: Updates', 'Real-time feed'], h: 900, draw: wUpdates, url: 'traditionalsports.live/updates',
    notes: [
      { k: 'A', ax: 200, ay: 400, title: 'Type filter', body: 'All, Schedule changes, Notices, Highlights, Facilities.', feats: [] },
      { k: 'B', ax: 200, ay: 640, color: SAF, title: 'Pinned announcement', body: 'The active announcement stays pinned even after it is dismissed from the top bar.', feats: [] },
      { k: 'C', ax: 1100, ay: 480, title: 'Update card', body: 'Type, time, age, headline and body. New items appear at the top without reloading.', feats: ['Schedule changes also mark the session CHANGED'] },
    ],
    flow: { in: ['Quick access: Updates', 'Home: Latest updates', 'Navigation badge'], self: 'Updates', out: ['Affected session (Schedule)', 'Back to Live Hub'] } },
];

W = 1640;
// ---------- 00 overview ----------
{
  const D = Doc('s00'); const H = 1240; let s = '';
  s += D.t(60, 62, 'FESTIVAL OF TRADITIONAL SPORTS  ·  UNIVERSAL QR LIVE HUB  ·  UI/UX SPECIFICATION', { f: MONO, s: 12, w: 600, c: TERRA, ls: 1.5 });
  s += D.t(60, 150, '00', { f: DISP, s: 96, w: 900 }) + D.t(168, 112, 'UNIVERSAL QR · USER JOURNEY', { f: DISP, s: 44, w: 800 });
  s += D.t(168, 142, 'One QR code is printed everywhere. Every scan opens the same Event Live Hub; the visitor then chooses what they need.', { s: 16, c: '#3D352D' });
  const places = ['Event venue', 'Entrances', 'Registration counters', 'Hotel lobbies', 'Standee displays', 'Information desks', 'Country showcase areas', 'Demonstration areas', 'FOP areas', 'Transport / common areas', 'Promotional material'];
  s += D.t(60, 232, 'THE SAME QR IS DISPLAYED AT', { f: MONO, s: 11, w: 700, c: TERRA, ls: 1.2 });
  places.forEach((p, i) => { const y = 250 + i * 50; s += D.r(60, y, 300, 38, { r: 10, fill: '#fff', st: 'rgba(22,18,14,.12)' }) + D.t(78, y + 24, p, { s: 14, w: 600 }); s += `<path d="M360 ${y + 19} C 430 ${y + 19}, 430 520, 506 520" fill="none" stroke="${TERRA}" stroke-width="1.6" stroke-dasharray="5 5"/>`; });
  s += D.r(506, 400, 240, 240, { r: 24, fill: '#fff', st: 'rgba(22,18,14,.15)' }) + qr(D, 536, 430, 180) + D.t(626, 670, 'ONE UNIVERSAL QR', { f: DISP, s: 22, w: 800, a: 'middle' }) + D.t(626, 692, 'Never replaced during the event', { s: 13, c: MUTED, a: 'middle' });
  s += `<path d="M746 520 L 840 520" stroke="${TERRA}" stroke-width="3" marker-end="url(#s00-arrow)"/>` + D.t(793, 506, 'scan', { f: MONO, s: 11, c: TERRA, a: 'middle' });
  s += D.r(850, 420, 300, 200, { r: 24, fill: RED }) + D.t(1000, 490, 'EVENT', { f: DISP, s: 44, w: 900, c: '#fff', a: 'middle' }) + D.t(1000, 536, 'LIVE HUB', { f: DISP, s: 44, w: 900, c: '#fff', a: 'middle' }) + D.t(1000, 572, 'Same page for everyone', { s: 14, c: '#fff', a: 'middle' }) + D.t(1000, 592, 'Opens in any browser', { s: 14, c: '#fff', a: 'middle' });
  const outs = [['Live now', '01'], ['Schedule', '03'], ['Countries', '04 · 05'], ['Sports', '06 · 07'], ['Venue map', '08'], ['Updates', '09'], ['Explore', '02']];
  s += D.t(1250, 232, 'VISITOR CHOOSES WHAT THEY NEED', { f: MONO, s: 11, w: 700, c: TERRA, ls: 1.2 });
  outs.forEach(([o, n], i) => { const y = 260 + i * 70; s += `<path d="M1150 520 C 1200 520, 1200 ${y + 25}, 1244 ${y + 25}" fill="none" stroke="${TERRA}" stroke-width="1.8" marker-end="url(#s00-arrow)"/>` + D.r(1250, y, 330, 50, { r: 12, fill: INK }) + D.t(1270, y + 32, o, { f: DISP, s: 22, w: 800, c: '#fff', up: true }) + D.t(1562, y + 31, 'Screen ' + n, { f: MONO, s: 11.5, c: SAF, a: 'end' }); });
  // admin loop
  s += D.r(506, 760, 1074, 170, { r: 22, fill: '#fff', st: 'rgba(22,18,14,.12)' }) + D.t(536, 800, 'CONTENT STAYS DYNAMIC', { f: MONO, s: 11, w: 700, c: TERRA, ls: 1.2 });
  s += D.r(536, 820, 250, 80, { r: 14, fill: NIGHT }) + D.t(556, 852, 'ADMIN', { f: DISP, s: 22, w: 800, c: '#fff' }) + D.t(556, 876, 'edits content (screen 10)', { s: 12.5, c: 'rgba(255,255,255,.7)' });
  s += `<path d="M786 860 L 866 860" stroke="${TERRA}" stroke-width="2.5" marker-end="url(#s00-arrow)"/>`;
  const ch = ['Live status', 'Upcoming sessions', 'Timings', 'Venue / FOP', 'Country & sport names', 'Announcements', 'Live updates', 'Promotions'];
  ch.forEach((c2, i) => { const x = 876 + (i % 4) * 150, y = 826 + Math.floor(i / 4) * 40; s += D.r(x, y, 142, 30, { r: 15, fill: SAND }) + D.t(x + 71, y + 20, c2, { s: 12, w: 600, a: 'middle' }); });
  s += D.t(876, 920, 'The Live Hub updates automatically. The printed QR is never changed.', { s: 13.5, w: 600, c: TERRA });
  // principle
  const pr = ['ONE EVENT', 'ONE QR', 'ONE WEBSITE', 'ONE LIVE INFORMATION SOURCE']; let px2 = 60;
  s += D.r(60, 980, 1520, 150, { r: 22, fill: INK }) + D.t(90, 1020, 'FINAL QR PRINCIPLE', { f: MONO, s: 12, w: 700, c: SAF, ls: 1.5 });
  const widths = [250, 200, 290, 620]; px2 = 90; pr.forEach((p, i) => { s += D.t(px2, 1090, p, { f: DISP, s: 44, w: 900, c: i === 3 ? SAF : '#fff' }); px2 += widths[i] + 40; });
  s += D.t(90, 1112, 'The QR is a permanent physical gateway into the continuously updated event platform. No context-specific QR behaviour.', { s: 13.5, c: 'rgba(244,238,228,.7)' });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><marker id="s00-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${TERRA}"/></marker><pattern id="s00-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#16120E" opacity=".08"/></pattern></defs><rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#s00-dots)"/>${s}${D.t(W - 60, H - 28, '00 / 10', { f: MONO, s: 12, c: MUTED, a: 'end' })}</svg>`;
  await saveFile('ux/w00-user-journey.svg', svg);
}


W = 1980;
const out = [];
for (const sc of webScreens) {
  const D = Doc('w' + sc.n);
  const notes = sc.notes.map((n) => ({ ...n, side: 'R', ay: n.ay + 44 }));
  const svg = page(D, sc, sc.h + 44, (d, x, y) => browserFrame(d, x, y, sc.h, sc.url, sc.draw(d)), notes, sc.flow, { desktop: true, px: 60, phoneW: SW });
  await saveFile('ux/' + sc.file + '.svg', svg); out.push(sc.file + ' ' + Math.round(svg.length / 1024) + 'k');
}
W = 1640;
{ const sc = adminScreen; const D = Doc('w10'); const svg = page(D, sc, 780, sc.draw, sc.notes, sc.flow, { desktop: true, px: 560 }); await saveFile('ux/' + sc.file + '.svg', svg); out.push(sc.file); }
log(out.join('\n'));
