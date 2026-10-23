# moratorium.ai redesign

The live site is `redesign/site/`, a static build: `npm run build` (or `bun run build`) copies it to `build/`, which Cloudflare Pages serves.

To regenerate it after editing `docs/intro.md` (the essay), `src/pages/index.js` (the quotes) or anything in `redesign/src/`:

    python3 redesign/src/build.py .

This needs Python 3 and pandoc. Then commit `redesign/site/`.

- `redesign/src/template.html`: layout and styles.
- `redesign/src/engine.js`: the drawn pictures behind the page.
- `redesign/src/content.json`: the redesign's own copy (short version, what happened, precedents, why this can work, how to help).
- `redesign/src/quote-fixes.json`: corrections that make the home-page quotes match their sources.

Forms post to the same endpoints as before (`forms.moratorium.ai`), and only from a moratorium.ai hostname. Every old URL and anchor still works, including `/docs/intro/#…` and `/newsletter/`. The old Docusaurus build is still available with `npm run build:docusaurus`.
