import type { Module } from "../curriculum";

export const module15: Module = {
  id: "module-15",
  slug: "15-vulnerability-management",
  title: "Vulnerability Management & Prioritization",
  description:
    "Discover, assess, prioritize, remediate, verify: the full vulnerability management program and the art of knowing what to fix first.",
  language: "Blue Team",
  lessons: [
    {
      id: 1,
      slug: "01-vuln-mgmt-lifecycle",
      title: "The Vulnerability Management Lifecycle",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Discover, Assess, Prioritize, Remediate, Verify, Report — the loop that keeps an estate patched in a moving-threat world.",
      content: `# The Vulnerability Management Lifecycle

## Why Vulnerability Management Is a Program, Not a Scan

A scan alone changes nothing. The **program** is the loop that turns "there are vulnerabilities" into "they are managed":

\`\`\`
Discover → Assess → Prioritize → Remediate → Verify → Report
         ↑                                      │
         └──────────────────────────────────────┘
\`\`\`

## The Six Steps

**1. Discover** — know what you own
- Asset inventory (the elephant in the room: you can't secure what you don't know exists)
- Scanning, agents, cloud configuration APIs, CMDBs
- Continuous discovery of new/shadow IT

**2. Assess** — find the vulnerabilities
- Scanner (Nessus/OpenVAS/Qualys/Rapid7) produces finding lists
- Agent-based vs network scanning
- False positive verification (M10 lesson 3)

**3. Prioritize** — decide what to fix FIRST (the whole art)
- NOT "fix highest CVSS first" — context beats number
- CVSS + exploitability + asset value + business impact

**4. Remediate** — patch, configure, mitigate, accept
- **Patch** (vendor fix) is most common; **configuration** change; **remediation** plan; **compensating control**; or formal **risk acceptance**

**5. Verify** — rescan to confirm closure

**6. Report** — to decision-makers in business language (risk in, risk out)

## The Metrics of VM

- **MTTR for critical findings** (how fast does critical get patched?)
- % of criticals open > 30 days
- Re-opened findings (patch failed / bypass)
- Scan coverage % (assets scanned)
- Vulnerability density (per system or per department)

## The 2026 Rule of Thumb

Automation is HOW you scale:
- Auto-inventory (agents + cloud APIs)
- Auto-patch for baseline OS patching (Patch Tuesday rhythm)
- Auto-risk-score the findings (the priority problem solved by a machine that combines CVE data)

> **Blue-team truth:** your vulnerability program's worst day isn't "critical" findings piling up — it's "nobody told me we had that server," i.e. inventory failure. Discovery is the foundation.
`,
      defaultCode: `// Simple prioritization: CVSS is not enough
function prioritize(findings) {
  return findings
    .map(f => ({
      ...f,
      priority: (f.exploitable ? 2 : 0) +
                (f.criticalAsset ? 3 : 0) +
                (f.businessCritical ? 2 : 0),
    }))
    .sort((a, b) => b.priority - a.priority);
}
const out = prioritize([
  { id: 1, cvss: 10, exploitable: false, criticalAsset: false, businessCritical: false },
  { id: 2, cvss: 7, exploitable: true,  criticalAsset: true,  businessCritical: true },
]);
console.log("top fix:", out[0].id); // 2, not the 10 — context decides`,
  solution: `Risk-scoring with context (exploitability + asset) correctly beats raw CVSS. That's the real priority lesson.`,
  hint: "CVSS says 'how bad could it be'; context says 'is it on MY crown jewel and is it being exploited'.",
  challenge: `**Home Lab — Build Your VM Program:**
1. Inventory: write your OWN homelab asset list (VMs, services, IPs, purpose, criticality).
2. Scan your Linux target (M10 lesson 3 skills).
3. Take the findings CSV and apply a prioritization model (CVSS + exploitable + your 'asset criticality' flag).
4. Remediate the #1 and #2 — verify with rescan.
5. You've now done the whole loop. Could do it again weekly — that's the program.`,
    },
    {
      id: 2,
      slug: "02-prioritization-frameworks",
      title: "Prioritization: CVSS, EPSS & CISA KEV",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Why CVSS alone flames out, and how EPSS and known-exploited-vulnerability lists actually drive real-world repair.",
      content: `# Prioritization: CVSS, EPSS & CISA KEV

## The CVSS Trap

CVSS 3.x base = intrinsic severity, computed by math on properties. BUT:

- A CVSS 9 in an air-gapped lab ≠ high risk
- A CVSS 5 with a 5-year-old public exploit (EternalBlue!) is **more dangerous** than a newer CVSS 9 without a working exploit

> CVSS tells you how *severe* a vulnerability might be, not how *likely it is to be exploited in YOUR estate now*. Two different curves.

## EPSS: Probability, Not Severity

**EPSS** (Exploit Prediction Scoring System) estimates the **probability a CVE will be exploited in the wild in the next 30 days** with a model trained on real exploit data.

\`\`\`bash
# EPSS API (free):
curl https://api.first.org/data/v1/epss?cve=CVE-2023-23397
# → score: 0.67 = 'top 4% most-likely-to-be-exploited CVEs'
\`\`\`

How to combine: **CVSS + EPSS**:
- High CVSS + high EPSS = **your top queue**
- Low CVSS + high EPSS = "cheap to avoid being on the horror list", fix anyway
- High CVSS + negligible EPSS = priority drops unless you're a juicy target

## CISA KEV: "Being Exploited in the Wild — NOW"

**Known Exploited Vulnerabilities (KEV)** catalog — CVEs with **confirmed public exploitation**. If it's on KEV, it's real, now:

\`\`\`bash
# CISA KEV catalog (JSON, free)
curl https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
# filter latest 20 by dateAdded and vendor
\`\`\`

**The automotive golden rule of modern VM:**

> Vulnerabilities with known public exploits ("in the wild") get fixed FIRST, no debate, regardless of CVSS number.

## Prioritize With RICH CONTEXT

The perfect question = "what will hurt me most, soonest?":

1. Is it exploited in the wild? (KEV / EPSS high)
2. Is it exposed? (internet-facing? reachable?)
3. Is the asset critical? (crown jewel)
4. Do we have a compensating control? (e.g. WAF in front of the vulnerable web app)
5. What's the fix cost (reboot? downtime? tooling)?

## The "Exposure" Reducer

- Internet-facing + KEV = **fix by the weekend**
- Internal only + EPSS low = **schedule in sprint** (careful: still fix!)
- Segmented so blast radius small = lower urgency but track

> **The discipline:** everything gets a ticket, nothing lives forever unpatched. But the ORDER is driven by what's *actually happening in the world*, not a desk-award CVSS figure.
`,
      defaultCode: `#!/bin/bash
# Pull today's top KEV + EPSS for a small CVE car - script for practice
echo "== CISA KEV: 10 most recently added =="
curl -s https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.vulnerabilities.slice(0,10).map(v=>v.cveID+' ('+v.dateAdded+') '+v.vendorProject).join('\\n'));})"
echo "== EPSS for a sample CVE =="
curl -s "https://api.first.org/data/v1/epss?cve=CVE-2023-23397" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);const e=j.data[0];console.log('EPSS:', e.epss, 'pctile:', e.percentile);})"`,
  solution: `Pulls the KEV list (real exploits) and EPSS (exploit probability) — the two feeds that should drive your patching order.`,
  hint: "KEV gets fixed first, every time; EPSS helps you cut the rest of the list.",
  challenge: `**Home Lab — Feed the Machine:**
1. Fetch the KEV catalog today; list the 10 newest.
2. Now fetch your own software's vendor CVE releases (or scan your lab target) and cross-check your findings against KEV + EPSS.
3. Draw the 'patch order' for your lab target.
4. Write a one-page pitch: "why we patch this one first, despite its CVSS 6".
5. Get comfortable talking to the JSON APIs — this is a daily analyst move.`,
    },
    {
      id: 3,
      slug: "03-enterprise-vuln-mgmt",
      title: "Vulnerability Management in the Enterprise",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "People, process, technology: vulnerability scanners, agent fleets, patching windows, SLAs, and the politics of 'please reboot at 3am'.",
      content: `# Vulnerability Management in the Enterprise

## The Three Legs: People / Process / Technology

Technology is the smallest part of VM. Two-thirds is process and politics:

## Scanners, Agents & the Two Perspectives

- **Network scanner** (Nessus/Qualys/Rapid7) — external view, what ACTUALLY responds
- **Agent-based** (CrowdStrike, Defender, or vendor agents) — internal truth, apps, missing patches, even offline assets
- **Both** — because network shows exposure, agent shows install-state

\`\`\`bash
# qualys/nc tool equivalent example:
# run a config/agent audit for missing patches:
#   systemctl get-default    (systemd meeting runtime state on a Linux box)
#   dpkg --list | wc -l      (*Julia* package census on Debian-like)
\`\`\`

## Patching Windows (The Patch Tuesday Rhythm)

- Microsoft ships cumulative updates the **second Tuesday of each month**
- **End of Support** = the silent killer (EOL OS = zero patches = permanent criticals)
- Testing ring: pilot → broad → critical
- Maintenance windows are BUSINESS decisions, not IT preferences

## The Approval Wars (Process Honestly)

The 'why is this still open?' question has predictable answers:
- No approved downtime
- Vendor says "don't patch"
- Application breaks with patch (incompatibility)
- Nobody owns the asset
- End-of-life (can't patch — the fix is decommission or network-isolate)

**The manager's skill:** each is a *decision*, not a stall. An 'accepted risk' finding needs a named owner + sign-off date + scheduled re-review.

## SLAs & The Judgment of 'Due Today'

Classic VM SLAs:

| Severity (after triage) | Patch by |
|--------------------------|----------|
| Critical (exploited/exposed) | 7 days |
| High | 30 days |
| Medium | 90 days |
| Low | next maintenance |

**Exceptions flag themselves up the chain:** "critical, internet-facing, KEV, can't patch within 7" is an EXECUTIVE decision, not a silent budget cut.

## Reporting to the Business

Executives care about: **risk in, risk out**, exposure trend, and the Top 10 hotspots.

\`\`\`text
Report monthly: patched vs exposed by risk class
Trend: did MTTD/MTTR shift?
Hotspots: names, not numbers ("Domain Controllers, RDP, unpatched since Apr")
\`\`\`

> **The reality of enterprise VM:** you don't fight the scanner; you fight *ownership, windows, standards* and the twilight zone of 'nobody noticed we had a legacy server'. Master that and the CVEs mostly take care of themselves.
`,
      defaultCode: `#!/bin/bash
# Patch-state census on a Debian/Ubuntu target (lab)
echo "== upgradable packages =="
apt list --upgradable 2>/dev/null | head -15
echo "== security upgra4bles only =="
apt list --upgradable 2>/dev/null | grep -i -E "security|\\bopenssl\\b|\\bssh\\b|\\bapache\\b|\\bnginx\\b"
echo "== service listening summary =="
ss -tlnp |
  while read line; do echo "$line"; done |
  head -25`,
  solution: `Gives the 'what needs patching, and what's exposed' view — the raw material for enterprise patch SLAs.`,
  hint: "Exposure (listening ports) + patch-state = the two halves of a risk ticket.",
  challenge: `**Home Lab — Run a Mini VM 'Program':**
1. On your Linux target: census patches (command above); decide a fake 'critical' to patch.
2. Document the fake business decision: who's the owner, what's the maintenance window, is downtime acceptle?
3. Track the finding in a sheet: status, SLA due, owner, verify date.
4. Reboot-patch (in the lab!) and rescan/verify: closed ⟶ ticket done.
5. Write the 'monthly report' for your 1-machine enterprise. Score yourself on the 5 VM metrics.`,
    },
  ],
};