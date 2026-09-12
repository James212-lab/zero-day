import type { Module } from "../curriculum";

export const module13: Module = {
  id: "module-13",
  slug: "13-incident-response",
  title: "Incident Response & Crisis Management",
  description:
    "The NIST incident lifecycle, playbooks, containment, and how teams make the tough calls when something is already burning.",
  language: "Blue Team",
  lessons: [
    {
      id: 1,
      slug: "01-ir-lifecycle-nist",
      title: "The Incident Response Lifecycle (NIST 800-61)",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Preparation, Detection, Containment, Eradication, Recovery, Lesson Learned — the spine of every IR program.",
      content: `# The Incident Response Lifecycle (NIST 800-61)

## The Six Phases

NIST SP 800-61 defines the process:

\`\`\`
1. Preparation
2. Detection & Analysis
3. Containment, Eradication & Recovery
4. Post-Incident Activity
\`\`\`

Popular 6-step framing adds the middle:

\`\`\`
Prepare → Detect → Contain → Eradicate → Recover → Lessons Learned
\`\`\`

## Phase 1 — Preparation (Before Anything Happens)

- **IR Plan** — who does what when the pager goes off
- **Playbooks** — step-by-step for the common types (ransomware, phish, insider)
- **Access when it counts** — emergency admin access that actually works when AD is compromised
- **Tools** pre-deployed (EDR, SIEM, containment switches)
- **Contacts** — vendors, legal, PR, cyber insurance, law enforcement
- **Backups you can actually restore** (tested!)

> The best IR happens because of the preparation 12 months earlier. If you only prepare when the incident starts, you've lost.

## Phase 2 — Detection & Analysis

- **Triage** (module 12) → confirmation
- The five W's again: what, who, when, where, why
- **Scope** — how far has it spread? (that's the biggest question at the start)
- Establish **IDs/labels**: incident #, case naming, comms channels

## Phase 3 — Containment

Goal: stop the bleeding WITHOUT destroying evidence.

- **Short-term**: isolate hosts (kick from network), kill the pipes (block C2)
- **Preserve**: snapshot, memory capture *before* you pull the plug (M14)
- **Long-term**: temporary fix to run business safely while you continue
- Decision: to contain means changes to the environment — **document every change** and why

## Phase 4 — Eradication

Remove the attacker's footholds:
- Malware, backdoors, persistence
- Reset ALL affected credentials (they may have more)
- Patch the *cause*, not just the symptom

## Phase 5 — Recovery

- Restore from clean backups
- **Careful**: restore to a *clean* state and validate
- Reinstate business functions under monitoring
- The attacker may re-enter — watch for re-compromise (a well-known failure)

## Phase 6 — Lessons Learned

The phase most teams skip and regret:
- What worked / what didn't
- Root cause to fix — permanently
- Update the playbook, close the gap

> **Key mindset:** recovery isn't "everything works again" — it's "we understand what happened, why, and how we'll prove it won't happen the same way."
`,
      defaultCode: `// IR lifecycle tracker for yourself
const cycle = ["prepare", "detect", "contain", "eradicate", "recover", "learn"];
const status = { prepare: true, detect: true, contain: false, eradicate: false, recover: false, learn: false };
const next = cycle.find(p => !status[p]);
console.log("Next phase:", next || "completed");

// Important: every phase has a gate criterion. e.g.
const gates = {
  contain: "brakes on + evidence preserved + comms notified",
  eradicate: "persistence removed + root cause patched",
};
console.log("contain gate:", gates.contain);`,
  solution: `Tracks phases and their gates — you don't mono-skip phases; each has an exit criterion.`,
  hint: "Phase discipline: don't leap to 'eradicate' before containment + evidence.",
  challenge: `**Home Lab — Write YOUR IR Plan:**
1. Draft a 2-page "incident response plan for my homelab" (this teaches the same structure as a company doc).
2. Write 2 playbooks: (a) ransomware on a lab VM, (b) phishing email reported by a fake "employee".
3. Define your **3 emergency contacts** and **1 tool already installed** you'd use.
4. Do a desk exercise (10 min): walk through the ransomware playbook aloud — find 3 gaps.
5. Rewrite the plan with the gaps fixed. This is genuinely the core skill of an IR lead.`,
    },
    {
      id: 2,
      slug: "02-playbooks-detection-triage",
      title: "Playbooks & Confirmed Incident Triage",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Writing and running playbooks, plus the triage ritual when a real incident is confirmed.",
      content: `# Playbooks & Confirmed Incident Triage

## What a Playbook Is

A **decision tree with steps and owners**, codified into repeatable runbook. The SOC goal: the *first* responder doesn't improvise the *first* time.

Anatomy:

\`\`\`yaml
name: Ransomware - Initial Response
triggers: [edr "ransomware" alert, files .locked, fake ransom note]
steps:
  - id: 1
    action: Confirm scope - isolate host from network (document IP)
    owner: Tier1
  - id: 2
    action: Preserve: memory capture + disk snapshot before reboot
    owner: DFIR
  - id: 3
    action: Notify IR lead + business owner (template in annex)
    owner: Tier1
  - id: 4
    action: Block C2 (if identified) at firewall
    owner: Security Eng
  - id: 5
    action: Begin eradication after IR lead go-signal
    owner: IR
\`\`\`

## Confirmed Incident Triage (< the golden hour)

When an alert becomes a case:

1. **Freeze concerns** — take the alert seriously; don't let one "maybe nothing" derail
2. **Initial scope message** — sources, assets, earliest timestamp you can see
3. **Evidence grab NOW** — before remediation kills the trail
4. **Isolation without frying evidence** — cut network, DON'T reboot/change first
5. **Containment vs. evidence: the eternal tension** — resolved by "do the safe action, capture first"

## The Triage Room Technique

For real incidents: a **virtual incident room** (chat channel) with:
- The case timeline pinned to top
- Owners + decision-makers in the loop
- External comms channel for non-sec people

**Decision log**: every major call and its owner — recoverable rationales for law and next-day sanity.

## Playbooks in SOAR

Automation runs steps, not people:
- auto-normalize + enrich IPs/domains/hashes
- auto-isolate on firm detections
- case notes auto-created

> BUT: automation is only as good as the playbook design + the last logic review. An automation that "auto-suppresses" the actual ransomware is worse than none.

## Confirmed Incident Discipline (the psychological part)

- One **single incident commander** — no committee
- **Deliberate pace, urgent communication** — feel the urgency but act in order
- Security folk speak in "I believe / I can prove / I suspect" — never overclaim to panicky stakeholders
- Write as you go; memory rots in a firefight

> **The meta-skill of IR is decision-making under uncertainty with partial information.** Playbooks raise the floor; judgment raises the ceiling.
`,
      defaultCode: `// Tiny SOAR-style triage: enrich and score an IOC
function scoreIoc(ioc, enrich) {
  let s = 0;
  if (enrich.newDomain) s += 30;         // suspicious
  if (enrich.malwareHash) s += 50;
  if (enrich.inThreatIntel) s += 60;     // known-bad
  if (enrich.victimCritical) s += 40;
  return s >= 100 ? "ISOLATE + T2" : s >= 50 ? "high-priority triage" : "monitor";
}
console.log(scoreIoc("evil.com", { newDomain: true, malwareHash: true, victimCritical: true }));`,
  solution: `Scores IOCs by enrichment context — automation's contribution to triage is context, then humans decide.`,
  hint: "Automation enriches and suggests; a human owns the verdict.",
  challenge: `**Home Lab — Write + Ru2 a Ransomware Playbook:**
1. Write your ransomware playbook (more detailed than in lesson 1 — include exact commands to isolate, things NOT to do like reboot/pay).
2. Simulate it: spin a VM with a fake "ransomware" (a text file with .locked + fake note, NOT real malware).
3. Run your playbook "for real" against it: capture memory (M14 skills), snapshot, block, restore.
4. Time yourself — note every place you had to think instead of execute.
5. Write 3 improvements to your playbook from the simulation.`,
    },
    {
      id: 3,
      slug: "03-containment-recovery",
      title: "Containment Strategies & Recovery",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Cut, isolate, segment, kill-switch: containment techniques, eradication, and recovery with monitoring.",
      content: `# Containment Strategies & Recovery

## Containment Levels (Pick by Situation)

| Technique | When | Consequence |
|-----------|------|-------------|
| **Isolate host** (unplug / V-LAN cut) | single host, low spread | host offline; last-resort data risk |
| **Block C2 at firewall/EDR** | attacker is beaconing out | may tip off attacker |
| **Account lockout/reset** | attacker using stolen creds | disrupts user too (coordinate) |
| **Segment / micro-segment** | broad spread, don't cut everything | keeps business running |
| **Kill switch** (DNS sinkhole, trademark alert) | influential malware | attacker changes infra |

**The ranking question:** what's the *fastest brake* that *keeps the important systems alive* and *protects evidence most*?

## The "Don't Reboot First" Rule

If you think it's an incident:
- Collect **memory** and **evidence** BEFORE power actions (reboot wipes memory!)
- Only then isolate / power off if indicated
- Unless it's spreading **right now** — then containment beats forensics, and you document that call.

## Eradication: Complete or Done

Incomplete eradication = the #1 cause of re-compromise:

1. Find ALL the footholds (not just the first one): persistence, backup accounts, sockets
2. Reset credentials EVERYWHERE (all accounts touched by the attacker's path + services)
3. Patch the ROOT CAUSE vuln
4. Verify: no new beaconing, no unknown users, no open holes

## Recovery: The Re-Entry Watch

The classic horror: restored from backup, and 3 weeks later the same attacker is back — because *the backup itself* had a dormant backdoor.

Hard rules:
- **Restore points cleaned before the infection window** (find first-sign from logs)
- **Validate restored state** (AV scan, tripwire file check)
- **Monitor restored systems with extra vigilance** for a defined period
- **Gradual reconnection** — don't slam everything back on the unfiltered network at once

## The Business Conversation

IR recovery is a *business continuity* problem, not just technical:

- What can wait vs what must run now
- Managed downtime beats unplanned outage
- Executive communication: 1-page status (facts, systems, status, next)
- Legal/PR trigger points pre-defined

> **The recovery metric:** not "services are back" but "we are back *and* we know the attacker isn't." Re-entry is the silent failure.
`,
      defaultCode: `#!/bin/bash
# Lab demonstration: isolate a host (as root) - then restore
# (this is the skill of the playbook, run on a REVERTABLE VM)
HOST=192.168.1.50
iptables -A FORWARD -s $HOST -j REJECT     # cut outbound/inbound
iptables -L FORWARD -n | head -5
echo "host isolated; document this change"
# restore:
# iptables -D FORWARD -s $HOST -j REJECT`,
  solution: `Cutting a host via firewall is instant containment without touching data or memory. Reverting undoes it cleanly.`,
  hint: "Contain at the network edge, not the keyboard — evidence stays intact.",
  challenge: `**Home Lab — Containment Drill:**
1. Set up: victim VM, attacker VM, and a 'gateway' host where you run firewall rules.
2. In your operations, traffic victim→attacker flows via the gateway.
3. Practice: (a) cut the victim entirely, (b) cut only suspicious ports (DNS, specific C2 IP), (c) sinkhole a DNS name.
4. Document in your playbook which works fastest for your setup.
5. Recover-by-restore: take an image backup of victim, restore it, verify files unchanged (hash).`,
    },
    {
      id: 4,
      slug: "04-lessons-learned-root-cause",
      title: "Lessons Learned & Root Cause Analysis",
      level: "advanced",
      tag: "lab",
      duration: "40 min",
      description:
        "The post-incident review: 5 Whys, root cause, metrics, and turning each incident into a permanent improvement.",
      content: `# Lessons Learned & Root Cause Analysis

## Why "Lessons Learned" Is the Most Important Phase

Every incident is expensive. The only thing that makes it worth anything is **the system getting stronger**. Skip this phase and you've paid the price for nothing.

## The Retro Format

Post-Incident Review (PIR), run when the dust settles:

1. **Timeline** — what happened, when, who (facts only)
2. **What went well** — name the wins, reinforce them
3. **What went wrong** — detect gaps, slow calls, missing data
4. **Root cause analysis** — why did it happen *fundamentally*
5. **Action items** — owned, dated, tracked (SWIMLanes: Specific, With Owner, In time, Measurable)
6. **Metrics** — record MTTD, MTTR for every incident

## Root Cause: 5 Whys (Toolbox Classic)

Example — "attacker got in via RDP":
- Why? → RDP exposed to internet
- Why? → firewall rule moved 'temporarily'
- Why? → no change-management gating for firewall
- Why? → process exists but no enforcement muscle
- Why? → leadership didn't see firewall changes as risk

Management fixes cost more than technical ones — and they're the ones that stick.

## The 5 Whys Pitfalls

- **Don't stop at "human error"** — it's usually the last expression of a system problem ("user clicked link" → why was that click not blocked? → why no simulated-phish training? ...)
- **Blame-free zone** — people stop reporting incidents if they fear punishment (M09's 'reward for reporting')
- **Beware gut-checks** — root cause might be lower than the loudest complaint

## Turning Findings Into Rules

Every PIR should yield DETECTION improvements:
- New Sigma rule for the technique used
- New log source enabled (the reason it was missed was *no telemetry*)
- New playbook path for the scenario

**Track "detection coverage gaps" found in incidents** — that's your roadmap to better defense:

\`\`\`markdown
| Incident | Technique | What we missed | Rule now |
|----------|-----------|----------------|----------|
| Phish | Delivery | user clicked | add DMARC-reject |
| Ransom | Defense evasion | no child-process rule | add Sigma |
| Exfil | Exfiltration | long-duration DNS | add beacon detector |
\`\`\`

## Metrics the Org Actually Cares About

- MTTD / MTTR (down or flat)
- Escapements (incidents that should have been caught)
- Recurring incidents (same root cause twice = red flag for the program)
- % of PIR actions completed on time — the honesty meter

> **Final message:** incidents are inevitable; repeat incidents are not. The gap between them is filled by the lessons-learned discipline you build today.
`,
      defaultCode: `// Root-cause tracker: every PIR yields actions with owners & due dates
const actions = [
  { item: "enable AD 4624 source-IP logging", owner: "infra", due: "2026-10-01", done: false },
  { item: "add Sigma rule for lsass dump", owner: "detection", due: "2026-10-05", done: false },
];
const overdue = actions.filter(a => new Date() > new Date(a.due) && !a.done);
console.log(overdue.length ? "OVERDUE: " + overdue.map(a => a.item).join("; ") : "all on track");`,
  solution: `Tracks PIR action completion — the honest metric that closes the loop on lessons learned.`,
  hint: "An action without an owner and date was never an action.",
  challenge: `**Home Lab — Run a Retro on Your Lab Incident:**
1. Reproduce a small 'incident' (e.g. open internet SSH got brute-forced in your lab logs).
2. Run the 5 Whys until you reach a systemic cause.
3. Write 5 concrete actions you'll take this weekend (owned + dated).
4. Write 3 metrics for YOUR homelab: MTTD-ish, recurring, coverage gap.
5. Build a "detection coverage" table with 5 techniques and mark which you can detect — this becomes your improvement roadmap.`,
    },
  ],
};