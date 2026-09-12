import type { Module } from "../curriculum";

export const module24: Module = {
  id: "module-24",
  slug: "24-ethical-hacking-methodology",
  title: "Ethical Hacking Methodology",
  description:
    "How professional pen tests actually run: engagement types, rules of engagement, scoping, the test lifecycle, reporting, and professional conduct.",
  language: "Offensive",
  lessons: [
    {
      id: 1,
      slug: "01-engagement-types",
      title: "Engagement Types & Rules of Engagement",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Black-box vs white-box vs gray-box, and the legal scoping document that makes testing legal.",
      content: `
# Engagement Types & Rules of Engagement

## Test models

| Model | Knowledge given | Realism of attacker |
|-------|-----------------|---------------------|
| **Black-box** | Nothing (or fake account) | External attacker / zero-day researcher |
| **Gray-box** | Credentials, architecture summary | Insider-ish, realistic post-authenticated risk |
| **White-box** | Full source, config, infra docs | Audits, DevSecOps, "assume knowledge" |

Budget and goals drive choice: black-box is realistic but expensive; white-box finds the deepest logic flaws fast.

## Rules of Engagement (RoE) — the legal scope

Everything you may test, defined in writing:

- Authorized target range/organization (IP scope, domains, hosts)
- Testing window (start/stop, blackout times)
- Allowed techniques (or **prohibited**: DoS severities, social engineering, exfiltration, destructive actions)
- Emergency contacts + stop-work trigger
- Data handling (no copying beyond need, no personal data)
- Lines of communication and reporting cadence

## Scope boundaries worth negotiating

- Third-party systems (a SaaS you use) — often out of scope, requires their vendor authorization
- Production vs staging — prefer staging for dangerous tests
- Cloud provider basins (AWS/DB) — respect provider terms
- Sensitive systems (HR, billing) — flag "careful handling" rather than forbid

## Getting it in writing

A professional test ONLY with a signed RoE/SOW/authorization letter. Verbally "about it" is not authorization. When in doubt: stop and ask in writing.

> Memorize the question: "Who authorized this, in writing, and what exactly did they authorize?" If you cannot answer with documents, you are not testing — you are committing a crime.
`,
      defaultCode: `// Model the RoE as gates your test must respect
const roe = {
  targets: ['10.0.0.0/24'],
  techniques: ['recon','scan','exploit'],
  prohibited: ['dos','exfil','social-eng'],
  window: { start: '09:00', end: '18:00' }
};
function allowed(technique) {
  return !roe.prohibited.includes(technique);
}
console.log('dos allowed?', allowed('dos'));
console.log('scan allowed?', allowed('scan'));`,
      solution: `const roe = {
  targets: ['10.0.0.0/24'],
  techniques: ['recon','scan','exploit'],
  prohibited: ['dos','exfil','social-eng'],
  window: { start: '09:00', end: '18:00' }
};
function allowed(technique) {
  return !roe.prohibited.includes(technique);
}
console.log('dos allowed?', allowed('dos'));
console.log('scan allowed?', allowed('scan'));`,
      hint: "If a technique or target is not in writing, treat it as forbidden.",
      challenge: `**Home Lab — Draft Your Own RoE:**
1. Imagine you are authorized to test your OWN lab network (10.0.0.0/24 with 3 VMs).
2. Write a 1-page RoE: targets, window, allowed techniques, prohibited items, communication plan.
3. List 3 edge cases you would bring up in a kickoff call (e.g., what if production goes down mid-test?).
4. Save this template — you will reuse it for every engagement concept in this course.`,
    },
    {
      id: 2,
      slug: "02-testing-lifecycle",
      title: "The Penetration Testing Lifecycle",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "Recon → Scanning → Exploitation → Post-exploitation → Reporting — plus planning, disclosure and lessons learned.",
      content: `
# The Penetration Testing Lifecycle

## The phases

\`\`\`
1. Pre-engagement (scope, RoE, kickoff)
2. Reconnaissance (passive -> active)
3. Scanning & Enumeration (ports, services, vulns)
4. Exploitation (gain initial access)
5. Post-exploitation (privesc, persistence, pivot, data)
6. Reporting (findings, severity, remediation)
7. Lessons learned & retest (close the loop)
\`\`\`

## Phase highlights

**Recon**: passive first (DNS, OSINT, Shodan, search engines) then active (scan). Passive = legal-ish, low noise; active = your RoE window.

**Scanning**: nmap host disover → port scan → service detection → NSE vuln scripts. Enumerate everything a service "tells" you.

**Exploitation**: match findings to exploits; verify impact. Professional exploitation is *proof of impact* with minimal damage.

**Post-exploitation**: privilege escalation (from rogue user to admin/root), lateral movement simulation, persistence proof, then collect "what would the attacker take" — but within RoE limits.

**Reporting**: every finding has repro steps, severity (CVSS), impact, and a fix. Executive summary for leadership, technical detail for devs.

## Time allocation reality

Reporting is where professionals separate from hobbyists. A good report takes longer than the exploitation did.

## Retesting

A retest verifies each finding is fixed. Professional courtesy: report the retest result per CVE ID, keeping history.
`,
      defaultCode: `// Track lifecycle phase status during an engagement
const lifecycle = [
  'recon', 'scan', 'exploit', 'post-exploit', 'report'
];
let step = 0;
function next(milestone) {
  console.log('Reached', milestone, 'at', lifecycle[step]);
  step = Math.min(step + 1, lifecycle.length - 1);
}
next('internal access'); next('domain admin');`,
      solution: `const lifecycle = [
  'recon', 'scan', 'exploit', 'post-exploit', 'report'
];
let step = 0;
function next(milestone) {
  console.log('Reached', milestone, 'at', lifecycle[step]);
  step = Math.min(step + 1, lifecycle.length - 1);
}
next('internal access'); next('domain admin');`,
      hint: "Recon and reporting bookend everything — both matter as much as finding shells.",
      challenge: `**Home Lab — Run the Lifecycle on a Lab Machine:**
1. In your VirtualBox lab, boot a Metasploitable 3 or an intentionally vulnerable VM.
2. Walk: recon (nmap scan), enumerate (open service versions), exploit or at least identify exploit candidates.
3. If exploitation would risk the lab, stop at "candidate identified + repro planned".
4. Write a 1-page "findings report" in the professional format.
5. Note which phase consumed the most time and why.`,
    },
    {
      id: 3,
      slug: "03-reconnaissance-passive-active",
      title: "Reconnaissance: Passive & Active",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Gather intel without touching the target, then shift to active scanning — the phase most people skip and attackers love.",
      content: `
# Reconnaissance: Passive & Active

## Passive recon (no target contact)

- DNS: whois, dig/nslookup, SPF/DMARC, subdomain brute-listing
- Search engines: Google dorking ("filetype:pdf site:company.com")
- Shodan/Censys: exposed services by org IP space
- OSINT social: LinkedIn employees, GitHub repos, job listings (stack hints)
- Certificate transparency logs (crt.sh) — subdomains revealed by TLS certs
- Breach databases: haveibeenpwned-style leaks (pwned data)

## Active recon (methods that touch the target)

- Ping sweeps (fping, nmap -sn)
- Port scans
- Banner grabbing (nc, scripts)
- Web enumeration: robots.txt, sitemaps, headers, tech fingerprint (whatweb)
- API enumeration: open endpoints, versioned paths

## Google dorking power

\`\`\`
site:example.com filetype:sql
site:example.com intitle:"index of" (directory listing)
inurl:admin inurl:login
"password" filetype:log site:example.com
\`\`\`

## Defense angle (what blue teams want you to think)

- Web server errors reveal stack → strip details
- Directory listings → disable
- Unnecessary open ports → firewall
- Subdomains → wildcard certs and monitoring
- Published GitHub secrets → secret scanning + rotation

> Every byte of recon shrinks the exploitation phase. A thorough mapper finds the seam before the big hammer is needed.
`,
      defaultCode: `// Order your recon into a playbook
const recon = [
  { step: 'whois', passive: true },
  { step: 'crt.sh-subdomains', passive: true },
  { step: 'shodan', passive: true },
  { step: 'nmap-scan', passive: false }
];
for (const r of recon) {
  console.log((r.passive ? '[passive] ' : '[active] ') + r.step);
}`,
      solution: `const recon = [
  { step: 'whois', passive: true },
  { step: 'crt.sh-subdomains', passive: true },
  { step: 'shodan', passive: true },
  { step: 'nmap-scan', passive: false }
];
for (const r of recon) {
  console.log((r.passive ? '[passive] ' : '[active] ') + r.step);
}`,
      hint: "Passive first: DNS, cert logs, OSINT — before any packet touches the target.",
      challenge: `**Home Lab — OSINT Your Own Digital Footprint:**
1. Choose something you own (your GitHub username, a domain you have).
2. Run WHOIS on it; enumerate via crt.sh; check Shodan for exposed services on your home IP.
3. Google-dork your own name honestly and catalog what's public.
4. List 3 pieces of your own info that aid \`attacker\` targeting.
5. Write a paragraph: how does recon shape what you should NOT publish?`,
    },
    {
      id: 4,
      slug: "04-scanning-exploitation-workflow",
      title: "Scanning, Exploitation & Post-Exploitation",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "From nmap results to a working foothold on a lab target — the hands-on core routine of every professional test.",
      content: `
# Scanning, Exploitation & Post-Exploitation

## The workflow loop

1. **nmap** open ports → **service versions** (-sV) → **vuln hints** (NSE script, searchsploit)
2. Pick the most promising service
3. Research the version against exploit-db (searchsploit)
4. Craft or run the exploit against a lab target
5. Verify: did you get code execution / access?
6. Post-exploit: understand the foothold, privileges, and next destination

## An efficient nmap practice

\`\`\`
nmap -sC -sV -oA target 10.0.0.5
# -sC default scripts, -sV versions, -oA all formats
sudo nmap -sS -O 10.0.0.5   # stealth SYN scan + OS detection (root)
nmap -p- --min-rate 1000 10.0.0.5  # full port range fast
\`\`\`

## From version to exploit

Version string "Apache/2.4.29 (Ubuntu)" → searchsploit apache 2.4.29 → likely nothing for the service itself → pivot to the app behind it (admin panel version, .php interface).

## Understanding your foothold

- User context (www-data vs SYSTEM vs root)
- What can it reach? (pivot map, network from box)
- What creds/secrets exist? (configs, history, env)
- What runs on the box? (cron jobs, scheduled tasks — persistence bait)

## Post-exploitation restraint

Professionals gather **proof** and **access paths**, not bags of cash. Screenshot the win, log the exact commands, note the impact, clean up any changes (within RoE), and move lightly.

> The mindset: "I am mapping the adversary's road to the objective" — not "I need a shell on everything."
`,
      defaultCode: `// Build an intel summary per host from scan data
const host = {
  ip: '10.0.0.5',
  ports: [ { port: 22, service: 'SSH', version: 'OpenSSH 7.2' },
           { port: 80, service: 'HTTP', version: 'Apache 2.4.29' } ],
  candidates: ['http admin panel', 'ssh auth brute']
};
for (const p of host.ports) {
  console.log(host.ip + ':' + p.port, p.service, p.version);
}`,
      solution: `const host = {
  ip: '10.0.0.5',
  ports: [ { port: 22, service: 'SSH', version: 'OpenSSH 7.2' },
           { port: 80, service: 'HTTP', version: 'Apache 2.4.29' } ],
  candidates: ['http admin panel', 'ssh auth brute']
};
for (const p of host.ports) {
  console.log(host.ip + ':' + p.port, p.service, p.version);
}`,
      hint: "Service version -> vulnerability candidates -> exploit. Log every step.",
      challenge: `**Home Lab — Full Workflow on Metasploitable:**
1. Boot your lab target (Metasploitable 2/3).
2. nmap full: \`sudo nmap -sS -sV -O 10.0.0.5\`
3. Identify 3 attackable services (versions).
4. For each, run \`searchsploit <service> <version>\` to list public exploits.
5. (Optional, carefully) exploit ONE service in the lab; verify what you gained.
6. Write a per-host summary line: IP, ports, services, candidates, priority.`,
    },
    {
      id: 5,
      slug: "05-reporting-communicating",
      title: "Reporting & Professional Communication",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Turn raw findings into an executive-grade report: severity, CVSS, repro, impact, remediation — the deliverable that gets you paid and trusted.",
      content: `
# Reporting & Professional Communication

## The audience split

- **Executives** care about business risk: "what does this mean for us, in numbers/money?"
- **Engineering** cares about reproducible fixes: "which file, which line, which config?"
- **Compliance** cares about evidence: scan dates, scope, remediation status

A good report serves all three in sections.

## Finding anatomy

| Field | Example |
|-------|---------|
| Title | "SQL injection in product search" |
| Severity | High (CVSS 8.6 vector AV:N/AC:L/... ) |
| Asset/endpoint | https://app.example.com/api/products?q= |
| Description | The q parameter built into SQL unsafely |
| Vulnerability detail | Parameterized query missing; stacked queries possible |
| Reproduction | exact curl + request/response (redacted PII) |
| Impact | Full DB read incl. customer PII; potential RCE via stacked + INTO OUTFILE |
| Recommendation | Use parameterized queries; add WAF rule while fixing |
| Reference | CWE-89, OWASP A03 |

## Severity calibration

- Critical: unauthenticated RCE, default-credent access to admin
- High: authenticated RCE, SQLi on sensitive data
- Medium: XSS limited scope, misconfigurations you can exploit
- Low: info disclosure, hygiene

Never inflate: credibility dies with exaggeration. CVSS vector provides the objective numeric anchor.

## Essentials to include

- Executive summary (top findings, risk statement)
- Methodology (tests run, what was covered and NOT)
- Scope + RoE reference
- Findings with the anatomy above
- Remediation prioritized (p0 now, p30 days, etc.)
- Appendix: detailed repro, tool versions, evidence hashes

> The report is the product. Exploits are the means. If your report is readable and actionable, you are worth every dollar. Trim fluff; keep proof.
`,
      defaultCode: `// Draft a finding object for the report
const finding = {
  title: 'SQL injection in product search',
  severity: 'High',
  cvss: 8.6,
  repro: ['GET /api/products?q=" OR 1=1--'],
  impact: 'Full database read',
  fix: 'Use parameterized queries'
};
console.log(finding.title, '|', finding.severity, finding.cvss);`,
      solution: `const finding = {
  title: 'SQL injection in product search',
  severity: 'High',
  cvss: 8.6,
  repro: ['GET /api/products?q=" OR 1=1--'],
  impact: 'Full database read',
  fix: 'Use parameterized queries'
};
console.log(finding.title, '|', finding.severity, finding.cvss);`,
      hint: "Every finding: repro + impact + fix. Calibrate severity honestly.",
      challenge: `**Home Lab — Write the Report:**
1. Use today's lab scan results (or the findings report you drafted earlier).
2. Write an executive summary of 4 sentences and a technical section with 2 polished findings in the anatomy above.
3. Add 3 CVSS vectors you can defend (quote 2 of them).
4. Peer-review your own report: is the repro copy-pasteable? Is impact business-readable?
5. Store it — this is your writing portfolio start.`,
    },
    {
      id: 6,
      slug: "06-legal-reporting-tools",
      title: "Legal Boundaries & Engagement Tooling",
      level: "advanced",
      tag: "lab",
      duration: "40 min",
      description:
        "The reporting stack (Faraday/Dradis), evidence preservation, and the legal traps that end careers — handled professionally.",
      content: `
# Legal Boundaries & Engagement Tooling

## Tooling for structure

- **Faraday / Dradis** — centralize findings, assets, evidence
- **Ghostwriter** (SpecterOps) — report generation + tracking
- **CherryTree / Obsidian** — private notes that link
- **Keep**: scope doc, RoE, scan outputs, screenshots, command logs, session IDs

Store evidence with hashes. If a client disputes a finding, your evidence must survive inspection.

## Evidence discipline

- Save raw nmap/curl output (not just summaries)
- Timestamp every action (your command history matters)
- Record DURING, not after (memory is unreliable)

## Legal traps (real cases)

- Scanning a range you "assumed" was in scope
- Exfiltrating more than needed for proof ("pwned data")
- Social engineering a helpdesk employee without authorization
- Running a destructive DoS that breaks the client's prod
- Publishing client findings publicly without consent

Every one of these has ended a career. The fix is the same: **written scope, minimal action, evidence, discretion**.

## The authorized boundary check

Before any test step ask:

\`\`\`
Does the RoE authorize this target?
Does the RoE authorize this technique?
Is this necessary to prove the finding?
Will this action be reversible/clean?
\`\`\`
If any answer is no — stop, ask, document.

## After the engagement

- Deliver the report
- Clean up any test artifacts (in scope!)
- Rotate/retire test credentials
- Mutual close-out: what did we find, what changed, what's next?

> A pentester's career is a graveyard of people who got the shell but forgot the scope. Professionalism is 30% skill and 70% boundaries.
`,
      defaultCode: `// The four-question gate before any test step
const questions = [
  'target authorized?',
  'technique allowed?',
  'necessary for proof?',
  'recoverable / clean?'
];
for (const q of questions) {
  console.log('ASK:', q);
}
console.log('If any answer is NO -> stop and document');`,
      solution: `const questions = [
  'target authorized?',
  'technique allowed?',
  'necessary for proof?',
  'recoverable / clean?'
];
for (const q of questions) {
  console.log('ASK:', q);
}
console.log('If any answer is NO -> stop and document');`,
      hint: "Authorized. Allowed. Necessary. Recoverable. All four, every step.",
      challenge: `**Home Lab — Evidence Folder Practice:**
1. Create an 'engagement' folder with subfolders: scope, scan-output, exploits, evidence, report.
2. Run one scan against a lab box and save raw output (tee/nmap -oA).
3. Hash your evidence files (sha256) into a manifest.
4. Write your personal 4-question gate and commit to memory.
5. Review: what would a client ask if a finding is disputed? Can you answer?`,
    },
  ],
};