"""Optional visual check. Renders every scene in a real browser and confirms that each purchase
changes the picture. Needs Playwright for Python and a Chromium build:

    pip install playwright && playwright install chromium
    python3 tests/visual-check.py [sheet.png]

If you pass a file name, a contact sheet of every stage with everything owned is saved there.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sheet = sys.argv[1] if len(sys.argv) > 1 else None
read = lambda f: open(os.path.join(ROOT, f), encoding='utf8').read()

PAGE = """<!doctype html><body style="margin:0;background:#000">
<canvas id="cv" width="560" height="350"></canvas><div id="sheet"></div>"""

failures = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 900})
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.set_content(PAGE)
    pg.add_script_tag(content="Math.random=()=>0.5;")
    for m in ['engine','earth','biomes','genome','ecology','species','events','history','life','ascension','people','art','organism','portrait']:
        pg.add_script_tag(content=read('js/%s.js' % m))
    result = pg.evaluate("""() => {
      const cv = document.getElementById('cv'), ctx = cv.getContext('2d', {willReadFrequently: true});
      setCtx(ctx, 560, 350);
      const none = () => ({a:[0,0,0], g:[0,0,0], n:{}, b:{S:0,M:0,C:0,K:0,D:0,X:0}, flash:0});
      const snap = (e, V, o) => { ctx.clearRect(0,0,560,350); drawScene(e, 2.3, o==null?10:o, 0, null, V); return ctx.getImageData(0,0,560,350).data; };
      const diff = (x, y) => { let n = 0; for (let i = 0; i < x.length; i += 4) if (x[i]!==y[i]||x[i+1]!==y[i+1]||x[i+2]!==y[i+2]) n++; return n; };
      const out = [];
      for (let e = 0; e < 13; e++) {
        const base = snap(e, none());
        for (let j = 0; j < 3; j++) { const V = none(); V.a[j] = 1; out.push(['adaptation', ERAS[e].upg[j].n, e, diff(base, snap(e, V))]); }
        for (let i = 0; i < 3; i++) { const V = none(); V.g[i] = 1; out.push(['trait', ERAS[e].gens[i].n, e, diff(base, snap(e, V))]); }
      }
      // tech and civic branches: each branch, with its highest node, at the stage it unlocks
      const ref = snap(5, none());
      for (const kind of ['tech','civ']) for (const br of TREES[kind].branches) {
        const V = none(); V.b[br.id] = 3; V.n[br.id + '3' + (br.tiers[3].length>1?'a':'')] = 1;
        out.push(['branch', kind + ' ' + br.name, 5, diff(ref, snap(5, V))]);
      }
      return out;
    }""")
    for kind, name, era, n in result:
        status = 'ok   ' if n >= 60 else 'FAIL '
        if n < 60: failures.append((kind, name, era, n))
        print(f"{status} {kind:<11} stage {era+1:>2}  {name:<28} {n:>6} pixels change")
    if sheet:
        pg.evaluate("""() => {
          const box = document.getElementById('sheet'); box.style.cssText = 'display:grid;grid-template-columns:repeat(3,400px);gap:4px;padding:4px';
          const all = () => { const V = {a:[1,1,1], g:[8,8,8], n:{}, b:{S:3,M:3,C:3,K:3,D:3,X:3}, flash:0}; for (const k of ['tech','civ']) for (const id in NODES[k]) V.n[id] = 1; return V; };
          for (let e = 0; e < 13; e++) {
            const c2 = document.createElement('canvas'); c2.width = 400; c2.height = 250; c2.style.width='400px'; box.append(c2);
            setCtx(c2.getContext('2d'), 400, 250); drawScene(e, 2.3, 30, 0, 'thinker', all());
          }
        }""")
        pg.screenshot(path=sheet, full_page=True)
        print('contact sheet:', sheet)
    b.close()

if errors: print('page errors:', errors)
print('\n%d purchase(s) with no visible effect' % len(failures) if failures else '\nEvery purchase changes the picture')
sys.exit(1 if failures or errors else 0)
