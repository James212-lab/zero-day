import type { Module } from "../curriculum";

export const module12: Module = {
  id: "module-12",
  slug: "12-siem-soc",
  title: "SIEM, SOC & Detection Engineering",
  description:
    "The Security Operations Center: SIEM correlation, detection rules, alert triage, and the daily life of a SOC analyst.",
  language: "Blue Team",
  lessons: [
    {
      id: 1,
      slug: "01-what-is-a-soc",
      title: "The SOC & Security Operations",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Layers of a SOC, tiers of analysts, and how detection fits into the security machine.",
      content: `# The SOC & Security Operations

## What a SOC Does

A **Security Operations Center (SOC)** monitors, detects, investigates, and responds to cyber threats around the clock. It's the 911 dispatch + police + detective of the organization's security posture.

Core functions:
1. **Monitor** — watch telemetry from everywhere (endpoints, network, cloud, identity)
2. **Detect** — find the suspicious among the noisy
3. **Triage** — separate real threats from false alarms
4. **Investigate** — dig until there's a verdict
5. **Respond** — contain, eradicate, restore (with IR, module 13)
6. **Report & improve** — lessons, rules, signatures

## The SOC Stack

| Layer | Examples |
|-------|----------|
| **SIEM** | Splunk, Elastic, Sentinel, Qradar — the log brain |
| **EDR** | CrowdStrike, Defender, SentinelOne — endpoint telemetry + response |
| **NDR/IDS/IPS** | Suricata, Zeek — network detections |
| **SOAR** | playbook automation for response |
| **Threat Intel** | feeds, TI platforms — context for what's hitting you |

## SOC Tiers (the Career Ladder)

- **Tier 1 — Triage/Alert** — first look at alerts, triage, escalate; the "gate"
- **Tier 2 — Analysts** — deep investigation, containment, tuning
- **Tier 3 — Hunt/Experts** — advanced hunting, malware deep-dive, rule writing
- **SOC Lead** — shift management, metrics, process
- **Detection Engineer** — builds the rules and pipelines (the craft behind it)

## The Alarm Wall Problem

A SOC sees **thousands of alerts a day**. The real skill isn't answering calls — it's **reducing noise**:

- Tuning / false-positive reduction
- **Prioritization** (risk-based, not volume-based)
- Good **detection engineering** (module 03 of this track)

> **Blue-team lens:** If an alert isn't actionable, it's noise. A mature SOC measures *detection coverage* and *time-to-detect*, not alert counts.

## SOC Metrics (What a SOC Is Held To)

- **MTTD** — Mean Time to Detect
- **MTTR** — Mean Time to Respond/Resolve
- Detection coverage % (of the ATT&CK map, e.g.)
- False positive rate
- Escalation time

> The industry's shame is A09 of OWASP and the "invisibility" of breaches for months. SOCs exist to collapse MTTD from **months to minutes**.
`,
      defaultCode: `// Simulate a tier-1 triage decision for an alert
function triage(alert) {
  const critical = alert.assetCritical && (alert.indicatorHigh || alert.atomic);
  const fp = alert.falsePositivePattern;
  if (fp) return { action: "SUPPRESS", note: "known benign pattern" };
  if (critical) return { action: "ESCALATE_T2", note: "high-value asset + high confidence" };
  return { action: "TRIAGE_QUEUE", note: "investigate within SLA" };
}
console.log(triage({ assetCritical: true, indicatorHigh: true }));
console.log(triage({ falsePositivePattern: true }));`,
  solution: `Risk-based triage: suppress known FPs, escalate anything hitting crown jewels. This is tier-1 logic in code.`,
  hint: "Combine asset criticality + indicator confidence, not just one.",
  challenge: `**Home Lab — Build Your Own Mini-SOC:**
1. Install the **ELK stack** (or use free tier) and ingest logs from your lab machines (syslog from Ubuntu, Windows Event Log from a Windows VM).
2. Write 1 dashboard: authentication failures over time, top source IPs.
3. Create 1 alert/rule: >5 failed logons from one source in 5 minutes.
4. Manufacture a "login storm" (run a loop of wrong passwords in your VM) and watch it fire.
5. Write the "SLA now" criteria for a tier-1 analyst handling your alert: what decides escalate vs tune?`,
    },
    {
      id: 2,
      slug: "02-siem-basics",
      title: "SIEM Fundamentals & Searching Logs",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "What a SIEM is, the pipeline from log to alert, and hands-on searching with the ELK/Elastic stack (or Splunk free).",
      content: `# SIEM Fundamentals & Searching Logs

## The SIEM Pipeline

\`\`\`
Event → Agent (shipper) → Collector/Buffer → Index/Store → Search → Dashboards/Alerts
\`\`\`

Every login, process start, DNS query, and file change that ends up searchable went through this pipeline. The SIEM is the **memory of the network** — and memory is what you analyze when something goes wrong.

## The Log-Types Agenda

What a SOC lives on:

| Source | Class of events | Example threats visible |
|--------|-----------------|-------------------------|
| **Authentication** | Logon/Logoff | brute force, impossible travel |
| **Endpoint (EDR)** | Process, file, network | malware, suspicious child processes |
| **Network** | Firewall/DNS/Proxy | C2 beacons, data exfil |
| **Cloud/loud** | IAM, storage, API | privilege changes, data download spikes |
| **Web/DB** | HTTP, SQL | SQLi, API abuse |

## Searching: The Language of a SIEM

**Elastic/ELK (KQL):**

\`\`\`kql
event.category:authentication AND event.outcome:success
failures within window: event.action:"logon failure" AND user.name:"svc-*"
\`\`\`

**Splunk (SPL):**

\`\`\`spl
index=windows EventCode=4625 | stats count by src_ip | sort -count
\`\`\`

**Common queries you'll write immediately:**

- \`4625\` (failed logon) grouped by source
- new account creation (\`4720\`)
- unusual PowerShell execution (\`Image: powershell.exe\` from odd parent)
- outbound connections from a server to the internet

## The "Fifth Question" Discipline

Every investigation answers:
1. **Who** — accounts, hosts
2. **What** — actions, tools
3. **When** — timestamps, windows
4. **Where** — sources, destinations
5. **Why does this matter?** — asset value, blast radius

## Lab Fast-Start (Elastic/OpenSearch, free)

\`\`\`bash
# easiest: run the official Elastic docker-compose (or use cloud free tier)
# then configure a Filebeat agent on one Linux VM:
#   filebeat modules enable system
#   filebeat setup; filebeat -e
# now search "system.auth" events in Discover
\`\`\`

> **The skill is query fluency.** The more log types you can instantly write sightings to, the faster your MTTD shrinks. Practice 30 minutes/day of query writing on your own lab.

## Normalization & the ECS

Different vendors name the same event differently ("user", "account", "winlog.user"). The **Elastic Common Schema (ECS)** or SIEM's own normalizer translate them into one vocabulary — so an analyst searches one schema, not fifty.
`,
      defaultCode: `#!/bin/bash
# Enable system module on a Linux lab box (Education lab only)
# Install filebeat first: see your distro package manager
filebeat modules enable system
filebeat setup --index-management
filebeat -e &
sleep 60
# verify: floor source_username from /var/log/auth.log is now searchable`,
  solution: `Boots Filebeat → ingests auth logs into the SIEM → makes "failed logon by user" searchable. The heart of log forwarding.`,
  hint: "Check the filebeat output health before searching; a misconfigured shipper means empty searches.",
  challenge: `**Home Lab — Search Your Own Authentication Logs:**
1. Bring up your ELK lab. Point Filebeat at /var/log/auth.log (Linux) or Winlogbeat at Security events (Windows VM).
2. Manufacture: 10 failed logons to root, 1 successful SSH from your browser VM, a new local user creation.
3. Write queries that surface all three (KQL or SPL).
4. Build a "failed logon by source host & user" visualization - the SOC classic.
5. Document: which events were missing, and why would an attacker's actions still be invisible?`,
    },
    {
      id: 3,
      slug: "03-correlation-detection-rules",
      title: "Correlation & Detection Engineering",
      level: "intermediate",
      tag: "lab",
      duration: "60 min",
      description:
        "How a SIEM turns single events into detections: correlation rules, Sigma, and writing alerts that don't drown the analyst.",
      content: `# Correlation & Detection Engineering

## From Logs to Detections

A **single event** is noise. A **correlation** is meaning:

- 4625 failed logons × 20 from one host in 10 min = possible brute force
- Logon success 5 min before bitsadmin.exe beacon = possible ransomware setup
- New admin + odd PowerShell + outbound exfil = respond now

## Correlation Rule Structure

\`\`\`yaml
- name: Impossible Travel Detection
  when: any
  of:
    - event.category == authentication
    - and logon from GEO A AND GEO B within 1 hour
  window: 1 hour
  severity: high
  actions: [notify-t2, case-open]
\`\`\`

Triggers are the **correlation** of *multiple conditions over time*, not single matches.

## The Sigma Format (Write Once, Run Anywhere)

Sigma is the open signature language for detection rules. One rule → export to Splunk, Elastic, Sentinel, etc.

\`\`\`yaml
title: PowerShell Download Cradles
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    Image|endswith: '\\powershell.exe'
    CommandLine|contains: ['FromBase64String', 'DownloadString']
  condition: selection

level: high
\`\`\`

**Sigma rules are how modern SOCs share detections quickly.** You'll read/write/export them.

## Detection Engineering Quality Bar

A GREAT rule:
- **High precision** (low FP) — careful selection
- **High recall** — actually catches the thing
- **Explains itself** — references the technique (ATT&CK ID)
- **Tested** — on real data and known samples
- **Not duplicating** — check for overlap with existing rules

## The "Known to Unknown" Game

- **Signature detection**: known IOCs (hashes, domains) — brittle, but trivial
- **Behavioral/technique detection**: what the ATTACKER DOES (ATT&CK technique) — survives signature changes
- **Hunting**: assume breach, look for odd-but-not-yet-flagged — you write hypothesis-based queries

> **The 2020s reality:** signature-only detection is dead. Behavior-first, TTP-based detection on top of strong telemetry is the craft.

## Alert Naming & the Analyst's Day

Good alert metadata saves the day:
- MITRE ATT&CK technique mapping
- Affected assets (does it hit a crown jewel?)
- Recommended playbook link
- Clear severity + a one-liner explanation

> A detection that requires reading the source code to understand is a badge of failure. Engineers write *and* maintain — the analyst's Monday morning is the acceptance test.
`,
      defaultCode: `#!/bin/bash
# Simple netflow-style correlation: detect SSH brute force from auth log
# Tail the log and count failures; alert on threshold (lab demo)
tail -F /var/log/auth.log | awk '
  /Failed password/ { src[$NF]++; }
  END { for (ip in src) if (src[ip] > 5) print "ALERT: brute force from", ip, src[ip], "failures"; }'
# (Run for a few minutes under the manufactured attack)`,
  solution: `Counts per-source failures and blows past a threshold — the simplest brute-force correlation you'll build by hand.`,
  hint: "Threshold-based correlation is the baseline; real SIEMs add windows and context.",
  challenge: `**Home Lab — Put Together a Detection Shelf:**
1. Get real-ish log data into your ELK lab (your own tail of auth.log is fine).
2. Write 2 Sigma rules: (a) "SSH brute force" (many failed), (b) "PowerShell download cradle" logsource windows.
3. Export one rule to your SIEM's native syntax and fire it during a lab attack.
4. Tune the false positives: try the attack, observe FPs from your own usage.
5. Document "detection coverage" for 3 high-value ATT&CK techniques you could detect — write a short detection-coverage table.`,
    },
    {
      id: 4,
      slug: "04-alert-triage-incident-handoff",
      title: "Alert Triage & Incident Handoff",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "From blinking light to confident verdict: triage workflows, evidence collection, and a clean escalation to IR.",
      content: `# Alert Triage & Incident Handoff

## The Triage Ladder: From Alert to Case

1. **Triage** (Tier 1) — "Is this real, known, or new?"
   - Check: asset crit, IOC match, unusual-for-this-victim?
2. **Verdicts:** benign / false positive / potentially suspicious
3. **Suspicious?** → escalate with context, not just the raw event
4. **Confirmed incident?** → IR (module 13)

## The Analyst's Checklist (Do It in Order)

\`\`\`
[ ] What's the asset (crown jewel? internet-facing? whose?)
[ ] What does the tech say (rule, ATT&CK technique, correlation?)
[ ] Gather evidence NOW (screenshots, logs, process lists) — sources go stale
[ ] Never "just look" — formulate a hypothesis to test
[ ] Check the obvious: known-malicious IOcs? false-positive pattern? expected business activity?
\`\`\`

**The red flag:** an alert that "feels off" but nothing is definitive — that's not "false alarm, moving on", that's "needs a second set of eyes and 2 more log queries."

## Evidence: Chain of Custody Basics

When you keep something for investigation/legal:
- Collect & label at collection time (who, when, where, how)
- Hash it (SHA-256) — the hash is the "fingerprint" that proves nothing changed
- Preserve original media read-only; work on a **copy**
- Document every transfer

For everyday triage: capture **time-stamped, context-rich** evidence (hostname, timestamp, rule ID, source logs, user).

## The Escalation Artifact

What Tier 2 IR folks WANT on handoff (not an alert dump):

1. **Summary** — what happened in 2-3 sentences
2. **Evidence** — the 3-4 critical logs/events, screenshots
3. **Context** — asset criticality, business function
4. **Hypothesis** — what you think it is, what you tested
5. **Recommended next steps** — what IR should run

> **Triage is a confidence game, not a certainty game.** Document uncertainty loud and clear — "could not rule out" beats silent dismissal.

## The Kill-Chain-Beacons, Part 2

From M08: the kill chain (delivery → exec → persistence → c2 → action). Triage answers "WHICH stage?":

- Only delivery? (phish landed, nothing executed) → fewer alarms
- C2 beaconing? → now it's a sprint, not a jog
- Actions on objective? → full IR, isolate the host

## Metrics That Matter for Triage

- First-response time (to first query)
- Time-to-verdict
- Escalation quality (was the handoff actually usable?)
- FP reduction over time (are you tuning rules?)

> **Bottom line:** an un-triaged alert might as well not exist. The analyst's judgment — deciding *when to robotically follow policy vs when to think* — is the SOC's real asset.
`,
      defaultCode: `// Minimal "escalation packet" builder
function escalation(alert, evidence, context, hypothesis, next) {
  return { severity: alert.severity, summary: alert.summary,
           evidence, context, hypothesis, next };
}
// Handoff should always be > just the raw alert:
const packet = escalation(
  { severity: "high", summary: "suspicious admin logon" },
  ["4624 admin@CORP\\svc-admin from new IP"],
  { asset: "AD domain controller", critical: true },
  "recon techniques align with RDP brute-force then pass-the-hash",
  ["reset creds", "isolate endpoint", "full AD audit"]
);
console.log(packet.evidence.length >= 1 &&
            packet.hypothesis.length > 0 ? "handoff quality OK" : "thin");`,
  solution: `Forces the essentials onto the handoff: context + hypothesis + next steps, not a raw event dump.`,
  hint: "The handoff paragraph is what T2 actually reads; make it count.",
  challenge: `**Home Lab — Triage Drill:**
1. Manufacture 4 "alerts" in your lab: (a) failed logons from your own VPN (benign), (b) new admin created (you did it), (c) powershell connecting to a suspicious IP (one malicious sample from M08's VM), (d) normal webserver 404 spike.
2. Run the triage checklist on each: write the verdict + one-line reason + 2 evidence points each.
3. For the 'suspicious' one, build the full escalation packet.
4. Have a second person (voice/text) critique your handoff: would they act on it?
5. Save these as your "triage portfolio" examples.`,
    },
  ],
};