#!/usr/bin/env node
/**
 * Builds the animated SVG cards used by the profile README.
 *
 * Self-contained by design: no external services, no runtime fetches, no
 * webfonts. Cards carry their own dark surface so they read on either GitHub
 * theme. Motion is SMIL for geometry (every animated attribute keeps its final
 * value as the base value, so a renderer without SMIL still shows the finished
 * state) and CSS keyframes for opacity, so `prefers-reduced-motion` can stop it.
 *
 *   node .github/scripts/build-assets.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const OUT = join(ROOT, 'assets')

/* ------------------------------------------------------------------ tokens */

const C = {
  card: '#0B0F17',
  cardAlt: '#0E1420',
  line: '#1B2331',
  edge: '#242E3E',
  hi: '#F0F4F8',
  text: '#C7D0DA',
  dim: '#8C97A5',
  faint: '#6B7684',
  green: '#34D399',
  cyan: '#38BDF8',
  blue: '#60A5FA',
  violet: '#A78BFA',
  amber: '#FBBF24',
  orange: '#FB923C',
  pink: '#F472B6',
}

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif"
const MONO = "ui-monospace,'SF Mono','Cascadia Mono','JetBrains Mono',Menlo,Consolas,'Liberation Mono',monospace"
const DOT = '&#183;'

/* ----------------------------------------------------------------- helpers */

const r = n => String(Math.round(n * 1000) / 1000)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const vlen = s => s.replace(/&#\d+;|&[a-z]+;/g, '.').length
/** monospace advance — only ever used to size things drawn in MONO */
const tw = (s, fs, ls = 0) => vlen(s) * (fs * 0.6 + ls)

/* ------------------------------------------------------------------- icons */
/* Brand marks come from Simple Icons (CC0), baked in at build time. GitHub's
   image proxy blocks anything an SVG tries to fetch, so nothing is referenced
   by URL: each mark is a <path> in <defs>, reused by <use>. */

const ICONS = JSON.parse(readFileSync(join(HERE, 'icons.json'), 'utf8'))
const BY_SLUG = new Map(Object.values(ICONS).map(i => [i.slug, i]))

const hsl2hex = (h, s, l) => {
  const f = n => {
    const k = (n + h * 12) % 12
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

/** the brand colour, lifted until it reads against a near-black surface */
const iconColor = hex => {
  const [R, G, B] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min
  const l = (max + min) / 2
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (sat < 0.16) return C.hi
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  h = ((h * 60 + 360) % 360) / 360
  return hsl2hex(h, Math.min(1, sat), Math.max(l, 0.62))
}

/** one brand mark, or a monogram tile where no mark exists */
const mark = (label, x, y, size, fallback, used) => {
  const ic = ICONS[label]
  if (!ic) {
    const ch = (label.replace(/[^A-Za-z0-9]/g, '')[0] || '?').toUpperCase()
    return `<g><rect x="${r(x)}" y="${r(y)}" width="${r(size)}" height="${r(size)}" rx="${r(size / 4)}" fill="${fallback}" fill-opacity="0.2"/><text class="m" x="${r(x + size / 2)}" y="${r(y + size / 2 + size * 0.3)}" font-size="${r(size * 0.6)}" font-weight="700" fill="${fallback}" text-anchor="middle">${ch}</text></g>`
  }
  used.add(ic.slug)
  return `<use href="#i-${ic.slug}" xlink:href="#i-${ic.slug}" transform="translate(${r(x)} ${r(y)}) scale(${r(size / 24)})" fill="${iconColor(ic.hex)}"/>`
}

const markDefs = used => [...used].map(s => `<path id="i-${s}" d="${BY_SLUG.get(s).path}"/>`).join('\n')

/* ---------------------------------------------------------------- document */

const svg = ({ w, h, title, desc, style = '', defs = '', body }) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<style>
text{font-family:${SANS}}
.m{font-family:${MONO}}
@keyframes fx-in{from{opacity:0}to{opacity:1}}
@keyframes fx-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.fx-i{animation:fx-in .55s ease both}
${style}
@media (prefers-reduced-motion:reduce){
*{animation:none!important;animation-delay:0s!important}
.fx-loop{display:none}
}
</style>
<defs>
<filter id="sh" x="-6%" y="-14%" width="112%" height="128%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000000" flood-opacity="0.28"/></filter>
<pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.75" fill="#FFFFFF" fill-opacity="0.032"/></pattern>
<linearGradient id="sheen" x1="-0.35" y1="0" x2="-0.05" y2="0">
<stop offset="0" stop-color="#34D399" stop-opacity="0"/><stop offset="0.5" stop-color="#34D399" stop-opacity="0.11"/><stop offset="1" stop-color="#34D399" stop-opacity="0"/>
<animate attributeName="x1" values="-0.35;1" dur="11s" repeatCount="indefinite"/><animate attributeName="x2" values="-0.05;1.3" dur="11s" repeatCount="indefinite"/>
</linearGradient>
${defs}
</defs>
${body}
</svg>
`

const card = (x, y, w, h, { fill = C.card, stroke = C.edge, rx = 14, shadow = true } = {}) => ({
  base: `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${rx}" fill="${fill}"${shadow ? ' filter="url(#sh)"' : ''}/>`,
  border: `<rect x="${r(x + 0.5)}" y="${r(y + 0.5)}" width="${r(w - 1)}" height="${r(h - 1)}" rx="${rx}" fill="none" stroke="${stroke}" stroke-width="1"/>`,
})

/** small letterspaced caps label — the only "chrome" a card gets */
const eyebrow = (x, y, text, { fs = 10, color = C.faint, ls = 2, anchor = 'start', delay = 0.15 } = {}) =>
  `<text class="m fx-i" x="${r(x)}" y="${r(y)}" font-size="${fs}" letter-spacing="${ls}" fill="${color}" text-anchor="${anchor}" style="animation-delay:${r(delay)}s">${text}</text>`

/** number that ticks up, then freezes; the last frame is also the base state */
const counter = (frames, { x, y, fs, fill = C.hi, anchor = 'middle', start = 0.5, dur = 1.3 }) => {
  const total = start + dur, n = frames.length
  return frames.map((label, i) => {
    const a = (start + (i * dur) / n) / total
    const b = (start + ((i + 1) * dur) / n) / total
    const anim = i === n - 1
      ? `<animate attributeName="opacity" values="0;1" keyTimes="0;${r(a)}" calcMode="discrete" dur="${r(total)}s" fill="freeze"/>`
      : a === 0
        ? `<animate attributeName="opacity" values="1;0" keyTimes="0;${r(b)}" calcMode="discrete" dur="${r(total)}s" fill="freeze"/>`
        : `<animate attributeName="opacity" values="0;1;0" keyTimes="0;${r(a)};${r(b)}" calcMode="discrete" dur="${r(total)}s" fill="freeze"/>`
    return `<text x="${r(x)}" y="${r(y)}" font-size="${fs}" font-weight="700" fill="${fill}" text-anchor="${anchor}" opacity="${i === n - 1 ? 1 : 0}">${label}${anim}</text>`
  }).join('\n')
}

/** bar whose base width is the final width, grown from zero by SMIL */
const bar = (x, y, w, h, fill, { delay = 0, dur = 0.95 } = {}) =>
  `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(h / 2)}" fill="${fill}"><animate attributeName="width" from="0" to="${r(w)}" begin="${r(delay)}s" dur="${dur}s" calcMode="spline" keySplines=".16 .84 .32 1" keyTimes="0;1" fill="freeze"/></rect>`

const write = (name, content) => {
  writeFileSync(join(OUT, name), content)
  console.log(`  ${name.padEnd(24)} ${(content.length / 1024).toFixed(1).padStart(6)} KB`)
}

/* -------------------------------------------------------------------- data */

const STATS = [
  { label: 'PROJECTS', frames: ['0', '18+', '43+', '67+', '84+', '94+', '99+', '100+'] },
  { label: 'ORGANIZATIONS', frames: ['0', '4', '8', '11', '12', '13'] },
  { label: 'LANGUAGES', frames: ['0', '3', '6', '8', '9', '10'] },
  { label: 'PRODUCTS SHIPPED', frames: ['0', '2', '4', '6', '7+'] },
  { label: 'FIELDS OF WORK', frames: ['0', '2', '4', '6', '7', '8'] },
]

const LANGS = [
  { name: 'Python', n: 65, tier: 'EXPERT' },
  { name: 'Go', n: 38, tier: 'EXPERT' },
  { name: 'TypeScript', n: 30, tier: 'EXPERT' },
  { name: 'Rust', n: 18, tier: 'EXPERT' },
  { name: 'JavaScript', n: 20, tier: 'ADVANCED' },
  { name: 'SQL', n: 12, tier: 'ADVANCED' },
  { name: 'Protobuf', n: 6, tier: 'ADVANCED' },
  { name: 'Swift', n: 3, tier: 'ADVANCED' },
  { name: 'C#', n: 3, tier: 'INTERMEDIATE' },
  { name: 'Solidity', n: 1, tier: 'BASIC' },
]
const TIER = { EXPERT: C.green, ADVANCED: C.cyan, INTERMEDIATE: C.violet, BASIC: C.faint }

const WORK = [
  { tag: 'Rust', color: C.orange, name: 'Protocol research suite', lines: ['Large multi-crate workspace', 'Protocol reverse engineering', 'Automated analysis pipelines'] },
  { tag: 'Rust', color: C.orange, name: 'High-throughput engine', lines: ['Millions of operations a second', 'Sub-microsecond latency', 'Validated against production'] },
  { tag: 'Rust', color: C.orange, name: 'Fingerprint platform', lines: ['Privacy-preserving analytics', 'Streaming ingest pipeline', 'Multi-language client SDKs'] },
  { tag: 'Python ' + DOT + ' TypeScript', color: C.cyan, name: 'AI studio platform', lines: ['Multi-service architecture', 'GPU inference and orchestration', 'Contract-first API design'] },
  { tag: 'Go', color: C.green, name: 'Multi-tenant SaaS', lines: ['Isolation enforced at the database', 'Passkeys, SSO and billing', 'Admin control plane'] },
  { tag: 'Go ' + DOT + ' Swift', color: C.violet, name: 'Mobile and backend suite', lines: ['Native iOS, watch and widgets', 'On-device machine learning', 'Custom networking layer'] },
]

const NODES = [
  { name: 'CLIENT', sub: 'request' },
  { name: 'TLS EDGE', sub: 'fingerprinting' },
  { name: 'API', sub: 'tenant-isolated' },
  { name: 'QUEUE', sub: 'durable jobs' },
  { name: 'GPU WORKERS', sub: 'inference' },
  { name: 'STORE', sub: 'relational + cache' },
]

const STACK = [
  { title: 'LANGUAGES', color: C.green, items: ['Python', 'Go', 'Rust', 'TypeScript', 'JavaScript', 'Swift', 'C#', 'SQL', 'Protobuf', 'Solidity'] },
  { title: 'FRONTEND', color: C.blue, items: ['React 19', 'Next.js', 'Tailwind', 'Vite', 'Framer Motion', 'Three.js / R3F', 'Zustand', 'Recharts', 'Remotion', 'Radix UI', 'HeroUI', 'SwiftUI', 'SvelteKit', 'Electron'] },
  { title: 'BACKEND', color: C.cyan, items: ['FastAPI', 'Quart', 'Flask', 'Django / DRF', 'Pydantic v2', 'SQLAlchemy', 'Celery', 'Chi', 'Gin', 'pgx/v5', 'gRPC', 'River', 'asynq', 'Axum', 'Tower', 'tokio', 'sqlx', 'Express', 'Fastify', 'ASP.NET Core'] },
  { title: 'AI &amp; MACHINE LEARNING', color: C.violet, items: ['PyTorch', 'Lightning', 'Diffusers', 'Transformers', 'Whisper / WhisperX', 'OpenCV', 'scikit-learn', 'ONNX Runtime', 'InsightFace', 'YOLOv8', 'MediaPipe', 'spaCy'] },
  { title: 'SECURITY &amp; PROTOCOL', color: C.orange, items: ['utls', 'fhttp', 'tls-client', 'noble-tls', 'wreq', 'BoringSSL', 'ML-KEM / ML-DSA', 'JA3 / JA4', 'HTTP/2', 'HTTP/3 ' + DOT + ' QUIC', 'SWC', 'OXC', 'CDP'] },
  { title: 'DATA', color: C.amber, items: ['PostgreSQL', 'Redis', 'SQLite', 'MongoDB', 'ClickHouse', 'ScyllaDB', 'SQL Server', 'PostgREST', 'pgvector', 'Redpanda'] },
  { title: 'INFRASTRUCTURE &amp; OPERATIONS', color: C.pink, items: ['Docker', 'Compose', 'GitHub Actions', 'GHCR', 'Caddy', 'Nginx', 'Cloudflare', 'Hetzner', 'RunPod', 'RabbitMQ', 'PgBouncer', 'WireGuard', 'Vercel', 'S3 / MinIO', 'Prometheus', 'Grafana', 'Loki', 'Jaeger', 'OpenTelemetry', 'Sentry', 'GoReleaser', 'Ory Kratos', 'IPFS'] },
]

/* ------------------------------------------------------------------ header */

function header({ wide }) {
  const W = wide ? 880 : 420
  const H = wide ? 280 : 314
  const pad = wide ? 8 : 6
  const cw = W - pad * 2, chh = H - pad * 2
  const x = wide ? 40 : 24
  const c = card(pad, pad, cw, chh)

  const nameFs = wide ? 52 : 38
  const nameY = wide ? 126 : 128
  const ruleY = wide ? 146 : 146
  const ruleW = wide ? 92 : 68

  const pillText = wide ? 'Available for select work' : 'Available'
  const pillW = tw(pillText, 11) + 40
  const pillX = W - (wide ? 40 : 24) - pillW
  const pillY = wide ? 46 : 30

  const lede = wide
    ? [{ y: 186, t: 'I build production systems where performance, security and scale' },
       { y: 210, t: 'are the actual requirements, not aspirations.' }]
    : [{ y: 182, t: 'I build production systems' },
       { y: 203, t: 'where performance, security' },
       { y: 224, t: 'and scale are the actual' },
       { y: 245, t: 'requirements.' }]

  const meta = wide
    ? [{ y: 244, t: `Rome, Italy &#160;&#160;${DOT}&#160;&#160; Founder of Inoue AI &#160;&#160;${DOT}&#160;&#160; Consulting and collaboration welcome` }]
    : [{ y: 278, t: `Rome, Italy &#160;${DOT}&#160; Founder of Inoue AI` }]

  const body = `${c.base}
<g clip-path="url(#clip)">
<rect x="${pad}" y="${pad}" width="${cw}" height="${chh}" fill="url(#grid)"/>
<rect class="fx-loop" x="${pad}" y="${pad}" width="${cw}" height="${chh}" fill="url(#sheen)"/>
</g>

<g class="fx-i" style="animation-delay:0.9s">
<rect x="${r(pillX)}" y="${pillY}" width="${r(pillW)}" height="26" rx="13" fill="${C.green}" fill-opacity="0.1" stroke="${C.green}" stroke-opacity="0.35"/>
<circle class="fx-loop" cx="${r(pillX + 16)}" cy="${pillY + 13}" r="3.5" fill="${C.green}" style="animation:fx-pulse 2.6s ease-in-out infinite"/>
<circle cx="${r(pillX + 16)}" cy="${pillY + 13}" r="3.5" fill="${C.green}" opacity="0.001"/>
<text class="m" x="${r(pillX + 28)}" y="${pillY + 17}" font-size="11" fill="${C.green}">${pillText}</text>
</g>

${eyebrow(x, wide ? 68 : 78, wide ? `SOFTWARE ENGINEER &#160;${DOT}&#160; SECURITY RESEARCHER &#160;${DOT}&#160; FOUNDER` : `ENGINEER &#160;${DOT}&#160; SECURITY &#160;${DOT}&#160; FOUNDER`, { fs: wide ? 11 : 9.5, ls: wide ? 2.6 : 1.6, color: C.green, delay: 0.2 })}

<g clip-path="url(#wipe)"><text x="${x}" y="${nameY}" font-size="${nameFs}" font-weight="700" fill="${C.hi}" letter-spacing="-0.5">Paolo Vergani</text></g>
<rect x="${x}" y="${ruleY}" width="${ruleW}" height="3" rx="1.5" fill="${C.green}"><animate attributeName="width" from="0" to="${ruleW}" begin="0.95s" dur="0.6s" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1" fill="freeze"/></rect>

${lede.map((l, i) => `<text class="fx-i" x="${x}" y="${l.y}" font-size="${wide ? 17 : 14}" fill="${C.text}" style="animation-delay:${r(1 + i * 0.08)}s">${l.t}</text>`).join('\n')}
${meta.map(m => `<text class="m fx-i" x="${x}" y="${m.y}" font-size="${wide ? 12 : 10.5}" fill="${C.faint}" style="animation-delay:1.25s">${m.t}</text>`).join('\n')}

${c.border}`

  return svg({
    w: W, h: H,
    title: 'Paolo Vergani &#8212; software engineer, security researcher, founder',
    desc: 'Profile header. Paolo Vergani, software engineer, security researcher and founder, based in Rome, Italy, based in Rome, Italy, founder of Inoue AI, available for select work.',
    defs: `<clipPath id="clip"><rect x="${pad}" y="${pad}" width="${cw}" height="${chh}" rx="14"/></clipPath>
<clipPath id="wipe"><rect x="${r(x - 6)}" y="${r(nameY - nameFs - 8)}" width="${r(W)}" height="${nameFs + 20}"><animate attributeName="width" from="0" to="${r(W)}" begin="0.45s" dur="0.75s" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1" fill="freeze"/></rect></clipPath>`,
    body,
  })
}

/* ---------------------------------------------------------------- glance */

function glance({ wide }) {
  const W = wide ? 880 : 420
  const H = wide ? 148 : 250
  const pad = wide ? 8 : 6
  const c = card(pad, pad, W - pad * 2, H - pad * 2, { fill: C.cardAlt })
  let body = `${c.base}\n`

  if (wide) {
    const colW = 800 / STATS.length
    STATS.forEach((s, i) => {
      const cx = 40 + colW * i + colW / 2
      body += counter(s.frames, { x: cx, y: 82, fs: 31, start: 0.35 + i * 0.1, dur: 1.3 })
      body += `\n${eyebrow(cx, 108, s.label, { fs: 9.5, ls: 1.5, anchor: 'middle', delay: 0.3 + i * 0.1 })}\n`
      if (i > 0) body += `<line x1="${r(40 + colW * i)}" y1="44" x2="${r(40 + colW * i)}" y2="114" stroke="${C.line}"/>\n`
    })
  } else {
    STATS.forEach((s, i) => {
      const y = 62 + i * 36
      body += `${eyebrow(24, y, s.label, { fs: 9.5, ls: 1.2, delay: 0.3 + i * 0.1 })}\n`
      body += counter(s.frames, { x: 396, y, fs: 19, anchor: 'end', start: 0.35 + i * 0.1, dur: 1.3 })
      if (i < STATS.length - 1) body += `\n<line x1="24" y1="${r(y + 12.5)}" x2="396" y2="${r(y + 12.5)}" stroke="${C.line}"/>\n`
    })
  }

  return svg({
    w: W, h: H,
    title: 'At a glance',
    desc: 'Summary figures: 100+ projects, 13 organizations, 10 programming languages, 7+ shipped products, 8 fields of work.',
    body: body + c.border,
  })
}

/* --------------------------------------------------------------- languages */

function languages({ wide }) {
  const W = wide ? 880 : 420
  const H = wide ? 428 : 466
  const pad = wide ? 8 : 6
  const c = card(pad, pad, W - pad * 2, H - pad * 2)
  const used = new Set()
  const max = 65
  const x = wide ? 40 : 24
  let body = `${c.base}\n${eyebrow(x, wide ? 42 : 38, 'PROFICIENCY BY LANGUAGE')}\n`
  if (wide) body += eyebrow(840, 42, 'GROUPED BY LEVEL, RANKED BY PROJECTS', { anchor: 'end', ls: 1.6 }) + '\n'

  LANGS.forEach((l, i) => {
    const y = (wide ? 78 : 74) + i * (wide ? 32 : 36)
    const col = TIER[l.tier]
    const d = 0.3 + i * 0.07
    if (wide) {
      body += `<g class="fx-i" style="animation-delay:${r(d)}s">${mark(l.name, x, y - 12, 16, col, used)}</g>
<text class="fx-i" x="${r(x + 26)}" y="${r(y + 4)}" font-size="14" fill="${C.text}" style="animation-delay:${r(d)}s">${l.name}</text>
<rect x="160" y="${r(y - 4)}" width="490" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.05"/>
${bar(160, y - 4, (490 * l.n) / max, 8, col, { delay: d + 0.1 })}
<text class="fx-i" x="688" y="${r(y + 4)}" font-size="13.5" font-weight="600" fill="${C.hi}" text-anchor="end" style="animation-delay:${r(d + 0.1)}s">${l.n}</text>
<text class="m fx-i" x="706" y="${r(y + 3.5)}" font-size="10" letter-spacing="1" fill="${col}" style="animation-delay:${r(d + 0.1)}s">${l.tier}</text>\n`
    } else {
      body += `<g class="fx-i" style="animation-delay:${r(d)}s">${mark(l.name, x, y - 10, 13, col, used)}</g>
<text class="fx-i" x="${r(x + 21)}" y="${r(y + 1)}" font-size="12.5" fill="${C.text}" style="animation-delay:${r(d)}s">${l.name}</text>
<text class="m fx-i" x="396" y="${r(y + 1)}" font-size="10" letter-spacing="0.8" fill="${col}" text-anchor="end" style="animation-delay:${r(d)}s">${l.n} ${DOT} ${l.tier}</text>
<rect x="24" y="${r(y + 8)}" width="372" height="7" rx="3.5" fill="#FFFFFF" fill-opacity="0.05"/>
${bar(24, y + 8, (372 * l.n) / max, 7, col, { delay: d + 0.1 })}\n`
    }
  })

  let lx = x
  const ly = wide ? 398 : 442
  const lfs = wide ? 9.5 : 8.5
  Object.entries(TIER).forEach(([k, v]) => {
    body += `<circle class="fx-i" cx="${r(lx + 4)}" cy="${r(ly - 3.5)}" r="4" fill="${v}" style="animation-delay:1.25s"/>
${eyebrow(lx + 15, ly, k, { fs: lfs, ls: 1, color: C.dim, delay: 1.25 })}\n`
    lx += 15 + tw(k, lfs, 1) + (wide ? 26 : 14)
  })
  if (wide) body += eyebrow(840, ly, 'BAR LENGTH = PROJECTS SHIPPED', { anchor: 'end', ls: 1.4, delay: 1.25 }) + '\n'

  return svg({
    w: W, h: H,
    title: 'Proficiency by language',
    desc: 'Bar chart of ten languages grouped by level and ranked by project count. Expert: Python 65, Go 38, TypeScript 30, Rust 18. Advanced: JavaScript 20, SQL 12, Protocol Buffers 6, Swift 3. Intermediate: C# 3. Basic: Solidity 1.',
    defs: markDefs(used),
    body: body + c.border,
  })
}

/* -------------------------------------------------------------------- work */

function work({ wide }) {
  const W = wide ? 880 : 420
  const cols = wide ? 3 : 1
  const gap = wide ? 16 : 0
  const gx = wide ? 36 : 20
  const gw = wide ? 808 : 380
  const colW = (gw - gap * (cols - 1)) / cols
  const tileH = wide ? 142 : 88
  const pitch = tileH + (wide ? 16 : 8)
  const rows = Math.ceil(WORK.length / cols)
  const top = wide ? 62 : 56
  const H = top + rows * pitch - (wide ? 16 : 8) + (wide ? 22 : 18)
  const pad = wide ? 8 : 6
  const c = card(pad, pad, W - pad * 2, H - pad * 2)

  let body = `${c.base}
<g clip-path="url(#clip)"><rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" fill="url(#grid)"/></g>
${eyebrow(wide ? 40 : 24, wide ? 42 : 38, wide ? 'SIX OF MORE THAN A HUNDRED PROJECTS' : 'SIX OF 100+ PROJECTS')}\n`

  WORK.forEach((p, i) => {
    const tx = gx + (i % cols) * (colW + gap)
    const ty = top + Math.floor(i / cols) * pitch
    const d = 0.28 + i * 0.1
    const n = wide ? 3 : 2
    body += `<g class="fx-i" style="animation-delay:${r(d)}s">
<rect x="${r(tx)}" y="${r(ty)}" width="${r(colW)}" height="${tileH}" rx="10" fill="${C.cardAlt}" stroke="${C.line}"/>
<rect x="${r(tx + 1.5)}" y="${r(ty + 14)}" width="3" height="${tileH - 28}" rx="1.5" fill="${p.color}" opacity="0.9"><animate attributeName="height" from="0" to="${tileH - 28}" begin="${r(d + 0.15)}s" dur="0.65s" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1" fill="freeze"/></rect>
<text class="m" x="${r(tx + (wide ? 20 : 16))}" y="${r(ty + (wide ? 26 : 21))}" font-size="${wide ? 10 : 9}" letter-spacing="1.2" fill="${C.faint}">${String(i + 1).padStart(2, '0')}</text>
<text class="m" x="${r(tx + colW - (wide ? 18 : 14))}" y="${r(ty + (wide ? 26 : 21))}" font-size="${wide ? 9.5 : 8.5}" letter-spacing="0.6" fill="${p.color}" text-anchor="end">${p.tag}</text>
<text x="${r(tx + (wide ? 20 : 16))}" y="${r(ty + (wide ? 54 : 45))}" font-size="${wide ? 15.5 : 13.5}" font-weight="700" fill="${C.hi}">${p.name}</text>
${p.lines.slice(0, n).map((ln, j) => `<text x="${r(tx + (wide ? 20 : 16))}" y="${r(ty + (wide ? 80 : 65) + j * (wide ? 20 : 16))}" font-size="${wide ? 11.5 : 10.5}" fill="${C.dim}">${ln}</text>`).join('\n')}
</g>\n`
  })

  return svg({
    w: W, h: H,
    title: 'Selected work',
    desc: 'Six project summaries: a Rust protocol research suite, a high-throughput Rust engine, a privacy-preserving fingerprint platform, a multi-service AI studio platform, a multi-tenant Go SaaS backend, and a combined mobile and backend product suite.',
    defs: `<clipPath id="clip"><rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" rx="14"/></clipPath>`,
    body: body + c.border,
  })
}

/* ------------------------------------------------------------------- inoue */

const MARK_DATA = 'data:image/png;base64,' + readFileSync(join(OUT, 'inoue-mark.png')).toString('base64')

function inoue({ wide }) {
  const W = wide ? 880 : 420
  const H = wide ? 226 : 336
  const pad = wide ? 8 : 6
  const c = card(pad, pad, W - pad * 2, H - pad * 2, { fill: C.cardAlt })
  const logo = wide ? { x: 40, y: 44, s: 88 } : { x: 24, y: 28, s: 64 }
  const tx = wide ? 156 : 102

  const feats = ['AI generation', 'Captioning and scheduling', 'Analytics and orchestration']
  const fx = wide ? 596 : 24
  const fw = wide ? 244 : 372
  const fh = wide ? 36 : 32
  const fy0 = wide ? 52 : 196
  const fp = wide ? 44 : 38

  const desc = wide
    ? [{ y: 136, t: 'A production AI studio for creators and agencies.' }]
    : [{ y: 124, t: 'A production AI studio for' }, { y: 145, t: 'creators and agencies.' }]

  const body = `${c.base}
<rect x="${logo.x}" y="${logo.y}" width="${logo.s}" height="${logo.s}" rx="${wide ? 20 : 15}" fill="#0A0A0F" stroke="${C.edge}"/>
<g clip-path="url(#logoclip)"><image href="${MARK_DATA}" xlink:href="${MARK_DATA}" x="${logo.x}" y="${logo.y}" width="${logo.s}" height="${logo.s}"/></g>

${eyebrow(tx, wide ? 70 : 50, 'FLAGSHIP PRODUCT', { color: C.green, fs: wide ? 10 : 9, ls: 2, delay: 0.2 })}
<text class="fx-i" x="${tx}" y="${wide ? 106 : 80}" font-size="${wide ? 30 : 24}" font-weight="700" fill="${C.hi}" style="animation-delay:0.28s">Inoue AI</text>
${desc.map((d, i) => `<text class="fx-i" x="${wide ? tx : 24}" y="${d.y}" font-size="${wide ? 15 : 12.5}" fill="${C.dim}" style="animation-delay:${r(0.36 + i * 0.06)}s">${d.t}</text>`).join('\n')}
<text class="m fx-i" x="${wide ? tx : 24}" y="${wide ? 170 : 176}" font-size="${wide ? 12.5 : 11}" fill="${C.green}" xml:space="preserve" style="animation-delay:0.46s">inoue.app<tspan fill="${C.faint}">   ${DOT}   </tspan>vault.inoue.app</text>

${feats.map((f, i) => `<g class="fx-i" style="animation-delay:${r(0.5 + i * 0.09)}s">
<rect x="${fx}" y="${r(fy0 + i * fp)}" width="${fw}" height="${fh}" rx="${fh / 2}" fill="${C.green}" fill-opacity="0.06" stroke="${C.green}" stroke-opacity="0.24"/>
<circle cx="${r(fx + 20)}" cy="${r(fy0 + i * fp + fh / 2)}" r="3" fill="${C.green}"/>
<text class="m" x="${r(fx + 34)}" y="${r(fy0 + i * fp + fh / 2 + 4)}" font-size="${wide ? 11.5 : 11}" fill="${C.text}">${f}</text>
</g>`).join('\n')}
${c.border}`

  return svg({
    w: W, h: H,
    title: 'Inoue AI &#8212; a production AI studio for creators and agencies',
    desc: 'Product card for Inoue AI, a production AI studio for creators and agencies, covering AI generation, captioning and scheduling, and analytics and orchestration. Links to inoue.app and vault.inoue.app.',
    defs: `<clipPath id="logoclip"><rect x="${logo.x}" y="${logo.y}" width="${logo.s}" height="${logo.s}" rx="${wide ? 20 : 15}"/></clipPath>`,
    body,
  })
}

/* ------------------------------------------------------------ architecture */

function architecture({ wide }) {
  const W = wide ? 880 : 420
  const H = wide ? 292 : 564
  const pad = wide ? 8 : 6
  const c = card(pad, pad, W - pad * 2, H - pad * 2)
  const used = new Set()
  const CYC = 3.6

  const nw = wide ? 110 : 280
  const nh = wide ? 72 : 56
  const pitch = wide ? 138 : 70
  const nx = i => (wide ? 40 + i * pitch : 70)
  const ny = i => (wide ? 78 : 54 + i * pitch)
  const busY = wide ? 200 : 486
  const busH = wide ? 52 : 58

  let body = `${c.base}\n${eyebrow(wide ? 40 : 24, wide ? 42 : 38, 'A TYPICAL REQUEST PATH')}\n`
  if (wide) body += eyebrow(840, 42, `ZERO-TRUST EDGE ${DOT} IDEMPOTENT WRITES ${DOT} FULL TRACING`, { anchor: 'end', ls: 1.5 }) + '\n'

  NODES.slice(0, -1).forEach((_, i) => {
    const off = -i * 0.5
    const [a, b] = wide ? [nx(i) + nw, nx(i + 1)] : [ny(i) + nh, ny(i + 1)]
    const axis = wide ? 'cx' : 'cy'
    const fixed = wide ? `cy="${r(ny(0) + nh / 2)}"` : `cx="${r(nx(0) + nw / 2)}"`
    body += `<line x1="${wide ? r(a) : r(nx(0) + nw / 2)}" y1="${wide ? r(ny(0) + nh / 2) : r(a)}" x2="${wide ? r(b) : r(nx(0) + nw / 2)}" y2="${wide ? r(ny(0) + nh / 2) : r(b)}" stroke="${C.edge}"/>
<circle class="fx-loop" ${fixed} r="2.6" fill="${C.green}" opacity="0">
<animate attributeName="${axis}" values="${r(a)};${r(b)};${r(b)}" keyTimes="0;0.16;1" dur="${CYC}s" begin="${r(off)}s" repeatCount="indefinite"/>
<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.13;0.16;1" dur="${CYC}s" begin="${r(off)}s" repeatCount="indefinite"/>
</circle>\n`
  })

  NODES.forEach((n, i) => {
    const X = nx(i), Y = ny(i)
    const hit = Math.max(0.001, (i * 0.5) / CYC)
    const icoX = wide ? X + nw / 2 - 9 : X + 22
    const icoY = wide ? Y + 12 : Y + 19
    body += `<g class="fx-i" style="animation-delay:${r(0.25 + i * 0.09)}s">
<rect x="${r(X)}" y="${r(Y)}" width="${nw}" height="${nh}" rx="10" fill="${C.cardAlt}" stroke="${C.edge}">
<animate attributeName="stroke" values="${C.edge};${C.green};${C.edge}" keyTimes="0;${r(hit)};${r(Math.min(0.999, hit + 0.06))}" calcMode="discrete" dur="${CYC}s" repeatCount="indefinite"/>
</rect>
${mark(n.name, icoX, icoY, 18, C.dim, used)}
<text x="${r(X + nw / 2)}" y="${r(Y + (wide ? 48 : 26))}" font-size="${wide ? 12 : 13}" font-weight="700" fill="${C.hi}" text-anchor="middle" letter-spacing="0.4">${n.name}</text>
<text class="m" x="${r(X + nw / 2)}" y="${r(Y + (wide ? 63 : 42))}" font-size="${wide ? 9 : 9.5}" fill="${C.dim}" text-anchor="middle">${n.sub}</text>
</g>\n`
    if (wide) body += `<line x1="${r(X + nw / 2)}" y1="${r(Y + nh)}" x2="${r(X + nw / 2)}" y2="${busY}" stroke="${C.line}" stroke-dasharray="2 4"/>\n`
  })

  const bx = wide ? 40 : 24
  const bw = wide ? 800 : 372
  body += `<rect class="fx-i" x="${bx}" y="${busY}" width="${bw}" height="${busH}" rx="10" fill="${C.cardAlt}" stroke="${C.line}" style="animation-delay:1s"/>
${eyebrow(bx + 20, busY + 22, 'OBSERVABILITY', { color: C.violet, fs: 9.5, ls: 1.8, delay: 1.05 })}
<text class="m fx-i" x="${r(bx + 20)}" y="${r(busY + (wide ? 40 : 40))}" font-size="${wide ? 10.5 : 10}" fill="${C.faint}" style="animation-delay:1.1s">${wide ? `metrics ${DOT} dashboards ${DOT} log aggregation ${DOT} distributed tracing ${DOT} profiling` : `metrics ${DOT} dashboards ${DOT} logs`}</text>\n`
  if (!wide) body += `<text class="m fx-i" x="${r(bx + 20)}" y="${r(busY + 54)}" font-size="10" fill="${C.faint}" style="animation-delay:1.15s">tracing ${DOT} profiling</text>\n`
  body += `<g class="fx-i" style="animation-delay:1.15s"><circle class="fx-loop" cx="${r(bx + bw - 76)}" cy="${r(busY + (wide ? 26 : 22))}" r="3.5" fill="${C.green}" style="animation:fx-pulse 2.6s ease-in-out infinite"/><circle cx="${r(bx + bw - 76)}" cy="${r(busY + (wide ? 26 : 22))}" r="3.5" fill="${C.green}" opacity="0.001"/><text class="m" x="${r(bx + bw - 20)}" y="${r(busY + (wide ? 30 : 26))}" font-size="${wide ? 11 : 10}" fill="${C.green}" text-anchor="end">healthy</text></g>\n`

  return svg({
    w: W, h: H,
    title: 'How the systems fit together',
    desc: 'Architecture diagram with animated traffic moving through six stages: client request, a TLS edge doing fingerprinting, a tenant-isolated API, a durable job queue, GPU inference workers, and a relational store with cache. Every stage reports into a shared observability layer covering metrics, dashboards, log aggregation, distributed tracing and profiling.',
    defs: markDefs(used),
    body: body + c.border,
  })
}

/* ------------------------------------------------------------------- stack */

function techStack({ wide }) {
  const W = wide ? 880 : 420
  const pad = wide ? 8 : 6
  const used = new Set()
  const P = wide
    ? { x: 40, cw: 800, fs: 11.5, ch: 28, ico: 14, ig: 7, px: 11, gx: 8, gy: 8, head: 26, sect: 26, top: 74 }
    : { x: 22, cw: 376, fs: 10, ch: 24, ico: 12, ig: 5, px: 8, gx: 5, gy: 5, head: 22, sect: 20, top: 62 }

  let body = ''
  let y = P.top
  let k = 0

  STACK.forEach((s, si) => {
    body += `<rect class="fx-i" x="${P.x}" y="${r(y - 8)}" width="8" height="8" rx="2" fill="${s.color}" style="animation-delay:${r(0.18 + si * 0.07)}s"/>
${eyebrow(P.x + 16, y, s.title, { color: s.color, fs: wide ? 10 : 9, ls: 1.8, delay: 0.18 + si * 0.07 })}
${eyebrow(P.x + P.cw, y, String(s.items.length), { fs: wide ? 10 : 9, ls: 0.6, anchor: 'end', delay: 0.18 + si * 0.07 })}\n`
    y += P.head

    let cx = P.x
    s.items.forEach(it => {
      const w = P.px * 2 + P.ico + P.ig + tw(it, P.fs)
      if (cx + w > P.x + P.cw) { cx = P.x; y += P.ch + P.gy }
      const d = 0.26 + si * 0.07 + k * 0.011
      body += `<g class="fx-i" style="animation-delay:${r(d)}s"><rect x="${r(cx)}" y="${r(y)}" width="${r(w)}" height="${P.ch}" rx="${r(P.ch / 2)}" fill="${s.color}" fill-opacity="0.06" stroke="${s.color}" stroke-opacity="0.26"/>${mark(it, cx + P.px, y + (P.ch - P.ico) / 2, P.ico, s.color, used)}<text class="m" x="${r(cx + P.px + P.ico + P.ig)}" y="${r(y + P.ch / 2 + P.fs * 0.35)}" font-size="${P.fs}" fill="${C.text}">${it}</text></g>\n`
      cx += w + P.gx
      k++
    })
    y += P.ch + P.sect
  })

  const H = y - P.sect + (wide ? 24 : 20)
  const c = card(pad, pad, W - pad * 2, H - pad * 2)
  const total = STACK.reduce((a, s) => a + s.items.length, 0)
  const head = `${eyebrow(P.x, wide ? 44 : 38, 'TOOLS IN PRODUCTION USE')}
${wide ? eyebrow(840, 44, `${total} ENTRIES ACROSS ${STACK.length} DOMAINS`, { anchor: 'end', ls: 1.6 }) : ''}`

  return svg({
    w: W, h: H,
    title: 'Tools in production use',
    desc: 'Technology board grouped into seven domains: languages, frontend, backend, AI and machine learning, security and protocol, data, and infrastructure and operations. Each entry is shown with its brand mark.',
    defs: markDefs(used),
    body: `${c.base}\n${head}\n${body}${c.border}`,
  })
}

/* ------------------------------------------------------------------ closing */

function closing({ wide }) {
  const W = wide ? 880 : 420
  const H = wide ? 108 : 128
  const pad = wide ? 8 : 6
  const c = card(pad, pad, W - pad * 2, H - pad * 2, { fill: C.cardAlt })
  const q = wide
    ? [{ y: 56, t: '&#8220;Tell me, why do you choose to be ordinary?&#8221;' }]
    : [{ y: 52, t: '&#8220;Tell me, why do you choose' }, { y: 78, t: 'to be ordinary?&#8221;' }]

  const body = `${c.base}
<rect x="${wide ? 40 : 24}" y="${wide ? 34 : 30}" width="3" height="${wide ? 40 : 66}" rx="1.5" fill="${C.green}"><animate attributeName="height" from="0" to="${wide ? 40 : 66}" begin="0.3s" dur="0.6s" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1" fill="freeze"/></rect>
${q.map((l, i) => `<text class="fx-i" x="${wide ? 62 : 42}" y="${l.y}" font-size="${wide ? 19 : 16}" font-style="italic" fill="${C.text}" style="animation-delay:${r(0.4 + i * 0.08)}s">${l.t}</text>`).join('\n')}
${eyebrow(wide ? 62 : 42, wide ? 80 : 108, 'S&#332;SUKE AIZEN', { delay: 0.6, ls: 2 })}
${c.border}`

  return svg({
    w: W, h: H,
    title: 'Closing note',
    desc: 'A pull quote: "Tell me, why do you choose to be ordinary?" attributed to Sosuke Aizen.',
    body,
  })
}

/* -------------------------------------------------------------------- main */

console.log('building assets')
write('header.svg', header({ wide: true }))
write('header-mobile.svg', header({ wide: false }))
write('glance.svg', glance({ wide: true }))
write('glance-mobile.svg', glance({ wide: false }))
write('work.svg', work({ wide: true }))
write('work-mobile.svg', work({ wide: false }))
write('inoue.svg', inoue({ wide: true }))
write('inoue-mobile.svg', inoue({ wide: false }))
write('languages.svg', languages({ wide: true }))
write('languages-mobile.svg', languages({ wide: false }))
write('architecture.svg', architecture({ wide: true }))
write('architecture-mobile.svg', architecture({ wide: false }))
write('stack.svg', techStack({ wide: true }))
write('stack-mobile.svg', techStack({ wide: false }))
write('closing.svg', closing({ wide: true }))
write('closing-mobile.svg', closing({ wide: false }))
console.log('done')

/* ----------------------------------------------------------------- contact */

function chip({ label, glyph }) {
  const W = 196, H = 44
  const used = new Set()
  const c = card(1, 1, W - 2, H - 2, { rx: 12, shadow: false, fill: C.cardAlt })
  const ico = glyph === 'in'
    ? `<rect x="20" y="14" width="16" height="16" rx="3" fill="#0A66C2"/><text class="m" x="28" y="26" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">in</text>`
    : mark(label, 20, 14, 16, C.dim, used)
  return svg({
    w: W, h: H,
    title: label,
    desc: `Link to ${label}.`,
    defs: markDefs(used),
    body: `${c.base}${ico}
<text class="m" x="46" y="27" font-size="12.5" fill="${C.text}">${label}</text>
<text class="m" x="176" y="27" font-size="12" fill="${C.faint}" text-anchor="end">&#8599;</text>
${c.border}`,
  })
}

write('chip-linkedin.svg', chip({ label: 'LinkedIn', glyph: 'in' }))
write('chip-x.svg', chip({ label: 'X / Twitter' }))
write('chip-email.svg', chip({ label: 'Email' }))
