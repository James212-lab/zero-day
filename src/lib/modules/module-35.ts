import type { Module } from "../curriculum";

export const module35: Module = {
  id: "module-35",
  slug: "35-edr-xdr",
  title: "Endpoint Detection & Response (EDR/XDR)",
  description:
    "Telemetry, behavioral analysis, hunting, response automation, and the detection-engineering craft of modern endpoint platforms.",
  language: "Detection",
  lessons: [
    {
      id: 1,
      slug: "01-edr-concepts",
      title: "EDR vs Antivirus: The Modern Endpoint",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "From signature AV to continuous telemetry-and-response — and what makes EDR/XDR the centerpiece of defense.",
      content: `
# EDR vs Antivirus: The Modern Endpoint

## Why signatures lost

AV hashes a file; evaders re-pack. EDR watches **what endpoints do continuously** and relates process/net/registry behavior in time — because behavior survives repacking.

## The EDR model

\`\`\`
[ Agent ]
   |  collects: process (create/kill), file (open/write), registry,
   |            network (connections/ports), DLL loads, scripts, wmi
   v
[ Cloud console ]  can correlate across endpoints (hunting, rules)

Alert pipeline:
  endpoint -> stream -> detection engines -> analyst(s) -> response action
\`\`\`

## Capabilities that matter

- **Process genealogy** (parent→child): 'Word spawned PowerShell' = lead
- **Behavioral rules**: powershell download cradle, LSASS read, wми spawning
- **Live response**: kill, quarantine, terminate process, take memory/image
- **Hunting UI**: search across events (my new file, evtx)
- **Rollback**: some EDRs offer 'restore point' after ransomware

## XDR = the expanded view

EDR + network, cloud, email, identity telemetry into one platform — detections span endpoints *and* the wire *and* the org's services.

## Trade-offs

- Cost, tuning burden, privacy (endpoint telemetry is sensitive)
- EDR is not a silver bullet: attacker TTPs still escape; analysts matter
- Alert flooding is the #1 EDR failure mode — tuning rules + baselines is the real job

## Detection-first posture

The EDR is only as good as the rules on it: process trees, LSASS protection, macro/script usage, anomalous admin usage, cred-dump signs, persistence writes.

> EDR shifts the battlefield from files to behavior. Your job as a future analyst/hunter/engineer is to make the behavior rules sharp, the baselines real, and the response fast.
`,
      defaultCode: `// visualize EDR telemetry as an event stream
const evts = [
  { t: 1, id: 1, parent: 'explorer', child: 'powershell', net: null },
  { t: 2, id: 2, parent: 'powershell', child: 'cmd', net: '1.2.3.4:443' },
  { t: 3, id: 3, parent: 'cmd', child: 'reg.exe', net: null }
];
// hunting idea: powershell->cmd->network = opens via rule 'lolbin-chain'
console.log('events:', evts.length, '-> correlate by parent/child over time');`,
      solution: `const evts = [
  { t: 1, id: 1, parent: 'explorer', child: 'powershell', net: null },
  { t: 2, id: 2, parent: 'powershell', child: 'cmd', net: '1.2.3.4:443' },
  { t: 3, id: 3, parent: 'cmd', child: 'reg.exe', net: null }
];
console.log('events:', evts.length, '-> correlate by parent/child over time');`,
      hint: "Behavior + genealogy + response = EDR. Signatures alone lost years ago.",
      challenge: `**Home Lab — Baseline Your Own Endpoint:**
1. If using Windows, enable some telemetry: Sysmon (config basic) live for a day.
2. List 3 'normal' process trees YOU generate (browser→updater, etc.).
3. Define 2 rules an attacker pattern would fire in YOUR baseline.
4. Write: what would overwhelm your alerts if you rolled EDR tomorrow?
5. Keep the baseline in lab notes for the hunting lesson.`,
    },
    {
      id: 2,
      slug: "02-telemetry-sources",
      title: "Telemetry Sources: OS Events, Sysmon, Endpoint Data",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Sysmon EventIDs, Windows event log families, Linux auditd — the raw streams EDR and SIEM are built on.",
      content: `
# Telemetry Sources: OS Events, Sysmon, Endpoint Data

## Windows event basics

**Security events (important IDs):**

| Event ID | What |
|----------|------|
| **4624/4625** | Logon / failed logon |
| **4672** | Admin logon (privileged) |
| **4688** | Process creation (needs audit) |
| **4769/4771** | Kerberos service-ticket / fail |
| **4720-4765** | Account management (new user, reset pw) |
| **7045** | Service installed |
| **1102/1104** | Log cleared / Windows log filled |

**Sysmon (system-level, via config):**

| Sysmon ID | What |
|-----------|------|
| **1** | ProcessCreation (full cmdline!) |
| **3** | NetworkConnection (full) |
| **6** | DriverLoad |
| **7/8/9** | ImageLoaded/CreateRemoteThread (injection flags) |
| **11/13** | FileCreate/RegistryValueSet |
| **23** | FileDelete |
| **25/26** | ProcessTampering/FileDeleteLogged |
\`\`\`
install:  sysmon.exe -accepteula -i config.xml
\`\`\`

## Linux telemetry

- **auditd**: rules on execve, file access, network (auid)
- **systemd journal**: service changes
- **bash history / auth.log**: login, sudo
- **ETW on Windows** implements many of the above via providers

## Correlation-ish thinking

Single events are noise; chains are signal:
- 4624(user, ip) then 4688 then 7045 then 4769 → 'possible lateral'
- No telemetry = no detection. Baseline everything, then alert on anomalies.

## The engineering reality

- Ship the fields you'll analyze: cmdline, parent PID, integrity, source IP, hash
- Time synchronization (NTP) everywhere — correlation depends on clock
- Centralize (SIEM) for the search; endpoint there for speed

> Telemetry isn't a feature — it's the foundation of the pramide of detection. If you can't describe the Tool layers (OS+sysmon+network), your detections are built on sand.
`,
      defaultCode: `# A minimal auditd setup (Linux lab)
sudo auditctl -a always,exit -F arch=b64 -S execve -k EXEC
# watch /etc/passwd
sudo auditctl -w /etc/passwd -p wa -k ETCPASS
# view
sudo ausearch -k EXEC -ts today | less`,
      solution: `sudo auditctl -a always,exit -F arch=b64 -S execve -k EXEC
sudo auditctl -w /etc/passwd -p wa -k ETCPASS
sudo ausearch -k EXEC -ts today | less`,
      hint: "Ship full cmdlines, keep clocks synced, centralize. Behavior chains, not single events.",
      challenge: `**Home Lab — Beef Up Telemetry:**
1. Install Sysmon with a standard config on your lab Windows VM.
2. Perform 3 'marker' actions (open a docx, run command, install a service).
3. Review Sysmon events for each (1, 3, 7045 analogies).
4. On Linux, enable auditd execve + /etc/passwd watch; trigger; ausearch.
5. Write a 'telemetry sources' cheat-sheet you'll reuse.`,
    },
    {
      id: 3,
      slug: "03-behavioral-detection",
      title: "Behavioral Detection & Alert Rules",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "The rule-writing craft: Sigma for EDR/SIEM, parent-child patterns, LOLBAS chains, and tuning away the false-positive flood.",
      content: `
# Behavioral Detection & Alert Rules

## What makes a behavior rule

A rule = a pattern over telemetry (process, network, registry) describing an attack *shape*, not a file hash.

## Sigma: the portable detection language

\`\`\`
title: Suspicious Office -> PowerShell Child Process
status: experimental
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith:
      - '\\winword.exe'
      - '\\excel.exe'
      - '\\outlook.exe'
    Image|endswith: '\\powershell.exe'
  filter:
    Image|startswith: 'C:\\Windows\\System32\\'
  condition: selection and not filter
fields:
  - ParentImage
  - Image
level: high
\`\`\`

**Toolchain**: Sigmahqs (search engine), sigma-cli converts to Splunk/ES/Elastic from the rule.

## Classic rule ideas (LOLBAS chains)

- Office → (word/excel/outlook) → powershell/cmd/mshta
- powershell → network (any) with -enc/-e argument
- regsvr32 with remote URL (scrobj abuse)
- LSASS read access (handle) from low-priv process
- msbuild/wscript with suspicious child or remote script

## Tuning: kill the noise, keep the signal

1. **Filter** known-safe: signed updaters, corporate inventory (baseline)
2. **Stack context**: only alert on 'spawned by office' combos as high-severity
3. **Time window** correlation (network + process within seconds)
4. Test a rule against 2 weeks of real data BEFORE enabling — measure FP rate
5. Set severity by damage potential, not alert volume

## The metacognition

Every rule encodes a hypothesis about an adversary's move. When it FPs, the hypothesis was too broad; tighten. When it misses, add a second path; correlate.

> A detection library's real value is proportional to its noise-to-signal ratio. Rule-writing is 30% security understanding, 70% data discipline.
`,
      defaultCode: `// the detection-selection mental model
const event = { parent: 'winword.exe', child: 'powershell.exe' };
const suspicious = event.parent.endsWith('winword.exe') &&
                   event.child === 'powershell.exe';
console.log('fires on office->ps1:', suspicious);
console.log('then filter signed/friended to cut FP');`,
      solution: `const event = { parent: 'winword.exe', child: 'powershell.exe' };
const suspicious = event.parent.endsWith('winword.exe') &&
                   event.child === 'powershell.exe';
console.log('fires on office->ps1:', suspicious);
console.log('then filter signed/friended to cut FP');`,
      hint: "Parent-child + argument + network references = durable behavior rules.",
      challenge: `**Home Lab — Write & Test a Sigma Rule:**
1. In your lab, generate: winword.exe → powershell.exe with -enc (create a dummy).
2. Write a Sigma rule for that chain; convert to your platform (Elastic/Splunk) via sigma-cli.
3. Run it against your actual test event — confirm it fires.
4. Generate a FALSE POSITIVE (legit office macro-less doc) — does it fire? tune filters.
5. Ship the final rule with status 'experimental'.`,
    },
    {
      id: 4,
      slug: "04-threat-hunting",
      title: "Threat Hunting: Hypothesis-Driven Analysis",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "The hunter's workflow: hypothesis → collect → analyze → document, with data-science tools like EQL, KQL, pandas and HARMLESS hunting datasets.",
      content: `
# Threat Hunting: Hypothesis-Driven Analysis

## What hunting is

Sitting back waiting for alerts is passive. Hunting = *actively* forming a hypothesis ('if an adversary used X, where would it appear?') and searching history for it.

## The method

\`\`\`
1. Hypothesis (based on a TTP or intel)
2. Build the search (telemetry + fields)
3. Analyze the hits (triage: real vs baseline)
4. Document (what did you learn? new detection?)
5. Repeat (make it a playbook/automated query)
\`\`\`

## Example hunts

- **'PowerShell download cradles in the last 90 days'**:
  process_creation with ParentImage powershell.exe and Image powershell.exe and Argument command-line containing 'DownloadString'
- **'LSASS unexpected handles'**: suspicion of credential theft — hunt handle-ops on lsass from odd PIDs
- **'New internal service connections 445/135'** — lateral movement fingerprint
- **'machine with no 4769 but many files changed'** — possible weird lateral antics

## Enrich your hunt with EQL/KQL (language examples)

\`\`\`eql
process where event.action == "ProcessCreate"
  and process.parent.name in ("winword.exe","excel.exe")
  and process.name in ("powershell.exe","cmd.exe")
  and process.command_line == "* -enc *"
\`\`\`

## Tools and data

- EDR hunting UI (open search), Splunk/SOAR, Elastic, Velociraptor
- Datasets: **EVTX-ATTACK-SAMPLES**, **MalwareBazaar**, clean baselines from your own lab
- **Velociraptor** (open): live hunt across fleet endpoints

## Honest triage

- Fewer strong hits > many weak leads
- Each hypothesis needs a 'kill' criterion (evidence it did NOT happen)
- Not finding things is also a finding (document coverage)

> Hunting is detective work with a hypothesis license. The hunt that finds nothing still sharpened your tools and your baseline.
`,
      defaultCode: `// a hypothesis object worth running
const hunts = [
  { hypothesis: 'lateral via new smb', query: 'smb session to unknown host', ttp: 'T1021.002' },
  { hypothesis: 'download cradle', query: 'ps1 with DownloadString', ttp: 'T1059.001' }
];
for (const h of hunts) {
  console.log('HUNT:', h.hypothesis, '-> rule', h.query, '[' + h.ttp + ']');
}`,
      solution: `const hunts = [
  { hypothesis: 'lateral via new smb', query: 'smb session to unknown host', ttp: 'T1021.002' },
  { hypothesis: 'download cradle', query: 'ps1 with DownloadString', ttp: 'T1059.001' }
];
for (const h of hunts) {
  console.log('HUNT:', h.hypothesis, '-> rule', h.query, '[' + h.ttp + ']');
}`,
      hint: "Hypothesis → search → triage → document. Empty results still documented.",
      challenge: `**Home Lab — 3 Hunts:**
1. In your own lab telemetry, run: office→script, lsass-handle, download-cradle searches over collected events.
2. For each: outcome (hits/triage), and whether a new rule is warranted.
3. Use at least one EQL/KQL-style query in a real tool (EDR demo or Velociraptor).
4. Write a 1-line 'hunt report' per hypothesis.
5. Save 1 query as your first reusable playbook.`,
    },
    {
      id: 5,
      slug: "05-automated-response-soar",
      title: "Automated Response & SOAR",
      level: "advanced",
      tag: "concept",
      duration: "40 min",
      description:
        "Playbooks, automation triggers, containment actions, and the human-vs-machine balance in modern incident triage.",
      content: `
# Automated Response & SOAR

## EDR response actions

Modern EDRs can act *on the endpoint*: terminate process, quarantine file, isolate host, rollback, run script. Combined with automation, containment can happen in seconds.

## SOAR (Security Orchestration, Automation, Response)

\`\`\`
Alert -> enrichment (lookup IP/domain/enrichment APIs)
       -> playbook (decision tree)
       -> action (contain via EDR / block via firewall / page analyst)
       -> case (create ticket, SLA, assign)
\`\`\`

- **Orchestration**: glue systems (EDR, SIEM, email, ticketing)
- **Automation**: run the boring steps
- **Response**: sanctioned actions on evidence

## Playbook examples

- **Phishing**: extract URLs/hashes → sandbox submit → block domain if malicious → tag user → awareness email
- **Impossible travel**: flag → MFA challenge → session kill → ticket
- **New admin creation**: verify with owner → if unauth → disable + notify DSO

## Guarding against automation horror stories

- **R/A risk**: automated isolation can knock prod; gate by severity + confidence
- **Bypass paths**: attacker knows a 'quarantine resets the machine' – don't let them weaponize the tool
- **Human bottleneck**: successful automation must page the *right* human eventually
- **Danger of false positives**: self-contained containment at scale is chaos; ring-fence tests

## The human-machine frontier

Automation works for deterministic, high-confidence, low-damage actions. Complex triage stays human. The growth path: 10% of SOC ops handled recursively, playbook for anomalies, then automated only the play-books.

> SOAR is a discipline, not a product. Automate the 80% that's boring and deterministic; keep the 20% judgment with a human who has the authority to act.
`,
      defaultCode: `// playbook decision gate
function triage(confidence, damage) {
  if (confidence >= 0.9 && damage < 3) return 'AUTO-contain';
  if (confidence >= 0.5) return 'PAGE-analyst';
  return 'LOW-priority-case';
}
console.log(triage(0.95, 1));  // auto
console.log(triage(0.6, 7));   // analyst page`,
      solution: `function triage(confidence, damage) {
  if (confidence >= 0.9 && damage < 3) return 'AUTO-contain';
  if (confidence >= 0.5) return 'PAGE-analyst';
  return 'LOW-priority-case';
}
console.log(triage(0.95, 1));
console.log(triage(0.6, 7));`,
      hint: "Automate deterministic, high-confidence, low-damage actions; escalate the rest to humans.",
      challenge: `**Home Lab — Playbook Design:**
1. Design a phishing playbook as a flow chart (steps, conditions, actions, handoffs).
2. Mark which steps are safe to automate and which need human judgment.
3. Add a 'false-positive breaker' — when does the playbook stop itself?
4. Consider blast radius: worst case if the automation misfires.
5. Write the 5 'rules of automation' your SOC would follow.`,
    },
  ],
};