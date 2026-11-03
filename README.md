# Dorian Sabo

Portfolio site for [dorian92.github.io](https://dorian92.github.io/). A terminal on the left is wired to a phone on the right. Typing a command, or tapping an app on the phone, runs the same action. `open pulse` plays the Pulse demo on the phone while an **illustrative** build log streams in the terminal.

The page is static. GitHub Pages serves it from the `main` branch root. There is no build step.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/). `file://` will not load the scripts reliably; use a local server.

## Edit content

All copy, links, and placeholders live in [`content/site.js`](content/site.js). Change a value, refresh, and the terminal and the phone both update.

Amber tags stay visible while `placeholder: true`. When a value is real, set `placeholder` to `false` and the tag disappears.

| What | Field in `content/site.js` |
| --- | --- |
| Email | `email.value`, then `email.placeholder: false` |
| CV / resume PDF | `cv.href` (for example `assets/cv.pdf`), then `cv.placeholder: false` |
| Photo | `photo.src`, `photo.alt`, `photo.intro`, then `photo.placeholder: false` |
| LinkedIn | `linkedin.href`, then `linkedin.placeholder: false` |
| X | `x.href`, then `x.placeholder: false` |
| Open-to-roles line | `availability.text` and `availability.detail`, then `availability.placeholder: false` |
| Pulse live demo | `projects` → Pulse → `demo.href`, then `demo.placeholder: false` |
| Pulse React Native | `projects` → `pulse-rn`: `stack`, `stackNote`, `summary`, `detail`, `repo.href`, `demo.href`. Set each `placeholder` to `false` as you fill it in |
| Open-source PRs | `oss` array. Set `placeholder: false`, real `repo`, `number`, `summary`, and `href` |
| Extra job notes | `experience[].extra.text`, then `extra.placeholder: false` |

Example, once the CV file is in the repo:

```js
cv: {
  href: "assets/cv.pdf",
  placeholder: false,
  tag: "link PDF",
},
```

`index.html` also has a short no-JavaScript summary (the `#static` article) and the JSON-LD `sameAs` list. Update those if the public bio or profile links change. Day-to-day edits stay in `content/site.js`.

The phone reel under `assets/media/` is the Pulse demo GIF, re-encoded as MP4 and WebM, plus WebP stills. It is fixture data, not a live market. The build log that plays with `open pulse` is labeled illustrative on screen.

## Keyboard

- Terminal input: Enter runs, ↑↓ history, Tab completes
- ⌘K or Ctrl+K: command palette (↑↓, Enter, Esc)
- Phone apps and the suggestion chips run the same commands
- The LIVE control pauses motion, including the ticker and the demo reel
- `prefers-reduced-motion` skips the boot delays, the particle field, and demo autoplay

## GitHub Pages

This repository is already published from the **main** branch, **root** folder (`/`). Merging to `main` updates the site.

No Pages setting change is required. Do not switch the source to GitHub Actions. [`.nojekyll`](.nojekyll) is in the root so Jekyll does not process the files.

## Fonts

Geist and Geist Mono are self-hosted (Latin, SIL Open Font License). See [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt).
