# Dorian Sabo

Portfolio site for [dorian92.github.io](https://dorian92.github.io/). A dark, premium one-pager for Dorian Sabo, a senior mobile engineer: typography-led hero, selected work on 3D phones, experience, and contact.

The page is static. GitHub Pages serves it from the `main` branch root. There is no build step.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

## Edit content and placeholders

Copy and section text live in [`index.html`](index.html). Styles are in [`assets/shared.css`](assets/shared.css), [`assets/page.css`](assets/page.css), and [`assets/phones.css`](assets/phones.css). Fonts are self-hosted under [`fonts/`](fonts/) (Geist, Geist Mono, Inter, and IBM Plex Serif), referenced from `assets/shared.css`.

Email, LinkedIn, and CV links in the contact section are still placeholders (`href="#"` plus an amber “placeholder” tag). To fill them in, edit the three `.link-chip` anchors in the Contact block of `index.html` (search for `id="contact"`):

- Email — set `href="mailto:you@example.com"` and remove the `<em class="ex">placeholder</em>` tag
- LinkedIn — set `href` to the profile URL and remove the placeholder tag
- CV — set `href` to the resume file (for example `assets/cv.pdf` after adding the file) and remove the placeholder tag

## GitHub Pages

This repository is published from the **main** branch, **root** folder (`/`). Merging to `main` updates the site.

No Pages setting change is required. Do not switch the source to GitHub Actions. [`.nojekyll`](.nojekyll) is in the root so Jekyll does not process the files.
