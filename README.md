# Dorian Sabo

Portfolio site for [dorian92.github.io](https://dorian92.github.io/). A dark, premium one-pager for Dorian Sabo, a senior mobile engineer: animated hero, highlights with count-up stats, selected work as stacking project cards, experience, and contact.

The page is static. GitHub Pages serves it from the `main` branch root. There is no build step and no external scripts or CDNs.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

## Structure

- [`index.html`](index.html) — all copy and section markup.
- [`assets/shared.css`](assets/shared.css), [`assets/page.css`](assets/page.css), [`assets/phones.css`](assets/phones.css) — base styles, layout, and CSS phone frames.
- [`assets/v3.css`](assets/v3.css) — stats, stacking work cards, and animations.
- [`assets/motion.js`](assets/motion.js) — scroll reveal, count-up numbers, stacking cards, hero parallax. Vanilla JS; respects `prefers-reduced-motion`.
- [`assets/img/`](assets/img/) — app screens shown in the phone mockups.
- [`fonts/`](fonts/) — self-hosted Geist, Geist Mono, Inter, and IBM Plex Serif, referenced from `assets/shared.css`.
- [`cv/Dorian_Sabo_CV.pdf`](cv/Dorian_Sabo_CV.pdf) — the CV linked from the contact section.

## Image credits

- `assets/img/solflare-market.webp` — cropped from Solflare's official App Store screenshots ([Solflare: Solana Crypto Wallet](https://apps.apple.com/app/id1580902717)).
- `assets/img/trojan-explorer.webp` — frame from the official Trojan docs ([Trojan Mobile](https://docs.trojan.com/additional-info/trojan-mobile)).

## GitHub Pages

This repository is published from the **main** branch, **root** folder (`/`). Merging to `main` updates the site. Do not switch the source to GitHub Actions. [`.nojekyll`](.nojekyll) is in the root so Jekyll does not process the files.
