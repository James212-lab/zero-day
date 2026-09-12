import type { Module } from "../curriculum";

export const module16: Module = {
  id: "module-16",
  slug: "16-policy-law-ethics",
  title: "Security Policy, Law & Ethics",
  description:
    "Policies and standards, the laws that govern security work, and the ethics that keep you out of prison.",
  language: "Governance",
  lessons: [
    {
      id: 1,
      slug: "01-security-policy",
      title: "Security Policies, Standards & Guidelines",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "Hierarchy of policy, standards, guidelines, procedures — the paperwork that actually changes behavior.",
      content: `# Security Policies, Standards & Guidelines

## The Governance Pyramid

\`\`\`
        POLICY          (WHY: the rule, high-level, mandatory)
          │
     STANDARDS         (WHAT: specific must-do technical requirements)
          │
     GUIDELINES        (SUGGESTED: recommended ways, not mandatory)
          │
     PROCEDURES        (HOW-to: step-by-step runbooks)
\`\`\`

**Policy = "you must."** Standard = "this exact version/way." Guideline = "best attempt." Procedure = "in this order."

## Common Policies You Must Know

- **Acceptable Use Policy (AUP)** — what employees may do with company IT
- **Data Classification & Handling** — public / internal / confidential / restricted
- **Password & Access Policy** — who, what strength, MFA requirement
- **Bring Your Own Device (BYOD)** policy
- **Remote Access / VPN policy**
- **Incident Response policy** — the authority that IR jumps when activated
- **Business Continuity / Disaster Recovery**
- **Privacy policy** (GDPR/CCPA dimension, module 17)

## A Policy Is Useless Alone

A policy works when it's:
1. **Written for a reader** (clear, short, enforceable)
2. **Owned + reviewed** (annual review, named owner)
3. **Tied to reality** (else it's aspirational paper)
4. **Enforced & measured** (controls enforce; metrics check)

## Policy vs Standard Example

\`\`\`text
POLICY:    "All production systems must support strong authentication."
STANDARD:  "MFA is mandatory on all external logins."
GUIDELINE: "Prefer FIDO2 over OTP where the platform supports it."
PROCEDURE: "1. Create MFA enrollment → 2. Attach device → 3. Test recovery."
\`\`\`

> **The governance insight:** documents don't secure anything — but they make 'who is accountable' and 'what is the rule' knowable, and that's the precondition for every technical control.
`,
      defaultCode: `// The keystone of a good policy: measurable + owned
function healthyPolicy(p) {
  return {
    readable: p.words > 500 && p.words < 8000,
    owned: typeof p.owner === "string" && p.owner.length > 0,
    reviewedThisYear: p.lastReviewYear === new Date().getFullYear(),
    enforceable: p.controlRefs.length > 0,
  };
}
const ok = healthyPolicy({
  words: 3000, owner: "CISO", lastReviewYear: new Date().getFullYear(), controlRefs: ["MFA-enrollment-idp"],
});
console.log(ok);`,
  solution: `Challenges you to write policies that are owned, current, and enforceable — not just text.`,
  hint: "review yourself: is it 2026-fresh with a named owner?",
  challenge: `**Home Lab — Write Your Own Policy Pack:**
1. Write a 1-page 'homelab acceptable use' policy + a password/MFA standard for YOUR systems.
2. Add a data classification: label your own files P/C/I/R.
3. Write a 'remote access' policy for your lab VPN (if you have one) or SSH access rule.
4. Quality check: is each item measurable? Enforceable? Owned by you?
5. Keep them in your homelab notebook. Every concept here scales to a company doc.`,
    },
    {
      id: 2,
      slug: "02-security-laws",
      title: "Security Law: CFAA, GDPR, HIPAA & More",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "The laws that frame cybersecurity work — CFAA, GDPR, HIPAA, CCPA, PCI — and their real obligations.",
      content: `# Security Law: CFAA, GDPR, HIPAA & More

## Why You Need the Law

Security people make decisions that are *legal decisions*:
- "Can I test that system?" (CFAA — written permission needed)
- "Can I keep this breach data?" (privacy — harm minimization)
- "Do I HAVE to disclose?" (breach notification laws)

Ignorance here is an ethics breach and a career ender. None of this is legal advice — you learn enough to KNOW when to involve counsel.

## CFAA (USA, 18 U.S.C. § 1030)

Unauthorized access to protected computers = crime, **even if you didn't 'damage' anything**. The 'authorized/unauthorized' line runs through pen testers and rogue users alike.

- **Homework:** read what "exceeds authorization" means; never rely on 'I had access to it in the lab'.
- The 2010s debate over whether it covers 'no damage + just viewing' data — you'll hear 'CFAA with great power...'. The safe reading: don't access what you're not authorized to.

## GDPR (EU) — the data-privacy star

- **Personal data** → rights: access, erasure, portability, consent control
- **Data breach notification**: ~72 hours to notify authority (EU, plus national rules)
- **DPO / ROPA** (policies, records)
- Huge fines: up to 4% global turnover / €20M
- Extra-territorial scope: applies to ANY company processing EU residents' data

**Ask in any role:** "where is the personal data flowing, and what privacy obligations attach?" That question is half of a SOC analyst's day in 2026.

## HIPAA (US healthcare)

- PHI (Protected Health Information) safeguards: administrative, physical, technical
- Breach notification: covered entities to HHS, patients, media (if 500+)
- Encryption isn't mandated — *safeguards* are — but encryption is how you mostly comply

## CCPA/CPRA (California) & the US state patchwork

- Consumer rights: deletion, 'do not sell', access
- The US has no single federal GDPR; states do their own thing — privacy programs are increasingly 'state law aware'

## PCI DSS (payment card data)

- Not law but CONTRACT (mandatory via card networks)
- 12 requirements: firewall, strong passwords, encrypted cardholder data, restrict physical/logical access, logging, testing, vendor management...

## The Breach Notification Matrix (the instant panic-solver)

| Law | What triggers | How fast | To whom |
|-----|---------------|----------|---------|
| GDPR | risk to rights/freedoms | 72h | authority (+ often users) |
| HIPAA | unsecured PHI | 60 days | HHS/patients |
| State laws | personal data | varies (often 30d) | state AGs |
| PCI | cardholder data | as contract says | acquiring bank |

> **In practice:** the legal team carries the notification call; *you* carry the facts (what data, how many, when, exposure). Your timestamped, hashed evidence (M14) is what makes notification accurate.
`,
      defaultCode: `// Breach triage: sketch what must be answered before legal can act
function breachFacts(b) {
  return {
    dataTypes: b.dataTypes,
    individuals: b.individuals ?? "N/A",
    timeline: b.firstKnown,
    exposure: b.howExposed,
    confirmed: b.confirmedSensitive,
    needsNotification: b.riskToIndividuals === "high-risk",
  };
}
const facts = breachFacts({
  dataTypes: ["email", "passwords plaintext"],
  individuals: 1200,
  firstKnown: "2026-03-01T03:00Z",
  howExposed: "web server traversal",
  confirmedSensitive: true,
  riskToIndividuals: "high-risk",
});
console.log("legal needs:", Object.keys(facts).length, "facts; notify:", facts.needsNotification);`,
  solution: `Shows the fields legal will demand seconds after your call: data, count, timing, exposure, risk.`,
  hint: "Speed helps; accuracy helps more — document, don't guess.",
  challenge: `**Home Lab — Legal Walk-Through:**
1. Read the actual PII 'what is personal data?' definition in GDPR (or CCPA) once.
2. For your homelab, classify: which databases you would hold if you were a company — and which law (GDPR / HIPAA / PCI) would bite.
3. Draft the 'breach notification facts' template for the top 3 laws.
4. Jot your anti-blind-spot rule: 'before I build anything, ask where personal data flows'.
5. Keep a note: where the legal team sits in your org — future you will need it at 3am.`,
    },
    {
      id: 3,
      slug: "03-ethics-for-security",
      title: "Ethics: The Human Rules of Security Work",
      level: "intermediate",
      tag: "concept",
      duration: "30 min",
      description: "Permissions, autonomy, doing no harm, and the day-to-day ethics dilemmas every analyst faces.",
      content: `# Ethics: The Human Rules of Security Work

## The Ethical Lines in Security

Security work is power. You can see everything, control anything, and (with a little effort) break most things. The rules are mostly internal:

1. **Authorization** — never touch a system you aren't authorized for (CFAA's blade, plus principle)
2. **Least-privilege-by-choice** — access what you need, not what you *can*
3. **Do no harm** — don't break production (M10's impact-limits)
4. **Data minimization** — handle customer data like a loaded gun
5. **Transparency to the business** — no 'secret' security work that surprises the owners
6. **Accountability** — your name is on the evidence and the report
7. **Respect humans** — security serves people, not machines

## The Everyday Dilemmas

- **"I found the CEO's password in a breach dump — do I look around?"** → No. Report the finding, don't weaponize it.
- **"I can see the intern's browser history via the SIEM"** → access ≠ you need it; if you must look, do it as procedure, title it, and explain why.
- **"My pentest found a hole in a THIRD party's system (through the scope)"** → stay in scope; out-of-scope findings get flagged to the client, not exploited.
- **"Can I 'hack back' the attacker's server?"** → NO. Unauthorized access is itself a crime. Defense + reporting, never retaliation.
- **"Everyone reuses passwords, it's fine to try my colleague's"** → never. Authorization doesn't imply permission to snoop.

## The Two-Credit Fantasy (the golden rule)

If you wouldn't want the exact action performed on your own account/data/systems, in the same situation — don't do it to anyone else's. Ethical RAM is short, so encode the rule.

## The Analyst's Confession Culture

Good teams treat 'I accidentally saw X' as a **report**, not a sin:
- Report early (before it festers)
- The harm is hiding it, not the accident
- Blame-free reporting = the only culture where mistakes surface (M13's lessons-learned rule)

## The Responsibility Escalator

As you gain access (admin, MSSP client SIEMs, cloud root):
1. Each level = new duty, not new privilege
2. Document actual ACA (authorized to access) before you click
3. When in doubt, ask. 'Ask' has saved more careers than skill.
`,
      defaultCode: `// A tiny 'is this OK?' filter worked around in text
function okToDo(action, asks) {
  const inScope = asks.scope && action.target.includes(asks.scope);
  const authorized = asks.writtenAuth === true;
  const noHarm = asks.impact === "none";
  return inScope && authorized && noHarm
    ? "PROCEED with documentation"
    : "STOP — require authorization + impact check";
}
console.log(okToDo("nmap scan 10.10.20.0/24", { scope: "10.10.20.0/24", writtenAuth: false, impact: "low" }));
console.log(okToDo("test exploit on lab", { scope: "lab", writtenAuth: true, impact: "none" }));`,
  solution: `The triage filter: in scope + written auth + no impact → go; else stop. Codifies the ethics line.`,
  hint: "Ethics is a checklist, not a feeling — encode it.",
  challenge: `**Home Lab — Ethics Scenarios:**
1. Write 10 mini-scenarios from SOC/pentest life (finding CEO creds, seeing an employee's private data, hack-back temptation, out-of-scope findings, borrowed credential temptation...).
2. Answer each with: right action + why + what YOU would write on the ticketed record.
3. Discuss one with a person outside security — that's the 'public lens' test.
4. Write your personal 'no-fly list' (never) and 'ask-first' (when unsure) — 5 items each.
5. Keep it next to your RoE. It's your ethical compass card.`,
    },
  ],
};