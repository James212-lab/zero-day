import type { Module } from "../curriculum";

export const module34: Module = {
  id: "module-34",
  slug: "34-threat-intelligence",
  title: "Threat Intelligence",
  description:
    "The intelligence cycle, TTP analysis, IOC/IOA distinction, ATT&CK mapping, threat feeds, and writing intel products decision-makers actually use.",
  language: "CTI",
  lessons: [
    {
      id: 1,
      slug: "01-intel-cycle",
      title: "The Intelligence Cycle",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "Direction → Collection → Processing → Analysis → Dissemination → Feedback: how intel organizations turn raw data into decisions.",
      content: `
# The Intelligence Cycle

## What threat intelligence is

Not "a threat feed." Intelligence is processed, assessed, actionable information for a *specific* decision. Feeds are raw material; the cycle produces a judgment.

## The cycle

\`\`\`
Direction (what decisions/products?)
  -> Collection (feeds, OSINT, internal telemetry)
  -> Processing (sanitize, enrich, de-dupe)
  -> Analysis (context, TTPs, confidence, behavior)
  -> Dissemination (product shaped for the consumer)
  -> Feedback (did it help? adjust direction)
\`\`\`

## Key phrases

- **Raw / processed info** — data before/after the human + tool enrichment
- **Analyst judgment** — 'likely state-backed activity' with confidence level
- **Finish** — how 'readiness-to-decide' the product is (finished = assessed)

## Intelligence types by consumer

| Type | Consumer | Product shape |
|------|----------|---------------|
| **Strategic** | CEO / board | 'threat landscape for our industry', no operations |
| **Operational** | SOC/IR leads | 'who to expect next' + TTPs + recommendations |
| **Tactical** | Analysts/detection engineers | Indicators: IOCs, signatures, hunting leads |
| **Technical** | Engineers | CVEs, exploits, patch roadmap |

## Pitfalls

- Pile of feeds ≠ intelligence
- 'Attribution confidence' without evidence = noise
- Product shaped for the wrong consumer (a board doesn't want a pcap)
- No feedback loop — you never learn the product mattered

## Your own mini-cycle

\`\`\`
Direction: my org's risk is ransomware via VPNs.
Collection: feeds (URLhaus, Feodo), OSINT, SIEM hits.
Analysis: distinct IOCs overlap known ransomware-C2 patterns → adjudged high-confidence.
Dissemination: one-page monthly 'ransomware read-out'.
Feedback: ask SOC: was it actionable?
\`\`\`

> A threat-intel team's output is judged by whether a decision got better. Everything else is subscription content.
`,
      defaultCode: `const cycle = [
  'Direction','Collection','Processing','Analysis',
  'Dissemination','Feedback'
];
let i = 0;
console.log('Cycle step:', cycle[i]);
console.log('rule: analysis without dissemination feeds nobody; dissemination without direction wastes everyone');`,
      solution: `const cycle = [
  'Direction','Collection','Processing','Analysis',
  'Dissemination','Feedback'
];
let i = 0;
console.log('Cycle step:', cycle[i]);
console.log('rule: analysis without dissemination feeds nobody');`,
      hint: "Start from the DECISION, then collect toward it.",
      challenge: `**Home Lab — Run Your First Mini-Cycle:**
1. Direction: pick ONE decision your 'org' faces (e.g., 'is phishing the biggest risk to my family?').
2. Collect: 5 sources (news, feeds, your own logs).
3. Analyze: 1 high-confidence claim with evidence; grade confidence.
4. Disseminate: a 3-bullet memo.
5. Feedback: ask a friend/read twice — was it actionable? adjust.`,
    },
    {
      id: 2,
      slug: "02-ioc-ioa-ttp",
      title: "IOCs, IOAs & TTPs",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Indicators of compromise (hashes, IPs) vs indicators of attack (behavior), and why TTP mapping beats IOC lists for detection.",
      content: `
# IOCs, IOAs & TTPs

## The indicator family

| Type | What | Example | Half-life |
|------|------|---------|-----------|
| **IOC** | Artefact of compromise | hash, C2 IP, registry key, filename | Days-weeks (attackers rotate) |
| **IOA** | Observable behavior | unusual child process, beaconing, admin-MSF entry | Even attackers change habits slow |
| **TTP** | Tactics, techniques, procedures | 'uses PowerShell to download and execute from X' | Long-lived — the most stable |

## Why IOA beats IOC

A hash dies the moment a packer re-rolls. A *behavior* ('office spawning powershell'→network to a fresh domain) describes the attack *shape* that survives:

\`\`\`
IOC-based rule:   file hashes of Cobalt Strike beacon variants  -> dies on rebuild
IOA-based rule:   parent=Word AND child=powershell AND child:network
                  -> catches variant generations
TTP-based:        technique T1059.001 detection, applies to ANY payload
\`\`\`

## Turning intel into detections

1. New sample arrives → analyze → extract BOTH IOC (hash, domain) and IOA (download cradle, MS office-parent)
2. Write: Sigma rule for the IOA (broader); YARA/static for the IOC family
3. Enrich with ATT&CK technique for the report mapping
4. Fade the IOC rule, keep the behavioral one

## Confidence & false friends

- Intelligence says IP X; SIEM shows 3 hits — but are they the same?
- IOC without context (geo) → you've generated more noise
- Always pair IOC with TTP: 'this domain is C2 *because* it's used with PowerShell-to-beacon payloads'

> The mature detection stack hunts IOAs mapped to TTPs; IOCs are just the first-responder fingerprints.
`,
      defaultCode: `const indicators = {
  oc: ['hash','ip','domain','reg-key'],
  oa: ['child-process','beaconing','admin-fun'],
  ttp: ['T1059.001','T1566']
};
console.log('IOC (fast fades) -> IOA (behavior) -> TTP (stable)'); 
console.log('rule type: IOC=blocklist, IOA=behavior/Sigma, TTP=hunting');`,
      solution: `const indicators = {
  oc: ['hash','ip','domain','reg-key'],
  oa: ['child-process','beaconing','admin-fun'],
  ttp: ['T1059.001','T1566']
};
console.log('IOC (fast fades) -> IOA (behavior) -> TTP (stable)');`,
      hint: "IOCs for triage; IOAs for detection durability; TTPs for mapping/reporting.",
      challenge: `**Home Lab — Indicator Paper Trail:**
1. Take a free public intel entry (e.g., a MalwareBazaar hash's page).
2. Extract: IOC fields; the TTP/technique hints; the sample's behavior.
3. Write 2 rules: one blocklist (hash/domain) and one Sigma-ish behavior rule.
4. Explain in 2 lines why the behavior rule survives re-packing.
5. Log the half-life lesson: which indicators do you actually trust for 6 months?`,
    },
    {
      id: 3,
      slug: "03-ttp-mapping-mitre",
      title: "TTP Mapping with MITRE ATT&CK",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Map detection libraries and incidents to techniques; read Navigator layers; and build the ATT&CK narrative of any intrusion.",
      content: `
# TTP Mapping with MITRE ATT&CK

## Why mapping matters

ATT&CK turns prose ('they used weird coverage trades') into a standardized graph: techniques → tactics. It lets SOC, CTI, red, and management speak one language.

## The mapping workflow

\`\`\`
1. Gather action evidence (logs, samples, timeline)
2. For each action: pick the technique (exact + sub) & tactic
   e.g., 'office launched powershell which contacted domain' :
        Execution/T1059.001  +  C2/T1071
3. Tag anywhere ambiguous with confidence/doubt
4. Build the Navigator layer (json) -> visualize coverage gaps
\`\`\`

## Tools

- **MITRE ATT&CK Navigator**: layer JSON → clickable matrix
- **Sigma / detection mapping**: each rule can name technique(s) it covers
- **Assessments**: 'coverage vs the adversary' (the red/blue bridge)

\`\`\`
# A mini 'coverage layer' for a rule
{
  "techniqueID": "T1059.001",
  "tactic": "execution",
  "level": { "effectiveness": "partial" }
}
# and an 'incident map' for one intrusion:
[
 { "T1133":"initial-access-vpn" },
 { "T1078":"valid-accounts" },
 { "T1021.001":"rdp-lateral" }
]
\`\`\`

## Reading a layer

- Colors = your coverage; white = gap (you have no detection there)
- The 'iron triangle': technique ↔ procedure ↔ detection quality

## Analysts in practice

- **CTAI (Cyber Threat-Analysis Intelligence)** persona maps new reports to ATT&CK
- Detection engineers: 'we detect 8 of 14 initial-access techniques'
- IR: timeline narrated as technique sequence (kill-chain readability)

> If you can map an incident, you can explain a defense gap to a board in one matrix — that's the real export of ATT&CK literacy.
`,
      defaultCode: `// a coverage layer skeleton (MITRE Navigator format)
const layer = {
  name: 'demo-ish coverage',
  techniques: [
    { techniqueID: 'T1059.001', score: 50 },
    { techniqueID: 'T1133', score: 80 }
  ],
  // other cells default 0 = 'no coverage'
  layout: { showTacticRowBackground: true }
};
console.log('white cells = detection gaps (== where attackers live)');`,
      solution: `const layer = {
  name: 'demo-ish coverage',
  techniques: [
    { techniqueID: 'T1059.001', score: 50 },
    { techniqueID: 'T1133', score: 80 }
  ],
  layout: { showTacticRowBackground: true }
};
console.log('white cells = detection gaps (== where attackers live)');`,
      hint: "Map rules to techniques; the empty cells on Navigator are your roadmap.",
      challenge: `**Home Lab — Map an Incident:**
1. Open attack.mitre.org → matrix.
2. Pick a public write-up (or use one of the kill-chain labs in this course).
3. Map ≥6 steps to (tactic, technique/sub) pairs.
4. In Navigator (web app) draw your coverage: 4 detections you 'have'.
5. Write: which 2 techniques have no coverage, and one Sigma idea each.`,
    },
    {
      id: 4,
      slug: "04-threat-feeds-platforms",
      title: "Threat Feeds, Platforms & Dissemination",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Open feeds (abuse.ch, AlienVault, MISP), TIPs, and the craft of a finished intelligence product for executives.",
      content: `
# Threat Feeds, Platforms & Dissemination

## The free feed shelf

| Feed | Type | Use |
|------|------|-----|
| **abuse.ch (URLhaus, MalwareBazaar, ThreatFox, Feodo)** | IOCs (hashes, URLs, IPs/C2) | blocklists, enrichment |
| **AlienVault OTX** | Threat exchange | community pulse |
| **MISP** (self-host) | Sharing platform | store & share indicators, structured (JSON) |
| **Censys/Shodan** (banner search too) | Attack-surface query | discovery |
| **CIRCL, Emerging Threats, Shadowserver** | CSIRT feeds | network-level blocklists |

## Platforms (TIP — Threat Intelligence Platforms)

- **MISP**: open-source, storm-in-a-teacup exchange; MD5 of an event gets you tipping
- **OpenCTI**: model knowledge (STIX 2.1); graph-based
- **VirusTotal / Recorded Future / Flashpoint**: commercial + web

Key workflows: **enrichment** (hash→детails), **correlation** (does this IP appear in 3 intel events?), **sharing** (anonymize + publish only vetted).

## Feeding your detection

- Set the SIEM to consume a *curated* feed list (⊃ quality over quantity)
- Every feed incl. false positives — tune by timeout, dismiss source trust
- Structure matters: STIX/TAXII or CSV consistency; blocklist keys (IP, domain, hash)

## Writing the product (executive)

A finished 'Cyber Threat Readout' in 4 bullets:

\`\`\`
1. Top risk this month: [one sentence + business impact]
2. Trend: [change vs last month]
3. Evidence: [highest-confidence signal(s), keep it 2 lines]
4. Ask: [one decision needed]
\`\`\`

Avoid: raw feeds, jargon-density, un-assessed numbers. The reader is a decision-maker, not an analyst.

> The feed shelf is your raw stock; the platform your kitchen; the product your plate. A plate with 200 unproven indicators is a mess, not breakfast.
`,
      defaultCode: `// curated feed intake rule: quality over quantity
const feed = {
  source: 'malwarebazaar',
  type: 'hash',
  updated: 'UTC',
  desiredFields: ['sha256','tags','first_seen']
};
console.log('Curate:', feed.source, 'for', feed.type,
  'with', feed.desiredFields.join(', '));`,
      solution: `const feed = {
  source: 'malwarebazaar',
  type: 'hash',
  updated: 'UTC',
  desiredFields: ['sha256','tags','first_seen']
};
console.log('Curate:', feed.source, 'for', feed.type,
  'with', feed.desiredFields.join(', '));`,
      hint: "Few trusted feeds, structured, tuned into the SIEM — and products aimed at decisions.",
      challenge: `**Home Lab — Feed to Product:**
1. Subscribe to abuse.ch ThreatFox/MalwareBazaar (email/API or just read pages).
2. Pull 5 recent IOCs into a CSV (hash, type, first_seen).
3. Enrich one: hash → VirusTotal/search → what family / techniques?
4. Write a 4-bullet readout on 'phishing' for a pretend exec.
5. Identify: which decision should that readout drive?`,
    },
    {
      id: 5,
      slug: "05-intel-driven-detection",
      title: "Intel-Driven Detection: From Report to Response",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "The full loop: an intel report arrives → build priority → turn indicators into rules → hunt → respond — the workflow that closes the CI/KC.",
      content: `
# Intel-Driven Detection: From Report to Response

## The loop

\`\`\`
Intel report arrives
  -> assess: FINISH (confidence, relevance to MY stack)
  -> priority: which technique can I detect today?
  -> build: Sigma/YARA/EDR rule for the IOA + IOC
  -> deploy: staging, tune false positives
  -> hunt: search historical logs for the pattern
  -> respond: if a hit -> IR handoff; if none -> documentation of coverage-gap
  -> update ATT&CK layer + share back
\`\`\`

## A concrete session

Say intelligence says: 'Recent phishing delivers **Emotet**; it uses Excel 4.0 macros dropping a DLL in %APPDATA% and beaconing to a specific C2 port.'

Your build:

\`\`\`
1. SAL: Excel process spawning cmd.exe/powershell (Sigma, parent-child)
2. DNS: high DNS queries to random subdomains of known C2 domains (IOA)
3. static: YARA on excel/xlsm 4.0-macro markers ('_xl4macros' / XLAs)
4. hunt: historical EDR search 'excel -> dll in appdata'
5. plan: if detect -> contain: kill DLL, disable macro, IOC the domain.
\`\`\`

## Common blockers (honest)

- Too many feeds → analyst drowning; curate, earmark, alert
- Rule tuning forever → prioritize 'critical + high-information' rules
- No ownership → every intel item needs an owner + expiry
- Detections die silently → revalidate quarterly (attack sim!) 

## Tools that help

- **Sigmahqs / Sigma CLI**: convert to Splunk/ES/Elastic
- **EDR hunting UIs**: endpoint rawQuery; basic signatures in tooling
- **MISP + integration**: auto-import blocklists

> The only intel that matters is intel that changed a detection, stopped a beacon, or ended an incident. Every other feed entry is a bookmark.
`,
      defaultCode: `// the loop as a checklist
const loop = [
  'assess-finish', 'prioritize-technique', 'build-rule',
  'tune-under-staging', 'hunt-history', 'respond-or-doc', 'update-coverage'
];
loop.forEach((step, i) => console.log(i + 1, step));
console.log('Deliverable: one intel product -> one new detection');`,
      solution: `const loop = [
  'assess-finish', 'prioritize-technique', 'build-rule',
  'tune-under-staging', 'hunt-history', 'respond-or-doc', 'update-coverage'
];
loop.forEach((step, i) => console.log(i + 1, step));
console.log('Deliverable: one intel product -> one new detection');`,
      hint: "Every intel item has an owner, an expiry, and should produce a detection or gap note.",
      challenge: `**Home Lab — From One Report to One Rule:**
1. Choose a real recent advisory (CISA or vendor blog) on a known malware.
2. List: IOC fields (hashes, domains) + 2 IOA behaviors.
3. Write a Sigma-ish rule for one IOA.
4. Write a YARA rule for one static marker.
5. Document: who owns it, expire-date, and what response fires on a match.`,
    },
  ],
};