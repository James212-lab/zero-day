import type { Module } from "../curriculum";

export const module22: Module = {
  id: "module-22",
  slug: "22-secure-architecture-design",
  title: "Secure Architecture & Design",
  description:
    "Designing systems that fail safely: defense in depth, zero trust, security by design, threat modeling, and the patterns architects actually use.",
  language: "Architecture",
  lessons: [
    {
      id: 1,
      slug: "01-defense-in-depth",
      title: "Defense in Depth: Layers, Not Walls",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Why single controls fail, and how layered, independent controls make compromise expensive.",
      content: `
# Defense in Depth: Layers, Not Walls

## The onion principle

Any single control can be bypassed. A firewall can be RULEd around; a patch can be missed; an antivirus can be evaded. Defense in depth accepts imperfection and layers **independent** controls so that failure of any one layer does not equal compromise.

\`\`\`
Attacker must defeat (in order):
  perimeter firewall  ->  host firewall  ->  app hardening
  ->  least privilege  ->  EDR  ->  encryption at rest
  ->  monitoring & detection ->  IR team
\`\`\`

## Independence is the key

Layers must not share the same flaw:

- Bad: firewall AND switch ACL both use the same stale IP allow-list
- Good: perimeter firewall + host firewalls patched by separate teams + app-level auth + encryption

If every layer trusts the same single source, you have one wall, not many.

## The tools per layer

| Layer | Typical controls |
|-------|------------------|
| Network | segmentation, ZTNA, egress filtering, IDS/IPS |
| Host | hardening, EDR, application allow-listing |
| App | secure coding, WAF, input validation, authN/authZ |
| Data | encryption, DLP, backup |
| People | training, least privilege, separation of duties |

## Fail-closed vs fail-open

Design decisions: if a control breaks, does access become **denied** (fail-closed — safer but availability hits) or **allowed** (fail-open — convenient but dangerous)? Authentication should fail-closed; a load balancer health check may fail-open.

> Classic failure: a misconfigured "internal only" service that authenticates via network presence. Defense in depth says such a service still requires app-layer auth — because that network boundary WILL someday be pierced.
`,
      defaultCode: `// Visualize layers as an ordered list to audit
const layers = [
  'perimeter', 'host', 'application', 'data',
  'access', 'detection', 'response'
];
for (const [i, layer] of layers.entries()) {
  console.log('Layer', i + 1, layer);
}`,
      solution: `const layers = [
  'perimeter', 'host', 'application', 'data',
  'access', 'detection', 'response'
];
for (const [i, layer] of layers.entries()) {
  console.log('Layer', i + 1, layer);
}`,
      hint: "Audit whether any two layers share a single point of failure.",
      challenge: `**Home Lab — Layer Your Own Network:**
1. Draw YOUR network as layers: ISP/router, Wi-Fi, devices (phone/PC/IoT), cloud accounts.
2. Mark the control at each layer (password, firewall, encryption, 2FA, backups).
3. Find a single point of failure: a reason one exploit could take everything.
4. Add ONE compensating layer to break that path (example: keep phone OS updated, or enable 2FA on email).`,
    },
    {
      id: 2,
      slug: "02-zero-trust-architecture",
      title: "Zero Trust: Never Trust, Always Verify",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "From perimeter castle-and-moat to continuous identity-based verification — the architecture reshaping enterprise security.",
      content: `
# Zero Trust: Never Trust, Always Verify

## Why zero trust

The perimeter model assumed "inside the firewall = safe." Then breaches showed: 80%+ of intrusions interact with internal systems, and attackers love the un-trusted-inside assumption. Zero trust inverts it: **no implicit trust based on location or network**.

## The core principles

1. **Continuous verification** — every request authenticated and authorized, regardless of source
2. **Least privilege** — minimum access needed, for minimum time
3. **Assume breach** — segment, encrypt, monitor as if already compromised
4. **Verify explicitly** — identity, device health, context every time

## NIST SP 800-207 pillars

- All data sources and services are resources
- All communication secured regardless of network location
- Access granted per-session, not per-network
- Access determined by dynamic policy (identity, device, behavior)
- Continuous monitoring; no trusted insiders

## The ZTNA experience

Instead of a VPN granting the whole network, **Zero Trust Network Access** grants the app:

\`\`\`
User -> Device check -> Identity (IdP SSO) -> Policy engine
   -> approve/deny -> Micro-segment access to ONE app
\`\`\`

No lateral movement: even a stolen laptop can reach only approved apps, not the domain controller.

## Implementing pragmatically

- Identity as the new perimeter (IdP + MFA everywhere)
- Micro-segmentation (even in cloud VPCs)
- Device compliance checks before resource access
- Session logging + behavioral analytics
- FIDO2 hardware keys for privileged accounts

## The cultural shift

Zero trust is a philosophy, not a product. Vendors sell "ZTNA" but real adoption is policy + telemetry + the willingness to break the "flat network" habit.
`,
      defaultCode: `// A simplified zero-trust access decision
const request = {
  user: 'alice',
  deviceCompliant: true,
  mfa: true,
  allowedApp: 'crm'
};

const granted =
  request.user && request.mfa &&
  request.deviceCompliant && request.allowedApp === 'crm';

console.log('Access granted:', granted);`,
      solution: `const request = {
  user: 'alice',
  deviceCompliant: true,
  mfa: true,
  allowedApp: 'crm'
};

const granted =
  request.user && request.mfa &&
  request.deviceCompliant && request.allowedApp === 'crm';

console.log('Access granted:', granted);`,
      hint: "Every request is re-verified: identity + device + context.",
      challenge: `**Home Lab — Apply Zero Trust at Home:**
1. List every account that can reach a sensitive destination (email, banking, NAS).
2. Enable MFA on ALL of them (this one wins the most).
3. Enforce device checks: unique passwords per device, updates on.
4. Practically segment: keep IoT off your work/email devices' network.
5. Write a paragraph: which of your 'apps' still implicitly trust the network?`,
    },
    {
      id: 3,
      slug: "03-security-by-design",
      title: "Security by Design & Secure Defaults",
      level: "intermediate",
      tag: "concept",
      duration: "30 min",
      description:
        "Build it safe from day one: design principles, the principle of least privilege, and architecture review checklists.",
      content: `
# Security by Design & Secure Defaults

## Retrofit is expensive

Fixing security after launch costs 10-100x more than baking it in. "Shift-left" means considering security at design, not after incidents.

## The principles

1. **Least privilege** — components get the minimum rights to work
2. **Fail-secure** — errors must default to denying
3. **Separation of duties** — no single person/component holds all power
4. **Economy of mechanism** — simpler = fewer bugs
5. **Defense in depth**
6. **Complete mediation** — every access checked (not cached forever)
7. **Secure defaults** — insecure only by explicit choice
8. **Open design** — security not via secrecy of the mechanism (Kerckhoffs)

## Threat modeling at design time

For every design doc: identify assets, draw data flows, apply STRIDE, rank risks, record mitigations. Architecture reviews exist to catch design-level flaws that code review cannot.

## Architecture review checklist (abbreviated)

- Authentication and authorization clearly scoped per component
- Secrets never in code/builds; injected via vault at runtime
- Input validation and output encoding at every trust boundary
- Logging of security-relevant events
- Session management and CSRF defense on stateful webflows
- Data classification and retention defined
- Encryption for data at rest and in transit
- Availability: backup + recovery tested, rollback path exists

## Coding defaults that matter

- Frames, HSTS, CSP headers set by default in the framework
- Parameterized queries default
- Least-privilege DB accounts default
- Error messages do not leak internals

> When a framework ships an insecure default (e.g., no CORS config, debug mode on), and you forget to change it — that's a design-level failure your review checklist should have caught.
`,
      defaultCode: `// Enforce least privilege in code boundaries
const roles = { read: 1, write: 2, admin: 8 };

function authorize(user, required) {
  return (roles[user.role] || 0) >= required;
}
console.log(authorize({ role: 'read' }, roles.admin));
console.log(authorize({ role: 'admin' }, roles.admin));`,
      solution: `const roles = { read: 1, write: 2, admin: 8 };

function authorize(user, required) {
  return (roles[user.role] || 0) >= required;
}
console.log(authorize({ role: 'read' }, roles.admin));
console.log(authorize({ role: 'admin' }, roles.admin));
// read-user denied, admin user allowed`,
      hint: "Enforce roles numerically so least privilege is a comparison, not a special case.",
      challenge: `**Home Lab — Design Review Practice:**
1. Pick a hobby project or a favorite small web app.
2. Apply the 8 design principles: for each, note whether the app follows it.
3. List its "defaults": Does debug mode ship? Are secrets in env vars? Is CORS open?
4. Find one design flaw you could fix with a single configuration change.
5. Write a 5-item security checklist the maintainers should adopt.`,
    },
    {
      id: 4,
      slug: "04-threat-modeling-in-practice",
      title: "Threat Modeling in Practice: STRIDE + DFD",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Build a data-flow diagram and run STRIDE against a real microservice — the practical workflow behind every secure design.",
      content: `
# Threat Modeling in Practice: STRIDE + DFD

## The workflow

1. **Scope** — what component boundary?
2. **Enumerate assets**
3. **Create data-flow diagram (DFD)** — processes, data stores, trust boundaries
4. **Apply STRIDE** per element
5. **Rank & record** — risk score + mitigation + owner

## Data-flow diagram conventions

\`\`\`
[ USER ] --https--> ( API GW ) --gRPC--> ( Orders Svc ) --SQL--> < DB >
    |                     |                    |
 process              process              data store
   |____________________|____________________|
              TRUST BOUNDARY (app zone)
\`\`\`

- Circles/roundrects = processes
- Open rectangles = external entities (user, third party)
- Double edges or store symbol = data stores
- Dashed line = trust boundary

## STRIDE scoring template

| # | Threat | STRIDE | Likelihood (1-5) | Impact (1-5) | Risk | Mitigation |
|---|--------|--------|------------------|--------------|------|------------|
| 1 | Attacker replays order via missing idempotency | R | 4 | 4 | 16 | Idempotency keys |
| 2 | SQL injection in search | T/I | 3 | 5 | 15 | Parameterized queries |
| ... | ... | ... |

## Common pitfalls

- Not crossing trust boundaries (where input arrives is where bugs live)
- Forgetting the "deny by default" angle of STRIDE (E)
- Drowning in detail — model the decision-critical flows
- No owner assigned → findings die

## Tooling

- **OWASP Threat Dragon** (free) — DFD + STRIDE notes
- **Microsoft Threat Modeling Tool** (Windows) — templates
- **PyTM / threatspec** — as-code models you can version

> A practical threat model is one your team can RE-READ. Keep the artifact: an attacker-relevant statement of how the system acts when attacked.
`,
      defaultCode: `// Represent a threat model as structured data
const model = {
  name: 'order-api',
  trusts: [['user', 'api-gw'], ['api-gw', 'orders-svc']],
  dbStore: 'orders-db',
  threats: [
    { id: 1, type: 'Spoofing', risk: 12 },
    { id: 2, type: 'Tampering', risk: 15 }
  ]
};
console.log(model.name, 'threats:', model.threats.length);`,
      solution: `const model = {
  name: 'order-api',
  trusts: [['user', 'api-gw'], ['api-gw', 'orders-svc']],
  dbStore: 'orders-db',
  threats: [
    { id: 1, type: 'Spoofing', risk: 12 },
    { id: 2, type: 'Tampering', risk: 15 }
  ]
};
console.log(model.name, 'threats:', model.threats.length);`,
      hint: "The artifact must identify where trust changes and who owns each risk.",
      challenge: `**Home Lab — Model the 'Forgot Password' Flow:**
1. Draw the DFD: user → web → email service → reset-token store.
2. Mark trust boundaries (where does an email link cross boundaries?).
3. Run STRIDE: list at least 6 threats (one per letter or more).
4. Score each risk; rank top 3.
5. For each top risk, state one mitigation and who should own it.`,
    },
    {
      id: 5,
      slug: "05-security-metrics",
      title: "Security Metrics & Architecture Governance",
      level: "advanced",
      tag: "concept",
      duration: "35 min",
      description:
        "How security teams measure what matters, report to leadership, and keep architecture from decaying back into chaos.",
      content: `
# Security Metrics & Architecture Governance

## Why metrics

Security teams shop with vague "we're more secure now." Metrics translate effort into business language: risk reduced, breaches avoided, coverage increased.

## Good metrics

| Category | Example metric |
|----------|----------------|
| **Coverage** | % of assets with EDR, % of apps with secrets scanning |
| **Speed** | Mean time to patch critical (MTTC), time to provision restricted server |
| **Quality** | % of findings remediated within SLA, vuln-age profile |
| **Detection** | Mean time to detect (MTTD) and respond (MTTR) |
| **Adoption** | Phishing simulation failure rate, training completion |

## Guard against gaming

- Vanity metrics (total alerts) don't drive decisions
- Track the metric + the action it should trigger
- Baseline, then trend: "mean time to patch dropped 3 days quarter-over-quarter"
- Pair lagging (outcome) with leading (input) indicators

## Architecture governance

Constrained "wild west" architecture never stays secure:

- **Architecture Review Board (ARB)** gates design changes
- **Policy-as-code** — IaC checks (e.g., deny world-readable S3) enforced in CI
- **Reference architectures** for common patterns
- **Exception process** — deviation is recorded, dated, owned, and re-reviewed

## The security scorecard

A CISO-grade report:

\`\`\`
Control maturity: 72/100 (baseline 60)
Critical vuln exposure: 14 (target <5) - trend down
Mean time to patch critical: 9 days (SLA 7) - MISS
EDR coverage: 96%
User susceptibility rate: 11% (target <10)
\`\`\`

> Metrics only matter when they change decisions. If a metric does not influence budget, priority, or architecture gate — it is decoration.
`,
      defaultCode: `// Compute a simple coverage score
const total = 120; // endpoints
const edrCovered = 115;
console.log('EDR coverage %:', (edrCovered / total * 100).toFixed(1));`,
      solution: `const total = 120; // endpoints
const edrCovered = 115;
console.log('EDR coverage %:', (edrCovered / total * 100).toFixed(1));
// 95.8`,
      hint: "Report coverage and SLA-achievement; trend them; act on them.",
      challenge: `**Home Lab — Your Personal Security Scorecard:**
1. Define 5 measures meaningful to YOU (patches pending, backups age, 2FA coverage, unlocked sessions/week, phishing-email clicks).
2. Measure the baseline this week.
3. Decide one action per metric and set a 4-week target.
4. In 4 weeks, remeasure and describe the trend.
5. Write a one-line executive summary your future self can read fast.`,
    },
  ],
};