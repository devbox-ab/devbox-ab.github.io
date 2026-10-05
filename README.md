# devbox.com

One-page static site for Devbox, served straight from the repo root by GitHub Pages (`main`, CNAME `www.devbox.com`). No framework, no runtime dependencies, nothing loaded from third-party hosts.

## Files

| Path | What |
|---|---|
| `index.html` | The page. |
| `src/style.css` | All styles. Edit this. The build minifies it into the `<style>` block in `index.html`. |
| `src/app.js` | Mobile menu, hero logo trace, scroll reveals. Edit this. Imports `animate` from Motion. |
| `app.min.js`, the `<style>` block in `index.html` | Built from `src/` by `npm run build` (`build.mjs`). Committed, since Pages has no build step. Don't edit by hand. |
| `fonts/` | Inter variable, self-hosted (latin subset). |
| `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-*.png`, `site.webmanifest` | Icons: the Devbox mark in #ecebe9 on #1b1b1c. |
| `img/work/` | Case-study screenshots, cropped to 16:10 at 512w, 768w and 1024w. Produced from the raw client screenshots by the design handoff's script. |

## Working on it

```sh
npm install
npm run build        # src/ -> app.min.js + <style> in index.html
python3 -m http.server 8000   # then open http://localhost:8000
```

Commit the built files together with the source change. Pushing to `main` deploys.

Dependencies are pinned to exact versions in `package.json`: Motion (bundled into `app.min.js`, tree-shaken) and esbuild.
