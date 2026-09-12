import type { Module } from "../curriculum";

export const module05: Module = {
  id: "module-05",
  slug: "05-security-fundamentals",
  title: "Cybersecurity Fundamentals: CIA & Risk",
  description:
    "Confidentiality, Integrity, Availability, threat models, and risk — the conceptual core that makes every other lesson make sense.",
  language: "Fundamentals",
  lessons: [
    {
      id: 1,
      slug: "01-cia-triad-and-more",
      title: "The CIA Triad & Beyond",
      level: "beginner",
      tag: "concept",
      duration: "20 min",
      description:
        "The three pillars of security — plus the properties that complete the modern model.",
      content: `
# The CIA Triad & Beyond

## Why Every Security Decision Traces Back to Three Words

**Confidentiality** — only authorized parties can read it.
**Integrity** — data is accurate and unaltered.
**Availability** — the system is up when needed.

## Breaking It Down With Examples

| Property | Failure Example | Attack |
|----------|----------------|--------|
| Confidentiality | Data breach (SolarWinds) | theft, exfiltration |
| Integrity | Ransomware encrypting files? Actually tampering | tampering, MITM |
| Availability | DDoS taking a site down | DDoS, ransomware |
| Authenticity | Fake updates | impersonation |
| Accountability | No logs of who did what | no audit trail |
| Non-repudiation | Alice denies sending the file | forged/missing signatures |

## CIA Doesn't Mean All Three Equally

Security is a business decision. A hospital prioritizes **availability + integrity** (lives depend on it). A bank prioritizes **integrity + confidentiality**. A startup might trade availability for confidentiality. Your job is to understand and articulate the trade-offs.

## Beyond CIA: The Extended Model

Modern frameworks add:

- **Authenticity** — is it really from whom it claims?
- **Non-repudiation** — can the sender deny it? (digital signatures)
- **Privacy** — is personal data handled per law?
- **Safety** — could a breach harm people/equipment? (OT/ICS)

## DAD vs CIA

**DAD** is the negative triad: Disclosure (breaks Confidentiality), Alteration (breaks Integrity), Denial (breaks Availability). Framing attacks as "which CIA property did it violate?" is how you speak to executives and incident responders.

> **Golden mental model:** When reading any security news story, ask: *Which property was violated? What was the attack chain? What control would've stopped it?* Training this loop turns news into lessons.
`,
      defaultCode: `// Classify an incident against the CIA triad
function classify(incident) {
    const props = [];
    const s = incident.toLowerCase();
    if (s.includes("stolen") || s.includes("leaked")) props.push("Confidentiality");
    if (s.includes("tamper") || s.includes("modified") || s.includes("man-in-the-middle")) props.push("Integrity");
    if (s.includes("down") || s.includes("downtime") || s.includes("ddo")) props.push("Availability");
    return props.length ? props.join(", ") : "needs analysis";
}
console.log(classify("Data stolen in breach"));       // Confidentiality
console.log(classify("ATM network down for hours"));  // Availability`,
      solution: `The classifier returns the violated CIA property from keywords. Running it builds the "which pillar?" habit.`,
      hint: "Think: did the attack read data, change data, or stop service?",
      challenge: `**Home Lab — Build a Breach Scorecard:**
1. Pick 5 recent (real) security news stories.
2. For each: name the violated CIA property(ies), the attack vector, and ONE control that would have stopped it.
3. Rank them by severity using (impact × likelihood).
4. Write a paragraph connecting each breach to "Defense in Depth" — was the failure single-layer or multi-layer?
5. Save the scorecard. It's your first analyst-format deliverable.`,
    },
    {
      id: 2,
      slug: "02-threat-actor-lenser",
      title: "Threat Actors & Their Motivations",
      level: "beginner",
      tag: "concept",
      duration: "25 min",
      description:
        "Who is attacking? Nation-states, criminals, hacktivists, insiders — and what each one wants.",
      content: `
# Threat Actors & Their Motivations

## Know Your Enemy

Security without a threat model is decoration. You must understand WHO might attack you and WHY — because the "who" dictates the "how hard they'll try".

## The Main Actor Types

| Actor | Motivation | Sophistication | Persistence |
|-------|-----------|----------------|-------------|
| Cybercriminals | Money | Low-Med | Medium |
| Nation-state (APT) | Espionage, sabotage | Very High | Extreme |
| Hacktivists | Ideology, chaos | Low-Med | Low |
| Insiders | Money, revenge, espionage | Varies | Varies |
| Script kiddies | Notoriety, learning | Low | Low |
| Terrorists | Disruption | Med | Low |
| Competitors | Economic espionage | Med-High | High |

## Nation-State / APT

Advanced Persistent Threats. Slow, quiet, patient.
- Rely on **dwell time** — staying hidden inside networks for months
- Use **zero-days** and custom malware
- Abuse legitimate tools (living off the land — PowerShell, WMI, LOLBins)
- Objective is usually espionage OR preparing sabotage (ICS)

> APT playbook: Initial access (phish or exploit) → establish persistence → enumerate → move laterally → collect target data → exfiltrate stealthily.

## Cybercriminals & Ransomware Gangs

Business model: ransomware as a service (RaaS). Affiliates do the attacks, operators take a cut. This industrialized model is why ransomware exploded — anyone can "buy" a capable attack.

Profile: opportunistic at first, increasingly surgical (they research your backups and negotiate based on your insurance).

## Hacktivists & DDoS for a Cause

Ideology-driven: DDoS, defacement, data leaks. Targets: govt sites, corporations they dislike. Lower sophistication, loud, not patient.

## Insiders

The insider threat is always among the hardest:
- **Malicious** — disgruntled, bribed, recruited
- **Negligent** — clicks phishing, weak passwords (the most common)
- **Compromised** — attacker logins as them via phishing

> **Detection:** impossible to prevent perfectly. You detect via anomalies: user accessing abnormal systems, exfil volumes, off-hours logins.

## Modeling: The Diamond Model

The Diamond Model frames intrusion events as four vertices:
- **Adversary** — who
- **Capability** — what tool/technique
- **Infrastructure** — what C2/servers
- **Victim** — who/what is targeted

Every intrusion sits inside that diamond. Using it to communicate makes you sound (and think) like an analyst.
`,
      defaultCode: `// Map an incident to actor types by motivation signals
const incident = { stolen: false, stateSponsored: true, quiet: true, customMalware: true };
function likelyActor(i) {
  if (i.stateSponsored && i.quiet && i.customMalware) return "Nation-state / APT";
  if (i.stolen) return "Cybercriminal";
  return "Unknown — complete the Diamond Model";
}
console.log(likelyActor(incident));`,
      solution: `Signals like quiet persistence + custom malware + state sponsorship point to APT. This mirrors real analytical shorthand.`,
      hint: "Dwell time, custom tooling, and patience = likely nation-state.",
      challenge: `**Home Lab — Profile the Actors:**
1. Research three real groups (e.g., APT28/Fancy Bear, LockBit, Anonymous).
2. For each, complete the Diamond Model: adversary, capability, infrastructure, victim.
3. For each, note: objective, typical TTPs, and what detection priority you'd assign.
4. Write an "actor risk matrix": likelihood × impact for your hypothetical organization.
5. Which actor would you fear most for a hospital? A political campaign? A bank? Justify.`,
    },
    {
      id: 3,
      slug: "03-risk-management-modeling",
      title: "Risk Management & Threat Modeling",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Risk = likelihood × impact, assets, vulnerabilities, threats, and the STRIDE/DREAD frameworks professionals use.",
      content: `
# Risk Management & Threat Modeling

## The Risk Formula

**Risk = Likelihood × Impact** (at its simplest). More precisely:

- **Asset** — what you value (data, systems, reputation)
- **Threat** — what could harm it (attacker, disaster)
- **Vulnerability** — the weakness that makes the harm possible
- **Impact** — how bad it is when it happens

## The Risk Equation Everyone Uses

> Risk = (Threat × Vulnerability) × Asset Value

Reduce risk by: reducing threats (unlikely), removing vulnerabilities (possible), or reducing asset exposure (possible).

## Risk Response Options (Mitigate Doesn't Mean Prevent)

| Response | Meaning | Example |
|----------|---------|---------|
| Mitigate | Reduce likelihood/impact | patches, MFA |
| Transfer | Move the risk | cyber insurance |
| Accept | Acknowledge and tolerate | low-impact, low-likelihood |
| Avoid | Remove the risky thing | stop offering that service |

## Threat Modeling with STRIDE

**S**poofing — pretending to be someone else
**T**ampering — modifying data
**R**epudiation — denying an action
**I**nformation disclosure — leaking data
**D**enial of service — making unavailable
**E**levation of privilege — gaining more rights

Apply STRIDE per data-flow, component, and trust boundary. For each threat ask: **can this happen? like how? what control stops it?**

## Threat Modeling with DREAD (Risk Prioritization)

D**amage** potential — how severe?
R**eproducibility** — how easy to trigger again?
E**xploitability** — how hard to exploit?
A**ffected users** — how many?
D**iscoverability** — how easy to find?

Score 0-10 each, sum, and rank. DREAD is a scoring aid; STRIDE is a discovery aid. Together: discover with STRIDE, prioritize with DREAD.

## The Asset Inventory Comes First

You cannot protect what you don't know exists. Threat modeling starts with an **asset inventory**: data, servers, accounts, network segments, third parties, and a data-flow diagram.

> **Security through refusal:** if you can't list your assets and draw the data flows, any "security" is theater. This is the first question auditors and CISOs ask.
`,
      defaultCode: `// STRIDE scoring helper
function strideScore(threat, severity) {
  const cat = threat.toLowerCase();
  const mapping = {
    spoof: "Spoofing", tamper: "Tampering", repud: "Repudiation",
    info: "Information Disclosure", denia: "Denial of Service", elev: "Elevation of Privilege"
  };
  for (const [k, v] of Object.entries(mapping)) {
    if (cat.includes(k)) return { category: v, severity };
  }
  return { category: "Unknown", severity };
}
console.log(strideScore("Spoofing user identity", 8));`,
      solution: `Maps a threat description to its STRIDE category — creating the habit of classifying threats, then scoring severity (0-10).`,
      hint: "STRIDE discovers threats; DREAD prioritizes them.",
      challenge: `**Home Lab — Threat Model a System:**
1. Draw a data-flow diagram of a simple web app: user → web server → app server → database.
2. Apply STRIDE to each flow across each trust boundary. (e.g., user→web: Spoofing? Injection? DoS?)
3. Score with DREAD (0-10). List the top 3 priority threats.
4. For the top threat, name ONE control: prevent, detect, respond.
5. Present it in one page — this is format you'll reuse at work.`,
    },
    {
      id: 4,
      slug: "04-security-controls",
      title: "Security Controls: Prevent, Detect, Respond",
      level: "beginner",
      tag: "concept",
      duration: "25 min",
      description:
        "Physical, technical, administrative controls — and how defense-in-depth stacks them together.",
      content: `
# Security Controls: Prevent, Detect, Respond

## The Three Control Categories

| Category | What It Protects | Examples |
|----------|-----------------|----------|
| **Administrative** | People & process | policies, training, background checks, change control |
| **Technical** | Systems & data | firewalls, AV/EDR, encryption, MFA, SIEM |
| **Physical** | Buildings & devices | locks, cameras, badges, server-room air-gap |

## Function: Prevent / Detect / Respond

Controls also have a FUNCTION:

- **Prevent** — stop it happening: firewall, patch, MFA, policy
- **Detect** — notice it happening: EDR, SIEM, IDS, logging, alerts
- **Respond** — handle it after: IR plan, backups, containment, recovery
- **Deter** — discourage: banners ("authorized use only"), logging posters

> A good security program is not "more prevention". It's balanced prevention + detection + response. Prevention fails eventually — that's when detect+respond saves you.

## Defense in Depth (The Onion)

Layers around each asset:

1. **People/Policy** — least privilege, training
2. **Perimeter** — firewall, WAF, IDS
3. **Network** — segmentation, VLANs
4. **Host** — hardening, EDR, patching
5. **Application** — secure coding, CSP
6. **Data** — encryption, DLP, backups
7. **People again** — the human layer (phishing resistance)

An attacker that defeats the firewall still meets the EDR, the encryption, and the air-gapped backups.

## The Control-to-CIA Mapping

Every control should map to a CIA property + an asset:

| Control | CIA Property | Comment |
|---------|--------------|---------|
| MFA | Confidentiality | blocks credential misuse |
| Hash | Integrity | detects modification |
| Redundancy/backups | Availability | survives failure |
| Digital signature | Non-repudiation | proves sender |
| Audit logging | Accountability | proves actions |

> **Analyst habit:** when someone says "we have a control", ask three questions: *Prevent, detect or respond? Which CIA property? For which asset?* If they can't answer, the control is cosmetic.
`,
      defaultCode: `// Classify controls by function
function controlFunction(name) {
  const s = name.toLowerCase();
  if (s.includes("firewall") || s.includes("patch") || s.includes("mfa")) return "Prevent";
  if (s.includes("edr") || s.includes("splunk") || s.includes("ids") || s.includes("log")) return "Detect";
  if (s.includes("backup") || s.includes("incident") || s.includes("recovery")) return "Respond";
  return "Classify yourself";
}
console.log(controlFunction("Splunk alerts on new admin")); // Detect`,
      solution: `The classifier maps control names to function. Practice: most security products are DETECT, backups are RESPOND, MFA is PREVENT.`,
      hint: "Ask: does it stop, notice, or fix?",
      challenge: `**Home Lab — Map Your Own Defenses:**
1. List 10 security controls you use today (personal + work/school).
2. Classify each: prevent/detect/respond + category (admin/tech/physical).
3. Build your "onion": draw 3-5 layers protecting your most valuable account.
4. Identify your single point of failure — where does control redundancy break down?
5. Write one paragraph on where your personal security is strongest and weakest.`,
    },
    {
      id: 5,
      slug: "05-security-industry-roles",
      title: "Security Roles & Career Landscape",
      level: "beginner",
      tag: "concept",
      duration: "20 min",
      description:
        "Blue vs red team, SOC tiers, GRC, and the job titles behind the profession — know where you're heading.",
      content: `
# Security Roles & Career Landscape

## Blue Team Defense vs Red Team Offense

- **Blue team** — defends: SOC, incident response, threat hunting, forensics, vulnerability management
- **Red team** — simulates attacks: pentesting, exploit dev, red-team operations
- **Purple team** — both, working together

Entry into security is *almost always* blue team (more roles, lower bar). Red team usually requires years of blue experience + certs (OSCP).

## The SOC Tier Model

| Tier | Role | Duty |
|------|------|------|
| Tier 1 | Triage | Monitor dashboards, alert on events, escalate |
| Tier 2 | Investigation | Deep-dive incidents, containment, malware analysis |
| Tier 3 | Expert/Threat Hunt | Advanced analysis, hunting, tuning, forensics |

## Other Careers

| Role | Focus |
|------|-------|
| Security Engineer | Build & maintain systems (SIEM, EDR, cloud) |
| Pentester / Red Teamer | Authorized attacks |
| GRC Analyst | Governance, risk, compliance |
| Security Architect | Design secure systems |
| Digital Forensics / DFIR | Investigate incidents & crimes |
| Threat Intelligence Analyst | Study actors & TTPs |
| Security Auditor | Verify controls exist & work |
| Bug Bounty Hunter | Find & report vulns for pay |

## Frameworks That Define Roles

- **NIST NICE** framework — 50+ work roles across 7 categories
- **CyberSeek** — interactive career map (US)
- **OSCP / CySA+ / Security+ / CISSP** — certifications per level

## The Path in One Minute

1. **Months 0-6**: networking + Linux + security fundamentals (this course)
2. **Months 6-12**: first cert (Security+), labs, portfolio
3. **Months 12-24**: SOC Tier 1 → Tier 2, or junior analyst
4. **Years 2-5**: specialize (hunt, forensics, pentest, GRC, cloud)
5. **Years 5+**: senior engineer/architect, or specialized SANS-level mastery

> The meta-skill: *continuously learn*. This field changes weekly. Your superpower is a repeatable learning loop — which is exactly what this course is building.
`,
      defaultCode: `// Career path decision helper (conceptual)
const path = (pref) => {
  const p = pref.toLowerCase();
  if (p.includes("monitor") || p.includes("detect") || p.includes("soc")) return "Blue team → SOC Analyst";
  if (p.includes("break") || p.includes("hack") || p.includes("test")) return "Red team → Pentester (after blue experience)";
  return "Exploratory: finish fundamentals, then specialize";
};
console.log(path("I love monitoring and detecting threats"));`,
      solution: `Returns a starting career direction based on preference. The honest answer for most: start blue, go red later if you like it.`,
      hint: "Blue team is the entry path; red team the destination for most.",
      challenge: `**Home Lab — Build Your Roadmap:**
1. Research 3 roles you'd actually enjoy (read 2 job postings each).
2. For each, list: required skills, typical certs, salary range, and common titles.
3. Draw your 24-month personal roadmap: what you'll learn each quarter.
4. Identify 3 "proof" projects that would make you hireable in your chosen role.
5. Write your 1-page "hiring me" pitch: what will you know and have built after this course?`,
    },
  ],
};