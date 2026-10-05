# Deep Time

An evolution game that runs in the browser. You start as a single cell in a young sea and carry your lineage through eleven stages, from fish and shore-dwellers to villages, kingdoms, factories and finally a ship that leaves orbit.

It is a plain static site: HTML, CSS and JavaScript with no build step and no dependencies.

**Play it:** `https://YOUR-USERNAME.github.io/YOUR-REPO/` (see [Publishing](#publishing-on-github-pages) below)

## How it plays

- **Tap** to gather, and spend what you gather on **traits** that produce on their own.
- **Focus** sets where your effort goes: Grow (production), Learn (insight), Society (cohesion) or Balanced. Change it at any time.
- **Approach** is a per-stage choice made each time you evolve: Expand, Endure or Explore.
- **Tech tree** (spend insight) and **civic tree** (spend cohesion) each have three branches and six tiers. Half the tiers are forks where you pick one of two options. You can switch a fork later for a fee, but you cannot afford everything, and each node you own makes the next one dearer.
- **Decisions** appear along the way (a rival band at your water hole, a heretic scholar, a strange signal). Your answers add lasting marks to your people, such as Merciful, Ruthless or Curious, and those change your numbers.
- **Your choices show in the world.** Every adaptation and trait changes the picture of your creature or civilization, and the Chronicle tab records what appeared: a sticky membrane on the cell, gills and teeth on the fish, spears and speech bubbles for the band, lit windows and street lamps once you buy Electric Light. Each tech and civic branch adds its own glow to the scene as you invest in it.
- At stage 5 you pick a **lineage**: Apex Hunter, Social Herd or Curious Thinker.
- At the end you choose where the Ark goes, and the epilogue describes the people you became.

A full run takes about 20 to 40 minutes. Progress saves in the browser (`localStorage`), and you earn some production while the tab is closed.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publishing on GitHub Pages

The repo includes a workflow that runs the checks and deploys the site on every push to `main`.

1. Create a repository on GitHub and push this folder to it (default branch `main`).
2. In the repository go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main`. The **Deploy to GitHub Pages** workflow runs, and the URL appears on the Pages settings page and in the workflow summary.

If you would rather not use Actions, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`. The site works from the repo root as it is; the `.nojekyll` file stops GitHub from processing it.

Everything uses relative paths, so it works both at `username.github.io/repo/` and on a custom domain.

## Project layout

```
index.html        page markup and meta tags
css/style.css     all styling; the palette re-tints per stage
js/engine.js      game data (stages, trees, events) and rules, no DOM access
js/art.js         one canvas scene per stage, drawn from what you own
js/ui.js          interface, save and load, main loop
assets/           favicon
tests/check.js    sanity checks and a pacing simulation
tests/visual-check.py   optional browser check that every purchase changes the picture
.github/workflows/pages.yml   test and deploy
```

The scripts are plain classic scripts loaded in order (`engine`, `art`, `ui`) and share one global scope.

## Changing the game

Most content is data in `js/engine.js`:

- **Stages:** the `ERAS` array. Each stage has a name, colors (`h`, `ah`, `s`), three traits and three adaptations. Evolution costs are the `adv` list just below it.
- **Trees:** `TREES.tech` and `TREES.civ`. A tier with one entry is a fixed step, a tier with two entries is a fork. An entry is `[name, description, effects]`.
- **Effects** use short keys: `e` production, `t` tap, `i` insight, `c` cohesion, `g` trait cost, `adv` evolution cost, `bad` event losses, `gain` event gains, `luck` gamble odds, `buffd` buff duration, `upg` adaptation cost.
- **Events:** the `EVENTS` array. Give an event an `id` and `once: true` to make it a one-time decision, and `need: ['civ','X3a']` to require a tree node.
- **What a purchase looks like:** `LOOKS` in `js/engine.js` holds the captions, and each `sN` function in `js/art.js` draws its stage from the `V` object that `lookOf()` builds (`V.a` adaptations, `V.g` trait counts, `V.n` and `V.b` tree nodes and branch totals).
- **Character marks** are in `MARKS`; an event option adds one with `{mark:'merciful'}`.

After editing, run the checks.

## Tests

```sh
node tests/check.js
```

This needs only Node 18 or newer. It parses the scripts, checks that every element id used by the UI exists, validates all effect keys and event options, draws every scene against a mock canvas, and simulates a bot playing through to confirm the game finishes in a sensible time and that the trees help without being buyable in full.

### Visual check (optional)

`tests/visual-check.py` renders every scene in a real browser and confirms that each adaptation, trait and tree branch changes the picture. It can also save a contact sheet of all eleven stages. It needs Playwright:

```sh
pip install playwright && playwright install chromium
python3 tests/visual-check.py sheet.png
```

## Notes

- Fonts (Instrument Serif, Instrument Sans, DM Mono) load from Google Fonts. If they are blocked the page falls back to system fonts. To avoid the third-party request, download the fonts into `assets/fonts/` and replace the `<link>` in `index.html` with `@font-face` rules.
- Saves are per browser and per site address. **Start over** in the footer erases yours.

## License

MIT. See [LICENSE](LICENSE).
