import type { Module } from "../curriculum";

export const module17: Module = {
  id: "module-17",
  slug: "17-compliance-frameworks",
  title: "Compliance & Security Frameworks",
  description:
    "NIST CSF, ISO 27001, SOC 2, CIS Controls — the frameworks that turn 'good security' into something measurable and auditable.",
  language: "Governance",
  lessons: [
    {
      id: 1,
      slug: "01-frameworks-overview",
      title: "Security Frameworks: NIST CSF, ISO 27001 & CIS",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "The big three frameworks, what they measure, and how they structure a security program.",
      content: `# Security Frameworks: NIST CSF, ISO 27001 & CIS

## Why Frameworks Exist

Frameworks give a shared vocabulary and a yardstick. "Our security is good" means nothing; "we align 15 of 20 NIST CSF subcategories and audit against it" means something.

## NIST Cybersecurity Framework (CSF) — the operating system of US security

Six functions (CSF 2.0):

\`\`\`
Govern   - the rules, context, roles
Identify - what do we have and what matters
Protect  - boxes to keep bad stuff out
Detect   - how we know something's wrong
Respond  - what we do when it happens
Recover  - how we get back up
\`\`\`

Each function → categories (e.g. PR.AT = awareness & training) → subcategories (PR.AT-1: "All users are informed and trained..."). Tiers (Partial → Risk-Informed → Repeatable → Adaptive) say how *mature* you are.

**Why you'll meet it:** it's the de-facto language of US cybersecurity, cyber insurance, and vendor risk.

## ISO/IEC 27001 — the certifiable one

- An international **management system** (ISMS) — policies, risk, continual improvement
- Annex A = 93 (approx) controls you tailor to your context
- **Certifiable** — an auditor checks you; certs renew every 3 years; the audit culture
- Not security-brilliance: it's *governance discipline* — evidence, records, ownership

## CIS Controls — the operational, actionable list

18 controls, prioritized:

\`\`\`text
01 Inventory of enterprise assets
02 Inventory of software assets
03 Data protection
04 Secure config of assets and software
05 Account management
06 Access control / MFA
07 Continuous vuln management
08 Audit log management
09 Email & browser protections
10 Malware defenses
11 Data recovery
12 Network infrastructure management
13 Network monitoring / defense
14 Security awareness
15 Service provider management
16 Application software security
17 Incident response
18 Penetration testing
\`\`\`

Why organizations love them: **"Do these 18 things in this order."** The IG1/2/3 implementation groups say what to do first.

## Choosing a Framework

| Question | They answer |
|----------|-------------|
| "Which do I START with for culture?" | CIS Controls / NIST CSF |
| "Do I need an audited certificate?" | ISO 27001 |
| "Are we a vendor/ SaaS?" | SOC 2 (module 2 of this track) |
| "Am I Asia/EU cloud?" | ISO 27001 / TISAX / HITRUST (industry) |

> **The insight:** frameworks don't *be* security — they make it *structured, measurable, and auditable*. Know the trio: NIST CSF (IT), ISO (certification), CIS (ops list).
`,
      defaultCode: `// Map a control to a framework (tiny example)
const protect = [
  { id: "PR.AC-1", text: "Identities and credentials managed" },
  { id: "PR.AT-1", text: "All users informed & trained" },
  { id: "PR.DS-1", text: "Confidentiality of data protected" },
];
const cis18 = { 1: "asset inventory", 2: "software inventory" };
console.log("NIST subcategory:", protect[0].id);
console.log("CIS equivalences often overlap: asset inventory ~= Identify AS-1");
// Frameworks overlap a LOT — that's why mapping tables exist.`,
  solution: `Shows the NIST/CIS overlap — frameworks share intent, and mapping sheets exploit it.`,
  hint: "Framework mapping is a real analyst task: which control proves which requirement?",
  challenge: `**Home Lab — Map a Framework:**
1. Read NIST CSF 2.0's PROTECT function top-level (7 categories, PR.*).
2. For a small fictional company, write: 3 assets, then 3 PROTECT subcategories you'd implement and 1 piece of evidence each.
3. Take your homelab MFA/patching/AWARENESS and mark which CIS controls you cover (count them).
4. Write a 1-page 'our program, mapped to NIST CSF @ tier 2' for your fictional company.
5. It beats practice time: apply the same thought to a real open-source project's README.`,
    },
    {
      id: 2,
      slug: "02-soc2-audits",
      title: "SOC 2, Audits & Third-Party Risk",
      level: "advanced",
      tag: "concept",
      duration: "40 min",
      description:
        "Trust in SaaS: SOC 2 TSCs, the evidence game, auditor mindset, and vendor risk management.",
      content: `# SOC 2, Audits & Third-Party Risk

## What SOC 2 Is

**System and Organization Controls 2 (SOlOKI 2)** — for service organizations (SaaS), an **auditor attestation over 5 Trust Service Criteria (TSC)**:

\`\`\`text
Security   — protection vs unauthorized access/data loss (ALWAYS in scope)
Availability
Confidentiality
Processing Integrity
Privacy
\`\`\`

§ Security leads: **CCF (Common Criteria)** — CC 5.2, CC 6.1 etc. are the specific controls the auditor checks.

## The Audit Ritual

- **SOC 2 Type I** = design check: "controls exist at a point"
- **SOC 2 Type II** = operating check: "controls worked over 3-12 months" (evidence!)
- **Auditor** = third-party CPA-type firm; samples evidence; walks your TEAMS

Every control = evidence trail:
\`\`\`text
Control: "MFA enabled on all admin access"
Evidence: policy doc + screenshot of IdP MFA enforcement + access review log + training record
\`\`\`

## The Evidence Fabric (the part analysts live)

Companies "absorb" SOC 2 via their operations:
- Logs (from your SOC/M12 telemetry!)
- Reports (of the vuln-scan monthly, of incidents)
- Access review records, training completion, patch history (M15)

Your work product IS the audit evidence. That's why good operations make audits easy.

## Third-Party Risk Management (TPRM)

You outsource = you inherit their risk:

1. **Vendor questionnaire** — controls, certifications, breach history
2. **Assess** (tier by data criticality)
3. **Contract** — the SLA, incident notification, liability
4. **Review** on a cycle + re-assess after incidents
5. **Monitor** — provider's SOC 2 report (ask to read it!), breach disclosures

**Key question for any SaaS you adopt:** "What access does their team have to MY data, and what's their breach-notification SLA?" If they can't answer — risk flag.

## The Auditor's Question Pattern

The auditor doesn't just ask "do you have X?" — they ask:
- *Show me* the config
- *Show me* the review that happened
- *Show me* the evidence it's monitored
- *What would happen if someone left?* (offboarding evidence!)

> **Career note:** 'compliance' roles love people who understand the *operations* behind the evidence. The analyst who automates evidence collection is a compliance star.
`,
      defaultCode: `// A vendor risk score example (simplified)
function vendorScore(v) {
  let s = 0;
  if (v.soc2Type2) s += 30;
  if (v.breachNotice === "under 24h") s += 20;
  if (v.mfaEnforced) s += 20;
  if (v.dataRegional) s += 10;
  if (v.holdsYourPII && !v.encryptsAtRest) s -= 40;
  return { score: s, verdict: s >= 70 ? "adopt with monitoring" : s >= 40 ? "review terms" : "high-risk - seek alternative" };
}
console.log(vendorScore({ soc2Type2: true, breachNotice: "under 24h", mfaEnforced: true, dataRegional: true, holdsYourPII: true, encryptsAtRest: true }));`,
  solution: `A risk model for vendors — your TL;DR for 'should we connect this SaaS to our data?'`,
  hint: "Encryption at rest + breach SLA + MFA = the vendor's actual posture in 3 signals.",
  challenge: `**Home Lab — Vendor Due-Diligence Drill:**
1. Pick 2 SaaS tools you actually use (personal or project). List what data they hold.
2. Check their trust/security pages: do they publish SOC 2? Who's the auditor? Any breach history?
3. Score them with the model above and write your 'assessment note'.
4. Get comfortable reading a soc2 report's executive summary if one is public (look for 'independent' verbiage).
5. This is 80% of TPRM work — you've now done it twice.`,
    },
  ],
};