<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/header-light.svg">
  <img alt="Ali Soleimani — Backend .NET Tech Lead & Go Engineer" src="assets/header-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://alisoleimaninet.github.io"><img alt="Portfolio" src="https://img.shields.io/badge/alisoleimaninet.github.io-portfolio-22d3ee?style=for-the-badge&logo=googlechrome&logoColor=white&labelColor=0e1219"></a>
  <a href="https://www.linkedin.com/in/ali-soleimani-net/"><img alt="LinkedIn" src="https://img.shields.io/badge/LinkedIn-ali--soleimani--net-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white&labelColor=0e1219"></a>
  <a href="mailto:AliSoleimaniWorks@gmail.com"><img alt="Email" src="https://img.shields.io/badge/Email-AliSoleimaniWorks%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white&labelColor=0e1219"></a>
</p>

<br>

## Hi, I'm Ali 👋

**Backend .NET Tech Lead at [Helpsy](https://helpsy.ir)**, where I lead the engineering behind a mental-health clinic platform: the .NET backend, the frontend team and the delivery pipeline that ships it.

- 🏗️ I design and run **distributed .NET systems**: microservices, gRPC, message-driven integration with transactional outboxes, PostgreSQL, Redis, Docker and CI/CD.
- 🐹 I write **Go** too: I built the identity and access platform (SSO, MFA, OAuth2/OIDC) behind the [Barnabus](https://barnabus.ai) healthcare products.
- 🧾 I built and still operate a **self-service payment kiosk** network: bank POS terminals, receipt printers and offline-first sync, processing thousands of transactions a day.
- 🎓 M.Sc. Software Engineering student at the University of Isfahan · 📍 Isfahan, Iran
- 💬 Ask me about clean architecture, CQRS, multi-tenancy, payment integrations and developer tooling.

<br>

## What I'm building

<table>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="assets/cards/helpsy-dark.svg">
        <img alt="Helpsy" src="assets/cards/helpsy-light.svg" width="100%">
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="assets/cards/iam-dark.svg">
        <img alt="Barnabus IAM" src="assets/cards/iam-light.svg" width="100%">
      </picture>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="assets/cards/kiosk-dark.svg">
        <img alt="Kiosk Management" src="assets/cards/kiosk-light.svg" width="100%">
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="assets/cards/kiosell-dark.svg">
        <img alt="KioSell" src="assets/cards/kiosell-light.svg" width="100%">
      </picture>
    </td>
  </tr>
</table>

<sub>Most of my day-to-day work lives in private GitLab and GitHub organizations, so the public stats below undercount it.</sub>

<br>

## The shape I reach for

A reference architecture, not any one product: one gateway in front, services that own their data behind it, and every cross-service side effect through a transactional outbox.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/reference-architecture-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/reference-architecture-light.svg">
  <img alt="Reference architecture: clients, API gateway, independent services, and a PostgreSQL, Redis, message broker, job scheduler, observability and CI/CD layer" src="assets/reference-architecture-dark.svg" width="100%">
</picture>

<br>

## How I work

| | |
|---|---|
| **Boring infrastructure, interesting products** | PostgreSQL, Redis and a message broker cover most problems. Novelty goes into the domain, not the plumbing. |
| **Outbox or it did not happen** | Every cross-service side effect goes through a transactional outbox with retries and a dead-letter queue. |
| **Fail closed at the edge** | The gateway authenticates, rate-limits and denies by default. Services trust the gateway, never the client. |
| **Measure before tuning** | Traces and dashboards first; I only optimise what a p99 proves is slow. |
| **Docs are part of the code** | Architecture decisions, runbooks and team commands live in the repo, next to the code they describe. |
| **Offline is a feature** | Kiosks and flaky networks taught me store-and-forward, idempotency keys and reconciliation jobs. |

<br>

## Experience

| Period | Role | Where |
|---|---|---|
| Aug 2024 — now | **Senior Backend Engineer & Tech Lead** · .NET microservices, frontend team, CI/CD and infrastructure | [Helpsy](https://helpsy.ir) |
| 2026 | **Go Engineer** · identity & access platform: SSO, MFA, OAuth2/OIDC | [Barnabus](https://barnabus.ai) |
| Oct 2023 — Apr 2024 | **Full-Stack Developer** · logistics and freight platform in .NET | Bar1 |
| 2022 — 2023 | **Teaching Assistant** · computer engineering courses | University of Isfahan |

🎓 **M.Sc. Software Engineering** (2025 — present) · **B.Sc. Computer Engineering** (2020 — 2024) · University of Isfahan

<br>

## Featured open source

<p align="center">
  <img alt="Featured repositories" src="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/metrics/repos.svg">
</p>

| Repo | What it is |
|---|---|
| [Uber-Data-Intelligence-Platform](https://github.com/AliSoleimaniNet/Uber-Data-Intelligence-Platform) | End-to-end data platform on **.NET Aspire**: medallion lakehouse on PostgreSQL, Qdrant semantic search, a local LLM via Ollama, React + Tailwind front end |
| [QuizDSL-Studio](https://github.com/AliSoleimaniNet/QuizDSL-Studio) | LLM-assisted model-driven development: an **Xtext** DSL + a .NET 10 service that turn prompts into models and generated apps |
| [ProxyChainer](https://github.com/AliSoleimaniNet/ProxyChainer) | Xray-core config builder that chains VLESS traffic through SOCKS proxies, built with Flet |
| [ExpressFinder](https://github.com/AliSoleimaniNet/ExpressFinder) | Windows tool that automates the ExpressVPN CLI to find and connect to working locations |
| [TSP-Bokeh-Genetic-PSO-AntColony](https://github.com/AliSoleimaniNet/TSP-Bokeh-Genetic-PSO-AntColony) | TSP solved with genetic, particle-swarm and ant-colony metaheuristics, visualised with Bokeh |
| [ShamsiDate](https://github.com/AliSoleimaniNet/ShamsiDate) · [Chess](https://github.com/AliSoleimaniNet/Chess) | Persian calendar events library · WinForms chess with online play and chat |

<br>

## Tech stack

<table>
  <tr>
    <th align="left">Backend</th>
    <td>
      <img src="assets/icons/csharp.svg" width="40" height="40" alt="C#" title="C#">&nbsp;
      <img src="assets/icons/dot-net.svg" width="40" height="40" alt=".NET" title=".NET 9 / 10">&nbsp;
      <img src="assets/icons/dotnetcore.svg" width="40" height="40" alt="ASP.NET Core" title="ASP.NET Core">&nbsp;
      <img src="assets/icons/go.svg" width="40" height="40" alt="Go" title="Go">&nbsp;
      <img src="assets/icons/grpc.svg" width="40" height="40" alt="gRPC" title="gRPC">&nbsp;
      <img src="assets/icons/python.svg" width="40" height="40" alt="Python" title="Python">&nbsp;
      <img src="assets/icons/cplusplus.svg" width="40" height="40" alt="C++" title="C++">
      <br>
      <img src="https://img.shields.io/badge/EF%20Core-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt="EF Core">
      <img src="https://img.shields.io/badge/Dapper-1E1E1E?style=flat-square" alt="Dapper">
      <img src="https://img.shields.io/badge/MediatR%20%2F%20CQRS-0B8A9E?style=flat-square" alt="MediatR / CQRS">
      <img src="https://img.shields.io/badge/MassTransit-2D9CDB?style=flat-square" alt="MassTransit">
      <img src="https://img.shields.io/badge/YARP-512BD4?style=flat-square" alt="YARP">
      <img src="https://img.shields.io/badge/Hangfire-1E3A5F?style=flat-square" alt="Hangfire">
      <img src="https://img.shields.io/badge/OpenIddict-1F6FEB?style=flat-square" alt="OpenIddict">
    </td>
  </tr>
  <tr>
    <th align="left">Data &amp; messaging</th>
    <td>
      <img src="assets/icons/postgresql.svg" width="40" height="40" alt="PostgreSQL" title="PostgreSQL">&nbsp;
      <img src="assets/icons/microsoftsqlserver.svg" width="40" height="40" alt="SQL Server" title="SQL Server">&nbsp;
      <img src="assets/icons/sqlite.svg" width="40" height="40" alt="SQLite" title="SQLite">&nbsp;
      <img src="assets/icons/redis.svg" width="40" height="40" alt="Redis" title="Redis">&nbsp;
      <img src="assets/icons/rabbitmq.svg" width="40" height="40" alt="RabbitMQ" title="RabbitMQ">&nbsp;
      <img src="assets/icons/apachekafka.svg" width="40" height="40" alt="Kafka" title="Kafka / Redpanda">&nbsp;
      <img src="assets/icons/minio.svg" width="40" height="40" alt="MinIO" title="MinIO">&nbsp;
      <img src="assets/icons/qdrant.svg" width="40" height="40" alt="Qdrant" title="Qdrant">
    </td>
  </tr>
  <tr>
    <th align="left">Infra &amp; observability</th>
    <td>
      <img src="assets/icons/docker.svg" width="40" height="40" alt="Docker" title="Docker">&nbsp;
      <img src="assets/icons/kubernetes.svg" width="40" height="40" alt="Kubernetes" title="Kubernetes">&nbsp;
      <img src="assets/icons/nginx.svg" width="40" height="40" alt="nginx" title="nginx">&nbsp;
      <img src="assets/icons/linux.svg" width="40" height="40" alt="Linux" title="Linux">&nbsp;
      <img src="assets/icons/gitlab.svg" width="40" height="40" alt="GitLab CI" title="GitLab CI">&nbsp;
      <img src="assets/icons/githubactions.svg" width="40" height="40" alt="GitHub Actions" title="GitHub Actions">&nbsp;
      <img src="assets/icons/grafana.svg" width="40" height="40" alt="Grafana" title="Grafana">&nbsp;
      <img src="assets/icons/prometheus.svg" width="40" height="40" alt="Prometheus" title="Prometheus">&nbsp;
      <img src="assets/icons/opentelemetry.svg" width="40" height="40" alt="OpenTelemetry" title="OpenTelemetry">
      <br>
      <img src="https://img.shields.io/badge/Testcontainers-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Testcontainers">
      <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose">
    </td>
  </tr>
  <tr>
    <th align="left">Frontend &amp; tooling</th>
    <td>
      <img src="assets/icons/typescript.svg" width="40" height="40" alt="TypeScript" title="TypeScript">&nbsp;
      <img src="assets/icons/nextjs.svg" width="40" height="40" alt="Next.js" title="Next.js">&nbsp;
      <img src="assets/icons/react.svg" width="40" height="40" alt="React" title="React">&nbsp;
      <img src="assets/icons/tailwindcss.svg" width="40" height="40" alt="Tailwind" title="Tailwind CSS">&nbsp;
      <img src="assets/icons/threejs.svg" width="40" height="40" alt="Three.js" title="Three.js">&nbsp;
      <img src="assets/icons/git.svg" width="40" height="40" alt="Git" title="Git">&nbsp;
      <img src="assets/icons/ollama.svg" width="40" height="40" alt="Ollama" title="Ollama">
    </td>
  </tr>
</table>

<br>

## Activity

<p align="center">
  <img alt="GitHub overview" src="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/metrics/overview.svg">
</p>

<p align="center">
  <img alt="Coding habits" src="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/metrics/habits.svg">
</p>

<p align="center">
  <img alt="Streak" src="https://streak-stats.demolab.com/?user=AliSoleimaniNet&theme=dark&hide_border=true&background=0e1219&ring=22d3ee&fire=22d3ee&currStreakLabel=22d3ee&sideLabels=8b93a3&dates=8b93a3&currStreakNum=e6e9ef&sideNums=e6e9ef">
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/3d/profile-night-green.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/3d/profile-green-animate.svg">
  <img alt="3D contribution graph" src="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/3d/profile-night-green.svg" width="100%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/snake/snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/snake/snake-light.svg">
  <img alt="Contribution snake" src="https://raw.githubusercontent.com/AliSoleimaniNet/AliSoleimaniNet/output/snake/snake-dark.svg" width="100%">
</picture>

### Latest
<!--START_SECTION:activity-->
<!--END_SECTION:activity-->

<br>

## Now

- 🔭 Shipping and scaling the Helpsy platform, and growing the team around it.
- 🧪 Building **KioSell**, a multi-tenant commerce and reservation SaaS on .NET 10, Kafka and Go.
- 📚 Second year of my M.Sc.: distributed data systems, NLP and model-driven engineering coursework.
- 🛠️ Exploring .NET Aspire, OpenTelemetry-first services and local LLM tooling.

<br>

## Let's talk

📫 **[AliSoleimaniWorks@gmail.com](mailto:AliSoleimaniWorks@gmail.com)** · 💼 [LinkedIn](https://www.linkedin.com/in/ali-soleimani-net/) · 🌐 [alisoleimaninet.github.io](https://alisoleimaninet.github.io)

Open to backend, platform and tech-lead roles, .NET and Go consulting, and interesting collaborations.

<br>

<p align="center">
  <img alt="Profile views" src="https://komarev.com/ghpvc/?username=AliSoleimaniNet&color=22d3ee&style=flat-square&label=profile+views">
  &nbsp;
  <sub>Stats, graphs and the activity feed are regenerated every 6 hours by <a href=".github/workflows">GitHub Actions</a> in this repo.</sub>
</p>
