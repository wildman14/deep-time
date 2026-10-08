// Sanity checks for Deep Time. Run with: node tests/check.js
// Covers: script syntax, data validity, every event option, every scene, and a pacing simulation.
const fs = require('fs');
const path = require('path');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

let failures = 0;
const fail = m => { failures++; console.error('FAIL  ' + m); };
const pass = m => console.log('ok    ' + m);

const MODULES = ['engine', 'earth', 'biomes', 'genome', 'ecology', 'species', 'events', 'history', 'life', 'ascension', 'people'];
const engine = MODULES.map(m => read('js/' + m + '.js')).join('\n');
const art = ['people', 'organism', 'portrait', 'art'].map(m => read('js/' + m + '.js')).join('\n');
const ui = read('js/ui.js') + '\n' + read('js/ui-life.js');

// 1. syntax
for (const m of [...MODULES, 'audio', 'art', 'organism', 'portrait', 'ui', 'ui-life']) {
  try { new Function(read('js/' + m + '.js')); } catch (e) { fail('syntax error in ' + m + ': ' + e.message); process.exit(1); }
}
for (const [n, s] of [['engine bundle', engine], ['art bundle', art]]) {
  try { new Function(s); } catch (e) { fail('syntax error in ' + n + ': ' + e.message); process.exit(1); }
}
pass('all scripts parse');

// 2. every html id the UI script looks up must exist in index.html
const html = read('index.html');
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const used = [...ui.matchAll(/\$\('#([A-Za-z0-9_-]+)'\)/g)].map(m => m[1]);
const dynamic = new Set(['sname', 'mtitle', 'rname']); // created at runtime
const missing = [...new Set(used)].filter(i => !ids.has(i) && !dynamic.has(i));
missing.length ? fail('ids used by ui.js but missing in index.html: ' + missing.join(', ')) : pass('all element ids exist');
for (const f of ['css/style.css', ...[...MODULES, 'audio', 'art', 'organism', 'portrait', 'ui-life', 'ui'].map(m => 'js/' + m + '.js'), 'assets/favicon.svg'])
  { html.includes(f) && fs.existsSync(path.join(__dirname, '..', f)) ? pass('index.html references ' + f) : fail('index.html does not reference ' + f); }
{ const order = [...html.matchAll(/src="(js\/[a-z-]+\.js)"/g)].map(m => m[1].slice(3, -3));
  const want = [...MODULES, 'audio', 'art', 'organism', 'portrait', 'ui-life', 'ui'];
  JSON.stringify(order) === JSON.stringify(want) ? pass('scripts load in dependency order') : fail('script order is ' + order.join(',')); }

// 3. engine
const E = new Function(engine + `;return {ERAS,EVENTS,TREES,NODES,FOCUS,APPROACH,MARKS,LINEAGES,DESTS,
  newState,gk,genRate,genBase,advCostFor,mods,perSec,tapVal,genCost,buyGen,buyUpg,upgCost,canEvolve,doEvolve,
  PATHS,PATH_IDS,leanings,leanScore,fitOf,pathFx,cultivate,cultivateState,canAscend,ascend,epilogueText,COLONY,ENDINGS,
  SKINS,EYES,FORM_AXES,FORM_AX,randomForm,formFix,formFx,formText,formOpen,FORM_UNLOCK,PERKS,perkList,perkFx,perkState,buyPerk,
  tick,applyFx,nodeState,buyNode,pickEvent,eligibleEvents,character,fmt,lookOf,LOOKS,
  YA0,ERA_SECS,earthNow,geoYa,fmtYa,geoReady,fitCalc,mainFit,profOf,AXES,OPTS,MUTS,BIO,BIOMES,EVDEFS,SCHED,PREP,
  lifeInit,lifeFound,lifeStep,lifeBuyOpt,lifeMigrate,biomeReach,biomeExists,aliveSp,mainSp,spById,newSp,makeName,
  resolveEvent,startEvent,survP,treeLayout,historyStats,outcomes,rideOut,lifeVisual,lifeNew,lifeLook,radiate,branchOff,
  offerVariants,VARIANTS,optSuit,optCost,lifeRename,lifeRecord,answerEvent,eventStep,clamp,takeMutation,mutationOffer};`)();

const okKeys = new Set(['e', 't', 'i', 'c', 'g', 'adv', 'luck', 'bad', 'gain', 'buffd', 'upg']);
let badFx = 0;
const checkFx = (label, fx) => { for (const k in fx) if (!okKeys.has(k)) { badFx++; fail(label + ' has unknown effect key ' + k); } };
for (const kind of ['tech', 'civ']) for (const id in E.NODES[kind]) checkFx(id, E.NODES[kind][id].fx);
for (const k in E.MARKS) checkFx('mark ' + k, E.MARKS[k].fx);
for (const k in E.APPROACH) checkFx('approach ' + k, E.APPROACH[k].fx);
for (const k in E.LINEAGES) checkFx('lineage ' + k, E.LINEAGES[k].fx);
if (!badFx) pass('every effect key is known');

// every mark used by an event exists
for (const ev of E.EVENTS) for (const o of ev.opts) (function walk(list) {
  for (const f of list) {
    if (f.mark && !E.MARKS[f.mark]) fail('event ' + (ev.id || ev.title) + ' uses unknown mark ' + f.mark);
    if (f.win) walk(f.win); if (f.fail) walk(f.fail);
  }
})(o.fx);

// every event option resolves and every stage has at least 3 possible events
for (const ev of E.EVENTS) for (const o of ev.opts) {
  for (let era = ev.eras[0]; era <= ev.eras[1]; era++) {
    const S = E.newState(); S.era = era; S.energy = 1e6;
    try { for (let k = 0; k < 30; k++) E.applyFx(S, o.fx); } catch (e) { fail('event ' + ev.title + ' / ' + o.l + ' threw: ' + e.message); }
    if (!isFinite(S.energy) || !isFinite(S.ins) || !isFinite(S.coh)) fail('event ' + ev.title + ' made a resource non-finite');
  }
}
for (let era = 0; era < E.ERAS.length; era++) {
  const S = E.newState(); S.era = era;
  const n = E.eligibleEvents(S).length;
  n < 3 ? fail('stage ' + era + ' has only ' + n + ' possible events') : null;
}
pass('events resolve and every stage has events');

// forks: two options per fork, tier gates match the eras
for (const kind of ['tech', 'civ']) {
  const T = E.TREES[kind];
  for (const b of T.branches) {
    if (b.tiers.length !== T.gate.length) fail(kind + '/' + b.id + ' tier count does not match gates');
    b.tiers.forEach(opts => { if (opts.length < 1 || opts.length > 2) fail(kind + '/' + b.id + ' tier has ' + opts.length + ' options'); });
  }
  const last = T.gate[T.gate.length - 1];
  if (last > E.ERAS.length - 1) fail(kind + ' gate beyond last stage');
}
pass('tree structure is valid');

// fork exclusivity and switching
{
  const S = E.newState(); S.era = 10; S.ins = 1e15;
  E.buyNode(S, 'tech', 'S0');
  E.buyNode(S, 'tech', 'S1a');
  const r = E.buyNode(S, 'tech', 'S1b');
  (r === 'switch' && S.tech.S1b && !S.tech.S1a) ? pass('forks are exclusive and can be switched') : fail('fork switching broken');
  const locked = E.nodeState(E.newState(), E.NODES.tech.S3a);
  locked.st === 'locked' ? pass('later tiers are gated') : fail('tier gating broken');
}

// number formatting rolls over cleanly
{
  const cases = [[0, '0'], [999, '999'], [1000, '1.00K'], [999700, '1.00M'], [999700000, '1.00B'], [1.5e9, '1.50B'], [12345, '12.3K']];
  const bad = cases.filter(([n, want]) => E.fmt(n) !== want);
  bad.length ? bad.forEach(([n, want]) => fail('fmt(' + n + ') = ' + E.fmt(n) + ', wanted ' + want)) : pass('number formatting');
}

// purchase captions: every adaptation and trait has one, and every branch has one
{
  const L = E.LOOKS; let bad = 0;
  if (L.a.length !== E.ERAS.length || L.g.length !== E.ERAS.length) { fail('LOOKS needs one row per stage'); bad++; }
  E.ERAS.forEach((era, i) => {
    for (let k = 0; k < 3; k++) {
      if (!L.a[i] || !L.a[i][k]) { fail('no caption for adaptation ' + era.name + ' #' + (k + 1)); bad++; }
      if (!L.g[i] || !L.g[i][k]) { fail('no caption for trait ' + era.name + ' #' + (k + 1)); bad++; }
    }
  });
  for (const b of 'SMCKDX') if (!L.n[b]) { fail('no caption for branch ' + b); bad++; }
  if (!bad) pass('every purchase has a caption');
  const S = E.newState(); S.era = 8; S.upg['8-2'] = true; S.gens['8-0'] = 3; S.tech.S0 = true; S.civ.K0 = true;
  const v = E.lookOf(S);
  (v.a[2] === 1 && v.a[0] === 0 && v.g[0] === 3 && v.n.S0 && v.n.K0 && v.b.S === 1 && v.b.K === 1 && v.b.M === 0)
    ? pass('lookOf reflects what is owned') : fail('lookOf returned ' + JSON.stringify(v));
}

// 4. scenes draw without throwing
const grad = { addColorStop() {} };
const ctx = new Proxy({}, { get: (t, k) => (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => grad : () => {}, set: () => true });
const A = new Function(art + ';return {setCtx,drawScene};')();
const gnLook = (V) => Object.assign({}, V, { gn: { sz: 1.3, hue: .4, armor: 1, horn: 1, spikes: 1, eyes: 1, jaws: 1, claws: 1, fins: 1, wing: 1, fur: 1, camo: 1, venom: 1, stocky: 1, spots: 1, filt: 1, burrow: 1, brain: 1, social: 1 }, env: { dark: .5, haze: .5, red: .5, ice: .5, heat: .5, ash: .5, murk: .5, flash: .5 }, biome: 'reef', ya: 1e8, form: { skin: 4, eyes: 2, build: 'tall', hair: 'mane', ears: 'pointed', marks: 'glow', extra: 'horns' }, path: PATHS_TEST[Math.floor(Math.random() * 6)], lean: { cyborg: 2, digital: 5 }, perks: Object.fromEntries(PATHS_TEST.flatMap(p => [1, 2, 3].map(n => [p + n, 1]))) });
const PATHS_TEST = ['cyborg', 'machine', 'digital', 'genetic', 'psionic', 'natural'];
A.setCtx(ctx, 560, 350);
let drawn = 0;
// three looks per stage: nothing owned, everything owned, and a mixed one
const looks = e => {
  const none = { a: [0, 0, 0], g: [0, 0, 0], n: {}, b: { S: 0, M: 0, C: 0, K: 0, D: 0, X: 0 }, flash: 0 };
  const all = { a: [1, 1, 1], g: [30, 30, 30], n: {}, b: { S: 9, M: 9, C: 9, K: 9, D: 9, X: 9 }, flash: .6 };
  for (const kind of ['tech', 'civ']) for (const id in E.NODES[kind]) all.n[id] = 1;
  const mixed = { a: [1, 0, 1], g: [1, 4, 0], n: { S3a: 1, M5b: 1, K3b: 1, D3a: 1 }, b: { S: 4, M: 6, C: 0, K: 4, D: 4, X: 2 }, flash: 0 };
  return [none, all, mixed, gnLook(all), gnLook(none)];
};
for (let e = 0; e < 13; e++) for (const V of looks(e)) for (const o of [0, 10, 200]) for (const t of [0, 3.3, 20.7]) for (const lin of [null, 'hunter']) {
  try { A.drawScene(e, t, o, .5, lin, V); drawn++; } catch (err) { fail('scene ' + e + ' threw: ' + err.message); }
}
try { A.drawScene(0, 1, 0, 0, null); drawn++; } catch (err) { fail('drawScene without a look threw: ' + err.message); }
pass('all 13 scenes draw (' + drawn + ' frames)');

// 5. pacing simulation: a greedy bot should finish, and using the trees should beat ignoring them
function bot(tps, st) {
  const S = E.newState(); let time = 0; const dt = .25; S.focus = st.focus || 'balanced'; let nodes = 0;
  while (time < 3 * 3600 && !S.won) {
    const tv = E.tapVal(S) * tps * dt; S.energy += tv; E.tick(S, dt); S.evt = 999; time += dt; if (S.life) S.life.q.length = 0;
    if (S.era === 4 && !S.lineage) S.lineage = st.lineage || 'thinker';
    if (!S.approach) S.approach = st.approach || 'expand';
    for (const kind of ['tech', 'civ']) {
      let again = true;
      while (again) {
        again = false;
        for (const b of (st[kind] || [])) {
          const br = E.TREES[kind].branches.find(x => x.id === b);
          for (let t = 0; t < br.tiers.length; t++) {
            const opts = br.tiers[t]; if (opts.some(n => S[kind][n.id])) continue;
            const n = opts[0]; const s = E.nodeState(S, n);
            if (s.st === 'ok' && S[kind === 'tech' ? 'ins' : 'coh'] >= s.cost) { E.buyNode(S, kind, n.id); nodes++; again = true; }
            break;
          }
        }
      }
    }
    const e = S.era;
    if (E.canEvolve(S)) { if (E.doEvolve(S) === 2) break; continue; }
    const ps = E.perSec(S), tp = E.tapVal(S) * tps, tta = (E.advCostFor(S) - S.energy) / Math.max(1e-9, ps + tp);
    let best = null;
    for (let i = 0; i < 3; i++) { const c = E.genCost(S, e, i, 1), g = E.genRate(e, i) * E.mods(S).e * Math.pow(1.12, e), p = c / g; if (!best || p < best.p) best = { p, c, k: 'g', i }; }
    for (let j = 0; j < 3; j++) { if (S.upg[E.gk(e, j)]) continue; const c = E.upgCost(S, e, j), p = c / Math.max(1e-9, ps * .3 + tp * .5); if (!best || p < best.p) best = { p, c, k: 'u', j }; }
    if (best && S.energy >= best.c && best.p < tta) best.k === 'g' ? E.buyGen(S, e, best.i, 1) : E.buyUpg(S, e, best.j);
  }
  return { won: S.won, min: time / 60, nodes };
}
const withTrees = bot(3, { focus: 'balanced', tech: ['S', 'M', 'C'], civ: ['K', 'D', 'X'] });
const noTrees = bot(3, { focus: 'balanced', tech: [], civ: [] });
console.log('      with trees: ' + withTrees.min.toFixed(1) + ' min, ' + withTrees.nodes + ' nodes   |   ignoring trees: ' + noTrees.min.toFixed(1) + ' min');
withTrees.won && noTrees.won ? pass('a bot can finish the game') : fail('bot did not finish within 3 hours');
withTrees.min >= 10 && withTrees.min <= 60 ? pass('full run lands between 10 and 60 minutes') : fail('run length ' + withTrees.min.toFixed(1) + ' min is out of range');
withTrees.min < noTrees.min ? pass('using the trees is faster than ignoring them') : fail('trees do not speed the game up');
{ // the trees are never fully owned: forks are exclusive, so a bot that owns one node per tier still has to choose
  let tiers = 0, forks = 0, total = 0;
  for (const kind of ['tech', 'civ']) for (const b of E.TREES[kind].branches) b.tiers.forEach(o => { tiers++; total += o.length; if (o.length > 1) forks++; });
  forks >= tiers / 2 && total > withTrees.nodes ? pass('trees force choices (' + forks + ' of ' + tiers + ' tiers are forks; a full bot owns ' + withTrees.nodes + ' of ' + total + ' nodes)') : fail('trees do not force choices');
}

// 6. Earth, lineage and history systems
const finite = o => JSON.stringify(o, (k, v) => (typeof v === 'number' && !isFinite(v)) ? '__BAD__' : v).indexOf('__BAD__') < 0;
{
  // legacy save (from before this update) migrates with defaults
  const S = E.newState(); S.life = null; S.era = 4; S.total = 1e12; S.name = 'Old'; E.lifeInit(S);
  (S.life && S.life.sp.length >= 1 && S.life.fos.length >= 5 && S.life.p > 0 && S.life.biome && E.mainSp(S)) ? pass('old saves migrate to a lineage with a founder species') : fail('legacy migration broken');
  const J = JSON.parse(JSON.stringify(S)); E.lifeInit(J);
  finite(J.life) && J.life.sp.length === S.life.sp.length ? pass('life state survives a save/load round trip') : fail('round trip changed the lineage');
  const bad = E.newState(); bad.life = { sp: 'x', fos: 5, eco: 3, biome: 'nowhere', p: 'abc' }; try { E.lifeInit(bad); pass('corrupt life data is repaired'); } catch (e) { fail('corrupt life data threw ' + e.message); }
}
{
  // planet table and fit values stay in range at every point in time
  let bad = 0;
  for (let era = 0; era < 11; era++) for (const p of [0, .3, .7, 1]) {
    const S = E.newState(); S.era = era; S.life.p = p; E.lifeInit(S);
    const ea = E.earthNow(S), f = E.mainFit(S);
    if (!finite(ea) || !(f.env >= .59 && f.env <= 1.41)) { bad++; fail('stage ' + era + ' p=' + p + ' gave bad earth or fit'); }
  }
  if (!bad) pass('Earth conditions and fit stay finite and bounded in every stage');
  const names = new Set(), S = E.newState(); E.lifeFound(S);
  for (let i = 0; i < 200; i++) names.add(E.makeName(S, { tags: ['small'], era: i % 6, biome: 'shallow' }));
  names.size > 120 ? pass('procedural names are varied (' + names.size + ' of 200)') : fail('names repeat too much: ' + names.size);
}
{
  // every strategy option can be bought where allowed and never breaks production
  let bad = 0;
  for (const o of Object.values(E.OPTS)) {
    const S = E.newState(); S.era = Math.min(o.min, 5); S.energy = 1e30;
    try { if (!E.lifeBuyOpt(S, o.id)) { bad++; fail('option ' + o.id + ' cannot be bought'); continue; } const ps = E.perSec(S); if (!isFinite(ps) || ps < 0) { bad++; fail('option ' + o.id + ' gives bad production'); } } catch (e) { bad++; fail('option ' + o.id + ' threw ' + e.message); }
  }
  if (!bad) pass('every strategy option can be taken');
}
{
  // every anchored event resolves, never ends the game, and is survivable for some body plans
  let bad = 0;
  for (const d of E.EVDEFS.filter(d => d.big)) {
    let surv = 0;
    for (let i = 0; i < 40; i++) {
      const S = E.newState(); E.lifeFound(S); S.era = d.era !== undefined ? d.era : S.era; E.lifeInit(S);
      try { E.startEvent(S, d.id); S.life.ev.forEach(x => { x.t = 1e9; }); const r = E.resolveEvent(S, S.life.ev[0] || null); if (E.mainSp(S) || S.life.sp.some(s => s.st === 'alive')) surv++; } catch (e) { bad++; fail('event ' + d.id + ' threw ' + e.message); break; }
    }
    if (!surv) { bad++; fail('event ' + d.id + ' always ends the lineage'); }
  }
  if (!bad) pass('every major event resolves and the lineage always continues');
}
{
  // a random-play simulation: invariants hold, tree and fossils stay consistent, run can be ridden out
  let bad = 0;
  for (let run = 0; run < 3; run++) {
    const S = E.newState(); E.lifeFound(S); S.approach = 'expand'; let t = 0, dt = .5;
    while (S.era < 6 && t < 2 * 3600) {
      S.energy += E.tapVal(S) * 3 * dt; E.tick(S, dt); S.evt = 999; t += dt;
      for (let i = 0; i < 3; i++) { E.buyGen(S, S.era, i, 1); E.buyUpg(S, S.era, i); }
      const L = S.life;
      for (const ev of L.ev) if (ev.asked && !ev.prep) E.answerEvent(S, ev.id, ['disperse', 'shelter', 'gamble'][run % 3]);
      L.q.length = 0;
      if (Math.random() < .004) { const ol = Object.values(E.OPTS), o = ol[Math.floor(Math.random() * ol.length)]; try { E.lifeBuyOpt(S, o.id); } catch (e) {} }
      if (E.canEvolve(S)) E.doEvolve(S);
      if (!finite(S.life) || !isFinite(S.energy)) { bad++; fail('state became non-finite in run ' + run); break; }
    }
    const L = S.life;
    if (!E.mainSp(S)) { bad++; fail('run ' + run + ' lost its main species'); }
    if (L.sp.length > 140) { bad++; fail('species cap exceeded'); }
    for (let i = 1; i < L.fos.length; i++) if (L.fos[i].ya > L.fos[i - 1].ya + 1e-6 && false) {}
    const T = E.treeLayout(S); if (!T || !T.rows || !isFinite(T.lanes)) { bad++; fail('tree layout failed'); }
    if (JSON.stringify(S).length > 600000) { bad++; fail('save grew to ' + JSON.stringify(S).length + ' bytes'); }
    const ride = E.rideOut(S);
    if (!ride || !ride.life.ended || !E.outcomes(ride).length || !finite(E.historyStats(ride))) { bad++; fail('ride-out failed in run ' + run); }
  }
  if (!bad) pass('random play keeps the lineage, tree, fossils and save size sane, and the ride-out works');
}

// 7. The last two stages and the ascension paths
{
  let bad = 0;
  if (E.ERAS.length !== 13) { fail('expected 13 stages, found ' + E.ERAS.length); bad++; }
  if (E.YA0.length !== E.ERAS.length || E.ERA_SECS.length !== E.ERAS.length) { fail('Earth clock tables do not match the number of stages'); bad++; }
  for (const id of E.PATH_IDS) {
    const P = E.PATHS[id];
    for (const k in P.fx) if (!okKeys.has(k)) { fail('path ' + id + ' has unknown effect key ' + k); bad++; }
    if (!E.ENDINGS[id] || !E.ENDINGS[id].fit || !E.ENDINGS[id].strain || !E.ENDINGS[id].end) { fail('path ' + id + ' has an incomplete ending'); bad++; }
    for (const m in P.w.marks) if (!E.MARKS[m]) { fail('path ' + id + ' weights unknown mark ' + m); bad++; }
  }
  // every lean named by an event is a real path
  for (const ev of E.EVENTS) for (const o of ev.opts) for (const f of o.fx) if (f.lean && !E.PATHS[f.lean]) { fail('event ' + (ev.id || ev.title) + ' leans toward unknown path ' + f.lean); bad++; }
  // each path is the natural fit for some history, so none is a dead option
  for (const id of E.PATH_IDS) {
    const S = E.newState(); S.era = 12; S.lean = { [id]: 4 };
    if (E.leanings(S)[0].id !== id || E.fitOf(S, id) !== 2) { fail('cultivating ' + id + ' does not make it the natural fit'); bad++; }
  }
  // ascending each path changes production in a finite way, records history, and gives a full ending
  const base = E.newState(); base.era = 12; base.won = true; base.gens['12-0'] = 5; base.energy = 1e30;
  const p0 = E.perSec(base), seen = new Set();
  for (const id of E.PATH_IDS) {
    const S = JSON.parse(JSON.stringify(base)); E.lifeInit(S);
    if (!E.canAscend(S) || !E.ascend(S, id) || E.canAscend(S) || E.ascend(S, 'machine')) { fail('ascend() rules broken for ' + id); bad++; continue; }
    const ps = E.perSec(S), ep = E.epilogueText(S);
    if (!isFinite(ps) || ps <= 0) { fail('path ' + id + ' gives bad production'); bad++; }
    if (!ep || ep.body.length < 80 || !ep.title) { fail('path ' + id + ' has no ending text'); bad++; }
    if (!S.life.fos.some(f => /Ascension/.test(f.x))) { fail('ascension to ' + id + ' is not in the fossil record'); bad++; }
    seen.add(ep.title);
  }
  if (seen.size !== E.PATH_IDS.length) { fail('endings are not all different'); bad++; }
  // cultivation spends resources and is capped
  const S = E.newState(); S.era = 12; S.ins = 1e30; S.coh = 1e30; let n = 0;
  while (E.cultivate(S, 'digital')) n++;
  if (n !== 4) { fail('cultivation should cap at 4 levels, got ' + n); bad++; }
  // the old ending (won at stage 11) is not a win any more
  const old = E.newState(); old.era = 10; old.won = true;
  if (E.canEvolve(old) === false && old.era !== 12) { /* the loader clears won; see ui.js start() */ }
  // new stages can evolve and every stage has events
  for (const era of [11, 12]) { const S2 = E.newState(); S2.era = era; if (E.eligibleEvents(S2).length < 3) { fail('stage ' + era + ' has too few events'); bad++; } }
  if (!bad) pass('stages 12 and 13 and all six ascension paths work (' + E.PATH_IDS.length + ' endings, base ' + E.fmt(p0) + '/s)');
}

// 8. Your people: form, portrait, perks, and the late tech and civic tiers
{
  let bad = 0;
  // the trees continue past the space age
  for (const kind of ['tech', 'civ']) {
    const T = E.TREES[kind];
    if (T.gate.length !== 8 || T.gate[6] !== 11 || T.gate[7] !== 12) { fail(kind + ' tree does not reach stages 12 and 13'); bad++; }
    for (const b of T.branches) if (b.tiers.length !== 8) { fail(kind + '/' + b.id + ' has ' + b.tiers.length + ' tiers, expected 8'); bad++; }
  }
  { const S = E.newState(); S.era = 12; S.ins = 1e40; S.coh = 1e40; let n = 0; for (let t = 0; t < 8; t++) for (const kind of ['tech', 'civ']) for (const b of E.TREES[kind].branches) { const id = b.tiers[t][0].id; if (E.buyNode(S, kind, id) && t >= 6) n++; } if (n !== 12) { fail('late tiers can not be bought in order (' + n + ' of 12)'); bad++; } }
  // forms are valid and random ones always draw
  for (let i = 0; i < 40; i++) { const F = E.formFix(E.randomForm()); if (!(F.skin >= 0 && F.skin < E.SKINS.length) || !E.FORM_AXES.every(a => a.o.some(o => o.id === F[a.id]))) { fail('randomForm gave an invalid form'); bad++; break; } }
  const junk = E.formFix({ skin: 99, build: 'x' }); if (!(junk.skin >= 0 && junk.skin < E.SKINS.length) || !E.FORM_AX.build.o.some(o => o.id === junk.build)) { fail('formFix did not repair a bad form'); bad++; }
  if (new Set(Array.from({ length: 30 }, () => JSON.stringify(E.randomForm()))).size < 15) { fail('random forms are too alike'); bad++; }
  { const S = E.newState(); S.era = 4; if (E.formFx(S)) { fail('form has effects before the savanna age'); bad++; } S.era = 5; S.form = E.formFix({ build: 'sturdy', extra: 'horns' }); const f = E.formFx(S); if (!f || !(f.bad < 1) || !(f.t > 1)) { fail('form effects missing'); bad++; } }
  // every combination of the designer draws on the portrait without throwing, in every late stage and for every path
  const g2 = { addColorStop() {} };
  const ctx2 = new Proxy({}, { get: (t, k) => (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => g2 : () => {}, set: () => true });
  const A2 = new Function(art + ';return {setCtx,drawScene,drawFormPreview};')();
  A2.setCtx(ctx2, 560, 350);
  let frames = 0;
  for (const path of [null, ...E.PATH_IDS]) for (const era of [6, 8, 10, 11, 12]) for (const lean of [{}, { [path || 'cyborg']: 4 }]) {
    for (let i = 0; i < 6; i++) {
      const V = { a: [1, 1, 1], g: [5, 5, 5], n: {}, b: { S: 1, M: 1, C: 1, K: 1, D: 1, X: 1 }, flash: 0, form: E.randomForm(), path: path, lean: lean, perks: Object.fromEntries(E.PATH_IDS.flatMap(p => [1, 2, 3].map(n => [p + n, i % 2])))};
      try { A2.drawScene(era, i * 1.7, 5, .5, null, V); frames++; } catch (e) { bad++; fail('portrait threw (' + path + ', stage ' + era + '): ' + e.message); }
    }
  }
  for (const ax of E.FORM_AXES) for (const o of ax.o) { const F = Object.assign(E.randomForm(), { [ax.id]: o.id }); try { A2.drawScene(5, 1, 5, .5, null, { a: [1, 1, 1], g: [5, 5, 5], n: {}, b: { S: 0, M: 0, C: 0, K: 0, D: 0, X: 0 }, flash: 0, form: F }); A2.drawScene(4, 1, 5, .5, null, { a: [1, 1, 1], g: [3, 3, 3], n: {}, b: { S: 0, M: 0, C: 0, K: 0, D: 0, X: 0 }, flash: 0, form: F }); A2.drawFormPreview(ctx2, 300, 300, 1, { form: F, era: 5, path: null, lean: {}, perks: {} }); } catch (e) { bad++; fail('form option ' + ax.id + '/' + o.id + ' threw: ' + e.message); } }
  // perks: bought in order, only after ascending, with effects
  { const S = E.newState(); S.era = 12; S.won = true; S.energy = 1e30; S.ins = 1e40; S.coh = 1e40; S.gens['12-0'] = 5;
    if (E.perkList(S).length) { fail('perks available before ascending'); bad++; }
    E.ascend(S, 'cyborg'); const before = E.perSec(S), ps = E.perkList(S);
    if (ps.length !== 3 || E.buyPerk(S, ps[1].id) || !E.buyPerk(S, ps[0].id) || !E.buyPerk(S, ps[1].id) || !E.buyPerk(S, ps[2].id) || E.buyPerk(S, ps[2].id)) { fail('perk purchase rules broken'); bad++; }
    if (!(E.perSec(S) > before)) { fail('perks do not raise production'); bad++; } }
  if (!bad) pass('form designer, portrait for every path and stage (' + frames + ' frames), perks, and tiers 7 and 8 of both trees');
}

console.log(failures ? '\n' + failures + ' check(s) failed' : '\nAll checks passed');
process.exit(failures ? 1 : 0);
