import type { Module } from "../curriculum";

export const module01: Module = {
  id: "module-01",
  slug: "01-hardware-computing-iot",
  title: "Hardware, Computing & IoT Fundamentals",
  description:
    "Understand the machines you are protecting. From transistors and the boot process to CPUs, memory, storage and the Internet of Things.",
  language: "Hardware",
  lessons: [
    {
      id: 1,
      slug: "01-how-computers-work",
      title: "How Computers Really Work",
      level: "beginner",
      tag: "concept",
      duration: "20 min",
      description:
        "The journey of a computation: from your keystroke to electrons moving through silicon, and why it matters for security.",
      content: `
# How Computers Really Work

**Why this matters:** Every attack, every defense, every piece of malware ultimately runs on hardware. Before you can find vulnerabilities, break into systems, or defend them, you must understand what a computer actually is — a machine built to move electrons around in carefully controlled patterns.

## The Zeroes and Ones Are Not Abstract

Inside the machine, everything is voltage. A memory cell holding a \`1\` is a capacitor holding a charge. A \`0\` is an empty capacitor. The CPU does not "think" — it switches transistors between conducting and non-conducting states, millions of times per second.

## The Five Classic Components

Every computer — a smartphone, a server, a smart thermostat — follows the Von Neumann architecture:

1. **Input** — keyboard, mouse, network, sensors
2. **Output** — display, network, actuators
3. **Storage** — memory and disk
4. **Control unit** — the conductor of the orchestra
5. **Arithmetic/Logic Unit (ALU)** — does the math

\`\`\`
Input → Storage ⇄ Control ⇄ ALU → Output
        ↑          ↓
        └──────────┘
   (all connected by the bus)
\`\`\`

## The Fetch-Execute Cycle

The CPU runs a relentless three-step loop:

1. **Fetch** — pull the instruction from memory at the address in the Program Counter
2. **Decode** — interpret what the instruction means
3. **Execute** — do it (add, move, branch)

> A 3 GHz processor does this roughly 3 billion times per second. This is the clock. Every software exploit ultimately abuses this machinery — usually the memory, the bus, or the privilege levels.

## Layers of Abstraction

From hardware up:

| Layer | Example |
|-------|---------|
| Users & apps | Browser, malware |
| OS kernel | Windows, Linux |
| Firmware | UEFI, BIOS, device firmware |
| Microarchitecture | CPU internals |
| Digital logic | Gates, register files |
| Physical | Transistors, electrons |

**Security insight:** Malware can live at *any* layer. Rootkits hide in firmware, bootkits in the boot process, and normal viruses in user applications. The deeper the layer, the harder it is to detect and remove.
`,
      defaultCode: `// Compute the "layers" from hardware to application
const layers = [
  'physical', 'digital-logic', 'microarchitecture',
  'firmware', 'kernel', 'userspace'
];

for (let i = layers.length - 1; i >= 0; i--) {
  console.log('Abstraction ' + layers[i]);
}`,
      solution: `for (let i = layers.length - 1; i >= 0; i--) {
  console.log('Abstraction ' + layers[i]);
}
// Outputs: userspace, kernel, firmware, microarchitecture, digital-logic, physical`,
      hint: "Start at the top layer and iterate downward.",
      challenge: `**Home Lab:** Open Task Manager (Windows) or \`top\`/\`htop\` (Linux). List every running process. For each CPU core, note the percentage used. Now mind-map: which layer of the abstraction stack does each process live in? Bonus: run \`wmic cpu get name\` (Windows) or \`lscpu\` (Linux) and document your CPU's architecture.`,
    },
    {
      id: 2,
      slug: "02-cpu-memory-basics",
      title: "CPU, Memory & the Boot Process",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Registers, cache, RAM, and the boot sequence — the essential foundation for understanding firmware attacks and memory corruption.",
      content: `
# CPU, Memory & the Boot Process

## Registers and the Stack

The CPU has a tiny set of fast storage locations called **registers** (\`RAX\`, \`RBX\`, \`RIP\`, \`RSP\`, etc. on x86-64). The **stack** is a region of memory that grows downward, used for function calls and local variables. Every function call pushes a **return address** onto the stack.

**Security insight:** Buffer overflow attacks overwrite the return address. This is the classic stack-smashing exploit — understanding registers and the stack is essential to understanding half of all modern exploitation.

## The Memory Hierarchy

\`\`\`
Registers    (fastest, smallest)    ~1 cycle
L1 cache     ~4 cycles
L2 cache     ~12 cycles
L3 cache     ~40 cycles
RAM          ~200 cycles
SSD/NVMe     ~100,000 cycles
Disk/HDD     ~5,000,000 cycles
\`\`\`

The gap between "fast" and "slow" memory is called the **memory hierarchy gap** — and it is why operating systems use caching and why hardware engineers design prefetchers.

## Volatile vs Non-Volatile

| Type | Volatile? | Example |
|------|-----------|---------|
| RAM | Yes | DRAM — data gone on power loss |
| Cache | Yes | SRAM |
| ROM | No | Read-only firmware |
| SSD/HDD | No | Persistent storage |
| NVRAM | No | UEFI variables, CMOS |

**Forensics insight:** RAM contains secrets that vanish on power-down — encryption keys, passwords in plaintext, injected malware code. This is why memory forensics (using tools like Volatility) must happen before you power off the machine.

## The Boot Sequence

1. **Power-on** — CPU starts in a special mode
2. **UEFI/BIOS firmware** — initializes hardware, self-tests (POST)
3. **Boot manager** — finds the OS loader (e.g., GRUB, Windows Boot Manager)
4. **Kernel** — decompressed into memory, initializes drivers
5. **Init/systemd** — starts services
6. **Login screen** — user interaction

**Security insight:** A **bootkit** inserts malicious code before the OS loads, hiding itself from the soon-to-run antivirus. **Secure Boot** (UEFI) verifies digital signatures of boot components using a chain of trust starting from the hardware.
`,
      defaultCode: `// Inspect your own system's reported hardware
// Windows:
//   wmic cpu get caption
//   wmic memorychip get capacity, speed
//   Get-PCInfo | Format-List
console.log('Check: systeminfo | more');`,
      solution: `Windows: \`systeminfo\`, \`wmic memorychip get capacity\`
Linux: \`lscpu\`, \`free -h\`, \`cat /proc/meminfo\``,
      hint: "Use your OS's reporting tools and compare to the memory hierarchy.",
      challenge: `**Home Lab — Know Your Machine:**
1. Run \`lscpu\` (Linux) or \`systeminfo\` (Windows). Document:  CPU model, cores, cache sizes, RAM.
2. Identify whether Secure Boot is enabled: \`Verify-SecureBootUEFI\` (PowerShell) or \`mokutil --sb-state\` (Linux).
3. Boot your machine in UEFI mode and explore the firmware settings. Do NOT change anything — just map what exists.
4. Answer in your notes: where in the boot chain could malware hide on THIS machine?`,
    },
    {
      id: 3,
      slug: "03-operating-systems-deep",
      title: "Operating Systems in Depth",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Kernel, user mode, processes, virtual memory, and system calls — the OS security boundary you will defend every day.",
      content: `
# Operating Systems in Depth

## The Kernel Is the Trusted Third Party

The **kernel** is the only code allowed to touch hardware directly. Everything else (your programs, malware, browsers) runs in **user mode** and must ask the kernel for every privileged operation through a **system call**.

\`\`\`
User Mode:    apps, malware, browsers (restricted)
                │
                ▼  system calls (open, read, write, exec)
Kernel Mode:  drivers, scheduler, memory manager (privileged)
                │
                ▼
Hardware:     CPU, RAM, disks, network (bare metal)
\`\`\`

## CPU Privilege Levels (Rings)

Most CPUs provide multiple privilege levels:

| Ring | Purpose |
|------|---------|
| Ring 0 | Kernel mode — full hardware access |
| Ring 1-2 | Rarely used (some virtualization/device drivers) |
| Ring 3 | User mode — restricted |

Modern CPUs add **Ring -1** (hypervisor) and **Ring -2** (System Management Mode / SMM). Attacks that escalate to ring -1 or -2 are devastatingly hard to detect.

## Processes and Virtual Memory

Each process gets a **virtual address space** — the illusion that it owns all of memory. The kernel maps these virtual addresses to physical RAM using **page tables**. This gives:

- **Isolation**: Process A cannot read Process B's memory
- **Protection**: The kernel can decide what each process may touch
- **Consistency**: Every process sees the same layout

**Security insight:** A **local privilege escalation** (LPE) exploit typically chases one of these bugs:
1. A kernel bug reachable via an unvalidated system call
2. A page-table confusion that bypasses isolation
3. A race condition between two syscalls

## System Calls as the Attack Surface

The system call interface is the largest attack surface on your machine. Hundreds of syscalls, each with parameters that must be validated. Every unvalidated parameter is a potential deserialization or buffer overflow.

> Classic story: the \`mmap\` + syscall race used by Dirty COW (CVE-2016-5195) — a copy-on-write race let any user overwrite read-only files, including root-owned ones, and gain root.
`,
      defaultCode: `// Windows PowerShell: inspect running processes
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

// Linux: inspect processes and their memory maps
// ps aux --sort=-%mem | head
// cat /proc/<pid>/maps | head -20`,
      solution: `Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
// Note CPU and memory per process. On Linux explore /proc/<pid>/maps.`,
      hint: "Explore /proc on Linux to see the virtual memory maps of processes.",
      challenge: `**Home Lab — See the Rings:**
1. On Linux: run \`cat /proc/<pid>/maps\` for a process and identify: stack region (\`[stack]\`), heap (\`[heap]\`), and mapped libraries.
2. Compare \`ps aux\` vs \`top\`: which shows more per-process detail?
3. On Windows: use Process Explorer (download from Sysinternals) and enable "PID + Services" view.
4. Question: which processes run as SYSTEM (Windows) or root (Linux)? Why is that interesting to an attacker?`,
    },
    {
      id: 4,
      slug: "04-iot-embedded-systems",
      title: "IoT & Embedded Systems Security",
      level: "beginner",
      tag: "lab",
      duration: "35 min",
      description:
        "Smart devices, microcontrollers, firmware and the special security nightmares of the Internet of Things.",
      content: `
# IoT & Embedded Systems Security

## What Makes IoT Different

IoT devices — smart lights, cameras, thermostats, industrial sensors — are computers with three dangerous properties:

1. **They are often unmanaged** — no one patches them
2. **They run full TCP/IP stacks** — directly reachable on networks
3. **They are physically deployable** — attackers can buy them, tear them apart, and extract secrets

## Embedded Hardware Components

| Component | Role |
|-----------|------|
| Microcontroller (MCU) | Single chip computer (ARM Cortex-M, ESP32, etc.) |
| SoC | System-on-Chip (attacker router, camera) |
| Flash/EEPROM | Holds firmware |
| UART/JTAG | Debug interfaces (attackers love unauthenticated serial) |
| EMI shielding & OTP fuses | Physical protection against probing |

## Firmware Is the Operating System

Embedded firmware is usually a monolithic blob. Attackers:

1. Download the firmware image from the vendor
2. Use firmware analysis tools to extract the file system (\`binwalk\`, \`strings\`, \`ghidra\`)
3. Find hardcoded credentials, backdoors, and vulnerabilities

> The infamous Mirai botnet (2016) did not use sophisticated exploits. It used ~60 default usernames/passwords. Every device in the camera/DVR market had the same defaults — easy pickings for a botnet that nearly took down the internet's DNS infrastructure.

## The IoT Threat Model

- **Device compromise**: default creds, unpatched CVEs, exposed debug ports
- **Network exposure**: devices on the same LAN as your laptop
- **Data privacy**: cameras and mics streaming to remote vendors
- **Physical tampering**: JTAG/SWD on a smart lock
- **DoS/Vendors**: permanent device control, bricking

## Securing IoT (Defensive Checklist)

1. Change every default password
2. Segment IoT on an isolated VLAN/guest network
3. Disable UPnP and remote management
4. Block IoT device outbound connections except required
5. Check for firmware updates monthly
6. Block vendor phone-home domains at the firewall
`,
      defaultCode: `# OpenWrt / pfSense idea: isolate IoT on a VLAN
# Example (conceptual — your router's CLI differs):
# vlan 100 "iot" interface eth1
# firewall rule: block iot -> lan except established
echo "Segment IoT devices onto their own network."`,
      solution: `Use your router's VLAN feature or a separate guest network to isolate IoT devices from your main LAN. Block direct IoT -> LAN traffic.`,
      hint: "Isolation is the #1 IoT defense. Make IoT can't-chat-with-laptop.",
      challenge: `**Home Lab — Inventory Your IoT:**
1. Download \`nmap\` and scan your home network: \`nmap -sn 192.168.1.0/24\` (adjust your subnet).
2. Identify every device. Note which are IoT (cameras, speakers, lights, smart plugs).
3. Check your router: which IoT devices have UPnP enabled? Disable it.
4. If possible, move IoT onto a guest network or VLAN.
5. Write a one-page "IoT isolation plan" for your home network.`,
    },
    {
      id: 5,
      slug: "05-virtualization-containers",
      title: "Virtualization, Hypervisors & Containers",
      level: "beginner",
      tag: "concept",
      duration: "25 min",
      description:
        "VMs, hypervisors, and containers — the isolation mechanisms underpinning every modern lab and cloud environment.",
      content: `
# Virtualization, Hypervisors & Containers

## Why Virtualization Is Security Baseline

You will spend your entire cybersecurity career in virtual machines. They let you:
- Run Kali Linux inside an isolated sandbox
- Snapshot a vulnerable system, attack it, and roll back
- Study malware without touching your host

## Hypervisor Types

| Type | Example | Description |
|------|---------|-------------|
| Type 1 (bare metal) | ESXi, Hyper-V, KVM | Runs directly on hardware, hypervisor is the OS |
| Type 2 (hosted) | VirtualBox, VMware Workstation | Runs on top of a host OS |

## Virtual Machine Security Model

The hypervisor creates **guest VMs** — complete computers with virtual hardware. Guests cannot see each other's memory or disks. The **virtualization boundary** is itself a security boundary.

**Security insight:** Jailbreak/escape exploits ("VM escape") are rare but feared — they break OUT of the hypervisor boundary to hit the host. The famous **VENOM** (CVE-2015-3456) bug lived in the virtual floppy controller of QEMU.

## Containers: Shared Kernel, Isolated Userspace

Containers (Docker, containerd) are different — they share the **host kernel** but isolate processes via namespaces and cgroups.

\`\`\`
VM:  [App][OS]  |  [App][OS]  |  hypervisor |  hardware
Ctr: [App] [App] [App] -------- namespaces/cgroups -------- shared host kernel | hardware
\`\`\`

Container security:
- **Namespaces** — isolate PID, mount, network, user, IPC
- **cgroups** — limit CPU, memory, devices
- **Seccomp** — restrict system calls
- **Read-only rootfs** — prevent modification

> If the shared kernel is exploited, ALL containers on the host are compromised. This is why "container escape" and "run as non-root" are such hot topics.

## Your Home Lab Foundation

Every cybersecurity professional's first lab:

1. Host OS (Windows or Ubuntu) + VirtualBox
2. Kali Linux VM (attacker)
3. Windows 10/11 VM (target)
4. Ubuntu server VM (target + SIEM later)
5. A target router/firewall VM
6. Isolation: host-only networking for lab traffic
`,
      defaultCode: `# VirtualBox command-line creations (conceptual)
# vboxmanage createvm --name "kali" --register
# vboxmanage modifyvm "kali" --memory 4096 --cpus 2
# vboxmanage modifyvm "kali" --nic1 hostonly
echo "Build your lab: VirtualBox + Kali + targeted VMs."`,
      solution: `Create VMs: Kali Linux, Windows 10, Ubuntu. Use host-only networking for the lab so it can't reach your real network.`,
      hint: "Host-only networking keeps lab attacks isolated from the real internet.",
      challenge: `**Home Lab — Build the Foundation:**
1. Install VirtualBox (download site or apt).
2. Create a Kali Linux VM (4GB RAM, 2 CPU, 40GB disk).
3. Create a Windows 10 VM and an Ubuntu server VM.
4. Configure host-only networking for all three.
5. Snapshot your Kali VM. Practice restoring it.
6. Why is host-only networking safer than bridged for a lab? Write the answer.`,
    },
    {
      id: 6,
      slug: "06-storage-forensics-basics",
      title: "Storage, File Systems & Forensic Basics",
      level: "beginner",
      tag: "lab",
      duration: "30 min",
      description:
        "How data is stored, what happens when you delete a file, and the forensic mindset of recovering what was 'gone'.",
      content: `
# Storage, File Systems & Forensic Basics

## How Storage Works

A disk is a block array. The file system organizes blocks into:
- **Files** (inodes/mft entries)
- **Directories** (trees)
- **Free space** (unallocated blocks)

## Deleting a File Does Not Delete Data

When Windows "deletes" a file:
1. The file's directory entry is marked free
2. The disk blocks are NOT erased — the data remains
3. Only the pointers are removed

This is why digital forensics can "recover deleted files" — the bytes are still sitting on the disk in **unallocated space**.

> **Forensic golden rule:** The filesystem leaves artifacts everywhere. Deleting, formatting, and even rebuilding rarely destroy everything. Wiping (overwriting multiple passes) or physical destruction is the only reliable erasure.

## Key Forensic Artifacts

| Artifact | Location | What It Reveals |
|---------|----------|----------------|
| $MFT / inode table | NTFS / ext4 | Every file ever created, even deleted |
| Prefetch | C:\\Windows\\Prefetch | Programs that ran |
| $LogFile | NTFS | File operation history |
| Shell bags | Registry | Folders user opened in Explorer |
| Browser history | AppData | Web activity |
| Pagefile/hiberfile | C:\\pagefile.sys | RAM that spilled to disk |

## The Forensic Process (First Look)

1. **Preserve** — image the disk byte-for-byte, write-protected
2. **Document** — hashes (SHA-256/SHA-1) to prove integrity
3. **Analyze** — study the image, never the original
4. **Recover** — carve deleted data
5. **Report** — present findings in court or incident report

> The first step of any investigation is preservation. If you touch the evidence, you may destroy it. Forensics runs on **images**, not originals.
`,
      defaultCode: `# Get SHA-256 hashes to document evidence integrity
# Windows:  Get-FileHash file.bin -Algorithm SHA256
# Linux:    sha256sum file.bin
echo "Always hash evidence before analysis."`,
      solution: `Windows: \`Get-FileHash evidence.bin -Algorithm SHA256\`
Linux: \`sha256sum evidence.bin\`
Document the hash before and after analysis to prove nothing changed.`,
      hint: "Hashing proves chain of custody — a core forensic requirement.",
      challenge: `**Home Lab — Recover a Deleted File:**
1. On a THROWAWAY VM, create a text file with a distinctive passphrase inside.
2. Delete it (Shift+Delete on Windows). 
3. Download a disk forensics tool (e.g., \`testdisk\`/\`photorec\` on Linux, or use \`foremost\`).
4. Recover the deleted file. Verify the passphrase is intact.
5. Now use a file wiper (\`srm\` or Windows cipher /w) and try to recover again.
6. Document: what survives deletion but not wiping?`,
    },
    {
      id: 7,
      slug: "07-computer-networks-hardware",
      title: "Network Hardware & Devices",
      level: "beginner",
      tag: "lab",
      duration: "30 min",
      description:
        "Routers, switches, firewalls, APs, and the topology of the network — the physical battlefield of every cyber attack.",
      content: `
# Network Hardware & Devices

## The Devices You Will Defend

| Device | Layer | Function |
|--------|-------|----------|
| Switch | L2 (Data Link) | Forwards frames by MAC address |
| Router | L3 (Network) | Routes packets by IP address between networks |
| Firewall | L3-L7 | Filters traffic by policy |
| AP (Access Point) | L2-L3 | Bridges wireless clients |
| Load balancer | L4/L7 | Distributes traffic |
| IDS/IPS | L3-L7 | Detects/prevent intrusion |

## MAC vs IP Addressing

- **MAC address** — physical, burned into NIC (48-bit hex)
- **IP address** — logical, assigned (32-bit for IPv4, 128-bit for IPv6)

ARP (Address Resolution Protocol) maps IP → MAC on a LAN.
> **ARP spoofing** is the classic MITM attack: an attacker sends fake ARP replies claiming "I have the gateway's IP" so all traffic flows through them.

## Network Topology and Segmentation

Modern networks use **segmentation**:
- DMZ (public-facing servers)
- Internal LAN
- Management VLAN
- Guest Wi-Fi
- IoT VLAN (from module 04)

Segmentation limits blast radius: a compromised web server in the DMZ cannot directly reach the finance team's VLAN without crossing a firewall.

## The Spanning Tree, VLANs, and Trunks

Switches segment broadcast domains using **VLANs**. VLAN trunking (802.1Q tags) lets one physical link carry many VLANs.
> **Trunking attack:** If a device can negotiate a trunk, it can join any VLAN — a common switch attack (DTP desync, double-tagging).

## Firewalls as Network Security

- **Packet filter** (stateless): inspects headers only
- **Stateful**: tracks connections
- **NGFW**: inspects at application layer, integrates IDS/IPS
- **WAF**: protects web apps specifically

**Security mindset:** Network security is about *zones and policy*. An attacker's dream is a flat network where everything can reach everything. Your job is to make every zone its own fortress.
`,
      defaultCode: `# View the ARP table to see neighbor MACs
# Windows:  arp -a
# Linux:    ip neigh show
echo "Understand what maps to what on your LAN."`,
      solution: `\`arp -a\` / \`ip neigh show\` lists IP→MAC mappings on your subnet — the data an ARP-spoofing attacker manipulates.`,
      hint: "ARP maps IP to MAC on the LAN — the key to LAN-level MITM.",
      challenge: `**Home Lab — Map Your Network:**
1. Run \`ipconfig\` / \`ip addr\` and \`arp -a\`. Identify: your IP, gateway, DNS.
2. Sign into your router's admin UI. Map: DHCP range, guest network, any port-forwards (disable unwanted ones!).
3. Check your router firewall: is UPnP enabled? Is remote admin enabled (should be OFF)?
4. If your router supports it, enable a guest Wi-Fi network for IoT.
5. Draw your home network topology with zones.`,
    },
  ],
};