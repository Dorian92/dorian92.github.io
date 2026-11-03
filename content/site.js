/**
 * Portfolio content — the only file you need to edit for copy and links.
 *
 * Anything with placeholder: true renders an amber "tag" until you fill it
 * in and set placeholder to false. Do not delete the tag string; it is the
 * label shown while the field is still a placeholder.
 *
 * Real public facts (name, role, jobs, Pulse repo) are not placeholders.
 * See README.md for a field-by-field guide.
 */
window.SITE = {
  name: "Dorian Sabo",
  role: "Senior Mobile Engineer",
  user: "dorian",
  host: "sabo",
  location: "Novi Sad, Serbia",
  timezone: "CET",
  years: "8+",
  lede: "Flutter, iOS & Android apps for fintech and Web3 — wallets, trading and real-time market data, built to feel native on every platform.",
  summary: "Fintech & Web3 apps — wallets, trading, real-time data.",
  github: "https://github.com/Dorian92",
  githubLabel: "github.com/Dorian92",
  siteUrl: "https://dorian92.github.io/",

  /* ——— placeholders ——— */

  availability: {
    text: "Open to senior mobile roles — remote",
    detail: "Open to senior mobile roles — Flutter, iOS, Android. Remote from Novi Sad (CET).",
    placeholder: true,
    tag: "confirm",
  },

  email: {
    value: "hello@example.com",
    placeholder: true,
    tag: "placeholder",
  },

  cv: {
    href: "",
    placeholder: true,
    tag: "link PDF",
  },

  photo: {
    src: "",
    alt: "Portrait of Dorian Sabo",
    intro: "Photo + one-line personal intro.",
    placeholder: true,
    tag: "placeholder",
  },

  linkedin: {
    href: "",
    label: "LinkedIn",
    placeholder: true,
    tag: "add link",
  },

  x: {
    href: "",
    label: "X",
    placeholder: true,
    tag: "add link",
  },

  experience: [
    {
      dates: "2025",
      range: "2025 · past",
      company: "Trojan Trading",
      summary: "Mobile development on a Solana trading app with real-time market data.",
      tags: ["Flutter", "Solana", "Real-time"],
      extra: { text: "", placeholder: true, tag: "add wins" },
    },
    {
      dates: "2022 — 2025",
      range: "2022 — 2025",
      company: "Solflare Wallet",
      summary: "Features for the Solflare Solana wallet app on iOS and Android.",
      tags: ["Flutter", "Web3", "Platform channels"],
      extra: { text: "", placeholder: true, tag: "add wins" },
    },
    {
      dates: "2018 — 2022",
      range: "2018 — 2022",
      company: "BrightMarbles",
      summary: "Cross-platform mobile apps for client projects.",
      tags: ["Flutter", "iOS", "Android"],
      extra: { text: "", placeholder: true, tag: "add details" },
    },
  ],

  projects: [
    {
      id: "pulse",
      command: "open pulse",
      name: "Pulse",
      stack: "Flutter · Dart",
      summary:
        "A Flutter crypto market tracker. CoinGecko metadata and Binance public prices over one shared WebSocket. Market data only — it doesn't trade and it doesn't hold accounts.",
      points: [
        "Live prices over a single shared WebSocket",
        "Feature-first modules, cache-first REST",
        "bloc · go_router · Hive · fl_chart",
        "English and Serbian (Latin), strict analysis, tests at every layer",
      ],
      repo: "https://github.com/Dorian92/pulse-flutter",
      repoLabel: "github.com/Dorian92/pulse-flutter",
      demo: { href: "", placeholder: true, tag: "placeholder" },
      media: {
        webm: "assets/media/pulse-demo.webm",
        mp4: "assets/media/pulse-demo.mp4",
        poster: "assets/media/pulse-poster.webp",
        width: 420,
        height: 910,
        stills: [
          {
            src: "assets/media/markets-dark.webp",
            alt: "Pulse markets screen in dark theme. Fixture data, not a live market.",
            w: 480,
            h: 1039,
          },
          {
            src: "assets/media/markets-light.webp",
            alt: "Pulse markets screen in light theme. Fixture data, not a live market.",
            w: 480,
            h: 1039,
          },
          {
            src: "assets/media/coin-chart.webp",
            alt: "Pulse coin detail chart. Fixture data, not a live market.",
            w: 480,
            h: 1039,
          },
        ],
      },
    },
    {
      id: "pulse-rn",
      command: "open pulse-rn",
      name: "Pulse RN",
      stack: "React Native",
      stackNote: { placeholder: true, tag: "confirm stack" },
      summary: "A React Native take on the same market tracker.",
      detail: { text: "", placeholder: true, tag: "add details" },
      repo: { href: "", label: "GitHub", placeholder: true, tag: "add link" },
      demo: { href: "", placeholder: true, tag: "placeholder" },
    },
  ],

  plugins: {
    summary:
      "Flutter plugins with native Swift and Kotlin code via platform channels. The Dart API and the native handlers ship together — this is plugin work, not a native-only role.",
    diagramNote: "Illustrative example — not a specific plugin.",
    real: { text: "", placeholder: true, tag: "name real plugins" },
  },

  /* Add real PRs by setting placeholder: false and href to the pull request URL. */
  oss: [
    {
      placeholder: true,
      tag: "placeholder",
      state: "merged",
      repo: "owner/repo",
      number: "1234",
      summary: "Short description of the pull request.",
      href: "",
    },
    {
      placeholder: true,
      tag: "placeholder",
      state: "merged",
      repo: "owner/repo",
      number: "567",
      summary: "Short description of the pull request.",
      href: "",
    },
  ],

  contactHeadline: "Let's build something people hold every day.",

  ticker: [
    ["EXP", "8+ yrs", "up"],
    ["FLUTTER", "▲ dart 3", "up"],
    ["iOS", "● swift", "up"],
    ["ANDROID", "● kotlin", "up"],
    ["SOLFLARE", "2022–25", "up"],
    ["TROJAN", "2025 · past", "down"],
    ["BRIGHTMARBLES", "2018–22", "up"],
    ["PULSE", "live · ws", "up"],
    ["NOVI SAD", "remote · CET", "up"],
    ["WEB3", "wallets · trading", "up"],
  ],

  nav: [
    { cmd: "experience", label: "work" },
    { cmd: "projects", label: "projects" },
    { cmd: "plugins", label: "plugins" },
    { cmd: "oss", label: "oss" },
    { cmd: "contact", label: "contact" },
  ],

  commands: [
    { cmd: "whoami", label: "About me", help: "who I am" },
    { cmd: "experience", label: "Experience", help: "where I've worked" },
    { cmd: "projects", label: "Projects", help: "things I've built" },
    { cmd: "open pulse", label: "Run Pulse (Flutter)", help: "run Pulse on the phone" },
    { cmd: "open pulse-rn", label: "Run Pulse (React Native)", help: "run the React Native placeholder" },
    { cmd: "plugins", label: "Plugins & native", help: "Flutter plugins and platform channels" },
    { cmd: "oss", label: "Open source", help: "open-source contributions" },
    { cmd: "contact", label: "Contact", help: "get in touch" },
    { cmd: "home", label: "Phone home screen", help: "phone home screen" },
    { cmd: "help", label: "All commands", help: "list commands" },
    { cmd: "clear", label: "Clear terminal", help: "clear the terminal" },
  ],
};
