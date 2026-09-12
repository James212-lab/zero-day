import type { Module } from "../curriculum";

export const module37: Module = {
  id: "module-37",
  slug: "37-risk-business-continuity",
  title: "Risk Management & Business Continuity",
  description:
    "Risk assessment, threat modeling, risk registers, BIA, RPO/RTO, DR/BCP, insurance and third-party risk — turning security into business decisions.",
  language: "Governance",
  lessons: [
    {
      id: 1,
      slug: "01-risk-assessment-frameworks",
      title: "Risk Assessment: Qualitative & Quantitative",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "The risk register, likelihood/impact scoring, FAIR-style quantification, and presenting risk to decision-makers.",
      content: `
# Risk Assessment: Qualitative & Quantitative

## Risk definition (again, sharpened)

\`\`\`
Risk = Threat (what/who) x Vulnerability (where)
       -> Event
       -> Impact (business cost)
\`\`\`
A risk register captures each identified risk one line: threat, vulnerability, likelihood L, impact I, score, owner, mitigation.

## Qualitative scoring (high-medium-low + 1-5)

| | Impact -> | 1 minor | 2 | 3 | 4 | 5 severe |
|--|--|--|--|--|--|--|
| L 1 rare    | 1 | 2 | 3 | 4 | 5 |
| ... 5 almost certain | 5 | 6 | 7 | 8 | 9 |

The matrix is a *communication tool*; the real analysis lives in the register's rationale.

## Quantitative (FAIR model)

- Asset value ($) x scenario frequency (per year) x loss magnitude (per event)
- Output: annualized loss exposure (ALE) → decision-makers see *money*
- Example: "ransomware on billing = 2x/year, $500k median loss → ALE $1M; backup-tape mitigation drops ALE to $300k"

## The register discipline

\`\`\`
Risk registers live as living documents:
- ID, description, threat, vuln, current controls
- L and I after controls (residual risk)
- Owner, next-review date, mitigation/decision
- status: accept / mitigate / transfer / avoid
\`\`\`

## Presenting risk

- The board wants 3 numbers and one ask, not a 50-row table
- Speak in money and likelihood percentages, not 'High' alone
- Show *trend*: risk last quarter vs this quarter
- Every 'accept' requires explicit sign-off (risk appetite)

> Risk management is decision support. A risk register with no owner and no decision is a list — a liability, actually.
`,
      defaultCode: `// a minimal risk registry object
const register = [
  { id: 1, threat: 'ransomware', vuln: 'weak MFA', L: 4, I: 5,
    owner: 'CTO', decision: 'mitigate' },
  { id: 2, threat: 'phishing', vuln: 'limited training', L: 5, I: 3,
    owner: 'HR+sec', decision: 'mitigate' }
];
for (const r of register) {
  console.log(r.id, r.threat, 'score', r.L * r.I, '->', r.decision);
}`,
      solution: `const register = [
  { id: 1, threat: 'ransomware', vuln: 'weak MFA', L: 4, I: 5,
    owner: 'CTO', decision: 'mitigate' },
  { id: 2, threat: 'phishing', vuln: 'limited training', L: 5, I: 3,
    owner: 'HR+sec', decision: 'mitigate' }
];
for (const r of register) {
  console.log(r.id, r.threat, 'score', r.L * r.I, '->', r.decision);
}`,
      hint: "Every risk: owner, residual score, decision. Business language for the board.",
      challenge: `**Home Lab — Personal Risk Register:**
1. List 6 risks to your own data (phishing, ransomware, lost device, DOX, cloud account, backup failure).
2. For each: threat, vuln, L(1-5), I(1-5), current control, mitigations.
3. Score them; pick your top 2.
4. Implement ONE mitigation for each within the month.
5. Write the 3-line 'executive summary' a family CISO would accept.`,
    },
    {
      id: 2,
      slug: "02-bia-rpo-rto",
      title: "Business Impact Analysis (BIA), RPO & RTO",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "What breaks when IT breaks: classify systems, define recovery targets, and translate downtime into money.",
      content: `
# Business Impact Analysis (BIA), RPO & RTO

## The two numbers that run the world

\`\`\`
RPO = Recovery Point Objective: how much data you can afford to lose
      ("we lose at most 1 hour of transactions")
RTO = Recovery Time Objective: how fast you must be back
      ("we must be running again within 4 hours")
\`\`\`

## BIA process

1. Inventory business functions (billing, payroll, production, CRM)
2. For each: dependency (systems, data, people), peak windows
3. Downtime cost: loss/hr (direct) + regulatory + reputation
4. Set RPO/RTO per function (not one-size): billing = RTO 2h; analytics = RTO 24h
5. Map dependencies (a function's RTO is capped by its weakest dependency)

## Classifications

| Tier | RTO | RPO | Examples |
|------|-----|-----|----------|
| Bronze | 72h | 24h | internal wiki, historical reports |
| Silver | 24h | 12h | CRM read, payroll approx |
| Gold | 4-8h | 1h | billing, patient records |
| Platinum | <1h | <15min | revenue-critical web, trading |

## The math

\`\`\`
Maximum Tolerable Downtime (MTD) > RTO + RPO + restoration var
Data loss economics: RPO is where you accept data loss; RTO where you measure business impact.
\`\`\`

## Craft notes

- Set RPO/RTO from BUSINESS tolerance, not IT convenience
- Validate: test the restore! an RTO declared but untested is a lie
- Reassess when business changes
> A BIA is the 'what will it cost to be down' number you'll quote in every RFP, every board slide, every incident. Know yours cold.
`,
      defaultCode: `// system-tier model
const systems = [
  { name: 'billing', tier: 'platinum', rpo: 15, rto: 60 },
  { name: 'wiki', tier: 'bronze', rpo: 1440, rto: 4320 }
];
for (const s of systems) {
  console.log(s.name, s.tier, 'RPO ' + s.rpo + 'min RTO ' + s.rto + 'min');
}`,
      solution: `const systems = [
  { name: 'billing', tier: 'platinum', rpo: 15, rto: 60 },
  { name: 'wiki', tier: 'bronze', rpo: 1440, rto: 4320 }
];
for (const s of systems) {
  console.log(s.name, s.tier, 'RPO ' + s.rpo + 'min RTO ' + s.rto + 'min');
}`,
      hint: "RPO = data loss tolerance; RTO = recovery speed. Set from business cost, test the restore.",
      challenge: `**Home Lab — BIA Your Own Life:**
1. List your critical 'systems': email, banking, docs, photos, personal cloud.
2. Per item: if lost, what does it cost you / hr & what data can you lose?
3. Set RPO/RTO per item (minutes/hours/days).
4. Note your top data-loss risk: does your backup match the RPO?
5. Write 5 lines on the difference between data loss and downtime in your context.`,
    },
    {
      id: 3,
      slug: "03-dr-bcp-planning",
      title: "Disaster Recovery & Business Continuity Planning",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Recovery strategies (hot/warm/cold), plan structure, testing methodology (tabletop → failover), and the continuity plan that survives audits.",
      content: `
# Disaster Recovery & Business Continuity Planning

## DR vs BCP

- **BCP** (Business Continuity): keep the BUSINESS operating (people, alt sites, manual workarounds)
- **DR** (Disaster Recovery): recover IT specifically (systems, data, backup restores)

## Recovery site tiers

| Tier | Standby | RTO | Cost |
|------|---------|-----|------|
| **Hot** | Ready to cutover live | <1h | $$$ |
| **Warm** | Bootable from replica, not running | 4-24h | $$ |
| **Cold** | Facility, no capacity = manual | >24h | $ |

## Plan structure (the doc)

\`\`\`
1. Scope & ownership       (who's on call, who declares disaster)
2. BIA recap (RPO/RTO per system)
3. Response: activation procedure + severity triggers
4. Recovery: per-system recovery steps + tooling + restoration order
5. Communication: escalation tree, external comms (regulators/PR)
6. Stand-down & lessons learned
\`\`\`

## Testing: the plan is a hypothesis until tested

- **Tabletop**: walk the phone-tree + decisions (cheap, monthly)
- **Simulation**: partial failover with checks (quarterly)
- **Full failover**: cut real traffic to DR (annually, carefully)
- **Restore test**: restore from backup & validate data (the RPO proof!)
Each test → improvement list with owner + dates.

## Backup strategy: the DR spine

\`\`\`
3-2-1: 3 copies, 2 media, 1 offsite
immutable (ransomware-proof): object-lock / air-gapped
versioned, tested restores monthly minimum
\`\`\`
## Pitfalls

- Plans dated "2021" with no owner — audit finds it, incident kills you
- Untested RTO — the classic lie
- No communication plan — the second disaster
> A BCP/DR that hasn't been tested is a prayer. The tabletop is the cheapest insurance your org will ever 'buy'.
`,
      defaultCode: `// test cycle tracker
const tests = { tabletop: 'monthly', sim: 'quarterly', failover: 'annual', restore: 'monthly' };
const overdue = Object.entries(tests).filter(([k, cadence]) => kadenceAge(k) > cadence);
console.log('Testing gaps:', overdue.length ? overdue.map(([k]) => k).join(', ') : 'all current');`,
      solution: `const tests = { tabletop: 'monthly', sim: 'quarterly', failover: 'annual', restore: 'monthly' };
const overdue = Object.entries(tests).filter(([k, cadence]) => kadenceAge(k) > cadence);
console.log('Testing gaps:', overdue.length ? overdue.map(([k]) => k).join(', ') : 'all current');`,
      hint: "Tabletop monthly, restore monthly, failover annually. Untested = not real.",
      challenge: `**Home Lab — BCP Light:**
1. Write the phone-tree for your household: who acts when the internet/bank/docs are down?
2. Tabletop: 'ransomware hits your main PC — walk through the first 30 min'.
3. Test a REAL restore: restore 3 files from your backups and verify.
4. Write your personal DR plan (RPO/RTO from last lesson) — 1 page.
5. Schedule the next tabletop on your calendar.`,
    },
    {
      id: 4,
      slug: "04-cyber-insurance-3prisk",
      title: "Cyber Insurance & Third-Party Risk",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "What insurance covers, premiums' security conditions, and the vendor risk management (VRM) process that audits your supply chain.",
      content: `
# Cyber Insurance & Third-Party Risk

## Cyber insurance reality

- **Covers**: incident response, forensics, ransomware response (extortion), legal, notification costs, business interruption, liability
- **Does NOT cover**: everything — warfare acts, pre-existing, negligence gaps
- **Premium conditions**: insurers REQUIRE basics (MFA, backups, EDR, patching, response plan). Your posture literally prices your premium.

## The smart contract angle

- Policy review: what's explicitly included, cyber-extortion vs ransomware, sub-limits
- Prove your controls (insurance audits your maturity)
- Underwriters now ask: MFA on VPN? backup iso? incident response retained?

## Third-party risk (vendor risk management)

Supply chain risk: you're only as secure as your vendors with your data.

\`\`\`
Vendor questionnaire (SOC 2, ISO 27001, NIST CSF)
  -> risk-tier (critical for access to PII/financial)
  -> continuous monitoring (breach disclosure, security posture changes)
  -> contract: liability, breach-notification terms, audit rights
  -> exit clause (data return/deletion)
\`\`\`

## The VRM flow

1. **Assessment**: questionnaire + evidence (SOC2/ISO certs, pen test results)
2. **Tier**: critical (PII, financials) vs normal
3. **Mitigate**: require controls in contract; retest high tiers yearly
4. **Monitor**: news/watchlists (breach disclosure alerts), reassess posture
5. **Offboard**: data deletion, credential revocation, access removal

## The big-brain question

"Who has my data?" — answer from an asset inventory + class/subclass registry, not from memory. Third-party risk fails when nobody keeps the list.
> Insurance is risk transfer with strings attached — your controls set the price and the coverage. Vendor risk = auditing the parts of your perimeter you didn't build.
`,
      defaultCode: `const vendors = [
  { name: 'saas-crm', tier: 'critical', has: ['soc2','iso27001'], lastReview: 2024 },
  { name: 'email-scan', tier: 'normal', has: [], lastReview: 2021 }
];
for (const v of vendors) {
  const okHing = v.tier !== 'critical' || (v.has.includes('soc2') && v.lastReview >= 2023);
  console.log(v.name, '->', okHing ? 'pass' : 'REVIEW NOW');
}`,
      solution: `const vendors = [
  { name: 'saas-crm', tier: 'critical', has: ['soc2','iso27001'], lastReview: 2024 },
  { name: 'email-scan', tier: 'normal', has: [], lastReview: 2021 }
];
for (const v of vendors) {
  const ok = v.tier !== 'critical' || (v.has.includes('soc2') && v.lastReview >= 2023);
  console.log(v.name, '->', ok ? 'pass' : 'REVIEW NOW');
}`,
      hint: "Tier vendors by data access; require evidence; monitor continuously; offboard cleanly.",
      challenge: `**Home Lab — Vendor Audit Yourself:**
1. List 8 apps/services that hold YOUR data.
2. Tier them (critical = financial/PII).
3. Verify each critical: MFA, breach policy, data-export capability.
4. Write the 'offboard' steps for the top 2 (export, delete, revoke).
5. Write the 4-question vendor questionnaire your family business would use.`,
    },
    {
      id: 5,
      slug: "05-threat-modeling-risk",
      title: "Threat Modeling & Risk in Practice",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Put risk to work: run a mini-assessment on a real system you use, produce the register + BIA + residual-risk story.",
      content: `
# Threat Modeling & Risk in Practice

## The capstone: assess one system end-to-end

Choose a system YOU own/handle (a home server, a tiny web app, your lab) and run the full risk process.

## Workflow

\`\`\`
1. Inventory: assets, data, flows, tech (draw it)
2. Threat model: STRIDE every element, note top risks
3. Assess: L/I per risk (register), target each mitigation
4. BIA-lite: what's the downtime/data-loss cost?
5. Decide: accept/mitigate/transfer each (document!)
6. Re-calc residual: the register after controls
7. Report: 1-page exec summary
\`\`\`

## Common trap: analysis paralysis

- Assess at the level the decision needs (no 200-line table for a home router)
- Iterate: first pass coarse, then drill where score is high
- Document *assumptions* (the register without assumptions is voodoo)

## Tools for play

- OWASP Threat Dragon (DFD + note)
- A simple risk register — spreadsheet is fine
- For formal clients: FAIR + vendor questionnaires

## The deliverable shape

\`\`\`
Executive summary: top 3 risks, ALE/financial if quantifiable, one ask
Register: full list w/ scores, owners, decisions, review dates
Assumptions: explicitly stated limits
\`\`\`

> The assessor's best output isn't the perfect model — it's the *decision it enabled*. Run the loop on one real system and you've earned the badge.
`,
      defaultCode: `// the one-system assessment loop
const system = {
  name: 'lab-home-server',
  risks: [
    { id: 1, threat: 'exposed web apps', L: 3, I: 4, control: 'reverse proxy+WAF' , residual: 8 },
    { id: 2, threat: 'no backups', L: 2, I: 5, control: 'immutable backups', residual: 4 }
  ]
};
console.log(system.name, 'risks:', system.risks.map(r => r.id).join(','));
console.log('residual > threshold?', system.risks.some(r => r.residual > 6));`,
      solution: `const system = {
  name: 'lab-home-server',
  risks: [
    { id: 1, threat: 'exposed web apps', L: 3, I: 4, control: 'reverse proxy+WAF' , residual: 8 },
    { id: 2, threat: 'no backups', L: 2, I: 5, control: 'immutable backups', residual: 4 }
  ]
};
console.log(system.name, 'risks:', system.risks.map(r => r.id).join(','));
console.log('residual > threshold?', system.risks.some(r => r.residual > 6));`,
      hint: "Inventory, model, register, decide. Residual with owners; decisions documented.",
      challenge: `**Home Lab — The Assessment:**
1. Run the workflow on YOUR home server/NAS/router.
2. Produce: 5-risk register (L/I/owner/decision), BIA-lite, 1-page exec summary.
3. Implement the highest-ROI mitigation within the week.
4. Note 2 assumptions you should validate later.
5. Save as your first 'risk assessment' portfolio artifact.`,
    },
  ],
};