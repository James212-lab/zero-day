import type { Module } from "../curriculum";

export const module20: Module = {
  id: "module-20",
  slug: "20-security-architecture-threat-intel",
  title: "Security Architecture & Threat Intelligence",
  description:
    "Designing defensible systems and turning intelligence into action â€” how senior engineers see the whole board.",
  language: "Architecture & Intel",
  lessons: [
    {
      id: 1,
      slug: "01-security-architecture",
      title: "Security Architecture & Zero Trust",
      level: "advanced",
      tag: "concept",
      duration: "50 min",
      description:
"Design principles, zones and trust â€” plus the Zero Trust model that's redefining the perimeter.",
      content: `# Security Architecture & Zero Trust

## What Architecture Is

**Security architecture** is the *design* of systems so they're safe by construction â€” not "add security later." It answers: "what must be trusted, and how little trust can we get away with?"

## The Classic Principles

1. **Defense in depth** â€” layers; a failure anywhere isn't a failure everywhere
2. **Least privilege** â€” every component only gets what it needs
3. **Fail closed** â€” when in doubt, deny
4. **Separation of duties** â€” no one person can do harmful alone
5. **Least common mechanism** â€” don't share more than required
6. **Economy of mechanism** â€” simplicity is security (complexity breeds holes)
7. **Compartmentalization** â€” break into blast-radius-cells

## Zones as Architecture (the Cisco-to-data-center view)

\`\`\`text
[Internet] â†’ [DMZ] â†’ [Internal] â†’ [Data Center] â†’ [Trusted/Admin]
                each hop = a firewall + a new trust level + a policy change
\`\`\`

**Data flows** (not just network) are the real specifications: what does an app need to communicate with, in which direction, on which ports? That's the allowlist that becomes the firewall rules and the monitoring signature.

## Zero Trust: The 2020s Model

**"Never trust, always verify."** The old model: 'inside the firewall = trusted'. The real model: no implicit trust, every request authenticated & authorized regardless of location:

- **Identity-driven** â€” every request tied to a user+device
- **Micro-segmentation** â€” even East-West traffic is gated
- **Continuous verification** â€” posture checks, re-auth, not 'login once'
- **Assume breach** â€” monitor, log, minimize blast radius

**The classic "castle and moat" vs "crowded city":** every building has its own locks and guards.

## Architecture in Practice (a simple case)

Building a web app:

\`\`\`text
User â†’ WAF â†’ LB â†’ App (containers) â†’ DB (private subnet, no internet)
              â†‘ TLS everywhere  â†‘ least-privilege IAM
              Secrets in a vault, never in images
              Logs > SIEM; Alerts on anom traffic
\`\`\`

Every arrow is a *trust decision* â€” and the plan should show each decision's control.

> **The senior skill:** the ability to see a system as *trust graph* and answer "what's the minimum set of trust relationships that still works?" That question is architecture.
`,
      defaultCode: `// Trust graph: the minimal relationship map
const graph = {
  "edge":   { trusts: ["app"], via: "TLS + WAF" },
  "app":    { trusts: ["db"], via: "mTLS + least-priv user" },
  "app":    { trusts: ["secrets-vault"], via: "IAM role, no static keys" },
  "db":     { trusts: [], via: "private subnet, no egress" },
};
// audit: does any arrow cross a trust level without control?
for (const [k, v] of Object.entries(graph)) {
  if (!v.via) console.log("GAP: no control on", k, "->", v.trusts);
}
console.log("every route has control:", !Object.entries(graph).some(([,v]) => !v.via));`,
  solution: `Every path carries an explicit control â€” the audit of trust relationships is the architecture review.`,
  hint: "If an arrow has no 'via' story, it's an unplanned trust boundary.",
  challenge: `**Home Lab â€” Architect of Your Own Box:**
1. Draw three diagrams: (a) your homelab currently, (b) a VLAN-segmented version (guest/IoT/prod/management zones), (c) a 'zero trust' version with per-app identity.
2. For each arrow in (c), write the control (TLS, IAM, etc.).
3. Pick the ONE improvement with the best effort/reward â€” implement it (e.g., guest VLAN or per-lights credentials).
4. Write a 1-page 'architecture decision record' explaining it.
5. Keep the habit: every future project gets the 'trust graph' sketched first.`,
    },
    {
      id: 2,
      slug: "02-threat-intelligence",
      title: "Threat Intelligence: Sources, Analysis & Action",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
"Structured intelligence, the harm triangle, MITRE ATT&CK, and converting intel into detection and response.",
      content: `# Threat Intelligence: Sources, Analysis & Action

## What Threat Intelligence Is

Not "a list of bad IPs" â€” but **processed, filtered, relevant** information about threats that *your* org can act on. Intelligence = (data + context + analysis) at the moment it helps _you_.

## The Intelligence Cycle

\`\`\`
Requirements â†’ Collection â†’ Processing â†’ Analysis â†’ Dissemination â†’ Feedback
\`\`\`

Start from **requirements** (the questions your leadership asks: "will our sector be targeted?") or the cycle spins without purpose.

## The Harm Triangle (the why-behind-the-bad)

What does the adversary want from *your* organization?

\`\`\`text
      Theft (data, money, IP)
      Disruption (availability, extortion)
      Deception (prestige, influence)
\`\`\`

Organizations rank these differently â€” that ranking IS the intelligence priority list.

## Sources: Open, Feeds, Targeted

- **Open-source (OSINT)** â€” M10: vendor blogs, advisories, dark-web chatter research, public reporting
- **Feeds** â€” MISP/OpenCTI eventstreams, abuse.ch, VirusTotal, **CISA KEV** (M15)
- **Targeted/commercial** â€” monitoring of adversary infrastructure you're exposed to

## MITRE ATT&CK: The Shared Language

The matrix of **tactics** (goals) and **techniques** (methods):

\`\`\`text
Initial Access (T1566 Phishing)
  â†’ Execution (T1059 PowerShell)
  â†’ Persistence (T1547 Startup Folder)
  â†’ Defense Evasion (T1562 Impair Defenses)
  â†’ Credential Access (T1003 Dump LSASS)
  â†’ Collection & Exfiltration (T1041)
\`\`\`

Why it matters: **you can map your detections to techniques, gaps become visible, and you can say "we have an ATP gap at collection."**

## Intelligence Led the Blue Team

1. **Detection** â€” new KEV CVE â‡’ write the Sigma rule NOW (before the smoke)
2. **Hunting** â€” intelligence says sector targeted â‡’ hunt for those TTPs in your logs
3. **Response** â€” incident: check intel for the IOCs/countermeasures
4. **Process** â€” block new C2 domains from virus feeds automatically

\`\`\`bash
# example: jam a feed into your firewall/EDR (education)
# curl the MISP/abuse.ch CSV to a blocklist - the 'dissemination' phase
curl -s https://feed.example/targeted-iocs.csv -o iocs.csv
python3 - <<'PY'
import csv
bad = [r[0] for r in csv.reader(open('iocs.csv')) if r] # IPs
print("pushed", len(bad), "new indicators to deny list")
PY
\`\`\`

## The IOCs vs TTPs Distinction (the mule trap)

- **IOC** â€” specific artifacts (a hash, an IP) = Tom's fingerprints on a window: fast to find, quickly changed by the adversary
- **TTP** â€” *behavior* (how the adversary works) = Tom's *steal intention*: slower to find, harder to change

**Starving on IOCs:** modern attackers rotate domains like socks. Behavior (TTP) detection is what survives.

## Producing Intelligence

- **Define your ADDRESSABLE requirement** ("is our fintech API being targeted?")
- **Answer with evidence + confidence** (confirmed/suspected/unconfirmed â€” language of M14)
- **Timely** â€” Tuesday intel for Friday's attack = intel
=> Echo chamber check: bad intel (stale, vague) drowns good eats away nobody's time. Quality over volume, always.

> **The single most useful habit:** maintain a real ATT&CK mapping table of (technique â†’ do we detect? â†’ evidence). That's what an "intel-driven SOC" actually runs on.
`,
      defaultCode: `#!/bin/bash
# Feedâ†’blocklist+ATT&CK-mapping example (education)
# 1. pull a known-exploited CVE list (KEV)
curl -s https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json \
  -o kev.json
# 2. print CVE count - 'the intel surface'
node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log('KEV CVEs:',j.vulnerabilities.length)})" < kev.json
# 3. (you will map: which of these can our estate detect?)`,
  solution: `Pulls the authoritative KEV list â€” the starting point for 'what to detect/watch' for your estate.`,
  hint: "Intel only matters if it maps to your environment â€” always ask 'and our gap is...?'",
  challenge: `**Home Lab â€” Your Mini Intel Desk:**
1. Subscribe to 2 threat feeds (CISA KEV + one other of your choice).
2. Pick one CURRENT real campaign/advisory; map its TTPs to ATT&CK.
3. Write the 'detection plan' for that campaign against YOUR lab: which 3 rules would you write or which logs to watch?
4. Build your own ATT&CK coverage table (10 techniques, detect: yes/no).
5. Clean-out exercise: delete 1 stale IOC that no longer adds value â€” learn 'quality over volume'.`,
    },
  ],
};