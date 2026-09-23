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
const W = 1640, PX = 625, PY = 250;
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
${D.t(W - 60, H - 28, meta.n + ' / 12', { f: MONO, s: 12, c: MUTED, a: 'end' })}
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

// ---------- screen drawings ----------
function homeTop(D) {
  let s = statusBar(D);
  s += D.r(0, 47, 390, 590, { fill: NIGHT }) + D.r(0, 47, 390, 590, { fill: `url(#${D.P}-kilim)`, op: .09 }) + D.c(360, 40, 130, `url(#${D.P}-glow)`);
  s += emblem(D, 39, 84) + D.t(72, 76, 'LIVE HUB · 2026', { f: MONO, s: 10.5, w: 600, c: SAF, ls: 1.5 }) + D.t(72, 99, 'FESTIVAL OF TRADITIONAL SPORTS', { f: DISP, s: 22, w: 800, c: '#fff' });
  s += D.r(16, 118, 358, 50, { r: 14, fill: 'rgba(255,255,255,.06)', st: 'rgba(255,255,255,.1)' }) + D.t(28, 137, 'TODAY', { s: 10.5, c: 'rgba(255,255,255,.6)', ls: 1 }) + D.t(28, 157, 'Day 2 of 3 · Fri 16 Oct', { s: 14, w: 600, c: '#fff' }) + D.t(362, 137, 'LOCAL TIME', { s: 10.5, c: 'rgba(255,255,255,.6)', ls: 1, a: 'end' }) + D.t(362, 158, '14:42:15', { f: MONO, s: 15, w: 600, c: '#fff', a: 'end' });
  s += D.r(16, 180, 358, 62, { r: 14, fill: SAF }) + D.t(48, 203, 'Gate B closed 15:00–15:30', { s: 13.5, w: 700 }) + D.t(48, 222, 'Use Gate A or South Gate while the Parade', { s: 12.5 }) + D.t(48, 237, 'of Nations passes. Sessions run on time.', { s: 12.5 }) + D.t(356, 202, '×', { s: 18, a: 'middle' }) + `<path d="M26 197v6h4l6 5V192l-6 5h-4z" fill="${INK}"/>`;
  s += D.c(22, 268, 4.5, RED) + D.t(34, 276, 'LIVE NOW', { f: DISP, s: 22, w: 800, c: '#fff' }) + D.t(374, 274, '5 locations live', { s: 12, c: 'rgba(255,255,255,.6)', a: 'end' });
  s += D.photo(16, 290, 358, 250, 'sumo', C.JPN, 20) + liveTag(D, 30, 304) + D.r(290, 303, 70, 26, { r: 13, fill: 'rgba(19,16,13,.7)', st: 'rgba(255,255,255,.25)' }) + D.t(325, 320, '◉ FOP 1', { s: 12.5, w: 600, c: '#fff', a: 'middle' });
  s += D.r(32, 452, 10, 10, { r: 3, fill: C.JPN }) + D.t(48, 461, 'Japan · Demonstration', { s: 12.5, w: 600, c: '#fff' }) + D.t(32, 500, 'SUMO', { f: DISP, s: 46, w: 900, c: '#fff' });
  s += D.t(32, 520, '14:30–15:00', { f: MONO, s: 12.5, c: '#fff' }) + D.t(358, 520, '17:45 left', { f: MONO, s: 12.5, c: SAF, a: 'end' }) + D.r(32, 527, 326, 4, { r: 2, fill: 'rgba(255,255,255,.2)' }) + D.r(32, 527, 130, 4, { r: 2, fill: RED });
  [['FOP 2', 'Sepak Takraw', 'Thailand · 14:30–15:00', .4], ['FOP 3', 'Stone Put', 'Scotland · 14:30–15:00', .4], ['Arena', 'Capoeira', 'Brazil · 14:00–14:45', .9]].forEach(([v, t1, t2, p], i) => { const x = 16 + i * 178; s += D.r(x, 552, 168, 70, { r: 14, fill: 'rgba(255,255,255,.07)', st: 'rgba(255,255,255,.1)' }) + D.c(x + 14, 567, 3, RED) + D.t(x + 22, 571, 'LIVE', { s: 10.5, w: 700, c: '#FF6A5F' }) + D.t(x + 156, 571, v, { s: 11, w: 600, c: 'rgba(255,255,255,.7)', a: 'end' }) + D.t(x + 11, 592, t1, { s: 14.5, w: 700, c: '#fff' }) + D.t(x + 11, 607, t2, { s: 11.5, c: 'rgba(255,255,255,.62)' }) + D.r(x + 11, 613, 146, 3, { r: 1.5, fill: 'rgba(255,255,255,.15)' }) + D.r(x + 11, 613, 146 * p, 3, { r: 1.5, fill: RED }); });
  s += secTitle(D, 670, 'Up next', 'Full schedule →');
  s += row(D, 684, { time: '15:00', sub2: 'in 18 min', title: 'Kabaddi', sub: 'India · Demonstration', venue: 'FOP 2', color: C.IND, tx: 104 });
  s += nav(D, 770, 'Live');
  return s;
}
function homeMid(D) {
  let s = D.r(0, 0, 390, 30, { fill: SAND }) + D.t(195, 20, '— continues below the first viewport —', { s: 11, c: MUTED, a: 'middle' });
  s += secTitle(D, 62, 'Up next', 'Full schedule →');
  [['15:00', 'Kabaddi', 'India · Demonstration', 'FOP 2', C.IND, 'in 18 min'], ['15:00', 'Kendo', 'Japan · Demonstration', 'FOP 1', C.JPN, 'in 18 min'], ['15:00', 'Hurling', 'Ireland · Showcase', 'Arena', C.IRL, 'in 18 min']].forEach(([a, b, c2, v, col, n], i) => { s += row(D, 76 + i * 66, { time: a, sub2: n, title: b, sub: c2, venue: v, color: col, tx: 104, status: i === 2 ? 'CHANGED' : null, changed: i === 2 }); });
  s += secTitle(D, 312, 'Quick access');
  s += D.r(16, 326, 358, 78, { r: 18, fill: INK }) + D.r(32, 342, 46, 46, { r: 13, fill: RED }) + icon('Schedule', 55, 365, '#fff') + D.t(92, 362, 'SCHEDULE', { f: DISP, s: 22, w: 800, c: '#fff' }) + D.t(92, 382, 'See every demonstration', { s: 13, c: 'rgba(255,255,255,.7)' }) + D.t(360, 370, '156 today →', { f: MONO, s: 12, c: SAF, a: 'end' });
  const tile = (x, y, t1, t2, art) => D.r(x, y, 174, 124, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' }) + art + D.t(x + 14, y + 92, t1, { f: DISP, s: 21, w: 800, up: true }) + D.t(x + 14, y + 111, t2, { s: 12.5, c: MUTED });
  let dots = ''; Object.values(C).forEach((col, i) => { dots += D.r(30 + (i % 5) * 16, 428 + Math.floor(i / 5) * 16, 12, 12, { r: 3.5, fill: col }); });
  s += tile(16, 414, 'Countries', 'Explore all 10 countries', dots) + tile(200, 414, '30 Sports', 'Every traditional sport', D.t(214, 468, '30', { f: DISP, s: 48, w: 900, c: TERRA }));
  s += tile(16, 548, 'Venue map', 'Locations and facilities', `<path d="M30 582 L58 566 L86 582 L58 598 Z" fill="#E7DCCB"/><path d="M44 580 L58 572 L72 580 L58 588 Z" fill="${INK}"/><circle cx="80" cy="566" r="4" fill="${RED}"/>`) + tile(200, 548, 'Updates', 'Changes and notices', icon('Updates', 226, 574, INK) + D.r(244, 565, 50, 18, { r: 9, fill: RED }) + D.t(269, 578, '3 new', { s: 11, w: 700, c: '#fff', a: 'middle' }));
  s += secTitle(D, 716, "Today's programme", 'Swipe →');
  s += D.r(16, 730, 358, 298, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' });
  const venues = ['Arena', 'FOP 1', 'FOP 2', 'FOP 3', 'TS Zone', 'Culture'];
  venues.forEach((v, i) => { s += D.t(26, 782 + i * 44, v, { s: 11.5, w: 700 }); });
  s += `<line x1="82" y1="730" x2="82" y2="1028" stroke="rgba(22,18,14,.08)"/>`;
  ['13:30', '14:00', '14:30', '15:00', '15:30'].forEach((h, i) => { const x = 96 + i * 60; s += `<line x1="${x}" y1="740" x2="${x}" y2="1024" stroke="rgba(22,18,14,.06)"/>` + D.t(x + 3, 750, h, { f: MONO, s: 10, c: MUTED }); });
  const blocks = [[0, 1, 1.5, 'Capoeira', C.BRA, 1], [0, 3, 1.5, 'Hurling', C.IRL, 0], [1, 0, 2, 'Oil Wrestling', C.TUR, -1], [1, 2, 1, 'Sumo', C.JPN, 1], [1, 3, 1, 'Kendo', C.JPN, 0], [2, 1, 1, 'Hurling', C.IRL, -1], [2, 2, 1, 'Sepak T.', C.THA, 1], [2, 3, 1, 'Kabaddi', C.IND, 0], [3, 2, 1, 'Stone Put', C.SCO, 1], [3, 3, 1, 'Shagai', C.MNG, 0], [4, 1, 2, 'Kabaddi', C.IND, 1], [4, 3, 2, 'Silat', C.IDN, 0], [5, 0, 1, 'Mongolia', C.MNG, -1], [5, 2, 1, 'Korea', C.KOR, 1]];
  blocks.forEach(([ri, c0, len, t1, col, st]) => { const x = 98 + c0 * 60, y = 762 + ri * 44, w = len * 60 - 4; s += D.r(x, y, w, 36, { r: 8, fill: st === 1 ? INK : st === -1 ? '#EFE8DC' : SAND, st: st === 1 ? RED : null, sw: 2 }) + D.r(x, y, w, 3, { fill: col }) + D.t(x + 6, y + 18, t1, { s: 10.5, w: 700, c: st === 1 ? '#fff' : INK }); });
  s += D.r(262, 752, 2, 272, { fill: RED }) + D.c(263, 752, 5, RED);
  s += secTitle(D, 1070, 'Explore countries', 'All 10 →');
  [['IND', 'India', 'kabaddi', C.IND], ['JPN', 'Japan', 'sumo', C.JPN], ['MNG', 'Mongolia', 'bokh', C.MNG]].forEach(([code, n, k, col], i) => { const x = 16 + i * 160; s += D.photo(x, 1084, 150, 190, k, col, 18) + D.r(x, 1084, 150, 5, { fill: col }) + D.t(x + 12, 1238, code, { f: MONO, s: 10.5, c: 'rgba(255,255,255,.8)' }) + D.t(x + 12, 1262, n, { f: DISP, s: 24, w: 800, c: '#fff', up: true }); if (i === 1) s += liveTag(D, x + 10, 1096, true); });
  s += nav(D, 1296, 'Live');
  return s;
}
function homeBottom(D) {
  let s = D.r(0, 0, 390, 30, { fill: SAND }) + D.t(195, 20, '— lower sections of the Live Hub —', { s: 11, c: MUTED, a: 'middle' });
  s += secTitle(D, 62, 'Discover sports', 'All 30 →');
  s += D.photo(16, 76, 358, 118, 'sumo', C.JPN, 14);
  s += D.t(28, 168, '■ Japan', { s: 10.5, c: '#fff' }) + D.t(28, 186, 'SUMO', { f: DISP, s: 20, w: 800, c: '#fff' });
  [['kabaddi', 'India', 'Kabaddi', C.IND], ['sepak', 'Thailand', 'Sepak Takraw', C.THA], ['hurling', 'Ireland', 'Hurling', C.IRL], ['oil', 'Türkiye', 'Oil Wrestling', C.TUR]].forEach(([k, c2, n, col], i) => { const x = 16 + (i % 2) * 183, y = 202 + Math.floor(i / 2) * 126; s += D.photo(x, y, 175, 118, k, col, 14) + D.r(x + 10, y + 90, 7, 7, { r: 2, fill: col }) + D.t(x + 22, y + 97, c2, { s: 10.5, c: '#fff' }) + D.t(x + 10, y + 111, n, { f: DISP, s: 19, w: 800, c: '#fff', up: true }); });
  s += secTitle(D, 500, 'Venue information');
  s += D.r(16, 514, 358, 236, { r: 18, fill: INK }) + D.t(32, 544, 'Event Grounds', { s: 16, w: 700, c: '#fff' }) + D.t(32, 563, '6 zones · 3 fields of play · gates 08:00–19:00', { s: 12.5, c: 'rgba(255,255,255,.68)' });
  [['Food', 'FOP 2 / Cultural Zone'], ['Medical', 'Behind FOP 1'], ['Information', 'Beside Main Arena'], ['Transport', 'South Gate']].forEach(([a, b], i) => { const x = 32 + (i % 2) * 166, y = 580 + Math.floor(i / 2) * 52; s += D.r(x, y, 160, 46, { r: 10, fill: 'rgba(255,255,255,.07)' }) + D.t(x + 10, y + 20, a, { s: 13, w: 600, c: '#fff' }) + D.t(x + 10, y + 36, b, { s: 11, c: 'rgba(255,255,255,.6)' }); });
  s += D.r(32, 690, 326, 44, { r: 12, fill: SAF }) + D.t(195, 717, 'Open event map', { s: 14, w: 700, a: 'middle' });
  s += secTitle(D, 792, 'Latest updates', 'All updates →');
  s += D.r(16, 806, 358, 190, { r: 18, fill: CARD, st: 'rgba(22,18,14,.08)' });
  [['Schedule change', '14:20', 'Gaelic Football moved from FOP 3 to FOP 2', SAF], ['Notice', '13:55', 'Shuttle frequency increased', C.MNG], ['Highlight', '13:10', 'Record crowd for the Sumo showcase', RED]].forEach(([tp, tm, ti, col], i) => { const y = 830 + i * 58; s += D.c(34, y + 2, 4, col) + D.t(46, y + 6, tp + ' · ' + tm, { s: 11, w: 600, c: MUTED }) + D.t(46, y + 26, ti, { s: 14, w: 600 }) + (i < 2 ? `<line x1="30" y1="${y + 42}" x2="360" y2="${y + 42}" stroke="rgba(22,18,14,.07)"/>` : ''); });
  s += secTitle(D, 1038, 'Cultural stories');
  [['sumo', 'Salt, stamp and clash: rituals', 'before a sumo bout', 'Japan · Sumo', '0:26'], ['kabaddi', 'One breath, one raid: learning', 'kabaddi in a day', 'India · Kabaddi', '0:11']].forEach(([k, a, b, tg, len], i) => { const x = 16 + i * 260; s += D.r(x, 1052, 250, 240, { r: 18, fill: INK }) + D.photo(x, 1052, 250, 150, k, '#333', 18, false) + D.r(x, 1180, 250, 22, { fill: INK }) + D.c(x + 125, 1127, 26, 'rgba(255,255,255,.92)') + `<path d="M${x + 118} ${1116} L${x + 136} ${1127} L${x + 118} ${1138} Z" fill="${INK}"/>` + D.r(x + 202, 1172, 38, 18, { r: 4, fill: 'rgba(0,0,0,.6)' }) + D.t(x + 221, 1185, len, { f: MONO, s: 11, c: '#fff', a: 'middle' }) + D.t(x + 14, 1222, tg, { s: 11, w: 600, c: SAF }) + D.t(x + 14, 1244, a, { s: 14, w: 600, c: '#fff' }) + D.t(x + 14, 1263, b, { s: 14, w: 600, c: '#fff' }); });
  s += secTitle(D, 1336, 'Partners');
  for (let i = 0; i < 6; i++) { const x = 16 + (i % 3) * 122, y = 1350 + Math.floor(i / 3) * 66; s += D.r(x, y, 114, 58, { r: 12, st: 'rgba(22,18,14,.25)', dash: '4 4' }) + D.t(x + 57, y + 33, 'Partner logo', { f: MONO, s: 10.5, c: MUTED, a: 'middle' }); }
  s += D.r(0, 1500, 390, 130, { fill: NIGHT }) + D.t(16, 1534, 'FESTIVAL OF TRADITIONAL SPORTS', { f: DISP, s: 18, w: 800, c: '#fff' }) + D.t(16, 1556, 'Information on this page updates live. No app download needed.', { s: 12, c: 'rgba(255,255,255,.7)' }) + D.t(16, 1580, 'traditionalsports.live', { f: MONO, s: 12, c: SAF });
  s += nav(D, 1630, 'Live');
  return s;
}
function schedule(D) {
  let s = statusBar(D) + darkHeader(D, 47, 200, 'Full programme', 'Schedule');
  s += D.r(300, 76, 74, 30, { r: 15, fill: RED }) + D.c(316, 91, 3, '#fff') + D.t(343, 96, 'Now', { s: 12.5, w: 700, c: '#fff', a: 'middle' });
  [['Day 1', 'Thu 15 Oct'], ['Day 2', 'Fri 16 Oct'], ['Day 3', 'Sat 17 Oct']].forEach(([a, b], i) => { const x = 16 + i * 121; const act = i === 1; s += D.r(x, 120, 115, 44, { r: 12, fill: act ? '#fff' : 'rgba(255,255,255,.07)' }) + D.t(x + 57, 139, a, { s: 13.5, w: 700, c: act ? INK : '#fff', a: 'middle' }) + D.t(x + 57, 155, b, { s: 11, c: act ? MUTED : 'rgba(255,255,255,.6)', a: 'middle' }); });
  s += chips(D, 16, 176, ['All locations', 'Main Arena', 'FOP 1', 'FOP 2', 'FOP 3'], 0, true);
  let y = 270;
  const grp = (time, tag, items) => { s += D.t(16, y, time, { f: MONO, s: 14, w: 700 }) + `<line x1="66" y1="${y - 5}" x2="${tag ? 318 : 374}" y2="${y - 5}" stroke="rgba(22,18,14,.12)"/>` + (tag ? D.t(374, y, tag, { s: 10.5, w: 700, c: tag.includes('LIVE') ? RED : MUTED, a: 'end', ls: .8 }) : ''); y += 12; items.forEach((it) => { s += row(D, y, it); y += 64; }); y += 18; };
  grp('14:00', 'ENDED', [{ time: '14:00', sub2: '14:30', title: 'Oil Wrestling', sub: 'Türkiye · Demonstration', venue: 'FOP 1', color: C.TUR, status: 'Ended', done: true, tx: 104 }]);
  grp('14:30', '● LIVE', [{ time: '14:30', sub2: '15:00', title: 'Sumo', sub: 'Japan · Demonstration', venue: 'FOP 1', color: C.JPN, status: 'LIVE', live: true, tx: 104 }, { time: '14:30', sub2: '15:00', title: 'Sepak Takraw', sub: 'Thailand · Demonstration', venue: 'FOP 2', color: C.THA, status: 'LIVE', live: true, tx: 104 }]);
  grp('15:00', 'UPCOMING', [{ time: '15:00', sub2: '15:30', title: 'Kabaddi', sub: 'India · Demonstration', venue: 'FOP 2', color: C.IND, status: 'in 18 min', tx: 104 }, { time: '15:00', sub2: '15:45', title: 'Hurling', sub: 'Ireland · Showcase', venue: 'Arena', color: C.IRL, status: 'CHANGED', changed: true, tx: 104 }, { time: '15:00', sub2: '15:30', title: 'Kendo', sub: 'Japan · Demonstration', venue: 'FOP 1', color: C.JPN, status: 'in 18 min', tx: 104 }]);
  grp('15:30', '', [{ time: '15:30', sub2: '16:00', title: 'Korea showcase', sub: 'Korea · Cultural performance', venue: 'Culture', color: C.KOR, status: 'in 48 min', tx: 104 }]);
  s += nav(D, 770, 'Schedule');
  return s;
}
function countries(D) {
  let s = statusBar(D) + darkHeader(D, 47, 132, '10 countries · 30 sports', 'Explore');
  s += D.r(16, 124, 358, 42, { r: 12, fill: 'rgba(255,255,255,.08)' }) + D.r(19, 127, 176, 36, { r: 10, fill: '#fff' }) + D.t(107, 150, 'Countries', { s: 13.5, w: 700, a: 'middle' }) + D.t(283, 150, 'Sports', { s: 13.5, w: 700, c: '#fff', a: 'middle' });
  [['IND', 'India', 'Kabaddi · Kho Kho · Mallakhamb', 'kabaddi', C.IND, 0], ['JPN', 'Japan', 'Sumo · Kendo · Kyūdō', 'sumo', C.JPN, 1], ['MNG', 'Mongolia', 'Bökh · Mongolian Archery · Shagai', 'bokh', C.MNG, 0], ['TUR', 'Türkiye', 'Oil Wrestling · Cirit · Turkish Archery', 'oil', C.TUR, 0], ['THA', 'Thailand', 'Muay Boran · Sepak Takraw · Krabi Krabong', 'sepak', C.THA, 1], ['IDN', 'Indonesia', 'Pencak Silat · Egrang · Gasing', 'silat', C.IDN, 0]].forEach(([code, n, sp, k, col, lv], i) => { const y = 194 + i * 106; s += D.r(16, y, 358, 96, { r: 16, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.photo(16, y, 110, 96, k, col, 16, false) + D.r(126, y, 5, 96, { fill: col }) + D.t(146, y + 30, code, { f: MONO, s: 11, c: MUTED }) + (lv ? liveTag(D, 180, y + 18, true) : '') + D.t(146, y + 58, n, { f: DISP, s: 24, w: 800, up: true }) + D.t(146, y + 78, sp.length > 34 ? sp.slice(0, 33) + '…' : sp, { s: 12, c: MUTED }) + D.t(358, y + 54, '›', { s: 20, c: TERRA, a: 'middle' }); });
  s += nav(D, 770, 'Explore');
  return s;
}
function countryDetail(D) {
  let s = statusBar(D) + D.photo(0, 47, 390, 270, 'sumo', C.JPN, 0);
  s += D.c(34, 79, 20, 'rgba(19,16,13,.6)') + `<path d="M38 71 L30 79 L38 87" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  s += D.r(16, 250, 26, 6, { r: 3, fill: C.JPN }) + D.t(50, 257, 'JPN', { f: MONO, s: 12, c: '#fff' }) + D.t(16, 300, 'JAPAN', { f: DISP, s: 52, w: 900, c: '#fff' });
  wrap('Budō traditions where ritual, etiquette and form matter as much as the result.', 48).forEach((l, i) => { s += D.t(16, 346 + i * 21, l, { s: 14.5, c: '#2E2721' }); });
  s += D.t(16, 406, 'TRADITIONAL SPORTS', { s: 12, w: 700, ls: 1.2 });
  [['sumo', 'Sumo', 'Wrestling · Live at FOP 1', 1], ['kendo', 'Kendo', 'Combat · Next 15:00 · FOP 1', 0], ['x', 'Kyūdō', 'Target · Next 16:30 · FOP 3', 0]].forEach(([k, n, sub, lv], i) => { const y = 418 + i * 84; s += D.r(16, y, 358, 76, { r: 14, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.photo(24, y + 8, 72, 60, k, C.JPN, 10, false) + D.t(110, y + 34, n, { s: 15, w: 700 }) + D.t(110, y + 52, sub, { s: 12, c: MUTED }) + (lv ? liveTag(D, 306, y + 28, true) : '') + D.t(360, y + 44, '›', { s: 18, c: TERRA, a: 'middle' }); });
  s += D.t(16, 690, 'TODAY AT THE EVENT', { s: 12, w: 700, ls: 1.2 });
  s += D.r(16, 702, 358, 70, { r: 14, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.t(28, 728, '14:30', { f: MONO, s: 12.5, w: 600 }) + D.t(80, 728, 'Sumo', { s: 13.5, w: 600 }) + D.t(300, 728, 'FOP 1', { s: 11.5, c: MUTED, a: 'end' }) + D.r(310, 716, 44, 16, { r: 4, fill: RED }) + D.t(332, 728, 'LIVE', { s: 9.5, w: 700, c: '#fff', a: 'middle' }) + D.t(28, 758, '15:00', { f: MONO, s: 12.5, w: 600 }) + D.t(80, 758, 'Kendo', { s: 13.5, w: 600 });
  s += nav(D, 770, 'Explore');
  return s;
}
function sports(D) {
  let s = statusBar(D) + darkHeader(D, 47, 230, '10 countries · 30 sports', 'Explore');
  s += D.r(16, 124, 358, 42, { r: 12, fill: 'rgba(255,255,255,.08)' }) + D.r(195, 127, 176, 36, { r: 10, fill: '#fff' }) + D.t(107, 150, 'Countries', { s: 13.5, w: 700, c: '#fff', a: 'middle' }) + D.t(283, 150, 'Sports', { s: 13.5, w: 700, a: 'middle' });
  s += D.r(16, 176, 358, 42, { r: 12, fill: CARD }) + D.c(36, 196, 6, 'none', { st: MUTED, sw: 2 }) + D.t(52, 202, 'Search 30 sports', { s: 14.5, c: MUTED });
  s += chips(D, 16, 230, ['All', 'Wrestling', 'Combat', 'Team', 'Target'], 0, true);
  s += D.t(16, 300, '30 of 30 sports', { s: 12, c: MUTED });
  [['kabaddi', 'Kabaddi', 'India · Team', C.IND, 0], ['khokho', 'Kho Kho', 'India · Team', C.IND, 0], ['mallakhamb', 'Mallakhamb', 'India · Skill', C.IND, 0], ['sumo', 'Sumo', 'Japan · Wrestling', C.JPN, 1], ['kendo', 'Kendo', 'Japan · Combat', C.JPN, 0], ['x', 'Kyūdō', 'Japan · Target', C.JPN, 0]].forEach(([k, n, sub, col, lv], i) => { const x = 16 + (i % 2) * 183, y = 312 + Math.floor(i / 2) * 156; s += D.r(x, y, 175, 148, { r: 14, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.photo(x, y, 175, 100, k, col, 14, false) + D.r(x, y + 86, 175, 14, { fill: CARD }) + (lv ? liveTag(D, x + 8, y + 8, true) : '') + D.t(x + 10, y + 114, n, { s: 14, w: 700 }) + D.r(x + 10, y + 124, 7, 7, { r: 2, fill: col }) + D.t(x + 22, y + 131, sub, { s: 11.5, c: MUTED }); });
  s += nav(D, 770, 'Explore');
  return s;
}
function sportDetail(D) {
  let s = statusBar(D) + D.photo(0, 47, 390, 300, 'sepak', C.THA, 0);
  s += D.c(34, 79, 20, 'rgba(19,16,13,.6)') + `<path d="M38 71 L30 79 L38 87" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  s += D.r(16, 230, 10, 10, { r: 3, fill: C.THA }) + D.t(32, 239, 'Thailand · Team', { s: 12.5, w: 600, c: '#fff' }) + D.t(16, 282, 'SEPAK TAKRAW', { f: DISP, s: 48, w: 900, c: '#fff' });
  s += D.r(16, 296, 122, 38, { r: 19, fill: '#fff' }) + D.c(36, 315, 14, RED) + `<path d="M32 309 L42 315 L32 321 Z" fill="#fff"/>` + D.t(58, 320, 'Watch clip', { s: 13, w: 700 });
  s += D.r(16, 364, 358, 46, { r: 14, fill: INK }) + liveTag(D, 28, 376, true) + D.t(78, 392, 'Happening now at FOP 2', { s: 13.5, w: 600, c: '#fff' }) + D.t(358, 392, '→', { s: 14, c: SAF, a: 'end' });
  wrap('Volleyball played with the feet, knees and head over a net, using a woven rattan ball.', 48).forEach((l, i) => { s += D.t(16, 438 + i * 21, l, { s: 14.5, c: '#2E2721' }); });
  s += D.t(16, 500, 'WHEN & WHERE', { s: 12, w: 700, ls: 1.2 });
  s += D.r(16, 512, 358, 150, { r: 14, fill: CARD, st: 'rgba(22,18,14,.08)' });
  [['Day 1', '11:00–11:30', 'FOP 2', 'Ended'], ['Day 2', '14:30–15:00', 'FOP 2', 'LIVE'], ['Day 2', '17:00–17:30', 'FOP 2', 'Later'], ['Day 3', '10:30–11:30', 'TS Zone', 'Day 3']].forEach(([d, t1, v, stt], i) => { const y = 540 + i * 36; s += D.t(28, y, d, { s: 12, c: MUTED }) + D.t(80, y, t1, { f: MONO, s: 12.5, w: 600, c: stt === 'Ended' ? MUTED : INK }) + D.t(290, y, v, { s: 12, w: 700, a: 'end' }) + D.r(300, y - 12, 56, 16, { r: 4, fill: stt === 'LIVE' ? RED : 'rgba(22,18,14,.07)' }) + D.t(328, y, stt, { s: 9.5, w: 700, c: stt === 'LIVE' ? '#fff' : MUTED, a: 'middle' }); });
  s += D.t(16, 690, 'RELATED SPORTS', { s: 12, w: 700, ls: 1.2 });
  [['kabaddi', 'Kabaddi', C.IND], ['hurling', 'Hurling', C.IRL], ['gaelic', 'Gaelic Football', C.IRL]].forEach(([k, n, col], i) => { const x = 16 + i * 148; s += D.photo(x, 702, 140, 110, k, col, 14) + D.t(x + 10, 800, n, { s: 14, w: 700, c: '#fff' }); });
  s += nav(D, 770, 'Explore');
  return s;
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
function mapVenue(D) {
  let s = statusBar(D) + D.r(0, 47, 390, 390, { fill: NIGHT }) + D.t(16, 71, 'EVENT GROUNDS', { f: MONO, s: 10.5, w: 600, c: SAF, ls: 1.5 }) + D.t(16, 103, 'EVENT MAP', { f: DISP, s: 32, w: 800, c: '#fff' }) + D.t(16, 124, 'Select a location to see what is on there.', { s: 12.5, c: 'rgba(255,255,255,.65)' });
  s += D.c(195, 290, 140, `url(#${D.P}-glow)`) + isoMap(D, 195, 160, 'fop1');
  s += D.r(0, 437, 390, 56, { fill: SAND }) + chips(D, 16, 449, ['Main Arena', 'FOP 1', 'FOP 2', 'FOP 3', 'TS Zone'], 1, false);
  s += D.t(16, 522, 'DEMONSTRATION · STANDING + 600 SEATS', { s: 11, w: 700, c: MUTED, ls: 1 }) + D.t(16, 554, 'FOP 1', { f: DISP, s: 30, w: 800 }) + D.t(16, 576, 'Wrestling and combat demonstrations on a 12 m mat.', { s: 13.5, c: '#4E463D' });
  s += D.c(21, 606, 4, RED) + D.t(32, 610, 'LIVE NOW', { s: 12, w: 700, ls: 1.2 }) + D.photo(16, 622, 358, 130, 'sumo', C.JPN, 16) + liveTag(D, 30, 636, true) + D.t(30, 690, 'SUMO', { f: DISP, s: 28, w: 800, c: '#fff' }) + D.t(30, 710, 'Japan · 14:30–15:00 · 17:45 left', { s: 12.5, c: '#fff', op: .85 }) + D.r(16, 748, 358, 4, { fill: 'rgba(255,255,255,.2)' }) + D.r(16, 748, 145, 4, { fill: RED });
  s += D.t(16, 790, 'UP NEXT', { s: 12, w: 700, ls: 1.2 }) + row(D, 802, { time: '15:00', sub2: 'in 18 min', title: 'Kendo', sub: 'Japan · Demonstration', venue: 'FOP 1', color: C.JPN, tx: 104 }) + row(D, 866, { time: '15:30', sub2: 'in 48 min', title: 'Ssireum', sub: 'Korea · Demonstration', venue: 'FOP 1', color: C.KOR, tx: 104 });
  s += D.t(16, 958, "TODAY'S PROGRAMME HERE", { s: 12, w: 700, ls: 1.2 }) + D.r(16, 970, 358, 150, { r: 14, fill: CARD, st: 'rgba(22,18,14,.08)' });
  [['14:00', 'Oil Wrestling', C.TUR, 'Ended'], ['14:30', 'Sumo', C.JPN, 'LIVE'], ['15:00', 'Kendo', C.JPN, 'in 18 min'], ['15:30', 'Ssireum', C.KOR, 'in 48 min']].forEach(([t1, n, col, stt], i) => { const y = 998 + i * 34; s += D.t(28, y, t1, { f: MONO, s: 12.5, w: 600, c: stt === 'Ended' ? MUTED : INK }) + D.r(80, y - 9, 8, 8, { r: 2, fill: col }) + D.t(98, y, n, { s: 13.5, w: 600, c: stt === 'Ended' ? MUTED : INK }) + D.r(296, y - 12, 64, 16, { r: 4, fill: stt === 'LIVE' ? RED : 'rgba(22,18,14,.07)' }) + D.t(328, y, stt, { s: 9.5, w: 700, c: stt === 'LIVE' ? '#fff' : MUTED, a: 'middle' }); });
  s += D.t(16, 1152, 'FACILITIES NEARBY', { s: 12, w: 700, ls: 1.2 });
  [['Medical', 'Behind FOP 1'], ['Water points', 'Next to every FOP'], ['Toilets', '4 blocks']].forEach(([a, b], i) => { const x = 16 + i * 122; s += D.r(x, 1164, 114, 58, { r: 12, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.t(x + 10, 1187, a, { s: 13, w: 700 }) + D.t(x + 10, 1206, b, { s: 11, c: MUTED }); });
  s += D.t(16, 1254, 'RELATED DEMONSTRATIONS', { s: 12, w: 700, ls: 1.2 });
  [['bokh', '15:00 · TS Zone', 'Bökh', C.MNG], ['krabi', '15:30 · FOP 2', 'Krabi Krabong', C.THA], ['ssireum', '16:00 · Arena', 'Ssireum', C.KOR]].forEach(([k, a, b, col], i) => { const x = 16 + i * 158; s += D.photo(x, 1266, 150, 110, k, col, 14) + D.t(x + 10, 1348, a, { s: 10.5, c: '#fff' }) + D.t(x + 10, 1366, b, { s: 14, w: 700, c: '#fff' }); });
  s += nav(D, 1406, 'Map');
  return s;
}
function mapFacility(D) {
  let s = statusBar(D) + D.r(0, 47, 390, 390, { fill: NIGHT }) + D.t(16, 71, 'EVENT GROUNDS', { f: MONO, s: 10.5, w: 600, c: SAF, ls: 1.5 }) + D.t(16, 103, 'EVENT MAP', { f: DISP, s: 32, w: 800, c: '#fff' }) + D.t(16, 124, 'Select a location to see what is on there.', { s: 12.5, c: 'rgba(255,255,255,.65)' });
  s += D.c(195, 290, 140, `url(#${D.P}-glow)`) + isoMap(D, 195, 160, null);
  const pin = (x, y, lab) => { const w = lab.length * 6.6 + 16; return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 16}" stroke="${SAF}" stroke-width="2"/>` + D.r(x - w / 2, y - 36, w, 20, { r: 8, fill: SAF }) + D.t(x, y - 22, lab, { s: 10, w: 700, a: 'middle' }) + D.c(x, y, 4, SAF); };
  s += pin(195 + (150 - 206) * .78, 160 + (150 + 206) * .4, 'Food');
  s += D.r(0, 437, 390, 56, { fill: SAND }) + chips(D, 16, 449, ['Registration', 'Food', 'Medical', 'Information'], 1, false);
  s += D.r(16, 512, 358, 170, { r: 16, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.t(32, 548, 'FOOD', { f: DISP, s: 26, w: 800 }) + D.t(32, 572, 'Food court with dishes from all 10 countries', { s: 13.5, c: '#4E463D' });
  s += D.r(32, 590, 158, 70, { r: 10, fill: SAND }) + D.t(42, 610, 'WHERE', { s: 10.5, c: MUTED, ls: 1 }) + D.t(42, 630, 'Between FOP 2 and', { s: 13, w: 600 }) + D.t(42, 647, 'Cultural Zone', { s: 13, w: 600 }) + D.r(200, 590, 158, 70, { r: 10, fill: SAND }) + D.t(210, 610, 'HOURS', { s: 10.5, c: MUTED, ls: 1 }) + D.t(210, 630, '10:00–20:00', { s: 13, w: 600 });
  s += D.t(16, 716, 'OTHER FACILITIES', { s: 12, w: 700, ls: 1.2 });
  [['Transport', 'South Gate · shuttles every 20 min'], ['Toilets', '4 accessible blocks across the site'], ['Water points', 'Free refills next to every FOP'], ['Prayer room', 'Cultural Zone pavilion'], ['Lost property', 'Held at the Information desk']].forEach(([a, b], i) => { const y = 728 + i * 58; s += D.r(16, y, 358, 50, { r: 12, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.t(30, y + 22, a, { s: 14, w: 700 }) + D.t(30, y + 39, b, { s: 12, c: MUTED }) + D.t(358, y + 30, '›', { s: 18, c: TERRA, a: 'end' }); });
  s += nav(D, 1030, 'Map');
  return s;
}
function updates(D) {
  let s = statusBar(D) + darkHeader(D, 47, 126, 'Updated live by event control', 'Updates') + chips(D, 16, 124, ['All', 'Schedule changes', 'Notices', 'Highlights'], 0, true);
  s += D.r(16, 190, 358, 96, { r: 16, fill: SAF }) + D.t(30, 214, 'PINNED ANNOUNCEMENT', { s: 10.5, w: 700, ls: 1.2 }) + D.t(30, 238, 'Gate B closed 15:00–15:30', { s: 16, w: 700 }) + D.t(30, 258, 'Use Gate A or South Gate while the Parade of', { s: 13 }) + D.t(30, 275, 'Nations passes. Sessions run on time.', { s: 13 });
  [['Schedule change', '#8A4B00', SAF, '14:20 · 22 min ago', 'Gaelic Football moved from FOP 3 to FOP 2', 'The 16:00 demonstration now takes place on FOP 2', 'to allow a full-size pitch.'], ['Notice', '#1F4F84', C.MNG, '13:55 · 47 min ago', 'Shuttle frequency increased', 'Hotel shuttles now leave South Gate every 15', 'minutes until 21:00.'], ['Highlight', '#B3221D', RED, '13:10 · 1 h ago', 'Record crowd for the Sumo showcase', 'The Main Arena reached capacity. Repeat', 'session at 16:30 on FOP 1.'], ['Facility', '#236B34', C.IRL, '12:40 · 2 h ago', 'Water point added beside FOP 3', 'A second refill station is open between FOP 3', 'and the Traditional Sports Zone.']].forEach(([tp, ink, dot, tm, ti, b1, b2], i) => { const y = 300 + i * 118; s += D.r(16, y, 358, 108, { r: 16, fill: CARD, st: 'rgba(22,18,14,.08)' }) + D.c(34, y + 21, 4, dot) + D.t(44, y + 25, tp.toUpperCase(), { s: 11, w: 700, c: ink, ls: .6 }) + D.t(360, y + 25, tm, { f: MONO, s: 11, c: MUTED, a: 'end' }) + D.t(30, y + 52, ti, { s: 15.5, w: 700 }) + D.t(30, y + 74, b1, { s: 13, c: '#4E463D' }) + D.t(30, y + 92, b2, { s: 13, c: '#4E463D' }); });
  s += nav(D, 770, 'Updates');
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

// ---------- screen specs ----------
const screens = [];
screens.push({ file: '01-live-hub-first-view', n: '01', title: 'Event Live Hub · First viewport', purpose: 'What every visitor sees the moment they scan the universal QR. It answers four questions in one screen: what is on now, what is next, where it is, and where the full programme is.', tags: ['Entry: universal QR scan', 'Mobile first · 390 px', 'Opens in browser · no app', 'Same for every visitor'], h: 844, draw: homeTop,
  notes: [
    { side: 'L', k: 'A', ax: 60, ay: 84, title: 'Event identity', body: 'Confirms the visitor has landed on the official event site. The emblem ring uses the ten country colours.', feats: ['Event name and edition, editable in Admin', 'Same header on every device and location'] },
    { side: 'L', k: 'B', ax: 200, ay: 143, title: 'Current event day / time', body: 'Shows which day of the event it is and the live local time, so "now" and "next" are always in context.', feats: ['Day X of 3 with date', 'Clock ticks live; drives Live / Next statuses'] },
    { side: 'L', k: 'C', ax: 16, ay: 210, color: SAF, title: 'Important announcement', body: 'Appears only when Admin publishes one. Used for gate closures, weather, safety or major timing changes.', feats: ['Hidden when there is no active announcement', 'Visitor can dismiss; stays pinned in Updates'], flow: 'Admin → Announcements → Publish' },
    { side: 'R', k: 'D', ax: 374, ay: 400, color: RED, title: 'Live now', body: 'The demonstration currently running, with a realistic LIVE badge, venue, country, time slot, countdown and progress bar. Background plays a muted clip or a photo of the sport.', feats: ['Tap card → Sport detail', 'Tap venue pill → Venue map with that FOP selected', 'Swipe row below for other live locations'], flow: 'Tap card → 08 Sport detail' },
    { side: 'R', k: 'E', ax: 374, ay: 585, title: 'Also live', body: 'Every other location live at the same time. Each card shows its own progress bar.', feats: ['Sorted FOP 1 → FOP 3 → Arena → Zones'] },
    { side: 'R', k: 'F', ax: 374, ay: 713, title: 'Up next', body: 'The next sessions to start across all venues, with a relative countdown ("in 18 min").', feats: ['Link to the full schedule', 'CHANGED badge when Admin edits a session'], flow: 'Full schedule → 04 Schedule' },
    { side: 'L', k: 'G', ax: 150, ay: 805, title: 'Persistent navigation', body: 'Five destinations, always reachable with one thumb: Live, Schedule, Map, Explore, Updates. A badge counts unread updates.', feats: [] },
  ],
  flow: { note: 'The QR never changes; only the content behind it does.', in: ['Scan universal QR (any location)', 'Type the public URL', 'Tap "Live" in the bottom navigation'], self: 'Live Hub · first view', out: ['08 Sport detail (tap live card)', '09 Venue map (tap venue pill)', '04 Schedule (Full schedule)', '11 Updates (announcement / badge)'] } });
screens.push({ file: '02-live-hub-programme', n: '02', title: 'Event Live Hub · Programme & quick access', purpose: 'Directly below Live Now. Quick Access stays highly visible and routes to the five main tasks; the timeline shows the whole day across all venues at a glance.', tags: ['Scroll section of 01', 'Quick access', 'Timeline'], h: 1370, draw: homeMid,
  notes: [
    { side: 'L', k: 'A', ax: 16, ay: 150, title: 'Up next list', body: 'The next three to four sessions. Each row: start time, countdown, sport, country, session type, venue badge.', feats: ['Tap a row → Sport detail', 'Changed sessions highlighted in amber'] },
    { side: 'R', k: 'B', ax: 374, ay: 365, color: RED, title: 'Quick access', body: 'Five large tiles, in the order given in the brief. Every tile is a one-tap route to a primary task.', feats: ['Schedule: see every demonstration', 'Countries: explore all 10', '30 Sports: every traditional sport', 'Venue map: locations and facilities', 'Updates: changes and notices, with unread count'] },
    { side: 'R', k: 'C', ax: 374, ay: 880, title: "Today's programme timeline", body: 'A horizontal timeline with one lane per location. Blocks show sessions; a red line marks the current time and the view opens scrolled to now.', feats: ['Live block outlined in red', 'Past blocks faded', 'Tap any block → detail'] },
    { side: 'L', k: 'D', ax: 16, ay: 1180, title: 'Explore countries', body: 'A swipeable row of the ten countries with photo, colour and code. LIVE tag shows which countries are on right now.', feats: ['Tap → Country detail'], flow: 'All 10 → 05 Countries' },
  ],
  flow: { note: 'Quick Access is the main routing hub of the site.', in: ['Scrolling down from 01', 'Return from any detail screen'], self: 'Live Hub · programme', out: ['04 Schedule', '05 Countries', '07 Sports', '09 Venue map', '11 Updates'] } });
screens.push({ file: '03-live-hub-discover', n: '03', title: 'Event Live Hub · Discover, venue & media', purpose: 'The lower half of the Live Hub. Promotional and cultural content sits here, after all live operational information.', tags: ['Scroll section of 01', 'Photos & video', 'Partners'], h: 1704, draw: homeBottom,
  notes: [
    { side: 'L', k: 'A', ax: 16, ay: 260, title: 'Discover sports', body: 'A photo mosaic of featured traditional sports with country colour and name.', feats: ['Featured set chosen in Admin', 'All 30 → Sports list'] },
    { side: 'R', k: 'B', ax: 374, ay: 620, title: 'Venue information', body: 'Key facts about the grounds and the four facilities people ask for most: food, medical, information, transport.', feats: ['Tap a facility → Map with facility selected', 'Open event map button'], flow: 'Open event map → 09 Venue map' },
    { side: 'L', k: 'C', ax: 16, ay: 900, title: 'Latest updates', body: 'The three most recent items from the live feed: schedule changes, notices, highlights, facilities.', feats: ['Colour-coded by type', 'Time and relative age'] },
    { side: 'R', k: 'D', ax: 374, ay: 1150, title: 'Cultural stories / media', body: 'Short videos and stories about the sports and countries. Videos play inline in the page.', feats: ['Poster frame with duration', 'Tap to play with sound and controls'] },
    { side: 'L', k: 'E', ax: 16, ay: 1400, title: 'Partners', body: 'Partner logos managed in Admin. Placed last so it does not compete with live information.', feats: [] },
    { side: 'R', k: 'F', ax: 374, ay: 1560, title: 'Footer', body: 'Repeats the public URL for people who want to type it or share it. Reminds visitors that no app is needed.', feats: [] },
  ],
  flow: { note: 'Cultural content is secondary to live information.', in: ['Scrolling down from 02'], self: 'Live Hub · discover', out: ['07 Sports / 08 Sport detail', '09–10 Venue map', '11 Updates', 'Inline video playback'] } });
screens.push({ file: '04-schedule', n: '04', title: 'Full schedule', purpose: 'Every demonstration across all three days and all locations. Opens on today, scrolled to the current time slot.', tags: ['Tab: Schedule', 'Day + location filters', 'Live statuses'], h: 844, draw: schedule,
  notes: [
    { side: 'L', k: 'A', ax: 16, ay: 100, title: 'Header & jump to now', body: 'The red Now button scrolls straight to the time slot that is currently running.', feats: [] },
    { side: 'L', k: 'B', ax: 16, ay: 142, title: 'Day tabs', body: 'Switch between Day 1, 2 and 3. Past days show every session as Ended; future days show the day label.', feats: [] },
    { side: 'R', k: 'C', ax: 374, ay: 192, title: 'Location filter', body: 'Show all locations or only one: Main Arena, FOP 1–3, Traditional Sports Zone, Cultural Zone.', feats: [] },
    { side: 'R', k: 'D', ax: 374, ay: 380, color: RED, title: 'Time-slot groups', body: 'Sessions grouped by start time. Each group is tagged LIVE, UPCOMING or ENDED; every row shows its own status.', feats: ['LIVE rows outlined red', 'Countdown for sessions within 90 minutes', 'CHANGED badge after an Admin edit', 'Tap row → Sport detail'] },
  ],
  flow: { note: 'Statuses are calculated from the live clock and Admin session data.', in: ['Quick access: Schedule', 'Up next: Full schedule', 'Bottom navigation: Schedule'], self: 'Schedule', out: ['08 Sport detail', '06 Country detail (cultural showcases)', '09 Venue map'] } });
screens.push({ file: '05-explore-countries', n: '05', title: 'Explore · Countries', purpose: 'All ten participating countries. Each card links to that country\'s sports, story and sessions today.', tags: ['Tab: Explore', 'Segment: Countries'], h: 844, draw: countries,
  notes: [
    { side: 'L', k: 'A', ax: 20, ay: 145, title: 'Countries / Sports switch', body: 'One Explore tab with two segments, so both lists are one tap apart.', feats: [] },
    { side: 'R', k: 'B', ax: 374, ay: 350, title: 'Country card', body: 'Photo, country colour stripe, code, name and its three traditional sports.', feats: ['LIVE tag when any of its sports is live', 'Names are Admin-managed'], flow: 'Tap → 06 Country detail' },
  ],
  flow: { in: ['Quick access: Countries', 'Live Hub: Explore countries → All 10', 'Bottom navigation: Explore'], self: 'Countries', out: ['06 Country detail', '07 Sports (segment)'] } });
screens.push({ file: '06-country-detail', n: '06', title: 'Country detail', purpose: 'Everything about one country at the event: its story, its three sports and where to see them today.', tags: ['Detail page', 'Back returns to origin'], h: 844, draw: countryDetail,
  notes: [
    { side: 'L', k: 'A', ax: 16, ay: 280, title: 'Country hero', body: 'Full-bleed photo with country colour, code and name. Back button returns to the previous screen.', feats: [] },
    { side: 'R', k: 'B', ax: 374, ay: 355, title: 'Country story', body: 'Short cultural context written by the organisers.', feats: [] },
    { side: 'R', k: 'C', ax: 374, ay: 500, title: 'Traditional sports', body: 'The country\'s three sports, each with type and its live or next session.', feats: ['Tap → Sport detail'] },
    { side: 'L', k: 'D', ax: 16, ay: 735, title: 'Today at the event', body: 'Every session from this country today, with venue and status.', feats: ['Tap → Venue map for that location'] },
  ],
  flow: { in: ['05 Countries', 'Live Hub country cards', 'Schedule (cultural showcases)'], self: 'Country detail', out: ['08 Sport detail', '09 Venue map', 'Back to previous screen'] } });
screens.push({ file: '07-explore-sports', n: '07', title: 'Explore · 30 Sports', purpose: 'All thirty traditional sports, searchable and filterable by discipline.', tags: ['Tab: Explore', 'Segment: Sports', 'Search + filter'], h: 844, draw: sports,
  notes: [
    { side: 'L', k: 'A', ax: 16, ay: 197, title: 'Search', body: 'Filters by sport or country name as the visitor types.', feats: [] },
    { side: 'L', k: 'B', ax: 16, ay: 246, title: 'Discipline filter', body: 'All, Wrestling, Combat, Team, Target, Strength, Skill.', feats: [] },
    { side: 'R', k: 'C', ax: 374, ay: 470, title: 'Sport card', body: 'Photo, name, country colour, country and discipline. LIVE tag when it is on now.', feats: ['Sports without a photo get a patterned country-colour tile'], flow: 'Tap → 08 Sport detail' },
  ],
  flow: { in: ['Quick access: 30 Sports', 'Live Hub: Discover sports → All 30', 'Explore segment switch'], self: '30 Sports', out: ['08 Sport detail', '05 Countries (segment)'] } });
screens.push({ file: '08-sport-detail', n: '08', title: 'Sport detail', purpose: 'Explains one sport and shows every time and place it is demonstrated during the event.', tags: ['Detail page', 'Video', 'All three days'], h: 844, draw: sportDetail,
  notes: [
    { side: 'L', k: 'A', ax: 16, ay: 250, title: 'Sport hero & video', body: 'Photo with country, discipline and name. Watch clip plays a short video in place.', feats: [] },
    { side: 'L', k: 'B', ax: 16, ay: 387, color: RED, title: 'Live banner', body: 'Shown only while the sport is live. Tap to open the venue on the map.', feats: [] },
    { side: 'R', k: 'C', ax: 374, ay: 450, title: 'About', body: 'A two-line explanation of how the sport is played, written for first-time spectators.', feats: [] },
    { side: 'R', k: 'D', ax: 374, ay: 585, title: 'When & where', body: 'Every session of this sport across Day 1–3 with time, venue and status.', feats: ['Tap → Venue map'] },
    { side: 'R', k: 'E', ax: 374, ay: 760, title: 'Related sports', body: 'Other sports of the same discipline from other countries.', feats: [] },
  ],
  flow: { in: ['Live now card', 'Up next / Schedule rows', 'Sports list, Country detail'], self: 'Sport detail', out: ['09 Venue map (live banner / session)', 'Related sport detail', 'Back to previous screen'] } });
screens.push({ file: '09-venue-map', n: '09', title: 'Venue map · Location selected', purpose: 'A 3D event map. The site does not know where the QR was scanned, so there is no "You are here". The visitor picks the location they want to inspect.', tags: ['Tab: Map', 'No "You are here"', 'Manual location select'], h: 1480, draw: mapVenue,
  notes: [
    { side: 'L', k: 'A', ax: 60, ay: 260, title: '3D event map', body: 'Isometric map of all zones. Live locations carry a red dot; the selected location rises and glows.', feats: ['Tap a block to select it', 'Title reads EVENT MAP, never "You are here"'] },
    { side: 'L', k: 'B', ax: 16, ay: 465, title: 'Select a location', body: 'Main Arena, Traditional Sports Zone, Cultural Zone, FOP 1–3, Registration, Food, Medical, Information, Transport, Toilets, Other facilities.', feats: [] },
    { side: 'R', k: 'C', ax: 374, ay: 690, color: RED, title: 'Live now', body: 'What is happening at the selected location right now.', feats: [] },
    { side: 'R', k: 'D', ax: 374, ay: 860, title: 'Up next', body: 'The next sessions at this location only.', feats: [] },
    { side: 'R', k: 'E', ax: 374, ay: 1045, title: "Today's programme", body: 'The full day at this location with statuses.', feats: [] },
    { side: 'L', k: 'F', ax: 16, ay: 1195, title: 'Facilities', body: 'Nearest facilities to this location.', feats: ['Tap → facility view (screen 10)'] },
    { side: 'L', k: 'G', ax: 16, ay: 1320, title: 'Related demonstrations', body: 'Upcoming sessions of similar disciplines elsewhere on site.', feats: [] },
  ],
  flow: { note: 'Selection is manual; location is never assumed.', in: ['Quick access: Venue map', 'Venue pill on Live now', 'Session rows (venue)', 'Bottom navigation: Map'], self: 'Venue map', out: ['08 Sport detail', '10 Facility view', 'Other location (chip / block)'] } });
screens.push({ file: '10-venue-map-facility', n: '10', title: 'Venue map · Facility selected', purpose: 'The same map when a facility is chosen. A pin marks the facility and a card gives location and opening hours.', tags: ['Tab: Map', 'Facilities'], h: 1104, draw: mapFacility,
  notes: [
    { side: 'L', k: 'A', ax: 90, ay: 300, color: SAF, title: 'Facility pin', body: 'The selected facility is pinned on the map in amber.', feats: [] },
    { side: 'R', k: 'B', ax: 374, ay: 595, title: 'Facility card', body: 'Name, description, where it is and its opening hours. All fields are Admin-managed.', feats: [] },
    { side: 'R', k: 'C', ax: 374, ay: 850, title: 'Other facilities', body: 'Transport, toilets, water points, prayer room and lost property.', feats: [] },
  ],
  flow: { in: ['Venue information on Live Hub', 'Facilities nearby on 09', 'Location chips'], self: 'Facility view', out: ['09 Venue map (select a venue)', 'Other facility'] } });
screens.push({ file: '11-updates', n: '11', title: 'Live updates', purpose: 'The live feed from event control: schedule changes and important notices, plus highlights and facility news.', tags: ['Tab: Updates', 'Real-time feed'], h: 844, draw: updates,
  notes: [
    { side: 'L', k: 'A', ax: 16, ay: 140, title: 'Type filter', body: 'All, Schedule changes, Notices, Highlights.', feats: [] },
    { side: 'L', k: 'B', ax: 16, ay: 238, color: SAF, title: 'Pinned announcement', body: 'The active announcement stays pinned here even after it is dismissed on the Live Hub.', feats: [] },
    { side: 'R', k: 'C', ax: 374, ay: 480, title: 'Update card', body: 'Type, publish time, relative age, headline and short body. New items appear at the top without reloading.', feats: ['Unread count on the bottom navigation', 'Schedule changes also mark the affected session as CHANGED'] },
  ],
  flow: { in: ['Quick access: Updates', 'Live Hub: Latest updates', 'Bottom navigation badge'], self: 'Updates', out: ['Affected session (Schedule)', 'Back to Live Hub'] } });
screens.push({ file: '12-admin-qr', n: '12', title: 'Admin · QR / Public access', purpose: 'The only QR screen in Admin. It shows the single universal QR, its destination, download and URL actions, and visit analytics. There are no per-location QR records.', tags: ['Admin web app', 'Desktop', 'Single QR record'], h: 780, desktop: true, draw: (D, x, y) => admin(D, x, y),
  notes: [
    { side: 'L', k: 'A', ax: 20, ay: 518, title: 'Admin navigation', body: 'QR / Public access sits alongside the content sections. Live control, Schedule, Countries, Sports, Venues, Updates and Announcements are where content is changed.', feats: [] },
    { side: 'L', k: 'B', ax: 320, ay: 250, title: 'Universal Event QR', body: 'QR name, status ACTIVE, destination Event Live Hub and the public URL. One record only.', feats: ['Download QR as PNG, SVG or print PDF', 'Copy public URL'] },
    { side: 'L', k: 'C', ax: 300, ay: 500, title: 'Analytics', body: 'Total visits, visits today, device breakdown and traffic trend for the public site.', feats: [] },
    { side: 'L', k: 'D', ax: 300, ay: 736, color: SAF, title: 'By design', body: 'No location-, hotel-, FOP-, country- or sport-specific QR codes and no contextual redirection.', feats: [] },
  ],
  flow: { note: 'Admin changes the website content, not the QR.', in: ['Admin login', 'Admin sidebar: QR / Public access'], self: 'Admin · QR', out: ['Download QR artwork for print', 'Copy URL for promotion', 'Other Admin sections to edit content'] } });

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
  s += D.r(850, 420, 300, 200, { r: 24, fill: RED }) + D.t(1000, 490, 'EVENT', { f: DISP, s: 44, w: 900, c: '#fff', a: 'middle' }) + D.t(1000, 536, 'LIVE HUB', { f: DISP, s: 44, w: 900, c: '#fff', a: 'middle' }) + D.t(1000, 572, 'Same page for everyone', { s: 14, c: '#fff', a: 'middle' }) + D.t(1000, 592, 'Opens in the mobile browser', { s: 14, c: '#fff', a: 'middle' });
  const outs = [['Live now', '01'], ['Schedule', '04'], ['Countries', '05 · 06'], ['Sports', '07 · 08'], ['Venue map', '09 · 10'], ['Updates', '11'], ['Explore', '02 · 03']];
  s += D.t(1250, 232, 'VISITOR CHOOSES WHAT THEY NEED', { f: MONO, s: 11, w: 700, c: TERRA, ls: 1.2 });
  outs.forEach(([o, n], i) => { const y = 260 + i * 70; s += `<path d="M1150 520 C 1200 520, 1200 ${y + 25}, 1244 ${y + 25}" fill="none" stroke="${TERRA}" stroke-width="1.8" marker-end="url(#s00-arrow)"/>` + D.r(1250, y, 330, 50, { r: 12, fill: INK }) + D.t(1270, y + 32, o, { f: DISP, s: 22, w: 800, c: '#fff', up: true }) + D.t(1562, y + 31, 'Screen ' + n, { f: MONO, s: 11.5, c: SAF, a: 'end' }); });
  // admin loop
  s += D.r(506, 760, 1074, 170, { r: 22, fill: '#fff', st: 'rgba(22,18,14,.12)' }) + D.t(536, 800, 'CONTENT STAYS DYNAMIC', { f: MONO, s: 11, w: 700, c: TERRA, ls: 1.2 });
  s += D.r(536, 820, 250, 80, { r: 14, fill: NIGHT }) + D.t(556, 852, 'ADMIN', { f: DISP, s: 22, w: 800, c: '#fff' }) + D.t(556, 876, 'edits content (screen 12)', { s: 12.5, c: 'rgba(255,255,255,.7)' });
  s += `<path d="M786 860 L 866 860" stroke="${TERRA}" stroke-width="2.5" marker-end="url(#s00-arrow)"/>`;
  const ch = ['Live status', 'Upcoming sessions', 'Timings', 'Venue / FOP', 'Country & sport names', 'Announcements', 'Live updates', 'Promotions'];
  ch.forEach((c2, i) => { const x = 876 + (i % 4) * 150, y = 826 + Math.floor(i / 4) * 40; s += D.r(x, y, 142, 30, { r: 15, fill: SAND }) + D.t(x + 71, y + 20, c2, { s: 12, w: 600, a: 'middle' }); });
  s += D.t(876, 920, 'The Live Hub updates automatically. The printed QR is never changed.', { s: 13.5, w: 600, c: TERRA });
  // principle
  const pr = ['ONE EVENT', 'ONE QR', 'ONE WEBSITE', 'ONE LIVE INFORMATION SOURCE']; let px2 = 60;
  s += D.r(60, 980, 1520, 150, { r: 22, fill: INK }) + D.t(90, 1020, 'FINAL QR PRINCIPLE', { f: MONO, s: 12, w: 700, c: SAF, ls: 1.5 });
  const widths = [250, 200, 290, 620]; px2 = 90; pr.forEach((p, i) => { s += D.t(px2, 1090, p, { f: DISP, s: 44, w: 900, c: i === 3 ? SAF : '#fff' }); px2 += widths[i] + 40; });
  s += D.t(90, 1112, 'The QR is a permanent physical gateway into the continuously updated event platform. No context-specific QR behaviour.', { s: 13.5, c: 'rgba(244,238,228,.7)' });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><marker id="s00-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${TERRA}"/></marker><pattern id="s00-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#16120E" opacity=".08"/></pattern></defs><rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#s00-dots)"/>${s}${D.t(W - 60, H - 28, '00 / 12', { f: MONO, s: 12, c: MUTED, a: 'end' })}</svg>`;
  await saveFile('ux/00-user-journey.svg', svg);
}

const results = [];
for (const sc of screens) {
  const D = Doc('s' + sc.n);
  const px = sc.desktop ? 560 : PX;
  const phoneH = sc.desktop ? 760 : sc.h;
  const svg = page(D, sc, phoneH, sc.desktop ? sc.draw : (d) => sc.draw(d), sc.notes, sc.flow, { desktop: sc.desktop, px });
  await saveFile(`ux/${sc.file}.svg`, svg);
  results.push(`${sc.file}: ${Math.round(svg.length / 1024)}k`);
}
log(results.join('\n'));
