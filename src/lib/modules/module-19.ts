import type { Module } from "../curriculum";

export const module19: Module = {
  id: "module-19",
  slug: "19-iot-ot-security",
  title: "IoT & OT Security",
  description:
    "Cameras, PLCs, industrial controllers and embedded devices — the other internet, where a vulnerability is physical danger.",
  language: "Embedded & Industrial",
  lessons: [
    {
      id: 1,
      slug: "01-iot-ot-basics",
      title: "IoT & OT: The Invisible Attack Surface",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "From smart lightbulbs to power grids: why the IoT/OT world is different, and why it matters to you.",
      content: `# IoT & OT: The Invisible Attack Surface

## Two Different Worlds

- **IoT (Internet of Things)** — consumer/edge gadgets: cameras, thermostats, medical sensors
- **OT (Operational Technology)** — industrial control: PLCs, SCADA, power grid, factory robots, HVAC in your building

> Both are computers with no security culture of their own: cheap, internet-exposed, rarely patched, no one's favorite child.

## Why They're Security's Nightmare

| Property | Classic IT | IoT/OT |
|----------|-----------|--------|
| Patching | monthly | sometimes *never* (uptime, vendor lock) |
| Attacker's prize | data | **physical systems** & availability |
| Traffic | network-complex, monitored | proprietary, messy, sometimes isolated |
| People | security teams | nobody owns them (IT says OT, OT says IT) |
| Blast radius | business | **safety, lives** |

**Consequence moments (learn the stories):**
- **Mirai (2016)** — IoT botnet of cameras/DVRs → massive DDoS via default creds
- **Colonial Pipeline (2021)** — IT breach → OT shutdown → fuel panic + ransom payment
- **NotPetya (2017)** — spread to OT → Maersk lost almost all systems, US$300M loss
- **Stuxnet (2010)** — the OG: sabotaged Iranian centrifuges (M08)

## The Layered Reality

\`\`\`text
The IT/OT boundary: IT network ← DMZ/gateway → OT network → PLCs → devices
\`\`\`

The dangerous part: modern OT is **converged** (it talks to the internet for telemetry) — the old 'air-gapped' dream is dead.

## The Default-Credential Epidemic

- Cameras shipped with \`admin/admin\`, never changed
- Scanned by bots within **minutes** of going online
- The Mirai pattern: it's not a hack, it's a plucking of the default orchard

\`\`\`bash
# How Mirai scanned: try the common defaults against the garden of devices:
# admin/admin, root/123456, support/support, etc.
nmap -p 23 --open 192.168.1.0/24   # finds telnet-enabled cameras/Linux-ish boxes
\`\`\`

## The Security-by-Omission of Vendors

- No secure boot / signed firmware
- No auto-update path an ORG can control
- Hard-to-change passwords, web UIs over HTTP
- Little logging worth anything

## The Realistic OT Program (what CSIRTs do)

1. **Inventory** — you can't protect the invisible: list every device, vendor, firmware, network position
2. **Segment (zones & conduits)** — the IoT/OT network is a *separate zone*, guards in both directions, NO direct internet
3. **Credential discipline** — change defaults on day one; centralized auth where possible
4. **Patch WHAT CAN be patched**; gate the rest behind controls
5. **Monitor the boundaries** — anomalies: a PLC calling the internet = incident
6. **Run the incident process for OT differently** — 'go-fast' interrupts safety procedures; the response plan must respect the process (plant rules)

> **The OT reality-check:** in ICS, remediators can't necessarily 'just reboot' — an emergency stop or PLC restart may be worse than the malware. Response in OT = plan, pause, and process, not cowboy speed.
`,
      defaultCode: `#!/bin/bash
# Lab-friendly: identify what lives on your network (DEMO ONLY on your own lab)
nmap -sV --open 192.168.1.0/24
# then ask for each: vendor? default creds? firmware version? internet-bound?
# the IoT/OT inventory columns you want:
echo "device | vendor | fw | network zone | last-patched | owner"`,
  solution: `A scan is only the beginning of inventory; the columns after are what make it a program.`,
  hint: "Inventory first — you literally cannot protect what you don't list.",
  challenge: `**Home Lab — IoT Under the Microscope:**
1. Audit YOUR smart devices (router, camera, printer, TV, IoT hub). Read their 'security' story.
2. Answer: default creds? auto-update on? web UI on HTTP? telemetry to the internet?
3. List them in a table with your 3 risk flags.
4. Segment mentally: could you put them on a Wi-Fi guest/IoT VLAN (lab or skills — the decision is important).
5. Write your 'personal OT list': which of your devices a Mirai-type botnet could take down tomorrow.`,
    },
    {
      id: 2,
      slug: "02-ics-protocols-security",
      title: "ICS Protocols & Their Attacks",
      level: "advanced",
      tag: "concept",
      duration: "45 min",
      description:
        "Modbus, SCADA, and the unprotected-by-design protocols that run the world's utilities.",
      content: `# ICS Protocols & Their Attacks

## The Protocols: Built for Reliability, Not Security

\`\`\`text
Modbus    — industrial, 1979, no auth (anyone can read/write registers!)
BACnet    — building automation, minimal security
DNP3      — electric utilities, slightly safer, still limited
OPC-UA    — the modern face, encryption available, often skipped
\`\`\`

**The key truth:** classic ICS protocols have **no authentication and no encryption** built in. Any host that can reach the network can command the controllers. "Security is assumed by isolation" — and convergence destroyed that assumption.

## Modbus Deep-Dive (the textbook)

\`\`\`text
READ   Read Holding Registers (0x03) → attacker reads facility state
WRITE  Write Single/Multiple Registers → attacker CHANGES setpoints
FC     Force Coil (0x05) → flip a switch!
\`\`\`

**Even without Metasploit, a plain TCP packet is enough:**

\`\`\`bash
# READ registers 40001..40002 from a lab PLC-ish target (port 502):
python3 -c "
import struct, socket
s = socket.socket(); s.connect(('10.10.10.50', 502))
req = struct.pack('>12B', 0,0,0,6, 1, 3, 0,0,0,2,0,0)  # FC03
s.send(req)
print('PLC response:', s.recv(64).hex())
"
\`\`\`

## The Attack Playbook Against ICS

1. **Discovery** → find controllers (they answer even without auth)
2. **State disclosure** → read registers: you learn everything
3. **State manipulation** → write registers: you affect the process
4. **Denial of service** → flood, lock, trigger e-stop
5. **Persistence** → a 'logic bomb' inside the PLC program itself (2014 Dragonfly pattern)

## The Defense the Protocol Can't Give

Because plaintext PLC scanning 'just works', the real defense is **architecture** (IEC 62443):

\`\`\`text
DMZ ↔ OT zone ↔ cell/plant zones ↔ safety zones
Each boundary: firewall + active monitoring + no unsanctioned internet egress
\`\`\`

**IEC 62443** is THE standard for ICS security: zones, conduits, security levels (SL 1-4).

## Monitoring the OT World

- Log/alert on: communication beyond allowed pairs (PLC↔HMI↔SCADA server only)
- Unusual time patterns (a register write at 3am)
- **Whitelist allowed Modbus/DNP3 function codes** (crazy powerful)
- Tripwire: a fingerprint of allowed read/write activity

## The Stuxnet Case Re-read

Attacker needed no protocol exploit — Modbus-era trust meant **it could just instruct the PLCs to destroy centrifuges**. The lesson: don't wait for new malware; trust-chain abuse IS the attack.

> **In one sentence:** ICS says 'operate' and security says 'every read AND write must be authenticated'. When the two collide, the architecture — not the protocol — must supply the missing trust.
`,
      defaultCode: `#!/bin/bash
# Lab READS-ONLY demo: touch a Modbus-ish target (your OWN simulator/VM only)
# free option: run a mini Modbus simulator/PLC in your VM image
nc -zv 10.10.10.50 502 && echo "PLC reachable - it doesn't authenticate!"
# the takeaway isn't to hack - it's to SEE why segmentation must carry trust`,
  solution: `Confirms port 502 is open and unauthenticated — the reason ICS defenses live in the network architecture.`,
  hint: "Never run this against real infrastructure; know your own lab only.",
  challenge: `**Home Lab — ICS Security Concepts, Safely:**
1. Read the Modbus function codes table (0x01-0x10) once — write down the 3 that let you change things.
2. If you can, run a Modbus simulator VM ('ModRSsim2' or similar) and practice READ only.
3. Draw your 'zones & conduits' for a hypothetical factory: which zone is the PLC in, what rules at each boundary?
4. Write your 3 'IEC 62443-ish' rules: zones, whitelisting function codes, monitoring the enclave.
5. The skill for interviews: explain WHY the network, not the protocol, must protect ICS.`,
    },
  ],
};