<div align="center">
<picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/header-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/header.svg?v=1" width="100%" alt="Paolo Vergani — software engineer, security researcher, founder"></picture>
</div>

## About

I'm a software engineer and founder based in Rome. I started out reverse-engineering the parts of the web most developers never see — how browsers really talk to servers, and how systems tell a person from a program. That work taught me to take things apart properly before rebuilding them, and I've worked that way ever since.

Today my work sits in three areas: **security research**, **AI and machine learning platforms**, and **production SaaS architecture**. Over a hundred projects across thirteen organizations, seven of them shipped as commercial products. I'm currently building **[Inoue AI](https://www.inoue.app/)**, a production AI studio for creators and agencies.

## At a glance

<picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/glance-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/glance.svg?v=1" width="100%" alt="100+ projects, 13 organizations, 10 languages, 7+ shipped products, 8 fields of work"></picture>

## Currently building

<a href="https://www.inoue.app/"><picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/inoue-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/inoue.svg?v=1" width="100%" alt="Inoue AI — a production AI studio for creators and agencies"></picture></a>

**[Inoue AI](https://www.inoue.app/)** brings AI generation, captioning, scheduling, analytics and worker orchestration into a single platform, with **[Inoue Vault](https://vault.inoue.app/)** as its companion product.

## Selected work

<picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/work-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/work.svg?v=1" width="100%" alt="Six selected projects across security research, AI platforms, SaaS and mobile"></picture>

<details><summary><b>The rest of the portfolio</b></summary>

<br>

| Area | Shape of the work |
|---|---|
| **Security research & protocol tooling** | large Rust workspaces, analysis pipelines, high-throughput engines |
| **AI & machine learning platforms** | training, inference and media pipelines on GPU infrastructure |
| **SaaS backends & dashboards** | multi-tenant APIs, billing, authentication, admin control planes |
| **Automation & integrations** | schedulers, worker fleets, bots, browser tooling |
| **SDKs & developer tooling** | multi-language clients, CLIs, published packages |
| **Blockchain infrastructure** | real-time data streaming, trading infrastructure, monitoring |
| **Mobile** | native iOS with on-device machine learning, watch and widget extensions |

Most of this is commercial work — happy to go into detail on any of it directly.

</details>

## Languages

<picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/languages-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/languages.svg?v=1" width="100%" alt="Language proficiency: Python, Go, TypeScript and Rust at expert level; JavaScript, SQL, Protobuf and Swift advanced; C# intermediate; Solidity basic"></picture>

<details><summary><b>Where each one goes</b></summary>

<br>

| Language | Level | Projects | Where I reach for it |
|---|---|---|---|
| **Python** | Expert | 65 | async backends, AI/ML pipelines, automation, SDKs |
| **Go** | Expert | 38 | production SaaS, gRPC services, networking libraries, workers |
| **TypeScript** | Expert | 30 | dashboards, marketing sites, desktop apps, browser extensions |
| **Rust** | Expert | 18 | security research, high-performance engines, systems tooling |
| **JavaScript** | Advanced | 20 | Node services, single-page apps, build tooling |
| **SQL** | Advanced | 12 | schema design, migrations, tenant isolation, analytics |
| **Protobuf** | Advanced | 6 | service contracts and code generation |
| **Swift** | Advanced | 3 | SwiftUI apps, watch and widget extensions, on-device ML |
| **C#** | Intermediate | 3 | ASP.NET Core services, static analysis tooling |
| **Solidity** | Basic | 1 | smart contract work |

</details>

## How I build

<picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/architecture-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/architecture.svg?v=1" width="100%" alt="Request path: client, TLS edge, tenant-isolated API, durable job queue, GPU workers, store — all reporting into a shared observability layer"></picture>

<details><summary><b>Patterns I design with</b></summary>

<br>

| | |
|---|---|
| Multi-tenant systems with isolation enforced at the database | Event-driven architecture with a transactional outbox |
| Services orchestrated with Docker Compose | Tiered caching across memory, cache and materialized views |
| Domain-driven design with strict layering | Clean architecture — ports and adapters |
| Contract-first APIs with enforcement gates | Multi-language SDK design and distribution |
| Workspace monorepos | Plugin and adapter-based extensibility |
| Real-time streaming over WebSocket, gRPC and SSE | Circuit breakers and per-endpoint rate limiting |
| Background job processing and worker fleets | Distributed orchestration with checkpoint and resume |
| Sidecar pattern for protocol-level concerns | Envelope encryption for secrets at rest |
| Idempotency keys on every write | Graceful shutdown with drain semantics |
| Zero-trust edge with no public ports | Subscription and metered billing |
| Content-addressed storage with signed audit logs | Cross-language bridges between runtimes |
| Serverless GPU inference | Metrics, logs, traces and profiles on every service |

</details>

## Technology

<picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/stack-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/stack.svg?v=1" width="100%" alt="Technology board covering languages, frontend, backend, AI and machine learning, security and protocol, data, and infrastructure and operations"></picture>

<details><summary><b>Data & infrastructure, in detail</b></summary>

<br>

| Database | How I use it |
|---|---|
| **PostgreSQL** | primary relational store — row-level security, vector search, materialized views, full-text |
| **Redis** | caching, pub/sub, job queues, session storage |
| **SQLite** | embedded storage — full-text search, write-ahead logging |
| **ClickHouse** | analytics at volume |
| **ScyllaDB** | wide-column persistence for high-write workloads |
| **MongoDB** | document storage |
| **SQL Server** | enterprise middleware integration |

| Infrastructure | How I use it |
|---|---|
| **Docker & Compose** | multi-stage builds, minimal images, full-stack orchestration with health checks |
| **GitHub Actions** | testing, linting, container publishing, contract gates, cross-platform releases |
| **Caddy · Nginx** | reverse proxying, automatic HTTPS, multi-subdomain routing |
| **Prometheus · Grafana · Loki · Jaeger** | metrics, dashboards, log aggregation, distributed tracing |
| **Cloudflare** | tunnels, workers, mutual-TLS access, object storage, DNS |
| **Hetzner · RunPod · Vercel** | production hosting, GPU inference, frontend delivery |
| **RabbitMQ · Redpanda** | message brokering and event streaming |
| **PgBouncer · WireGuard** | connection pooling, secure network tunnels |
| **PyPI · npm · crates.io · Go modules** | package publishing |

</details>

<details><summary><b>Protocols & interfaces</b></summary>

<br>

**Web & transport** — REST with contract-first OpenAPI, gRPC with streaming, WebSocket, TLS 1.2 and 1.3, HTTP/2, HTTP/3 and QUIC, Model Context Protocol, server-sent events

**Authentication** — JSON Web Tokens with key rotation, OAuth 2.0, OpenID Connect, PKCE, SAML single sign-on, WebAuthn and passkeys, time-based two-factor

**Payments** — subscriptions, webhooks, connected accounts, hosted card fields, 3-D Secure

**AI & cloud** — Anthropic, OpenAI, speech and text-to-speech providers, serverless GPU, model hosting

**Hardware & low-level** — Bluetooth Low Energy, push notifications, IMAP, AMQP, Chrome DevTools Protocol, S3-compatible storage

</details>

## Fields of work

<details><summary><b>Security research & protocol engineering</b></summary>

<br>

Protocol-level reverse engineering of commercial detection systems. JavaScript analysis and deobfuscation pipelines, cryptographic protocol reimplementation, and validation against recorded ground truth. Large Rust workspaces with automated verification built in from the start.

</details>

<details><summary><b>TLS & HTTP protocol engineering</b></summary>

<br>

Custom fingerprinting libraries and browser-realistic connection emulation. Frame-level HTTP/2 configuration, HTTP/3 and QUIC, and TLS bindings including post-quantum key exchange. Maintained forks of Go's networking internals, with packages published to PyPI and crates.io.

</details>

<details><summary><b>AI & machine learning</b></summary>

<br>

Fine-tuning for image and video diffusion models. Serverless GPU inference pipelines. Computer vision for detection, tracking, and face and speaker analysis. Speech recognition and multi-provider synthesis. Natural language processing for sentiment, entity extraction and topic modelling.

</details>

<details><summary><b>SaaS platform engineering</b></summary>

<br>

Multi-tenant architecture with isolation enforced at the database rather than in application code. Subscription billing, credit metering and entitlements. Passkeys, single sign-on and multi-factor authentication. Background job processing and full observability across deployments of fifteen or more services.

</details>

<details><summary><b>Blockchain & DeFi</b></summary>

<br>

Real-time chain data streaming and token monitoring. Automated trading infrastructure. DeFi protocol integration and cross-chain smart contract work.

</details>

<details><summary><b>Commerce & payments engineering</b></summary>

<br>

Checkout automation across more than thirty retail platforms. Payment protocol integration across the major processors. Session and identity management at scale, built on a modular, adapter-based architecture.

</details>

<details><summary><b>iOS & mobile</b></summary>

<br>

SwiftUI applications with watch and widget extensions. On-device machine learning with Core ML and Vision. Bluetooth hardware communication, health data, passkeys and automated UI testing.

</details>

<details><summary><b>Video & media processing</b></summary>

<br>

GPU-accelerated encoding and transcoding pipelines. Programmatic video generation. Animated, face-aware captioning. Automated publishing to social platforms.

</details>

## Experience

**Products shipped** — Inoue AI · ClipVision AI · AVAI · TCGNotify · Berserk · TixEase · DemonRaffles

**Previously**

| Organization | Focus |
|---|---|
| **[WeWill S.r.l.](https://wewill.ai)** | AI product development |
| **[ClipVision](https://clipvision.ai)** | AI video tooling |
| **SniperAIO** | automation platform |
| **DemonSolutions** | automation and security tooling |
| **Phasma AIO** | automation platform |
| **Elmec Informatica** | enterprise IT |

## Activity

<div align="center"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/github-metrics.svg?v=2" width="100%" alt="Contribution metrics, refreshed daily"></div>
<div align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/output/github-snake-dark.svg"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/output/github-snake.svg" width="100%" alt="Contribution graph"></picture></div>

## Contact

<p align="center">
<a href="https://linkedin.com/in/paolo-vergani-1082ab22b"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/chip-linkedin.svg?v=3" height="40" alt="LinkedIn"></a>&nbsp;&nbsp;<a href="https://twitter.com/lilyoungpolo1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/chip-x.svg?v=3" height="40" alt="X / Twitter"></a>&nbsp;&nbsp;<a href="mailto:paolovergani003@gmail.com"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/chip-email.svg?v=3" height="40" alt="Email"></a>
</p>

<p align="center">Open to consulting, collaboration, and problems worth the effort.</p>

<br>

<div align="center">
<picture><source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/closing-mobile.svg?v=1"><img src="https://raw.githubusercontent.com/captainyugi00/captainyugi00/main/assets/closing.svg?v=1" width="100%" alt="Tell me, why do you choose to be ordinary? — Sōsuke Aizen"></picture>
</div>

<div align="center"><sub>© Paolo Vergani · every graphic here is a self-contained SVG, generated by <code>.github/scripts/build-assets.mjs</code></sub></div>
