import type { Module } from "../curriculum";

export const module21: Module = {
  id: "module-21",
  slug: "21-cybersecurity-foundations",
  title: "Cybersecurity Foundations & History",
  description:
    "The professional's orientation: the CIA triad, threat models, kill chains, MITRE ATT&CK, ethics, laws, and the shape of the industry you are entering.",
  language: "Security",
  lessons: [
    {
      id: 1,
      slug: "01-the-cia-triad",
      title: "Confidentiality, Integrity & Availability",
      level: "beginner",
      tag: "concept",
      duration: "20 min",
      description:
        "The three pillars every control, attack and risk decision hangs on — and how they trade off against each other.",
      content: `
# Confidentiality, Integrity & Availability

**Why this matters:** Every security requirement in your career can be decomposed into CIA. When an attacker steals data, they break Confidentiality. When ransomware scrambles files, it breaks Integrity and Availability. When a pentester proves a flaw, they demonstrate a CIA violation. Start here.

## The Triad

| Pillar | Meaning | Breach example |
|--------|---------|----------------|
| **Confidentiality** | Only authorized parties can read data | Database exfiltration, shoulder surfing |
| **Integrity** | Data is accurate and unmodified | Tampered bank transfer, config change |
| **Availability** | Authorized users can access when needed | DDoS, ransomware lockout, disk failure |

## Gianni's complement: the extended models

Modern frameworks add more:

- **Parkerian Hexad** adds Authenticity, Utility, Possession
- **DAD** (Disclosure, Alteration, Destruction) is the attacker view of CIA
- **DREAD / STRIDE** are threat-modeling lenses (Microsoft) that map to CIA violations

## Trade-offs

Security is never absolute. You choose:

- Confidentiality vs Availability — tighter encryption slows access
- Integrity vs Usability — versioned immutable backups cost storage
- Security vs Speed — MFA annoys users every login

A security architect's job is to find the right balance for the business's risk appetite — not to say "no" to everything.

## Real example

An e-commerce breach: attacker uses SQL injection in the search bar (CIA Integrity of query) to dump the customer table (Confidentiality) — then a ransom note bricks the site (Availability). One injection broke all three pillars.

**Takeaway:** When someone describes an attack or control, name the CIA pillars it touches. This forces precision in every conversation.
`,
      defaultCode: `// Classify a security event in CIA terms
const event = {
  action: 'attacker-modified-a-firewall-rule',
  violates: 'integrity'
};
console.log(event.action, '->', event.violates);`,
      solution: `const event = {
  action: 'attacker-modified-a-firewall-rule',
  violates: 'integrity'
};
console.log(event.action, '->', event.violates);`,
      hint: "Think: what is the victim's loss — secrecy, correctness, or access?",
      challenge: `**Home Lab — CIA Journal:**
1. For the next week, log 5 real security events you encounter (phishing email, spam, app crash, update prompt).
2. For each, classify which CIA pillar(s) an attacker would break.
3. Give each event a 1-5 severity score and explain your reasoning.
4. Write one paragraph: which pillar matters most to *your* home and *your* employer, and why.`,
    },
    {
      id: 2,
      slug: "02-threat-modeling-basics",
      title: "Threat Modeling: The Discipline",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Assets, threats, attackers, attack surface and risk — the mental framework professionals use before they defend or attack anything.",
      content: `
# Threat Modeling: The Discipline

Threat modeling answers four questions:

1. **What are we building?** (system boundary, data flows)
2. **What can go wrong?** (threats)
3. **Who is attacking and why?** (threat actors, motive)
4. **What should we do about it?** (countermeasures)

## Core vocabulary

| Term | Definition |
|------|------------|
| **Asset** | Something of value — data, systems, reputation |
| **Threat** | A potential cause of harm (malware, insider, flood) |
| **Vulnerability** | A weakness that a threat can exploit |
| **Risk** | Likelihood × Impact of a threat exploiting a vulnerability |
| **Attack surface** | All the ways an attacker can interact with the system |
| **Trust boundary** | A line across which privilege or trust changes |

## A simple risk formula

\`\`\`
Risk = Threat Likelihood x Vulnerability Exploited x Impact
\`\`\`

If you patch (kill the vulnerability), risk drops even if the threat stays.

## The attackers you must know

- **Script kiddies** — low skill, recycled tools
- **Organized crime** — ransomware, extortion, profit
- **Nation-state / APT** — espionage, sabotage, persistence
- **Insiders** — employees, contractors, disgruntled or negligent
- **Hacktivists** — ideology-driven defacement and leaks

## STRIDE (attacker's view)

Microsoft's STRIDE names *what* goes wrong per element:

- **S**poofing — faking identity
- **T**ampering — modifying data
- **R**epudiation — denying actions
- **I**nformation disclosure — leaking data
- **D**enial of service — breaking availability
- **E**levation of privilege — gaining more rights

Walk any component through STRIDE and you have a threat list.

## Data flow first

Draw the system's data flows (request → app → DB → response). Mark trust boundaries at every hop. Most vulnerabilities hide at trust boundaries — inputs crossing them unvalidated, or privileges assumed on the other side.
`,
      defaultCode: `// Model risk as numbers so you can compare options
const assets = [
  { name: 'customer-db', value: 9 },
  { name: 'marketing-site', value: 4 }
];

function risk(likelihood, impact) {
  return likelihood * impact;
}
console.log(risk(8, 9), risk(3, 4));`,
      solution: `const assets = [
  { name: 'customer-db', value: 9 },
  { name: 'marketing-site', value: 4 }
];

function risk(likelihood, impact) {
  return likelihood * impact;
}
console.log(risk(8, 9), risk(3, 4));
// High-value assets get the highest attention.`,
      hint: "Risk = likelihood x impact. Rank systems, then protect the top.",
      challenge: `**Home Lab — Model Your Own App:**
1. Pick a real service you use (bank app, school portal, your own site).
2. Draw its data flows: user → app → database → storage. Mark trust boundaries.
3. Run STRIDE: list one example per letter for that service.
4. Score each of 5 threats: likelihood 1-10, impact 1-10, risk = product.
5. Rank the top 3 risks. What countermeasure reduces each the most?`,
    },
    {
      id: 3,
      slug: "03-kill-chain-attack-lifecycle",
      title: "Cyber Kill Chain & Attack Lifecycles",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Lockheed Martin's Cyber Kill Chain and the MITRE ATT&CK framework — the two models that let defenders and attackers think in phases.",
      content: `
# Cyber Kill Chain & Attack Lifecycles

## The Cyber Kill Chain (Lockheed Martin, 2011)

Modeled on military kill chains, it breaks an intrusion into seven phases:

1. **Reconnaissance** — research the target (OSINT, scanning)
2. **Weaponization** — craft the payload (malware + exploit + delivery)
3. **Delivery** — transmit the weapon (email, USB, web drive-by)
4. **Exploitation** — trigger the payload (buffer overflow, phishing click)
5. **Installation** — establish persistence (backdoor, service install)
6. **Command & Control (C2)** — open a channel to the attacker
7. **Actions on Objectives** — exfiltrate, encrypt, destroy

\`\`\`
Recon -> Weaponize -> Deliver -> Exploit -> Install -> C2 -> Act
\`\`\`

**Defensive insight:** You can disrupt the chain at ANY phase. Stop delivery → no infection. Stop C2 → no actions on objectives. Defenders who think in phases can pick the cheapest place to break the chain.

**Offensive insight:** The fewer phases the attacker must complete, the better their opsec. Phishing to clipboard (deliver+exploit in one click) is cheaper than a multi-stage C2 deployment.

## MITRE ATT&CK

The modern standard. Rather than a linear chain, ATT&CK maps **tactics** (the "why" — columns) and **techniques** (the "how" — rows) from real-world observations.

15 enterprise tactics include: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, Impact.

Techniques like **T1133 External Remote Services**, **T1021.001 Remote Desktop Protocol** reference both tactic and procedure — enabling standardized detection and reporting.

## Using the models together

- Kill chain describes **one intrusion's arc**
- ATT&CK describes **the techniques in detail**, mapped across the whole MITRE matrix
- Defenders map detections to techniques (MITRE says "detect T1133, not 'attacker'")
- Blue teams can organize detections per tactic playbook; red teams can plan procedure chains per tactic

> MITRE ATT&CK references a technique by ID: e.g., T1572 "Protocol Tunneling" in the Command and Control tactic. Adversaries' documents and threat intel feeds publish these IDs so everyone speaks the same language.
`,
      defaultCode: `// Track phases programmatically
const killChain = [
  'Recon', 'Weaponize', 'Deliver', 'Exploit',
  'Install', 'C2', 'Covert-Actions'
];
let phase = 0;
function advance() {
  if (phase < killChain.length - 1) phase++;
  console.log('Now at:', killChain[phase]);
}
advance(); advance(); advance();`,
      solution: `const killChain = [
  'Recon', 'Weaponize', 'Deliver', 'Exploit',
  'Install', 'C2', 'Covert-Actions'
];
let phase = 0;
function advance() {
  if (phase < killChain.length - 1) phase++;
  console.log('Now at:', killChain[phase]);
}
advance(); advance(); advance();`,
      hint: "Map each phase to a defensive countermeasure to find 'break points'.",
      challenge: `**Home Lab — Map a Real Breach:**
1. Choose a well-documented breach you have heard of (or search one from a reputable report).
2. Place each known action into the 7 kill-chain phases.
3. For each phase, propose ONE detection or prevention control that could have stopped it.
4. Which phase was the cheapest for the defenders to have broken the chain? Justify it in 3-4 sentences.`,
    },
    {
      id: 4,
      slug: "04-mitre-attack-foundations",
      title: "MITRE ATT&CK: The Shared Language",
      level: "beginner",
      tag: "lab",
      duration: "35 min",
      description:
        "Navigate the ATT&CK matrix, read technique pages, and map a detection to a technique — hands-on with attack.mitre.org.",
      content: `
# MITRE ATT&CK: The Shared Language

## What ATT&CK is

A curated knowledge base of **adversary tactics and techniques** based on real-world observations. It is not a threat model you choose — it is a common vocabulary used by threat intel, detection engineering, red teams, and vendors alike.

## Navigation essentials

- **attack.mitre.org** — the live matrix
- **Tactics** are the columns; **techniques** are the rows (a technique can appear in multiple tactics)
- Each technique page contains: **Procedure Examples**, **Mitigations**, **Detection**, **Data Sources**, **Techniques that intersect** (sub-techniques like T1021.001)

## The 15 tactics (Enterprise)

Reconnaissance → Resource Development → Initial Access → Execution → Persistence → Privilege Escalation → Defense Evasion → Credential Access → Discovery → Lateral Movement → Collection → Command and Control → Exfiltration → Impact.

## Hands-on: reading a technique page

Take **T1219 Remote Access Software** (Command and Control):

- **Description**: legitimate remote access tools (TeamViewer, AnyDesk) used for C2 to blend in
- **Sub-techniques**: apply per tool
- **Detection**: monitor network connections to known remote-access endpoints, application naming anomalies
- **Mitigation**: block employee use of unsanctioned remote tools

## Why this matters for every role

- **Detection engineer**: writes Sigma/Splunk detections keyed to technique IDs
- **SOC analyst**: classifies alerts into ATT&CK phases
- **Red teamer**: plans chains as technique sequences
- **Threat intel**: attributes activity groups (e.g., APT groups) by their technique usage

> Exercises: pick "T1059.001 Command and Scripting Interpreter: PowerShell" and find one procedure example, one detection, one mitigation. This pattern (technique → detection) is your bread and butter.
`,
      defaultCode: `// A detection rule shape inspired by ATT&CK
const detections = [
  { technique: 'T1059.001', name: 'powershell-from-office' },
  { technique: 'T1133', name: 'external-remote-service' }
];
for (const d of detections) {
  console.log('Detection covers', d.technique, '->', d.name);
}`,
      solution: `const detections = [
  { technique: 'T1059.001', name: 'powershell-from-office' },
  { technique: 'T1133', name: 'external-remote-service' }
];
for (const d of detections) {
  console.log('Detection covers', d.technique, '->', d.name);
}`,
      hint: "Every detection should name the technique it defeats.",
      challenge: `**Home Lab — Technique Deep Dive:**
1. Open attack.mitre.org.
2. Choose one technique from Initial Access (T1091 Replication Through Removable Media) or Execution.
3. Document: name, ID, tactic, description, one procedure example, one mitigation, one detection.
4. Write a one-line Sigma-style detection idea (e.g., Process creation where CommandLine contains 'mshta').
5. Save your notes — you will reuse this skill in the Threat Intelligence module.`,
    },
    {
      id: 5,
      slug: "05-ethics-laws-careers",
      title: "Ethics, Laws & the Security Profession",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Authorization, scope, responsible disclosure, certifications and career paths — how to be a white-hat professional, not an accidental felon.",
      content: `
# Ethics, Laws & the Security Profession

## The authorization wall

The single line between "hacker" and "professional": **written authorization and clear scope**. Testing systems you do not own, or beyond the scope you were granted, is illegal in almost every jurisdiction.

Key law families:

- **CFAA (US)** — unauthorized access to protected computers
- **Computer Misuse Act (UK)** — unauthorized access / modification
- **GDPR (EU)** — processing personal data without basis
- **Blue team caution** — scanning can itself break laws if unwarranted

> IRONY TO AVOID: A "security professional" who runs nmap against a network they do not own commits a crime even when their intent was to help. Always get written scope before scanning.

## Responsible disclosure

- **Coordinated disclosure**: inform the vendor, wait a reasonable period (7-90+ days), then publish
- **Full disclosure**: publish immediately — controversial
- **Bug bounty programs**: legally safe, scoped, rewarded testing

## Professional ethics principles

1. Confidentiality of client findings
2. Do no harm beyond agreed scope
3. Be honest about capabilities (do not oversell findings)
4. Never use training tools against real targets

## Certification landscape

| Path | Focus |
|------|-------|
| Security+ | Entry, fundamentals |
| CEH / PEN-200 (OSCP) | Offensive |
| CISSP / CISM | Management, governance |
| GIAC (GSEC, GCIH, etc.) | Hands-on defense |
| Cloud (CCSP, AWS/Azure Security) | Cloud |

## Career centers of gravity

- **SOC analyst** → incident responder → threat hunter
- **Penetration tester** → red teamer → exploit developer
- **GRC analyst** → risk manager → CISO
- **Detection engineer** → security engineering lead

**Takeaway:** Your value as a professional is trust + skill. Skill grows with practice; trust is preserved by scope, honesty and confidentiality. Protect both.
`,
      defaultCode: `// The minimum authorization check before any test
const authorization = {
  owner: true,
  written: true,
  scopeSpecified: true
};
const canProceed = Object.values(authorization).every(Boolean);
console.log('Authorized:', canProceed);`,
      solution: `const authorization = {
  owner: true,
  written: true,
  scopeSpecified: true
};
const canProceed = Object.values(authorization).every(Boolean);
console.log('Authorized:', canProceed);`,
      hint: "Before any probing: written, scoped, authorized. No exceptions.",
      challenge: `**Home Lab — Your Professional Roadmap:**
1. Research one entry-level certification (Security+ or equivalent) — cost, domains covered, study time.
2. Draft a 5-line "ethics pledge" for yourself: what you will and will not test without authorization.
3. Write down your 2-year goal: role target (SOC? pentesting? GRC?) and one cert to get there.
4. Find 3 job postings in your target role; list the top 5 skills each wants.`,
    },
    {
      id: 6,
      slug: "06-security-controls-everywhere",
      title: "Controls, Frameworks & the Defense Toolkit",
      level: "beginner",
      tag: "lab",
      duration: "30 min",
      description:
        "Preventive, detective, corrective and compensating controls — and the frameworks (NIST, ISO, CIS) that organize them.",
      content: `
# Controls, Frameworks & the Defense Toolkit

## Control categories

| Type | Purpose | Example |
|------|---------|---------|
| **Preventive** | Stop it happening | Firewall, patch, policy |
| **Detective** | Find it happening | IDS, logging, AV |
| **Corrective** | Recover / undo damage | Backups, IR, patching |
| **Directive** | Guide behavior | Policy, training |
| **Deterrent** | Discourage attacks | Warning banners, cameras |
| **Compensating** | Alternative control when ideal is impossible | MFA token in lieu of hardware key |

## Control implementation classes

- **Physical** — locks, cameras, cages
- **Technical** — software, hardware, cryptographic
- **Administrative** — policy, procedure, training

Strong security layers them: policy + training (admin) + MFA (technical) + locked server room (physical).

## The frameworks that matter

- **NIST CSF 2.0** — Govern, Identify, Protect, Detect, Respond, Recover
- **CIS Controls v8** — 18 prioritized safeguards (asset inventory, continuous vuln management, secure config, etc.)
- **ISO 27001** — certifiable ISMS standard, 93+ Annex A controls
- **NIST 800-53** — deep catalog of controls for US federal systems

## Defense in depth

Chart of layered controls:

\`\`\`
Users         -> training, policies, hardened browsers
Perimeter     -> firewalls, WAF, IDS/IPS, VPN/ZTNA
Network       -> segmentation, micro-segmentation, monitoring
Endpoints     -> EDR, application allow-listing, full-disk encryption
App/Data      -> secure coding, encryption, DLP, RBAC
Physical      -> access control, cameras, air-gap
\`\`\`

Assume any single layer fails. Design so that one failure does not become total compromise.
`,
      defaultCode: `// Map controls to the attackers they stop
const controls = [
  { layer: 'perimeter', control: 'firewall' },
  { layer: 'endpoint', control: 'EDR' },
  { layer: 'data', control: 'encryption' }
];
for (const c of controls) {
  console.log(c.layer + ' -> ' + c.control);
}`,
      solution: `const controls = [
  { layer: 'perimeter', control: 'firewall' },
  { layer: 'endpoint', control: 'EDR' },
  { layer: 'data', control: 'encryption' }
];
for (const c of controls) {
  console.log(c.layer + ' -> ' + c.control);
}`,
      hint: "Layer controls so one failure does not mean compromise.",
      challenge: `**Home Lab — Control Audit of Your Life:**
1. Inventory the controls protecting: your home Wi-Fi, your laptop, your bank account.
2. Classify each as preventive/detective/corrective/directive and as physical/technical/admin.
3. Identify your biggest gap (e.g., no 2FA, no backups, no AV).
4. Implement the single cheapest control that closes that gap this week.
5. Write one paragraph about what 'defense in depth' means for your setup.`,
    },
  ],
};