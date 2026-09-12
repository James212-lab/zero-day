import type { Module } from "../curriculum";

export const module14: Module = {
  id: "module-14",
  slug: "14-forensics-dfir",
  title: "Digital Forensics & DFIR",
  description:
    "Memory forensics, disk imaging, artifact forensics, timeline analysis — turning a dead box and a memory dump into the story of the attack.",
  language: "Forensics",
  lessons: [
    {
      id: 1,
      slug: "01-forensics-principles",
      title: "Forensics Principles & Imaging",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Order of volatility, evidence integrity, write-blocking, and capturing an image that holds up in court.",
      content: `# Forensics Principles & Imaging

## The Golden Rules

1. **Preserve the evidence** — work on COPIES, never the original
2. **Document everything** — chain of custody, timestamps, commands
3. **Least invasive first** — collect volatile data before it dies
4. **Hash everything** — SHA-256 the image; prove it didn't change

\`\`\`bash
sha256sum evidence.img      # record; recheck later
dd if=/dev/sda of=evidence.img bs=4M status=progress # image a disk
\`\`\`

## Order of Volatility (Collect FAST Things First)

Memory dies fastest — collect in this order:

\`\`\`
1. RAM (memory dump)          <-- THE most perishable
2. Network connections/state  <-- connection table
3. Running processes
4. Temporary files / cache
5. Disk (persistent)
\`\`\`

**Why it matters:** pulling the plug loses RAM forever. The whole attacker session (processes, passwords, crypto keys in memory) is sitting there — until you reboot.

## Write-Blocking

You must never write to evidence storage while imaging:

- Hardware write-blocker, OR
- Boot examiner system, image source read-only, OR
- \`dd\` with \`conv=noerror,sync\` reading from a source you've mounted read-only

**Without write-blocking, the "evidence" can be challenged:** "your own tools modified the disk."

## Imaging Tools That Matter

- \`dd\` / \`ddrescue\` — raw images (the gold standard)
- \`guymager\`, \`FTK Imager\`, \`Autopsy\` — GUI-friendly
- \`Magnet RAM Capture\`, \`dumpit\` (Win), \`lime\` (Linux) — memory capture

## The Analyst's Mindset

Forensics = "tell the story with proof":
- Evidence without timestamps = weak evidence
- No chain of custody = evidence that can't be presented
- No hashes = can't prove integrity

> **DFIR in 2026:** attackers LIVE in memory (fileless attacks, LOLBins - Living Off the Land Binaries). **Memory forensics is now the default, not the bonus.** Masters of it run circles around the disk-only analysts.
`,
      defaultCode: `#!/bin/bash
# Capture memory on a Linux LAB machine (kernel-level - run in a REVERTABLE VM)
echo "capturing RAM to /evidence/mem.img (lab only!)"
lime-forensics || { echo "alternative: use a live memory tool"; }
ls -la mem.img
echo "compute the hash you will record in your chain of custody:"
sha256sum mem.img`,
  solution: `Memory capture must happen BEFORE any reboot — the hacker's session lives only in RAM.`,
  hint: "Reboot = lose RAM = lose the attacker's trail. Capture first.",
  challenge: `**Home Lab — Image a Drive the Analyst Way:**
1. Create a small virtual disk (100MB) with some files on it in your lab.
2. Image it with dd to a file; sha256sum BOTH the source (live) and your image — note they match.
3. Modify ONE byte on a copy; hash again — prove to yourself that hashing catches tampering.
4. Mount the image read-only and recover a deleted file (extundelete / testdisk) if you can.
5. Write the 'chain of custody' note: who, when, what, hash, how stored.`,
    },
    {
      id: 2,
      slug: "02-memory-forensics",
      title: "Memory Forensics with Volatility",
      level: "advanced",
      tag: "lab",
      duration: "60 min",
      description:
        "Volatility 3, process and network analysis from a RAM dump, and finding the fileless attacker hidden in memory.",
      content: `# Memory Forensics with Volatility

## Why Memory Knows Everything

RAM contains the live truth:
- Running processes (including "fileless" malware that never touched disk)
- Loaded modules / DLLs
- Open network connections
- Command-line arguments (the attacker's actual commands)
- Crypto keys / passwords cached by tools

## Volatility 3 Quick Start

\`\`\`bash
# vol3 is plugin-based; no profile needed
vol3 -f mem.img windows.pslist.PsList
vol3 -f mem.img windows.psscan.PsScan          # deeper scan of process objects
vol3 -f mem.img windows.cmdline.CmdLine        # the attacker's command lines!
vol3 -f mem.img windows.netstat.NetStat        # connections
vol3 -f mem.img windows.malfind.Malfind        # injected code
vol3 -f mem.img windows.modscan.ModScan        # hidden modules
\`\`\`

## The "Process Tree" Read

Print the tree (pslist): browsers under word.exe? An "unusual parent-child pair" is the classic tell.

- \`winword.exe → powershell.exe\` = macro infection!
- \`svchost.exe → whoami /net user\` = someone poking inside
- \`rundll32.exe\` with a random .dll = suspicious

\`\`\`bash
vol3 -f mem.img windows.pstree.PsTree
\`\`\`

## cmdline: The Anciest Jewel

The command lines in memory tell the story OUTRIGHT:

\`\`\`text
"powershell -enc DQBjAGwAYQBzAHMA..."   <- base64 payload
"reg add HKLM\\\\...\\\\Run /v updater"
\`\`\`

Decode that base64 and you've pretty much solved it.

## netstat: Contact the C2

\`\`\`bash
vol3 -f mem.img windows.netstat.NetStat | grep ESTABLISH
# outbound connection to 185.x.x.x on 443 from powershell.exe = C2 hopper
\`\`\`

## malfind: The Hidden Injection

Memory-only malware injects into legit processes. \`Malfind\` flags regions with executable permissions + suspicious content (Read/Write/Execute = rwx).

\`\`\`bash
vol3 -f mem.img windows.malfind.Malfind
\`\`\`

Then dump the suspicious region:

\`\`\`bash
vol3 -f mem.img windows.dumpfiles.DumpFiles -p <pid>
\`\`\`

## From Dump to Verdict

1. Extract the injected blob
2. Scrape strings / hash it
3. Look it up (VT) or disassemble — now you have the "what".

> **The DFIR arrow:** raw memory → pslist/cmdline → malfunction → blob → identify. That's the whole day, done right.
`,
      defaultCode: `# Volatility 3 basics on a memory dump (lab MITRE sample)
vol3 -f mem.img windows.pstree.PsTree --print  # tree
vol3 -f mem.img windows.cmdline.CmdLine        # see attacker commands
vol3 -f mem.img windows.malfind.Malfind        # injected regions
vol3 -f mem.img windows.netstat.NetStat        # C2 connections
# dump the suspicious process's memory:
vol3 -f mem.img windows.dumpfiles.DumpFiles -p <PID> --virtaddr <addr>`,
  solution: `The standard DFIR flow: see the tree, read the commands, find the injection, reach the C2.`,
  hint: "pslist/pstree first — a bizarre parent-child tells you where to look.",
  challenge: `**Home Lab — Solve a Memory Challenge:**
1. Download a practice memory image (Volatility sample dumps, or malware-traffic-analysis dumps with the VM image — safe read-only analysis).
2. Run pstree — which process looks wrong?
3. Run cmdline — decode the base64 you find. That's your 'attacker intent'.
4. Run netstat + malfind — find the C2 address and the injected code.
5. Write your 1-page report: process, commands, C2, malicious-bear-neck 'suspicious activity'.`,
    },
    {
      id: 3,
      slug: "03-windows-artifacts",
      title: "Windows & Linux Artifact Forensics",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "Prefetch, Registry, Event Logs, AmCache, shellbags, bash history — the artifacts that fingerprint what the attacker did.",
      content: `# Windows & Linux Artifact Forensics

## The "Artifact Sandwich" Mindset

Volatile = lost at reboot; but PERSISTENT artifacts survive FOREVER and tell you a LOT even without memory:

## Windows Artifacts Cheat-Sheet

| Artifact | Path / Source | What It Proves |
|----------|---------------|----------------|
| **Prefetch** | \\\\Windows\\\\Prefetch\\*.pf | programs actually RUN (last executed times) |
| **Event Logs** | Security/System/Application | logons (4624), failures, service installs |
| **Registry** | NTUSER.DAT, SAM, SYSTEM | autostart (Run keys!), recent docs, MRU, uninstall list |
| **AmCache** | \\\\Windows\\\\AppCompat | executable install/execution history |
| **Shellbags** | Registry | folders the user opened (the 'visited folders') |
| **LNK files** | recent items | shortcuts opened |
| **Scheduled Tasks** | \\\\Windows\\\\Tasks | persistence + timing |
| **BITS/jobs** | BITS queue | unknown-file downloads |
| **$MFT / $J** | NTFS | file creation/deletion/residency |

## Reading the Autostart (Persistence Hunt)

\`\`\`reg
HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
HKLM\\...\\Services        # service persistence
\`\`\`

An entry pointing at \\\\Users\\Public\\update.exe = persistence found.

## Linux Artifacts

| Artifact | Location | Value |
|----------|----------|-------|
| **bash_history** | ~/.bash_history | commands the user ran |
| **auth.log/syslog** | /var/log | logons, su/sudo, cron |
| **cron** | /etc/cron*, spool | persistence |
| **last/logins** | /var/log/wtmp | logon history |
| **.bashrc/.profile** | home | sneaky auto-start |
| **/tmp** | ... | dropped tools |

\`\`\`bash
grep -E "sudo|su " ~/.bash_history
last -x
find /etc/cron* -type f -mtime -30
\`\`\`

## The Wall of Rebuilt Facts

Artifacts let you answer: **"What exactly was done, by whom, on this box?"** — without memory.

- Prefetch says "powershell ran at 03:14"
- Event log says "logon user 'bob', source IP 10.0.0.9, 03:13"
- Run key says "and it comes back at boot"

Together = the timeline (next lesson).

## Tooling

- **Autopsy / Sleuth Kit** — disk + artifact analysis GUI
- **Log2timeline / plaso** — build super-timelines (everything, sorted)
- **KAPE** (toolkit) — collect artifacts fast at scale
- **PowerShell/reg.exe** — quick triage on a live Windows box

> **The analyst's question:** every file has a story. Artifacts are the breadcrumbs arranged by the OS itself. Know where they live and you can always rebuild the story.
`,
      defaultCode: `# Windows evidence triage (run AS ADMIN on a TEST VM)
wevtutil qe Security /q:"*[System[(EventID=4624)]]" /f:text /rd:true /c:20   # last successful logons
reg query "HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Run"
dir C:\\Windows\\Prefetch\\*.pf
wevtutil qe Microsoft-Windows-TaskScheduler/Operational /c:10   # scheduled tasks
# (all of this = evidence to collect BEFORE any destructive action)`,
  solution: `Pulls the classic persistence+activity artifacts quickly: logons, autoruns, prefetch, tasks.`,
  hint: "36497... keep artifacts alive by NOT deleting the OS first — collect, then act.",
  challenge: `**Home Lab — Artifact Trail Investigation:**
1. On a test Windows VM: open files, run a program, visit folders, add a fake Run key.
2. From a 'forensics' stance, find: prefetch for the program, shellbags for the folders, the Run key you added, recent LNKs.
3. On Linux: run some commands, edit .bashrc, create a cron entry; then find all three in artifacts (auth.log, bash_history, cron).
4. Build a mini timeline: "who did what when" from your artifacts.
5. Write the '5-minute triage' artifact list for Windows and for Linux — the sheet you'd hand a new teammate.`,
    },
    {
      id: 4,
      slug: "04-timeline-analysis-reporting",
      title: "Timeline Analysis & Forensic Reporting",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Assembling artifacts into an attack timeline and writing a forensic report that explains the incident to anyone.",
      content: `# Timeline Analysis & Forensic Reporting

## Why Timelines Are the Heart of DFIR

A conclusion without a timeline is a gut-feeling. The timeline IS the story: event → effect, minute by minute.

## Building a Super-Timeline

Merge data from many sources into one time-sorted stream:

\`\`\`bash
# plaso/Log2Timeline — the standard
log2timeline.py case.plaso /evidence/image.dd
psort.py -o timeline case.plaso > timeline.csv
# now: every event from prefetch, registry, logs — sorted by time
\`\`\`

## The "Golden Hour" Analytical Window

Focus on the moments around the incident:

\`\`\`text
03:12:01 Failed password for root from 10.0.0.9
03:12:05 4624 An account was successfully logged on  (bob, 10.0.0.9)
03:12:09 SAMService installed service 'update' (HKLM\\Run)
03:12:14 powershell.exe created C:\\Users\\Public\\p.ps1
03:12:20 Outbound HTTPS connection to 185.45.x.x:443 from powershell.exe
\`\`\`

Four lines = full narrative. That's the payoff of all the artifact work.

## Rabbit Holes & The Analyst's Map

- **Timeline gaps** = missing log coverage (that's a finding itself!)
- **Clock skew** — VM/offline hosts have wrong times; NORMALIZE before judging
- **Red herrings** — the attacker deletes logs; the absence is evidence too
- Use "around the sighting" (10 min before/after) to contextualize events

## The Forensic Report (The Deliverable)

A report the C-Suite, a lawyer, AND a technician can all use:

\`\`\`text
1. EXECUTIVE SUMMARY (1 paragraph: what happened, impact, current state)
2. SCOPE & METHOD (what was examined, how, tools+hashes)
3. TIMELINE (the story in table format)
4. FINDINGS per evidence item (artifact → meaning → confidence)
5. CONCLUSION (verdict: compromised / not, at what confidence)
6. RECOMMENDATIONS (hardening, detection, staffing)
7. APPENDIX (hashes, tool versions, chain of custody)
\`\`\`

## Confidence Language (Forensics Honesty)

- **Confirmed** — artifact directly proves it
- **Suspected** — evidence points, but ambiguity
- **Unconfirmed** — the story needs data we couldn't get

> Forensic integrity: if you don't know, you don't guess. A report that overclaims is how the case (and your reputation) dies.
`,
      defaultCode: `#!/bin/bash
# Build a quick timeline from auth logs (education lab)
awk '{print $1, $2, $3, ":", $5, $6, $7}' /var/log/auth.log | sort > my-timeline.txt
head -30 my-timeline.txt
# cross-check with your own command history:
echo "== .bash_history =="
tail -25 ~/.bash_history`,
  solution: `Sorts auth events into a timeline and cross-references commands — a mini timeline built from real artifacts.`,
  hint: "Timeline + artifact + context = the report.",
  challenge: `**Home Lab — Full Mini Investigation:**
1. Manufacture an 'incident' on a test VM: inside a sandbox, do a series of actions (download something, create a user, connect out, edit a config) documented with times.
2. Collect evidence: auth.log, bash_history, cron, any new files created.
3. Build the timeline (super-timeline if you have plaso).
4. Write the 6-section forensic report on your own lab incident.
5. Swap conclusions: try to detect the suspicious 'incident' from ONLY the report — was it conclusive? Iterate until yes.`,
    },
  ],
};