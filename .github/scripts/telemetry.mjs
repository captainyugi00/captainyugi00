#!/usr/bin/env node
// telemetry.mjs — first-party GitHub telemetry card generator
// Node 20 ESM, zero npm dependencies (global fetch).
// Renders github-metrics.svg (900x300) in the repo's terminal design language.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const LOGIN = "captainyugi00";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../../github-metrics.svg");

const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) {
  console.error("telemetry: GH_TOKEN environment variable is required");
  process.exit(1);
}

// ---------------------------------------------------------------- fetch

const QUERY = `query {
  user(login: "${LOGIN}") {
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(first: 100, ownerAffiliations: [OWNER], isFork: false) {
      totalCount
      nodes {
        stargazerCount
        languages(first: 10) { edges { size node { name } } }
      }
    }
  }
}`;

async function fetchTelemetry() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": `${LOGIN}-telemetry`,
    },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL request failed: HTTP ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data?.user) {
    throw new Error(`GitHub GraphQL returned no user for login "${LOGIN}"`);
  }
  return json.data.user;
}

// ---------------------------------------------------------------- compute

function computeStreaks(days) {
  // days: [{date, count}] sorted ascending by date
  let best = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    if (run > best) best = run;
  }
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--; // today may legitimately still be 0
  while (i >= 0 && days[i].count > 0) {
    current++;
    i--;
  }
  return { current, best };
}

function computeStats(user) {
  const cc = user.contributionsCollection ?? {};
  const cal = cc.contributionCalendar ?? {};
  const weeks = Array.isArray(cal.weeks) ? cal.weeks : [];

  const days = weeks
    .flatMap((w) => w?.contributionDays ?? [])
    .filter((d) => d && typeof d.date === "string")
    .map((d) => ({ date: d.date, count: d.contributionCount ?? 0 }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const { current, best } = computeStreaks(days);

  const weekly = weeks
    .map((w) => (w?.contributionDays ?? []).reduce((s, d) => s + (d?.contributionCount ?? 0), 0))
    .slice(-52);

  const repos = user.repositories ?? {};
  const nodes = Array.isArray(repos.nodes) ? repos.nodes.filter(Boolean) : [];
  const stars = nodes.reduce((s, r) => s + (r.stargazerCount ?? 0), 0);

  const langBytes = new Map();
  for (const r of nodes) {
    for (const e of r.languages?.edges ?? []) {
      const name = e?.node?.name;
      if (!name || !(e.size > 0)) continue;
      langBytes.set(name, (langBytes.get(name) ?? 0) + e.size);
    }
  }
  const top = [...langBytes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topTotal = top.reduce((s, [, v]) => s + v, 0);
  const languages = top.map(([name, size]) => ({
    name,
    pct: topTotal > 0 ? (size / topTotal) * 100 : 0,
  }));

  return {
    contributions: cal.totalContributions ?? 0,
    streakCurrent: current,
    streakBest: best,
    commits: (cc.totalCommitContributions ?? 0) + (cc.restrictedContributionsCount ?? 0),
    stars,
    repoCount: repos.totalCount ?? 0,
    followers: user.followers?.totalCount ?? 0,
    languages,
    weekly,
  };
}

// ---------------------------------------------------------------- render

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const num = (n) => Number(n ?? 0).toLocaleString("en-US");
const pctLabel = (p) => `${(Math.round(p * 10) / 10).toString().replace(/\.0$/, "")}%`;

function renderSVG(stats) {
  const today = new Date().toISOString().slice(0, 10);

  // ---- geometry -------------------------------------------------
  // card: inset 14, body 872x272, chrome 30px
  const CARD = { x: 14, y: 14, w: 872, h: 272, rx: 8 };
  const CHROME_H = 30;

  // ---- left column: key/value rows ------------------------------
  const KEY_X = 46;
  const COLON_X = 168;
  const VAL_X = 184;
  const ROW_Y = [78, 102, 126, 150, 174];

  const B = "#E6EDF3"; // bright value
  const M = "#8B949E"; // muted descriptor
  const D = "#6E7681"; // dim

  const rows = [
    ["contributions", `<tspan fill="${B}">${num(stats.contributions)}</tspan><tspan fill="${M}"> (last 365d)</tspan>`],
    ["streak", `<tspan fill="${B}">${stats.streakCurrent}d</tspan><tspan fill="${M}"> current</tspan><tspan fill="${D}"> · </tspan><tspan fill="${B}">${stats.streakBest}d</tspan><tspan fill="${M}"> best</tspan>`],
    ["commits", `<tspan fill="${B}">${num(stats.commits)}</tspan><tspan fill="${M}"> (yr)</tspan>`],
    ["stars · repos", `<tspan fill="${B}">${num(stats.stars)}</tspan><tspan fill="${D}"> · </tspan><tspan fill="${B}">${num(stats.repoCount)}</tspan>`],
    ["followers", `<tspan fill="${B}">${num(stats.followers)}</tspan>`],
  ];

  let leftCol = "";
  ROW_Y.forEach((y, i) => {
    if (i % 2 === 1) {
      leftCol += `<rect x="38" y="${y - 15}" width="400" height="22" rx="3" fill="#FFFFFF" fill-opacity="0.03"/>\n`;
    }
  });
  ROW_Y.forEach((y, i) => {
    const [key, val] = rows[i];
    leftCol += `<text class="tm-t" x="${KEY_X}" y="${y}" font-size="14" fill="${M}">${esc(key)}</text>\n`;
    leftCol += `<text class="tm-t" x="${COLON_X}" y="${y}" font-size="14" fill="${D}">:</text>\n`;
    leftCol += `<text class="tm-t" x="${VAL_X}" y="${y}" font-size="14" fill="${B}">${val}</text>\n`;
  });

  // ---- right column: top languages -------------------------------
  const R_X = 470;
  const R_END = 854;
  const BAR_X = 584;
  const BAR_END = 806;
  const BAR_W = BAR_END - BAR_X;
  const OPACITIES = [1, 0.85, 0.7, 0.55, 0.42, 0.3];

  let rightCol = `<text class="tm-t" x="${R_X}" y="64" font-size="11" fill="${D}">top languages</text>\n`;
  if (stats.languages.length === 0) {
    rightCol += `<text class="tm-t" x="${R_X}" y="104" font-size="12" fill="${M}">no language data yet</text>\n`;
  } else {
    stats.languages.forEach((lang, i) => {
      const cy = 84 + i * 20;
      const name = lang.name.length > 14 ? lang.name.slice(0, 13) + "..." : lang.name;
      const w = Math.max(6, Math.round((lang.pct / 100) * BAR_W));
      rightCol += `<text class="tm-t" x="${R_X}" y="${cy + 4}" font-size="12" fill="#C9D1D9">${esc(name)}</text>\n`;
      rightCol += `<rect x="${BAR_X}" y="${cy - 3}" width="${BAR_W}" height="6" rx="3" fill="#1C2433"/>\n`;
      rightCol += `<rect x="${BAR_X}" y="${cy - 3}" width="${w}" height="6" rx="3" fill="#34D399" fill-opacity="${OPACITIES[i]}"/>\n`;
      rightCol += `<text class="tm-t" x="${R_END}" y="${cy + 4}" font-size="11" fill="${D}" text-anchor="end">${pctLabel(lang.pct)}</text>\n`;
    });
  }

  // ---- bottom strip: 52-week sparkline ---------------------------
  const S_X0 = 46;
  const S_X1 = 854;
  const S_TOP = 218;
  const S_BASE = 256;
  const weekly = stats.weekly.length > 0 ? stats.weekly : [0];
  const maxW = Math.max(1, ...weekly);
  const stepX = weekly.length > 1 ? (S_X1 - S_X0) / (weekly.length - 1) : 0;
  const pts = weekly.map((v, i) => {
    const x = S_X0 + i * stepX;
    const y = S_BASE - (v / maxW) * (S_BASE - S_TOP);
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  });
  const lineStr = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const areaStr = `${lineStr} ${S_X1},${S_BASE} ${S_X0},${S_BASE}`;
  let lineLen = 0;
  for (let i = 1; i < pts.length; i++) {
    lineLen += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  lineLen = Math.ceil(lineLen) + 2;

  const caption = `${num(stats.contributions)} contributions · last sync ${today} · auto-refreshed daily`;

  // ---- assemble ---------------------------------------------------
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300" width="900" height="300" role="img" aria-label="GitHub telemetry for ${LOGIN}: ${num(stats.contributions)} contributions in the last year">
<style>
.tm-t{font-family:ui-monospace,'SF Mono','Cascadia Mono','JetBrains Mono',Menlo,Consolas,'Liberation Mono',monospace}
@keyframes tm-draw{from{stroke-dashoffset:${lineLen}}}
@keyframes tm-fade{from{opacity:0}}
@keyframes tm-blink{0%,100%{opacity:1}50%{opacity:0}}
#tm-spark-line{animation:tm-draw 1.4s ease-out .3s both}
#tm-spark-area{animation:tm-fade .9s ease .5s both}
#tm-cursor{animation:tm-blink 1.06s steps(1,start) infinite}
@media (prefers-reduced-motion: reduce){*{animation:none !important}}
</style>
<defs>
<clipPath id="tm-clip"><rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.rx}"/></clipPath>
<filter id="tm-shadow" x="-4%" y="-6%" width="108%" height="118%">
<feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.22"/>
</filter>
</defs>

<!-- card body + baked shadow -->
<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD.rx}" fill="#0D1420" filter="url(#tm-shadow)"/>

<g clip-path="url(#tm-clip)">
<!-- chrome bar -->
<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CHROME_H}" fill="#10161F"/>
<line x1="${CARD.x}" y1="${CARD.y + CHROME_H + 0.5}" x2="${CARD.x + CARD.w}" y2="${CARD.y + CHROME_H + 0.5}" stroke="#1C2433" stroke-width="1"/>
<circle cx="34" cy="29" r="4.5" fill="none" stroke="#3A4454" stroke-width="1.5"/>
<circle cx="50" cy="29" r="4.5" fill="none" stroke="#3A4454" stroke-width="1.5"/>
<circle cx="66" cy="29" r="4.5" fill="#34D399"/>
<text class="tm-t" x="84" y="33" font-size="11" fill="#6E7681">operator@github: ~/telemetry — daily sync<tspan id="tm-cursor" fill="#34D399"> ▊</tspan></text>

<!-- left column: kv rows -->
${leftCol}
<!-- right column: top languages -->
${rightCol}
<!-- bottom strip: 52-week contribution sparkline -->
<line x1="${S_X0}" y1="${S_BASE}" x2="${S_X1}" y2="${S_BASE}" stroke="#1C2433" stroke-width="1"/>
<polygon id="tm-spark-area" points="${areaStr}" fill="rgba(52,211,153,0.14)"/>
<polyline id="tm-spark-line" points="${lineStr}" fill="none" stroke="#34D399" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="${lineLen}" stroke-dashoffset="0"/>
<text class="tm-t" x="${S_X0}" y="276" font-size="10.5" fill="#6E7681">${esc(caption)}</text>
</g>

<!-- border -->
<rect x="${CARD.x + 0.5}" y="${CARD.y + 0.5}" width="${CARD.w - 1}" height="${CARD.h - 1}" rx="${CARD.rx}" fill="none" stroke="#263042" stroke-width="1"/>
</svg>
`;
}

// ---------------------------------------------------------------- main

try {
  const user = await fetchTelemetry();
  const stats = computeStats(user);
  const svg = renderSVG(stats);
  writeFileSync(OUT, svg, "utf8");
  console.log(
    `telemetry: wrote ${OUT}\n` +
      `  contributions=${stats.contributions} streak=${stats.streakCurrent}d/${stats.streakBest}d ` +
      `commits=${stats.commits} stars=${stats.stars} repos=${stats.repoCount} followers=${stats.followers}\n` +
      `  languages=${stats.languages.map((l) => `${l.name}:${pctLabel(l.pct)}`).join(", ") || "none"}`
  );
} catch (err) {
  console.error(`telemetry: FAILED — ${err.message}`);
  process.exit(1);
}
