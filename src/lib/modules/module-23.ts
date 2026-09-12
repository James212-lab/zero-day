import type { Module } from "../curriculum";

export const module23: Module = {
  id: "module-23",
  slug: "23-secure-sdlc",
  title: "Software Security & Secure SDLC",
  description:
    "Weave security into every phase of building software: OWASP Top 10 awareness, secure coding, SAST/DAST/SCA, CI/CD gates, and appsec reviews.",
  language: "AppSec",
  lessons: [
    {
      id: 1,
      slug: "01-owasp-top-10-survey",
      title: "OWASP Top 10: The Threat Menu",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "The ten most critical web application security risks — a working survey so you can speak appsec fluently from day one.",
      content: `
# OWASP Top 10: The Threat Menu

The OWASP Top 10 is a periodically updated list of the most critical web app security risks. It is not a complete list — it is the "you must know these now" list.

## The 2021 edition (summary)

1. **A01:2021-Broken Access Control** — users doing more than allowed (IDOR, missing authz checks)
2. **A02:2021-Cryptographic Failures** — sensitive data exposed (no TLS, weak hashing, hardcoded keys)
3. **A03:2021-Injection** — SQL/NoSQL/LDAP/OS/command injection
4. **A04:2021-Insecure Design** — missing threat modeling, rate limits, business logic gaps
5. **A05:2021-Security Misconfiguration** — default creds, verbose errors, unpatched components (was A05 too)
6. **A06:2021-Vulnerable and Outdated Components** — known CVEs in libraries
7. **A07:2021-Identification and Authentication Failures** — weak passwords, session flaws, no MFA
8. **A08:2021-Software and Data Integrity Failures** — insecure deserialization, untrusted CI/CD, signed artifacts
9. **A09:2021-Security Logging and Monitoring Failures** — no logs, no alerting
10. **A10:2021-Server-Side Request Forgery (SSRF)** — server fetches attacker-controlled URLs

\`\`\`
Attackers exploit:  Broken Access Control -> IDOR is #1 in real data
What defenders underuse: logging & monitoring (A09)
\`\`\`

## How to use it

- Not a checklist to "pass" — a **risk lens** for design reviews and tests
- The detailed risks (e.g., the full injection page) are the real depth
- Combine with OWASP ASVS for a strong verification standard
- Pair with the OWASP Testing Guide for actual attack steps

> Industry data consistently shows Broken Access Control and Cryptographic Failures at the top of breaches. When auditing any app, start there.
`,
      defaultCode: `// Map your app's concerns to OWASP categories
const risks = ['A01','A03','A05','A07'];
const checked = [
  'A01 access control logic reviewed',
  'A03 parameterized queries',
  'A05 secure defaults verified',
  'A07 MFA enforced'
];
for (const c of checked) console.log(c);`,
      solution: `const risks = ['A01','A03','A05','A07'];
const checked = [
  'A01 access control logic reviewed',
  'A03 parameterized queries',
  'A05 secure defaults verified',
  'A07 MFA enforced'
];
for (const c of checked) console.log(c);`,
      hint: "For any web app you touch, know where its A01 and A03 exposures sit.",
      challenge: `**Home Lab — Pen-Test the Top 10 Mentally:**
1. Pick any web app you use daily.
2. Walk each of the 10 categories and note WHERE the app might be exposed (guess, then verify what you can).
3. Check obvious ones: Is the site HTTPS-only? Does it rate-limit login (try 5 bad passwords against YOUR OWN account in a private context — carefully, legally)? Does a URL look like an IDOR target (e.g., /order/1234)?
4. Write down: 3 highest-risk guesses and any secure design you notice.`,
    },
    {
      id: 2,
      slug: "02-secure-coding-basics",
      title: "Secure Coding: Injection, XSS, Path Traversal",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Write code that does not get pwned: parameterized queries, output encoding, input validation, and file-path handling.",
      content: `
# Secure Coding: Injection, XSS, Path Traversal

## Injection (SQL)

Unsafe:
\`\`\`
query = "SELECT * FROM users WHERE name = '" + userInput + "'"
\`\`\`
User input: \`' OR '1'='1'\` → returns everything or bypasses login.

Safe:
\`\`\`
query = "SELECT * FROM users WHERE name = ?"
db.execute(query, [userInput])   // parameterized
\`\`\`
The driver treats input as data, never SQL.

## XSS (output encoding)

User input echoed into HTML is dangerous unless encoded. Context matters: HTML, attribute, JS, CSS, URL all encode differently. Rule: **encode on output**, in the receiver's context.

\\\` \\\` \\\`
<div>HELLO <script>... // bad: raw insertion
&lt;img src=x onerror=alert(1)&gt; // encoded presentation
\\\` \\\` \\\`

## Path traversal

Never splice user input into filesystem paths:
\`\`\`
../ / ..\\ ..%2f  ->  escape the web root and read /etc/passwd
\`\`\`
Use a whitelist, canonicalize the resolved path, and ensure it stays under the base directory (path.resolve + startsWith check).

## Input validation principles

- **Whitelist > blacklist** — decide what is allowed, reject the rest
- Validate **syntax** (type, length, charset) then **semantics** (domain logic)
- Validate on the server, never trust client
- Canonicalize before validating (unicode normalization, decoding)

## Command injection

Never build shell commands from input. If unavoidable: use parameterized exec calls (execFile/spawn with array args), never a string concatenated into sh.

> The single most reusable rule: **data and code must be separated**. Wherever user data meets a parser (SQL, shell, HTML, LDAP, XML), choose the safe-parameterized path.
`,
      defaultCode: `// Safe vs unsafe string building for SQL
const userInput = "'; DROP TABLE users;--";

// UNSAFE (string interpolation)
const unsafe = "SELECT * FROM users WHERE name = '" + userInput + "'";

// SAFE: treat input as a value, not fragments
const safe = ['SELECT * FROM users WHERE name = ?', userInput];
console.log('unsafe built as:', unsafe);
console.log('safe keeps it a parameter:', safe[1] === userInput);`,
      solution: `const userInput = "'; DROP TABLE users;--";
const unsafe = "SELECT * FROM users WHERE name = '" + userInput + "'";
const safe = ['SELECT * FROM users WHERE name = ?', userInput];
console.log('unsafe built as:', unsafe);
console.log('safe keeps it a parameter:', safe[1] === userInput);`,
      hint: "Injection = treating data as code. Parameterize to keep them separate.",
      challenge: `**Home Lab — Find Real SQLi in a Safe Playground:**
1. Run \`docker run -d -p 8080:80 vulnerables/web-dvwa\` (or use DVWA in your lab).
2. Open the SQL Injection page, set security level LOW.
3. Try: \`' OR '1'='1\` and \`'\` (single quote) and watch the errors.
4. Try the same with password \`' OR '1'='1' -- \` style payloads against a login page of the lab.
5. Write a paragraph: what does parameterization change about that interaction?`,
    },
    {
      id: 3,
      slug: "03-sast-dast-sca",
      title: "SAST, DAST & SCA: The AppSec Toolchain",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "Static analysis, dynamic testing, and software composition analysis — and how to run them continuously, not once.",
      content: `
# SAST, DAST & SCA: The AppSec Toolchain

## The three engines

| Tool | What it does | Pros | Cons |
|------|--------------|------|------|
| **SAST** | Static Application Security Testing — scans source/bytecode | Fast, finds root causes, low false-ok | False positives, sees code not runtime |
| **DAST** | Dynamic — black-box tests a running app | Finds runtime/confg issues, no source needed | Misses deep paths, slower |
| **SCA** | Software Composition Analysis — audits open-source deps | Finds known CVEs (A06) | Noise in huge dep trees |

Plus: **IAST** (agent in the running app), **MAST** (mobile), **Secret scanning** (rotating tokens in repos).

## Where they fit in CI/CD

\`\`\`
commit -> [SAST + secret scan] -> build -> [SCA + SBOM] ->
test -> [DAST on staging] -> approval gates -> deploy -> [runtime]
\`\`\`

- Fail the build on critical/high SAST findings
- Pull-request comments so the *author* fixes it
- Scan every merge, not nightly-only
- SCA alerts on newly disclosed CVEs of already-shipped deps

## Results management

- Triage: true positive vs false positive
- SLA by severity
- Dedupe against prior scans (MRR — mean remediation rate)
- Let developers filter "new vs existing" findings

## Tooling examples

- SAST: Semgrep, CodeQL, SonarQube, Fortify/Checkmarx
- DAST: OWASP ZAP, Burp Pro scanner, HCL AppScan
- SCA: Snyk, Dependabot, Trivy, Grype

## SBOM (SBOM = Software Bill of Materials)

A machine-readable inventory of components (SPDX or CycloneDX). Required by modern supply chain exec orders. SCA feeds the SBOM; the SBOM makes "is Log4Shell in our stack?" answerable in minutes.
`,
      defaultCode: `// A tiny SAST-style check as a reminder of the model
const findings = [
  { severity: 'high', rule: 'sql-injection-unparameterized', path: 'db.js' },
  { severity: 'low', rule: 'no-frames-issue', path: 'view.js' }
];
const blocker = findings.find(f => f.severity === 'high');
if (blocker) {
  console.log('BLOCK build:', blocker.rule, '@', blocker.path);
} else {
  console.log('Build allowed');
}`,
      solution: `const findings = [
  { severity: 'high', rule: 'sql-injection-unparameterized', path: 'db.js' },
  { severity: 'low', rule: 'no-frames-issue', path: 'view.js' }
];
const blocker = findings.find(f => f.severity === 'high');
if (blocker) {
  console.log('BLOCK build:', blocker.rule, '@', blocker.path);
} else {
  console.log('Build allowed');
}
// High severity blocks; low doesn't.`,
      hint: "Gate on severity, and let developers see findings at commit time.",
      challenge: `**Home Lab — Scan a Real Project:**
1. Take any tiny GitHub project you like (or one of your own).
2. Run \`npx semgrep scan\` (if available) or \`npm audit\`/your language's audit tool.
3. Run a dependency scan: \`npx snyk test\` requires account; \`npm audit\` is free/local — use it.
4. List: findings, severities, and which are true vs false positives.
5. Write a one-line gate policy: which severities would block your CI?`,
    },
    {
      id: 4,
      slug: "04-cicd-security-supply-chain",
      title: "CI/CD Security & Software Supply Chain",
      level: "advanced",
      tag: "concept",
      duration: "40 min",
      description:
        "Your pipeline is the crown jewels: protecting build servers, secrets in CI, dependency confusion, and signed artifacts.",
      content: `
# CI/CD Security & Software Supply Chain

## Why pipeline security matters

If an attacker can modify your build, they own every customer who installs the product. Supply chain attacks (SolarWinds 2020, XZ utils 2024) show the blast radius: poison once, consume forever.

## Attackers' favorite moves

- **Dependency confusion** — publish a malicious package with the same name as an internal one, with a higher version, to public registries
- **Typosquatting** — a similarly-named package ("requests-ssl")
- **Stolen CI tokens** — exfiltrated env vars in build logs
- **Compromised upstream** — a legit dependency gets backdoored
- **Build-time code injection** — PRs with malicious workflow changes

## Core defenses

- Pin exact dependency versions; lockfiles committed; verify checksums
- **Secrets never in the repo**: use the secret manager + inject at runtime; rotate leaked tokens
- Least-privilege CI tokens; short-lived credentials
- **Signed artifacts** — sign builds; consumers verify (SLSA levels)
- Require PR approval + signed commits for release branches
- Scope dependency feeds: allow trusted registries/namespaces only
- Monitor advisories → **SBOM** matching to your inventory

## SLSA in one paragraph

Supply-chain Levels for Software Artifacts (salsa.dev): four levels describing provenance integrity — from "nothing" (L0) to "hosted auditable builds with signed provenance" (L3/L4). Aim L3+ for release artifacts.

## IaC as part of pipeline

- Scan Terraform/CloudFormation/K8s manifests in PR (checkov, tfsec, KICS)
- Gate on misconfigurations (world-open S3, admin-users, egress everything)
- Enforce drift detection: prod must match reviewed IaC.

> Cold realism: the hardest part is not the tooling — it is writing a pipeline where a compromised dependency or a tired engineer cannot silently ship malicious code.
`,
      defaultCode: `// Gate a release on signed provenance (conceptual)
const release = {
  artifact: 'pkg-1.2.3.tgz',
  signatureValid: true,
  provenanceLevel: 3 // SLSA
};
const shippable =
  release.signatureValid && release.provenanceLevel >= 2;
console.log('Release shippable:', shippable);`,
      solution: `const release = {
  artifact: 'pkg-1.2.3.tgz',
  signatureValid: true,
  provenanceLevel: 3 // SLSA
};
const shippable =
  release.signatureValid && release.provenanceLevel >= 2;
console.log('Release shippable:', shippable);`,
      hint: "Pin versions, guard secrets, sign artifacts, verify provenance.",
      challenge: `**Home Lab — Harden a Pipeline You Control:**
1. If you have a GitHub repo, go to Settings → Secrets and review what's stored (rotate anything exposed in logs).
2. Add a .github/dependabot.yml to auto-raise dependency PRs.
3. Enable branch protection on main: require PR + reviews.
4. If you use GitHub Actions, review each action pins a full commit SHA.
5. Write: your worst-case supply-chain exposure and the cheapest fix.`,
    },
    {
      id: 5,
      slug: "05-appsec-review-methodology",
      title: "AppSec Review & Threat Modeling in SDL",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Run a real application security review: gather the picture, test the critical flows, and write findings a developer can actually fix.",
      content: `
# AppSec Review & Threat Modeling in SDL

## The review loop (Microsoft SDL style)

1. **Requirements** — security requirements per feature (authz scope, data classification)
2. **Design** — threat model the feature before code
3. **Implementation** — secure coding standards, SAST in CI
4. **Verification** — code review, dynamic tests, fuzzing
5. **Response** — incident plan and post-release monitoring

## Practical review checklist (web)

- Authentication: brute-force protection, session fixation, logout
- Authorization: server-side checks per object (IDOR!)
- Input: validation, length, encoding on output
- Secrets: none in code, none in logs
- Sessions: HttpOnly+Secure flags, rotation on privilege change
- Crypto: modern ciphersets, no homegrown crypto
- Headers: CSP, HSTS, X-Frame-Options, Referrer-Policy
- Dependencies: SCA coverage, no known-critical CVEs
- Rate limits: login, forms, APIs
- Logging: authz events, anomalies, no secrets in logs

## Writing findings devs love (and fix)

Good finding:

- **Title**: "IDOR allows order enumeration for any user"
- **Severity & CVSS**: 8.1 (High)
- **Affected**: GET /api/orders/{id}, no ownership check
- **Repro**: curl with other user's id
- **Impact**: disclosure of order PII
- **Fix**: verify resource ownership server-side before returning

## Verify, don't assume

Run the test yourself (legal scope!), capture evidence (request/response, redacted), and only report what you reproduced. Then track the fix to done, then re-test.

> A review that names a risk without a reproducible repro wastes everyone's time. Evidence-first reporting is the difference between a "ticket" and a "security fix."
`,
      defaultCode: `// Score findings to route remediation
const findings = [
  { id: 1, severity: 'critical', fixedDays: 2 },
  { id: 2, severity: 'high', fixedDays: 7 },
  { id: 3, severity: 'medium', fixedDays: 30 }
];
for (const f of findings) {
  console.log(f.id, f.severity, '-> SLA', f.fixedDays, 'days');
}`,
      solution: `const findings = [
  { id: 1, severity: 'critical', fixedDays: 2 },
  { id: 2, severity: 'high', fixedDays: 7 },
  { id: 3, severity: 'medium', fixedDays: 30 }
];
for (const f of findings) {
  console.log(f.id, f.severity, '-> SLA', f.fixedDays, 'days');
}`,
      hint: "Repro, evidence, severity, fix suggestion. Then track to close.",
      challenge: `**Home Lab — Review Your Own Small App:**
1. Choose any tiny app you have built (or scaffold one with a login).
2. Run the checklist above — test: can you read another user's data? Is login rate-limited? Are secrets in config files?
3. Write 3 formal findings in the "developer-friendly" format above.
4. Fix the top one TODAY and re-test your repro to confirm it's gone.
5. Note what the review process taught you about writing code.`,
    },
  ],
};