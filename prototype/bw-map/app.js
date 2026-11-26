/* Bản đồ đen trắng (prototype): rê/chạm vào viên đá thì viên đó hiện màu gốc. Logic tọa độ chép từ sitemap.html. */
(async () => {
  'use strict';
  const DW = 1670, DH = 942, NS = 'http://www.w3.org/2000/svg';
  const REL = '../../';            // trang thật nằm ở gốc repo
  const BO_PAGE = '../bw-bo/';
  const POLYS = [{"pts":[[1133,72],[1115,56],[1086,44],[1074,32],[1021,9],[955,14],[917,8],[852,21],[792,14],[756,14],[736,18],[698,34],[700,57],[691,88],[684,163],[660,202],[651,228],[657,232],[691,238],[735,241],[793,259],[876,257],[887,263],[903,264],[945,281],[1005,280],[1010,263],[1041,198],[1060,179],[1078,167],[1092,151],[1108,118],[1129,88]]},{"pts":[[697,37],[690,36],[670,44],[631,52],[497,52],[467,56],[407,81],[379,87],[347,118],[336,125],[290,146],[238,164],[214,185],[201,207],[171,237],[156,269],[152,307],[134,359],[135,377],[144,409],[151,409],[167,402],[223,366],[261,358],[288,343],[327,336],[352,327],[362,327],[386,309],[411,299],[437,295],[488,294],[531,283],[551,274],[583,253],[603,248],[648,228],[667,187],[683,163],[690,88],[699,57]]},{"pts":[[1135,76],[1087,159],[1042,198],[1011,263],[1007,282],[1021,291],[1065,310],[1098,335],[1148,359],[1175,386],[1193,394],[1215,412],[1257,459],[1329,457],[1375,462],[1410,473],[1481,475],[1538,481],[1537,419],[1531,380],[1510,350],[1501,309],[1494,291],[1458,253],[1453,243],[1448,215],[1432,181],[1408,162],[1386,138],[1336,118],[1304,96],[1252,83],[1223,82],[1195,76]]},{"pts":[[886,263],[876,258],[793,260],[735,242],[691,239],[645,230],[603,249],[583,254],[551,275],[531,284],[488,295],[437,296],[405,302],[370,320],[366,324],[366,331],[382,346],[418,370],[446,412],[477,433],[500,459],[509,488],[511,521],[519,547],[522,587],[592,582],[602,578],[667,572],[743,558],[762,551],[799,527],[821,520],[848,464],[875,425],[876,409],[867,361],[867,332],[886,271]]},{"pts":[[888,265],[868,332],[868,361],[876,401],[876,425],[849,464],[831,504],[823,515],[823,522],[838,537],[850,555],[892,590],[915,618],[929,677],[950,714],[960,721],[977,763],[981,782],[990,782],[1012,767],[1071,699],[1109,642],[1155,610],[1210,557],[1227,533],[1256,465],[1256,459],[1215,413],[1193,395],[1175,387],[1148,360],[1098,336],[1065,311],[1021,292],[1005,281],[951,283],[931,278],[900,264]]},{"pts":[[362,328],[352,328],[327,337],[288,344],[261,359],[223,367],[167,403],[147,411],[148,421],[169,455],[181,513],[180,538],[174,563],[159,599],[143,623],[141,653],[134,672],[135,693],[151,731],[158,731],[190,708],[239,683],[325,660],[387,631],[452,622],[488,603],[521,592],[518,547],[510,521],[507,483],[499,459],[477,434],[445,412],[418,371],[382,347]]},{"pts":[[1536,482],[1481,476],[1410,474],[1375,463],[1329,458],[1258,460],[1228,533],[1211,557],[1155,611],[1110,642],[1072,699],[1023,757],[996,780],[982,783],[974,789],[972,797],[982,800],[1000,821],[1009,841],[1036,861],[1092,880],[1138,882],[1205,899],[1237,898],[1307,885],[1353,861],[1403,842],[1435,813],[1474,791],[1502,751],[1511,716],[1529,680],[1534,651],[1525,624],[1510,596],[1506,560],[1509,548],[1529,514]]},{"pts":[[523,589],[523,597],[552,640],[587,669],[608,701],[625,718],[664,747],[708,772],[712,780],[721,785],[736,804],[767,832],[771,843],[785,841],[807,831],[834,826],[863,815],[908,811],[939,800],[965,797],[979,785],[977,766],[959,721],[949,714],[928,677],[914,618],[892,591],[849,555],[837,537],[821,521],[799,528],[762,552],[743,559],[667,573]]},{"pts":[[769,846],[766,832],[735,804],[721,786],[711,780],[708,773],[664,748],[625,719],[607,701],[586,669],[551,640],[521,596],[503,598],[452,623],[387,632],[325,661],[239,684],[190,709],[158,732],[158,739],[204,786],[222,824],[260,854],[287,895],[326,922],[341,927],[374,930],[423,922],[445,922],[497,932],[563,928],[612,916],[673,907],[716,895],[739,882],[755,859]]}];
  // icon: [file, cx, cy, w, h] ; lb: [x, y, xoay, cỡ chữ, dòng]
  const D0 = [
    {id:1,name:'Đăng ký',href:'dangky.html',tip:'Đăng ký tham gia lớp',ic:2,lb:[395,238,-12,62,['Đăng ký']]},
    {id:0,name:'Khám phá tác phẩm',href:'khampha.html',tip:'Khám phá tác phẩm',ic:-1,lb:[880,150,-7,58,['khám phá','tác phẩm']],pk:.82},
    {id:2,name:'Workshop',href:'gallery.html',tip:'Xem hình các buổi Workshop',ic:6,lb:[1262,225,12,58,['Workshop']]},
    {id:5,name:'Lớp F1',href:'lopf1.html',tip:'Thông tin lớp F1',ic:0,lb:[335,425,-8,58,['Lớp F1']]},
    {id:3,name:'Giới thiệu',href:'gioithieu.html',tip:'Giới thiệu Me.Mori Class',ic:3,lb:[655,335,5,60,['Giới thiệu']]},
    {id:4,name:'Lộ trình Lớp F2',href:'roadmap.html',tip:'Xem lộ trình lớp F2',ic:5,lb:[1040,410,6,58,['Lộ trình','Lớp F2']]},
    {id:8,name:'Cộng đồng',href:'community.html',tip:'Vào không gian Cộng đồng',ic:1,lb:[470,735,8,60,['Cộng đồng']]},
    {id:7,name:'Phương pháp',href:'method.html',tip:'Phương pháp học',ic:4,lb:[725,640,-6,50,['phương pháp']],pl:['phương','pháp']},
    {id:6,name:'Tôi có phù hợp không',href:'index.html',tip:'Tôi có phù hợp không',ic:-1,lb:[1378,650,-4,54,['“Tôi có','phù hợp','không”']]}
  ];
  const SC = await MemoriContent.load('sitemap', {pageTitle: document.title, srTitle: 'Bản đồ trang web Me.Mori Class',
    stones: D0.map(d => ({id: d.id, name: d.name, href: d.href, tip: d.tip, lines: d.lb[4], portraitLines: d.pl || []}))});
  document.title = SC.pageTitle || document.title;
  MemoriContent.setText('#srt', SC.srTitle);
  /* đường dẫn của trang thật -> từ trang mẫu; riêng "index.html" (trang Bọ) -> trang mẫu Bọ */
  const fixHref = h => (h === 'index.html' || h === 'index.html#') ? BO_PAGE : h === 'roadmap.html' ? '../bw-roadmap/' : (/^(https?:|mailto:|#|\.\.\/)/i.test(h) ? h : REL + h);
  const D = D0.map(d => {
    const c = SC.stones.find(x => x && x.id === d.id) || {};
    const ln = a => Array.isArray(a) ? a.filter(t => typeof t === 'string' && t.trim()).slice(0, 6).map(t => t.slice(0, 40)) : [];
    const lines = ln(c.lines), pl = ln(c.portraitLines);
    return Object.assign({}, d, {name: c.name || d.name, tip: c.tip || d.tip,
      href: fixHref(MemoriContent.url(c.href, d.href, {hash: true}) || d.href),
      lb: [d.lb[0], d.lb[1], d.lb[2], d.lb[3], lines.length ? lines : d.lb[4]],
      pl: pl.length ? pl : (d.pl && !lines.length ? d.pl : undefined)});
  });
  const ICONS = [{cx:309.5,cy:531.0,w:187,h:196},{cx:358.0,cy:817.5,w:246,h:151},{cx:494.5,cy:146.5,w:139,h:113},{cx:661.0,cy:457.5,w:200,h:181},{cx:785.0,cy:713.5,w:196,h:153},{cx:1028.0,cy:550.5,w:284,h:133},{cx:1457.5,cy:310.0,w:185,h:162}];
  const DOT_ALPHA = [.17, .22, .14, .26, .19, .24, .15, .21, .18];     // độ đậm tram theo viên đá (chỉ xám)

  const $ = s => document.querySelector(s);
  const root = $('#root'), stage = $('#stage'), veil = $('#veil');
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const RM = RMQ.matches;
  if (RM) root.classList.add('rm');
  const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };
  const bgImg = $('#bg');
  const params = new URLSearchParams(location.search);

  /* ---------- hình học: thu nhỏ đa giác vào trong để chừa khe ---------- */
  function dedupe(p, min) {
    const o = [];
    for (const q of p) { const l = o[o.length - 1]; if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) >= min) o.push(q); }
    if (o.length > 2 && Math.hypot(o[0][0] - o[o.length - 1][0], o[0][1] - o[o.length - 1][1]) < min) o.pop();
    return o;
  }
  function inset(pts, d) {
    const p = dedupe(pts, 3), n = p.length;
    let A = 0;
    for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; }
    const s = A > 0 ? 1 : -1, out = [];
    const nrm = (a, b) => { const ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey) || 1; return [-ey / l * s, ex / l * s]; };
    for (let i = 0; i < n; i++) {
      const pr = p[(i + n - 1) % n], cu = p[i], nx = p[(i + 1) % n];
      const n1 = nrm(pr, cu), n2 = nrm(cu, nx);
      let vx = n1[0] + n2[0], vy = n1[1] + n2[1];
      const dot = n1[0] * n2[0] + n1[1] * n2[1], k = d / Math.max(.5, 1 + dot);
      vx *= k; vy *= k;
      const L = Math.hypot(vx, vy), cap = d * 2;
      if (L > cap) { vx *= cap / L; vy *= cap / L; }
      out.push([cu[0] + vx, cu[1] + vy]);
    }
    return out;
  }
  const GAP = 5, GAP_LIT = 6.2;

  /* ---------- dựng cảnh ---------- */
  const mkSvg = (id, z) => { const s = document.createElementNS(NS, 'svg'); s.id = id; s.setAttribute('class', 'vec'); s.setAttribute('aria-hidden', 'true'); stage.appendChild(s); return s; };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  const stones = mkSvg('stones'), inkv = mkSvg('inkv');
  const defs = el('defs', {}, stones);
  const sg = el('g', {filter: 'url(#hand)'}, stones), sm = el('g', {}, sg);
  const ig = el('g', {filter: 'url(#hand)'}, inkv), im = el('g', {}, ig);
  const patterns = [];
  const els = [];
  for (const d of D) {
    const P = POLYS[d.id];
    d.poly = P.pts;
    d.ins = inset(P.pts, GAP); d.insLit = inset(P.pts, GAP_LIT);
    { let A = 0, X = 0, Y = 0; const q = P.pts; for (let i = 0; i < q.length; i++) { const [a, b] = q[i], [c, e] = q[(i + 1) % q.length], f = a * e - c * b; A += f; X += (a + c) * f; Y += (b + e) * f } d.cen = [X / (3 * A), Y / (3 * A)]; }
    const pat = el('pattern', {id: 'dot' + d.id, width: 4, height: 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(' + (20 + d.id * 9) + ')'}, defs);
    el('circle', {cx: 2, cy: 2, r: .85, fill: '#111', 'fill-opacity': DOT_ALPHA[d.id]}, pat);
    patterns.push(pat);
    const pts = d.ins.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    el('polygon', {points: pts, fill: '#fbfbfa', stroke: 'none'}, sm);
    el('polygon', {points: pts, fill: 'url(#dot' + d.id + ')', stroke: 'none'}, sm);
    d.ink = el('polygon', {points: pts, fill: 'none', stroke: '#111', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'}, im);

    const a = document.createElement('a');
    a.className = 'dest'; a.href = d.href; a.setAttribute('aria-label', d.name + ' – ' + d.tip);
    a.innerHTML = '<span class="hit"></span><span class="litclip"><span class="litcircle"><span class="lit"><img alt="" draggable="false" src="' + REL + 'assets/sitemap/map.webp"></span></span></span>' +
      (d.ic >= 0 ? '<span class="ico"><img class="g" alt="" draggable="false" src="' + REL + 'assets/sitemap/icon' + d.ic + '.webp"><img class="c" alt="" draggable="false" src="' + REL + 'assets/sitemap/icon' + d.ic + '.webp"></span>' : '') +
      '<span class="lbl" aria-hidden="true"><span class="tx"></span><span class="tip"></span></span>';
    a.querySelector('.tip').textContent = d.tip;
    d.a = a; d.hit = a.querySelector('.hit'); d.litclip = a.querySelector('.litclip'); d.lc = a.querySelector('.litcircle'); d.lit = a.querySelector('.lit');
    d.ico = a.querySelector('.ico'); d.lbl = a.querySelector('.lbl'); d.tx = a.querySelector('.tx');
    stage.appendChild(a);
    els.push(d);
  }
  const mkImg = (id, src) => { const i = document.createElement('img'); i.id = id; i.src = src; i.alt = ''; i.draggable = false; i.onerror = () => { i.style.display = 'none'; }; stage.appendChild(i); return i; };
  const leaves = mkImg('leaves', 'img/leaves-bw.webp');
  const mound = mkImg('mound', 'img/mound-bw.webp');
  const lshadow = document.createElement('div'); lshadow.id = 'lshadow'; stage.appendChild(lshadow);

  /* ---------- Bọ đen trắng ---------- */
  const POSES = ['idle', 'wave', 'talk', 'listen', 'think', 'point', 'happy', 'surprised', 'confused', 'sleep', 'takeoff', 'fly'];
  const lady = document.createElement('div'); lady.id = 'lady';
  lady.innerHTML = '<div class="fly"><div class="bob"><div class="flip"></div></div></div>';
  stage.appendChild(lady);
  const flyEl = lady.querySelector('.fly'), bob = lady.querySelector('.bob'), flip = lady.querySelector('.flip');
  const sprites = {};
  for (const p of POSES) { const i = document.createElement('img'); i.alt = ''; i.draggable = false; i.src = '../bw-bo/img/bo/' + p + '.webp'; i.dataset.p = p; flip.appendChild(i); sprites[p] = i; }
  const ladyHit = document.createElement('button'); ladyHit.id = 'ladyHit'; ladyHit.type = 'button'; ladyHit.setAttribute('aria-label', 'Bọ'); ladyHit.tabIndex = -1;
  lady.appendChild(ladyHit);
  const mound2 = mkImg('mound2', 'img/mound-bw.webp');

  /* ---------- bố cục (xoay dọc khi điện thoại) ---------- */
  let K = 1, port = false, OX = 0, OY = 0, LK = 1;
  const T = (x, y) => port ? [(DH - y) * K, x * K] : [x * K, y * K];
  const LADY0 = [1215, 853], BOSZ = 290;
  function layout() {
    const w = innerWidth, h = innerHeight;
    port = w / h < .9;
    let sw, sh;
    if (!port) { K = Math.min(w / DW, h / DH); sw = DW * K; sh = DH * K; OX = (w - sw) / 2; OY = (h - sh) / 2; }
    else {
      const top = 60, mH0 = 171, kLady = 1.2;
      K = Math.min((w - 32) / DH, (h - top - mH0 * kLady * .5) / DW); K = Math.min(K, (w - 32) / DH);
      sw = DH * K; sh = DW * K; OX = (w - sw) / 2; OY = top + Math.max(0, (h - top - 171 * K * 1.2 * .55 - sh) / 2);
    }
    css(stage, {left: OX + 'px', top: OY + 'px', width: sw + 'px', height: sh + 'px'});
    const M = port ? 'translate(' + DH * K + ' 0) rotate(90) scale(' + K + ')' : 'scale(' + K + ')';
    sm.setAttribute('transform', M); im.setAttribute('transform', M);
    const psz = Math.max(4, 3.2 / K);
    patterns.forEach(p => { p.setAttribute('width', psz); p.setAttribute('height', psz); p.firstChild.setAttribute('cx', psz / 2); p.firstChild.setAttribute('cy', psz / 2); p.firstChild.setAttribute('r', Math.max(.85, .9 * psz / 4)); });
    // lá phủ toàn khung nhìn, cùng phép cover (neo 60% / 50%) với ảnh nền
    const s = Math.max(w / DW, h / DH), lw = DW * s, lh = DH * s;
    css(leaves, {left: (-OX + (w - lw) * .6) + 'px', top: (-OY + (h - lh) * .5) + 'px', width: lw + 'px', height: lh + 'px'});
    bgImg.style.objectPosition = '60% 50%';
    // gò rêu và Bọ
    let ms, mx, my;
    if (!port) { ms = K; mx = 0; my = 0; } else { ms = K * 1.2; mx = (w - OX) - 1571 * ms; my = (h - OY) - 942 * ms; }
    css(mound, {left: mx + 'px', top: my + 'px', width: DW * ms + 'px', height: DH * ms + 'px'});
    css(mound2, {left: mx + 'px', top: my + 'px', width: DW * ms + 'px', height: DH * ms + 'px'});
    const fx = mx + LADY0[0] * ms, fy = my + LADY0[1] * ms; LK = ms;
    const sw2 = 190 * ms, sh2 = 26 * ms;
    css(lshadow, {left: fx - sw2 / 2 + 'px', top: fy - sh2 * .5 - ms + 'px', width: sw2 + 'px', height: sh2 + 'px'});
    const y0 = (LADY0[1] - 7) * ms, mk = 'linear-gradient(to bottom,transparent ' + y0 + 'px,#000 ' + (y0 + 9 * ms) + 'px)';
    mound2.style.webkitMaskImage = mk; mound2.style.maskImage = mk;
    css(lady, {left: (fx - BOSZ * ms / 2) + 'px', top: (fy - BOSZ * ms + 4 * ms) + 'px', width: BOSZ * ms + 'px', height: BOSZ * ms + 'px'});
    // các viên đá
    for (const d of D) {
      const pts = d.poly.map(p => T(p[0], p[1])), ipts = d.insLit.map(p => T(p[0], p[1]));
      d.hit.style.clipPath = 'polygon(' + pts.map(p => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',') + ')';
      d.litclip.style.clipPath = 'polygon(' + ipts.map(p => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',') + ')';
      d.bbox = [Math.min(...ipts.map(p => p[0])), Math.min(...ipts.map(p => p[1])), Math.max(...ipts.map(p => p[0])), Math.max(...ipts.map(p => p[1]))];
      css(d.lit, {width: DW * K + 'px', height: DH * K + 'px', transformOrigin: '0 0', transform: port ? 'translate(' + DH * K + 'px,0) rotate(90deg)' : 'none'});
      const lines = (port && d.pl) || d.lb[4];
      d.tx.textContent = '';
      lines.forEach(t => { const sp = document.createElement('span'); sp.style.display = 'block'; sp.textContent = t; d.tx.appendChild(sp); });
      const lfs = d.lb[3] * K * (port ? (d.pk || 1) : 1), Lh = lines.length * lfs * .98;
      let lp = T(d.lb[0], d.lb[1]), ip = null;
      if (d.ico) { const c = ICONS[d.ic]; ip = T(c.cx, c.cy); }
      if (port) {
        const C = T(d.cen[0], d.cen[1]), Ih = d.ico ? ICONS[d.ic].h * K * .9 : 0, g = d.ico ? Math.max(8, 10 * K) : 0, tot = Lh + g + Ih;
        lp = [C[0], C[1] - tot / 2 + Lh / 2]; if (d.ico) ip = [C[0], C[1] + tot / 2 - Ih / 2];
      }
      d.lbl.style.setProperty('--r', (port ? d.lb[2] * .5 : d.lb[2]) + 'deg');
      if (d.ico) { const c = ICONS[d.ic], sc = port ? .9 : 1; css(d.ico, {left: ip[0] - c.w * K * sc / 2 + 'px', top: ip[1] - c.h * K * sc / 2 + 'px', width: c.w * K * sc + 'px', height: c.h * K * sc + 'px'}); }
      css(d.lbl, {left: lp[0] + 'px', top: lp[1] + 'px', fontSize: lfs + 'px'});
      d.lbl.querySelector('.tip').style.fontSize = Math.max(12, 24 * K) + 'px';
      d.cy = lp[1]; d.cx = lp[0];
      d.cenS = T(d.cen[0], d.cen[1]);
    }
    // thứ tự Tab theo thị giác
    const order = port ? [...D].sort((a, b) => a.cy - b.cy) : [...D].sort((a, b) => { const ra = a.lb[1] / DH * 3 | 0, rb = b.lb[1] / DH * 3 | 0; return ra - rb || a.lb[0] - b.lb[0]; });
    for (const d of order) stage.insertBefore(d.a, leaves);
  }

  /* ---------- hiện màu khi rê / chạm ---------- */
  let current = null;
  function radiusFrom(d, x, y) {
    const b = d.bbox; return Math.max(Math.hypot(x - b[0], y - b[1]), Math.hypot(x - b[2], y - b[1]), Math.hypot(x - b[0], y - b[3]), Math.hypot(x - b[2], y - b[3])) + 6;
  }
  function colorOn(d, x, y) {
    d.a.classList.add('lit-on');
    const lc = d.lc;
    if (d.animA) d.animA.cancel(); if (d.animB) d.animB.cancel();
    lc.style.opacity = 1;
    const R = radiusFrom(d, x, y);
    lc.style.clipPath = 'circle(' + R + 'px at ' + x + 'px ' + y + 'px)';
    if (!RM && lc.animate) d.animA = lc.animate([{clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)'}, {clipPath: 'circle(' + R + 'px at ' + x + 'px ' + y + 'px)'}], {duration: 380, easing: 'ease-out'});
  }
  function colorOff(d) {
    d.a.classList.remove('lit-on');
    const lc = d.lc;
    if (d.animA) d.animA.cancel(); if (d.animB) d.animB.cancel();
    if (RM || !lc.animate) { lc.style.opacity = 0; return; }
    const from = getComputedStyle(lc).opacity;
    lc.style.opacity = 0;
    d.animB = lc.animate([{opacity: from}, {opacity: 0}], {duration: 260, easing: 'ease-out'});
  }
  function setLit(d, v, pt) {
    if (v) {
      if (current && current !== d) setLit(current, false);
      if (current === d) return;
      current = d;
      const c = pt || d.cenS;
      colorOn(d, c[0], c[1]);
    } else {
      if (current === d) current = null;
      colorOff(d);
      if (LADY.tgt === d) { LADY.tgt = null; LADY.lostT = now; }
    }
  }
  const local = e => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  let lastType = 'mouse';
  for (const d of D) {
    const a = d.a;
    a.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { setLit(d, true, local(e)); target(d); } });
    a.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') setLit(d, false); });
    a.addEventListener('pointerdown', e => {
      lastType = e.pointerType;
      if (e.pointerType !== 'mouse') { setLit(d, true, local(e)); target(d); }
    });
    a.addEventListener('focus', () => { setLit(d, true); target(d); });
    a.addEventListener('blur', () => setLit(d, false));
    a.addEventListener('contextmenu', e => { if (matchMedia('(pointer:coarse)').matches) e.preventDefault(); });
    a.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      flyTo(d, () => { location.href = d.href; });
    });
  }
  // chạm ra ngoài viên đá: thu màu (cảm ứng)
  document.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !e.target.closest('.dest') && current) setLit(current, false); });

  /* ---------- Bọ: tư thế, nhìn về viên đá, ngủ, bay ---------- */
  const SECTORS = ['turnR', 'turnR', 'lookup', 'turnL', 'turnL', 'turnL', 'rest', 'turnR'];
  const LADY = {sprite: null, flip: false, tgt: null, cand: null, candT: 0, lostT: -9, sec: null, holdUntil: 0};
  let now = 0, flying = false, sleeping = false, lastAct = 0;
  function showPose(name, flipped) {
    if (name === LADY.sprite && flipped === LADY.flip) return;
    const sw = name !== LADY.sprite;
    LADY.sprite = name; LADY.flip = flipped;
    for (const k in sprites) sprites[k].classList.toggle('on', k === name);
    flip.style.transform = flipped ? 'scaleX(-1)' : 'none';
    lady.className = (lady.className.replace(/\bs-\S+/g, '') + ' s-' + name).trim();
    return sw;
  }
  function setPose(name, flipped, hop) {
    const ch = showPose(name, !!flipped);
    if (ch && !RM && hop !== 0 && bob.animate) bob.animate([{transform: 'translateY(0)'}, {transform: 'translateY(' + (-4 * LK) + 'px)', offset: .4}, {transform: 'translateY(0)'}], {duration: 280, easing: 'ease-out'});
  }
  function hold(name, sec, flipped) { setPose(name, flipped); LADY.holdUntil = now + sec; }
  function target(d) { LADY.tgt = d; }
  function sectorPose(d) {
    const r = lady.getBoundingClientRect(), bx = r.left + r.width * .5, by = r.top + r.height * .6;
    const l = d.lbl.getBoundingClientRect(), tx = l.left + l.width / 2, ty = l.top + l.height / 2;
    const ang = (Math.atan2(by - ty, tx - bx) * 180 / Math.PI + 360) % 360;
    let sec = Math.round(ang / 45) % 8;
    if (LADY.sec != null && LADY.sec !== sec) { const c = LADY.sec * 45, df = Math.abs(((ang - c + 540) % 360) - 180); if (df < 26.5) sec = LADY.sec; }
    LADY.sec = sec; return SECTORS[sec];
  }
  const poseFor = k => k === 'turnR' ? ['point', true] : k === 'turnL' ? ['point', false] : k === 'lookup' ? ['think', false] : ['idle', false];
  const DWELL = .25, REST_DELAY = 1.1, SLEEP_AFTER = 25;
  function ladyUpdate() {
    if (flying || now < LADY.holdUntil) return;
    const t = LADY.tgt && LADY.tgt.a.classList.contains('lit-on') ? sectorPose(LADY.tgt) : null;
    if (t) {
      if (t !== LADY.cand) { LADY.cand = t; LADY.candT = now; }
      if (now - LADY.candT >= DWELL) { const [p, f] = poseFor(t); setPose(p, f); }
      return;
    }
    LADY.cand = null; LADY.sec = null;
    if (now - LADY.lostT < REST_DELAY) return;
    if (!sleeping && now - lastAct > SLEEP_AFTER) sleeping = true;
    setPose(sleeping ? 'sleep' : 'idle', false, 0);
  }
  function interact() {
    if (flying) return;
    lastAct = now;
    if (sleeping) { sleeping = false; hold('surprised', .6); }
  }
  ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(t => addEventListener(t, interact, {passive: true}));
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') interact(); }, {passive: true});
  ladyHit.addEventListener('click', () => { if (flying) return; interact(); hold('happy', 1.2); });

  function flyTo(d, then) {
    if (flying) return;
    if (RM) { then(); return; }
    flying = true; document.body.classList.add('flying');
    setPose('point', false, 0);
    setTimeout(() => {
      showPose('takeoff', false);
      setTimeout(() => {
        showPose('fly', false);
        const r = lady.getBoundingClientRect(), l = d.lbl.getBoundingClientRect();
        const dx = (l.left + l.width / 2) - (r.left + r.width / 2), dy = (l.top + l.height / 2) - (r.top + r.height * .6) - r.height * .1;
        const base = Math.sign(dx) >= 0;
        flip.style.transform = base ? 'scaleX(-1)' : 'none';
        flyEl.animate([{transform: 'translate(0,0) scale(1)'}, {transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 40) + 'px) scale(.85)', offset: .5}, {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.55)'}],
          {duration: 600, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'forwards'});
        veil.animate([{opacity: 0}, {opacity: 1}], {duration: 220, delay: 400, fill: 'forwards'});
        setTimeout(then, 630);
      }, 300);
    }, 450);
  }
  addEventListener('pageshow', e => {
    if (!e.persisted) return;
    flying = false; document.body.classList.remove('flying');
    veil.getAnimations().forEach(a => a.cancel()); flyEl.getAnimations().forEach(a => a.cancel());
    if (current) setLit(current, false);
    lastAct = now; sleeping = false; LADY.holdUntil = 0;
  });

  /* ---------- thanh gợi ý: về trang Bọ + trang kế tiếp ---------- */
  (async () => {
    const nav = $('#np');
    const home = document.createElement('a'); home.className = 'np-home'; home.href = BO_PAGE; home.setAttribute('aria-label', 'Về trang Bọ');
    home.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
    nav.appendChild(home);
    const DEF = {max: 2, pages: [
      {id: 'sitemap', name: 'Bản đồ trang', href: 'sitemap.html', next: ['gioithieu']},
      {id: 'gioithieu', name: 'Giới thiệu', href: 'gioithieu.html', next: ['method', 'roadmap']},
      {id: 'method', name: 'Phương pháp', href: 'method.html', next: ['roadmap', 'lopf1']},
      {id: 'roadmap', name: 'Lộ trình Lớp F2', short: 'Lộ trình', href: 'roadmap.html', next: ['lopf1', 'dangky']},
      {id: 'lopf1', name: 'Lớp F1', href: 'lopf1.html', next: ['khampha', 'dangky']},
      {id: 'khampha', name: 'Khám phá tác phẩm', short: 'Khám phá', href: 'khampha.html', next: ['gallery', 'dangky']},
      {id: 'gallery', name: 'Workshop', short: 'Workshop', href: 'gallery.html', next: ['community', 'dangky']},
      {id: 'community', name: 'Cộng đồng', href: 'community.html', next: ['dangky']},
      {id: 'dangky', name: 'Đăng ký', href: 'dangky.html', next: ['community', 'gioithieu']}
    ]};
    const J = await MemoriContent.load('journey', DEF, {replace: ['pages']});
    const ps = (J && Array.isArray(J.pages)) ? J.pages : DEF.pages;
    const by = id => ps.find(p => p && p.id === id);
    const cur = by('sitemap'), out = [];
    ((cur && cur.next) || []).forEach(x => { const p = by(x); if (p && p.name && MemoriContent.url(p.href, '') && !out.includes(p)) out.push(p); });
    out.slice(0, 2).forEach(pg => {
      const a = document.createElement('a'); a.href = fixHref(MemoriContent.url(pg.href, ''));
      const n = document.createElement('span'); n.textContent = pg.name;
      const r = document.createElement('span'); r.textContent = '→'; r.setAttribute('aria-hidden', 'true');
      a.append(n, r); nav.appendChild(a);
    });
  })();

  /* ---------- vòng lặp nhẹ ---------- */
  let raf = 0; const t0 = performance.now();
  function loop(ts) {
    raf = 0; now = (ts - t0) / 1000; ladyUpdate();
    if (!RM && !flying) {
      const deep = LADY.sprite === 'sleep', f = deep ? .012 : .008, sp = deep ? 1.4 : 1.9;
      lady.style.transform = 'scaleY(' + (1 + (Math.sin(now * sp) * .5 + .5) * f * 2) + ')';
    }
    raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) raf = requestAnimationFrame(loop); });
  addEventListener('resize', layout); addEventListener('orientationchange', layout);
  layout();
  let i = 0;
  for (const d of D) {
    const k = i++;
    if (d.ico) d.ico.style.animationDelay = (RM ? 0 : 1.15 + k * .09) + 's';
    d.lbl.style.animationDelay = (RM ? 0 : 1.55 + k * .09) + 's';
    d.a.classList.add('shown');
  }
  showPose(params.get('state') && POSES.includes(params.get('state')) ? params.get('state') : (RM ? 'idle' : 'wave'), false);
  if (!RM && !params.get('state')) LADY.holdUntil = 2.6;   // vừa vào trang: vẫy 1.5s (sau khi Bọ hiện)
  if (params.get('state')) LADY.holdUntil = 1e9;
  raf = requestAnimationFrame(loop);
  window.BWMAP = {D, T, stage, get K() { return K; }, get port() { return port; }};
})();
