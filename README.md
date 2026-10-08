# Deep Time

An evolution game that runs in the browser. You start as a single cell in a young sea and carry your lineage through thirteen stages, from fish and shore-dwellers to villages, kingdoms, factories and finally a ship that leaves orbit.

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
- At the end you ascend and choose what your people become (see below), and the epilogue describes them.

A full run takes about 20 to 40 minutes. Progress saves in the browser (`localStorage`), and you earn some production while the tab is closed.

## The living Earth (v2)

The game now runs on a geological clock. Each stage is a slice of real history (3.8 billion years ago to the present, shown under the stage name), and you cannot skip past a major event: an epoch has to *mature* before you can evolve out of it.

- **Earth bar and World tab:** temperature, oxygen, CO₂, sea level, volcanism, vegetation, ocean conditions and food supply change over time and through events. They change how well your body plan fits (production) and how your branches fare.
- **Events with warning:** flood volcanism, ice ages, warming, oxygen rises and crashes, anoxia, droughts, impacts, and nine anchored mass extinctions/crises (Great Oxidation, Snowball Earth, Ordovician, Devonian, Carboniferous collapse, Permian, Triassic, K-Pg, Toba). Omens hint first, then you may prepare (disperse, shelter, gamble). Survival depends on body plan, habitat, branches and luck. Your lineage is never game-over: it either comes through, hands off to a surviving branch, or squeezes through a bottleneck.
- **Lineage tab:** eleven strategy axes (size, diet, defense, movement, senses, habitat, metabolism, mind, behavior, reproduction, tolerance) with trade-offs and no universal best; rare **mutations** (beneficial, harmful, neutral or situational, some only paying off later); **branching** into new species; renaming your species (the name updates everywhere).
- **Habitats:** 15 biomes appear when geologically appropriate; migration is risky, and first arrivals find empty niches.
- **Ecosystem:** prey, predators and competitors rise and fall, with a predator/prey arms race and named rivals. Catastrophes shake it, and afterwards surviving lineages **radiate** into the empty niches.
- **History tab:** an interactive family tree (continue, specialize, migrate, decline, go extinct), a chronological fossil record, and a summary with statistics. **Ride out the ages** lets the lineage live through the rest of Earth's history without you and ends with a history of what your descendants became. Living fossils and quiet survivors count as successes.
- Your body plan is drawn on the creature in the first six stages (size, armor, spines, eyes, jaws, fins, wings, fur, camouflage and more), and the scene shifts with the climate and habitat. Later stages only scale the figure slightly.
- Old saves load: they get a founder species, a backfilled history and sensible defaults.

## Beyond the space age (stages 12 and 13)

Space Age no longer ends the game. **Colony Worlds** (stage 12) has you settle other worlds (you pick where the first ships go: Mars, the ocean moons, or a seed ship to another star), and **Stellar Age** (stage 13) harnesses the star with collectors, swarm foundries and a Dyson ring. Each has its own scene.

At the end you **ascend** and choose what your people become, much like the ascension paths in Stellaris:

- **Cybernetic:** cyborgs, flesh joined to machinery.
- **Synthetic:** robots and machine bodies.
- **Uploaded:** consciousness moved into computers and AI.
- **Engineered:** evolution on purpose, with technology, very fast.
- **Transcendent:** a spiritual, shared mind.
- **Natural:** the unchanged. Staying as you are is a valid ending.

Your history leans your people toward some paths: decisions in stages 12 and 13, the tech and civic branches you built, your character marks, and the **Ascension** tab, where you can cultivate a path on purpose. Any path can be chosen, but one that fits your history pays a little more; one that goes against the grain pays a little less. Each path has its own production trade-offs, its own ending text, and its own visual effect on the scene afterward. Old saves that had already launched the Ark simply continue into stage 12.

## Your people, in the corner

From the savanna age (stage 6) on, the **Form** tab lets you design your creature, and it does not have to look human. Pick a **body plan** (primate, feline, reptile, avian, insectoid or aquatic) that changes the whole head, a **covering** (smooth, fur, scales, feathers, chitin), skin, accent and eye colors, the number and kind of **eyes** (two, three, four, one great eye, compound), **mouth** (mouth, snout, beak, mandibles), ears or frills, a crown, markings, a feature (horns, tusks, antennae, spines, a neck frill, a mantle), build, and two or four arms. It is free to change. It shows on your people in the savanna scene, and from the first settlements on a **portrait** of your people sits in the corner of the scene and ages with them: hides, tunics, coats, jackets, pressure suits, colony suits, light-woven cloaks. Every new game starts with a different random look.

From stage 12 the portrait shows the path your people are leaning toward (stronger the more you cultivate it), and after you ascend it shows the full path: cyborg implants and exo-limbs, a machine faceplate, a hologram of an uploaded mind, shimmering engineered skin, a psionic halo, or leaves and flowers for the natural path. Each path has three **upgrades** after ascending that give production bonuses and add to the portrait.

The tech and civic trees now continue to stages 12 and 13 with two more tiers per branch.

## Music and sound

Music and effects are generated live with the Web Audio API (`js/audio.js`), so there are no audio files. The score changes key, scale and tempo with each stage, gets a soft pulse in the civilization stages, and darkens during catastrophes. Effects cover taps (bubbles, wood, then chimes), purchases, research, evolving, omens, warnings, extinctions, mutations, migration and branching. Nothing plays until the first tap or key press (a browser rule). The speaker button in the header opens music, effects and volume settings, which are remembered in the browser.

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
js/earth.js       geological clock, planet conditions, food
js/biomes.js      habitats and migration rules
js/genome.js      strategy axes, mutations, fitness
js/ecology.js     prey, predators, rivals, arms race
js/species.js     species registry, procedural names, branching, radiations
js/events.js      Earth events, omens, mass extinctions and survival
js/history.js     fossil record, tree layout, outcomes, ride-out
js/ascension.js   ascension paths, leanings, endings
js/life.js        ties the systems together (save migration, per-tick simulation)
js/people.js      form designer data and effects
js/portrait.js    the portrait and path visuals
js/audio.js       generated music and sound effects
js/art.js         one canvas scene per stage, drawn from what you own
js/organism.js    body-plan overlays, climate and habitat effects on the scene
js/ui-life.js     Lineage, World and History tabs, Earth bar, event prompts
js/ui.js          interface, save and load, main loop
assets/           favicon
tests/check.js    sanity checks and a pacing simulation
tests/visual-check.py   optional browser check that every purchase changes the picture
.github/workflows/pages.yml   test and deploy
```

The scripts are plain classic scripts loaded in order (see `index.html`; the tests check the order) and share one global scope.

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

`tests/visual-check.py` renders every scene in a real browser and confirms that each adaptation, trait and tree branch changes the picture. It can also save a contact sheet of all thirteen stages. It needs Playwright:

```sh
pip install playwright && playwright install chromium
python3 tests/visual-check.py sheet.png
```

### Browser smoke test

The new tabs, modals, save/reload and legacy-save migration were checked with a scripted Chromium run (desktop and phone width) during development; that script is not part of the repo.

## Notes

- Fonts (Instrument Serif, Instrument Sans, DM Mono) load from Google Fonts. If they are blocked the page falls back to system fonts. To avoid the third-party request, download the fonts into `assets/fonts/` and replace the `<link>` in `index.html` with `@font-face` rules.
- Saves are per browser and per site address. **Start over** in the footer erases yours.

## License

MIT. See [LICENSE](LICENSE).
