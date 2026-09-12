import type { Module } from "../curriculum";

export const module08: Module = {
  id: "module-08",
  slug: "08-malware-analysis",
  title: "Malware: Types, Analysis & Defense",
  description:
    "Viruses, worms, trojans, ransomware, rootkits — what malware is, how it works, and how to safely analyze it in a lab.",
  language: "Malware",
  lessons: [
    {
      id: 1,
      slug: "01-malware-types",
      title: "Malware Types & Capabilities",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "The family tree of malicious code: viruses, worms, trojans, RATs, ransomware, and more.",
      content: `
# Malware Types & Capabilities

## The Malware Family Tree

| Type | How It Spreads/Holds | Key Trait |
|------|----------------------|-----------|
| Virus | Infects files/self-reproducing | Needs user action to replicate |
| Worm | Self-propagates over network | Spreads without user help |
| Trojan | Disguised as useful | Needs user to run it |
| RAT | Remote backdoor | Full remote control |
| Ransomware | Encrypts + demands payment | Business-destroying |
| Spyware/Adware | Harvests data/bombards ads | Stealth monetization |
| Rootkit | Hides itself deep | Evades detection (kernel/BIOS) |
| Bootkit | Infects boot chain | Survives reboot, pre-OS |
| Keylogger | Records keystrokes | Credential theft |
| Wiper | Destroys data | Sabotage (e.g., WhisperGate) |

## Classic Examples (Learn the Stories)

- **ILOVEYOU (2000)** — macro virus sent by email; ~$10B damages
- **Conficker (2008)** — worm exploiting unpatched SMB; millions infected
- **Stuxnet (2010)** — state-created worm targeting Iranian uranium centrifuges; sabotage
- **WannaCry (2017)** — ransomware + EternalBlue (leaked NSA exploit); global outage, NHS crippled
- **NotPetya (2017)** — disguised as ransomware, actually a wiper; ~$10B global damage
- **SolarWinds (2020)** — supply-chain backdoor (trojanized update)

## Malware Capabilities (What It Can Do)

- **Manipulation of files/data** — encrypt, delete, modify
- **Command & Control (C2)** — phone home for instructions
- **Spying** — record keys, screen, camera, mic
- **Lateral movement** — spread internally
- **Persistence** — reinstall across reboots (registry, cron, services)
- **Evasion** — anti-VM, anti-sandbox, code obfuscation (packers, polymorphism)

## The Payload Chain

Malware rarely acts alone:
1. **Delivery** — phishing, web, USB, exploit
2. **Execution** — macro, LNK, loader
3. **Persistence** — autostart
4. **C2** — beacon out
5. **Do the job** — steal, encrypt, spy

> **Blue-team lens:** each of those steps is a detection point. You don't need to catch the payload — a suspicious beacon at step 4 is equally actionable.

## Ransomware in Depth (2020s)

- **Encryption** of documents (AES fast encrypt, RSA for keys)
- **Double/triple extortion** — ALSO exfiltrating + threatening publication to pressure payment
- **RaaS economy** — affiliates rent infrastructure from gangs (LockBit, BlackCat etc.)
- **The defense:** airtight, off-line, tested backups + EDR + user hardening + fast IR

> **The most important malware fact:** you will never "see" most malware in action; you will see its *effects* (a file, a process, a network beacon, a ransom note). Analysis is all about connecting clues to the family and the playbook.
`,
      defaultCode: `// Classify a malware sample's behavior (conceptual)
function classify(behaviors) {
  const b = behaviors.join(" ").toLowerCase();
  if (b.includes("encrypt") && b.includes("ransom")) return "Ransomware";
  if (b.includes("keystroke") || b.includes("screen")) return "Spyware/Keylogger";
  if (b.includes("backend") && b.includes("c2")) return "RAT/Backdoor";
  if (b.includes("propagate") && b.includes("network")) return "Worm";
  return "Unknown — tune signals";
}
console.log(classify(["encrypts Files", "shows ransom note"])); // Ransomware`,
  solution: `Behavioral keyword classification — the same logic SOCs use for triage. It's heuristic, not perfect.`,
  hint: "Ask: how did it arrive? what does it do? what does it phone home with?",
  challenge: `**Home Lab — Malware Cybersmart Study (Read-Only, NO execution):**
1. Pick any well-documented family (e.g., Emotet, TrickBot, WannaCry).
2. Read its MITRE ATT&CK page: tactics, techniques, procedures.
3. Draw its kill chain: delivery → exec → persistence → c2 → action.
4. For each step, name the control that could detect/block it.
5. Write a one-page report "Anatomy of [family]" in analyst format.`,
    },
    {
      id: 2,
      slug: "02-static-analysis",
      title: "Static Malware Analysis",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Analyze malware without running it: file types, hashes, strings, PE structure, and YARA rules.",
      content: `
# Static Malware Analysis

## Static vs Dynamic

- **Static** — analyze the file WITHOUT executing it (safe)
- **Dynamic** — run it in a sandbox and observe (dangerous, but revealing)

Start static; move to dynamic (in a VM) when needed.

## The Static Toolkit

\`\`\`bash
file sample.bin            # what type of file is it?
sha256sum sample.bin       # hash → look up in VT
strings -n 6 sample.bin    # printable strings (URLs, paths, creds)
exiftool sample.exe        # metadata
\`\`\`

**Hashing first.** Query VirusTotal / MalwareBazaar by hash — the answer may already be public. The hash is the file's DNA.

## Files Insight

\`\`\`bash
file notepad.exe   # PE32+ executable (GUI) x86-64, for MS Windows
\`\`\`

- \`PE32\` = 32-bit, \`PE32+\` = 64-bit
- \`ELF\` = Linux
- \`Mach-O\` = macOS
- \`MZ\` header = DOS/Windows executable

## Strings Analysis

\`\`\`bash
strings -n 7 sample.exe |less
strings -n 7 sample.exe |grep -iE "http|cmd|powershell|reg|vbs|mail"
\`\`\`

Strings reveal:
- URLs / C2 hostnames
- Hardcoded passwords / keys
- File paths (persistence)
- Encryption keys
- If nothing readable → **packed/obfuscated** (huge red flag)

## PE Structure (Windows Executables)

- **DOS header** — \`MZ\`
- **PE header** — signature, machine type
- **Sections** — .text (code), .data, .rdata, .rsrc
- **Imports** — functions from DLLs (the "shopping list": \`CreateFile\`, \`WinHttp\`...)
- **Exports** — functions it offers

Import analysis alone identifies capability: \`WinHttp\` + \`crypt\` + \`CreateProcess\` = a network-aware downloader that runs things.

## YARA: The Signature Language

YARA matches byte patterns / strings / regex on files:

\`\`\`yara
rule Evil_Family
{
  meta:
    description = "Detects Evil_Family markers"
  strings:
    $s1 = "EvilUniqueURL" nocase
    $s2 = { E8 ?? ?? ?? ?? 74 ?? 51 }
  condition:
    uint16(0) == 0x5A4D and 2 of them
}
\`\`\`

Analysts (and EDRs) write YARA rules to catch families. You'll write, test, and share YARA rules in SOC work.

## Static Analysis Doesn't Lie Obfuscated

Heavily obfuscated samples may defeat strings. Then you:
1. Check **entropy** (high = packed/encrypted)
2. Run a **unpacker** (UPX often)
3. Move to **dynamic** (sandbox)
4. Or analyze the LOADER vs the PAYLOAD (two-stage)
`,
      defaultCode: `#!/bin/bash
# Static triage pipeline for a suspect file (use ONLY on lab samples)
SAMPLE="$1"
[ -z "$SAMPLE" ] && echo "usage: $0 <file>" && exit 1
echo "== FILE =="; file "$SAMPLE"
echo "== HASH =="; sha256sum "$SAMPLE"
echo "== SIZE =="; stat -c %s "$SAMPLE"
echo "== STRINGS (net/interesting) =="; strings -n 7 "$SAMPLE" | grep -iE "http|c2|key|pass|cmd|powershell" | head -30`,
  solution: `The triage script fingerprints a file: type, hash, size, suspicious strings. Never run on real samples unless you're in a lab with current AV.`,
  hint: "Always hash FIRST — VirusTotal answer may already exist.",
  challenge: `**Home Lab — Static Triage a Real Sample (Safely):**
1. Get a known malicious sample from MalwareBazaar (it's a public malware repository) — keep it in a VM's shared folder.
2. Run triage: file, hash, size, strings.
3. Query the hash on VirusTotal — what's the VT score/family tags?
4. Run \`exiftool\` if available; note compiler timestamps or odd metadata.
5. Write a 1-paragraph "triage report": type, indicators (hash), likely capabilities from strings/imports.`,
    },
    {
      id: 3,
      slug: "03-dynamic-analysis-sandbox",
      title: "Dynamic Analysis & Sandboxing",
      level: "intermediate",
      tag: "lab",
      duration: "55 min",
      description: "Run malware safely in a VM and observe: processes, network beaconing, file changes, registry changes.",
      content: `
# Dynamic Analysis & Sandboxing

## Why Dynamic

Static tells you WHAT it might do. Dynamic shows you WHAT IT ACTUALLY DOES — the C2 domain it dials, the files it touches, the persistence it plants.

## The Safe Sandbox Setup

Rules:
1. **Isolated VM, no shared folders** (or read-only snapshots)
2. **Host-only/isolated network** — let it talk to a *fake* server you control
3. **Snapshot before + revert after** each run
4. **No internet** to the real world (firewall the VM)
5. Never analyze on your production machine, ever.

## Observing Behavior

Run the sample, then capture:

| Artifact | Tool | Signal |
|----------|------|--------|
| Processes | Procmon, procps | What children spawn? |
| File changes | Procmon | What did it write? |
| Registry | Procmon | Persistence keys? |
| Network | Wireshark/tshark | C2 beacon pattern/domain |
| API calls | Python \`ntapi\`/Frida | What syscalls? |

## The Fake-C2 Trick

Instead of letting malware hit the hostile internet, route it to **you**:

\`\`\`bash
# fake webserver that logs EVERY request
python3 -m http.server 80 &
# or spin up a fake responder that logs DNS/HTTP
\`\`\`

Observe what the malware asks for — its queries reveal its C2 protocol even to you.

## Understanding Behavior Through Procmon

Process Monitor (Windows) shows:
- Process tree (who spawned whom)
- File writes (what/where)
- Registry ops (persistence, config)
- Network ops

> The **patterns** matter more than individual events: *downloader → drops payload → registers autorun → beacons out → theft*. That's the full chain you document.

## Anti-Analysis Evasion (the malware fights back)

- **Anti-VM** — checks for VirtualBox/VMware artifacts (exits if detected)
- **Sandbox detection** — sleeps, checks process names, mouse activity
- **Time-based** — delayed execution to outlast the sandbox
- **Packed** — encrypted until runtime

**How analysts win:** multiple sandboxes, timeout-bypass tricks (UNTRUST the clock), memory dumping before/after unpacking.

## Communicate Your Findings

A malware analysis report format:

1. Summary (2-3 sentences)
2. Key indicators (hash, family, C2)
3. Behavioral findings (processes, files, network, persistence)
4. Detection guidance (YARA, EDR rules)
5. IOCs list (IPs, domains, hashes)
`,
      defaultCode: `#!/bin/bash
# Lab sandbox network monitor (simplified)
# Only for a REVERTED, isolated VM!
echo "capturing all traffic the VM generates..."
sudo timeout 120 tshark -i eth0 -T fields \
  -e ip.src -e ip.dst -e dns.qry.name -e tcp.flags.syn \
  -E header=y 2>/dev/null || echo "run: sudo apt install tshark"
echo "then: revert the VM snapshot."`,
  solution: `Captures host traffic the malware generates, including DNS queries (often the C2 channel). Then revert the snapshot.`,
  hint: "DNS queries from the sandbox reveal C2 domains — inspect them.",
  challenge: `**Home Lab — Dynaemic Malware Observation (In VM Only):**
1. In your revertable malware-analysis VM, download a known malware sample from MalwareBazaar.
2. Set up DNS capture + fake HTTP server.
3. Run the sample (in the VM), observe: processes, files, network.
4. Document: C2 domain, dropped files, persistence locations.
5. REVERT the snapshot. Write your 1-page malware report with IOCs.`,
    },
  ],
};