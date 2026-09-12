import type { Module } from "../curriculum";

export const module03: Module = {
  id: "module-03",
  slug: "03-linux-operating-systems",
  title: "Linux, Windows & Operating System Security",
  description:
    "Master the two operating systems you'll defend every day — Linux and Windows — plus hardening, logging, and OS-level attacks.",
  language: "OS Security",
  lessons: [
    {
      id: 1,
      slug: "01-linux-command-line",
      title: "Linux Command Line Mastery",
      level: "beginner",
      tag: "lab",
      duration: "40 min",
      description:
        "Files, permissions, processes, pipes and redirection — become fluent in the language of every server and every hacking tool.",
      content: `
# Linux Command Line Mastery

## Why Linux Is Non-Negotiable

Most servers, most cloud, and 99% of security tools run on Linux. If you can't operate a terminal, you can't be a cybersecurity professional.

## File Navigation

\`\`\`bash
pwd                  # where am I
ls -la               # list everything with details
cd /var/log          # change directory
find / -name "*.conf"  # search the file system
locate shadows       # locate files by name
file suspicious.bin  # what kind of file is this?
\`\`\`

## File Permissions: The 10 Characters

\`-rwxr-xr--\` decodes as:

- Type (\`-\` file, \`d\` dir, \`l\` symlink)
- Owner: rwx
- Group: r-x
- Others: r--

\`\`\`bash
chmod 750 script.sh     # owner rwx, group r-x, others none
chown root:admin key    # change owner:group
\`\`\`

> **Security insight:** world-writable files (\`chmod 666\`) and SUID binaries are classic privilege escalation targets. \`find / -perm -4000\` (setuid) reveals them.

## Processes

\`\`\`bash
ps aux                     # all processes
top / htop                # live view
kill -9 <pid>             # force kill
pgrep -af "miner"         # find process by name
\`\`\`

**Dark knowledge:** malware often names itself innocuously (e.g., \`httpd\`, \`svchost\`). You verify by \`/proc/<pid>/exe\` — the actual binary path.

## Pipes, Redirection, and Text Tools

\`\`\`bash
# Find anomalies in a log
grep -i "error" /var/log/syslog | sort | uniq -c | sort -rn
# Extract IPs from access log
grep "GET" access.log | awk '{print $1}' | sort -u
# Count login failures
cat auth.log | grep "Failed password" | wc -l
\`\`\`

The "awk/sed/grep" trio is the engine of log analysis.

## Persistence (Attackers Do This Too)

\`\`\`bash
# list what runs at boot
ls -la /etc/init.d /etc/systemd/system
systemctl list-unit-files | grep enabled
cat /etc/crontab && ls -la /etc/cron*
\`\`\`

Persistence = anything in these locations is executed on boot. Defenders audit them; attackers plant in them.
`,
      defaultCode: `#!/bin/bash
# Audit your lab machine for risky files
echo "--- SUID binaries ---"
find / -perm -4000 2>/dev/null
echo "--- world-writable files ---"
find / -type f -perm -o+w 2>/dev/null | head -20
echo "--- listening ports ---"
ss -tulnp`,
      solution: `Run the audit script. SUID binaries and world-writable files are prime attack targets — know which are expected on your system.`,
      hint: "ss -tulnp replaces netstat -tulnp on modern Linux.",
      challenge: `**Home Lab — Linux Auditing Drill:**
1. Run the audit script above. For each SUID binary, research its purpose.
2. Practice permission changes: create a file, chmod 600, chown, verify with ls -la.
3. Harden one thing: move a sensitive file to 600 and remove extended write for group/other.
4. \`journalctl --since "1 hour ago"\` — read your system's log for the last hour.
5. Skill check: name an SUID binary whose compromise would lead to instant root. (Hint: think su, sudo, pkexec.)`,
    },
    {
      id: 2,
      slug: "02-linux-scripts-automation",
      title: "Bash Scripting & Automation",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Write scripts to automate reconnaissance, parsing, and monitoring — the backbone of security tooling.",
      content: `
# Bash Scripting & Automation

## The Security Professional's Glue

Bash is how security professionals glue tools together: "grab those IPs, check them here, and alert me."

## Variables, Conditionals, Loops

\`\`\`bash
#!/bin/bash
TARGET="192.168.1.0/24"
for ip in $(seq 1 254); do
  ping -c 1 -W 1 192.168.1.$ip > /dev/null 2>&1 && echo "192.168.1.$ip is up"
done

if [ -f /var/log/auth.log ]; then
  grep "Failed" /var/log/auth.log | wc -l
else
  echo "missing auth.log"
fi
\`\`\`

## Parsing Logs Like a Boss

\`\`\`bash
# Top source IPs in failed logins
grep "Failed password" auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head

# Would you block these IPs? Extract them:
grep "Failed password" auth.log | awk '{print $(NF-3)}' | sort | uniq | wc -l
\`\`\`

## Automation Patterns for Blue Team

\`\`\`bash
#!/bin/bash
# daily recon baseline
OUT=~/baseline-$(date +%F).txt
ss -tulnp > \$OUT
find / -perm -4000 2>/dev/null >> \$OUT
ls -la /var/mail >> \$OUT
echo "Baseline saved: \$OUT"
\`\`\`

## Automation Patterns for Red Team

\`\`\`bash
#!/bin/bash
# quick DNS sweep (change example.com)
for sub in www admin dev prod mail ftp vpn old; do
  host \$sub.example.com 2>/dev/null | grep "has address" && echo "FOUND: \$sub"
done
\`\`\`

## Functions & Error Handling

\`\`\`bash
check_port() {
  nc -zv -w 2 "\$1" "\$2" 2>&1 | grep -q succeeded && echo "OPEN \$1:\$2"
}
check_port 10.0.0.5 22
check_port 10.0.0.5 445
\`\`\`

> **Professional habit:** every script you write should (1) work from anywhere, (2) not depend on interactive prompts, (3) print what it's doing, and (4) log or save output. Your future SOC will run your scripts unattended.
`,
      defaultCode: `#!/bin/bash
# Port scanner using /dev/tcp (no extra tools)
if [ -z "$1" ]; then echo "Usage: $0 <ip>"; exit 1; fi
for port in 21 22 23 80 443 3389 445 65535; do
  (echo >/dev/tcp/$1/$port) 2>/dev/null && echo "$1:$port OPEN"
done`,
      solution: `Run with an IP: ./scan.sh 10.0.0.5. The /dev/tcp trick opens a socket; success means the port answered.`,
      hint: "Only scan your own lab — and remember, this is what attack scanners do.",
      challenge: `**Home Lab — Build Scripting Muscle:**
1. Write a script that scans 10.0.0.0/24 for live hosts and saves a clean list.
2. Write a script that tails your SSH auth.log and alerts on 3+ failed logins from one IP in a minute.
3. Write a script that checks the top-10 listening ports and emails you a diff if they change vs yesterday's baseline.
4. Run each script from a different directory to prove no path dependencies.
5. Push your scripts to a GitHub gist/repo — this becomes portfolio evidence.`,
    },
    {
      id: 3,
      slug: "03-windows-security-active-directory",
      title: "Windows Security & Active Directory",
      level: "intermediate",
      tag: "concept",
      duration: "45 min",
      description:
        "Windows authentication, Event IDs, the registry, and Active Directory — the kingdom, the castle, and the crown jewels of most enterprises.",
      content: `
# Windows Security & Active Directory

## Windows Gives Attackers the Kingdom

Most enterprises run Windows clients + Active Directory. AD holds the crown jewels: user accounts, groups, GPOs, domain trusts. Attackers target it relentlessly — that's why AD attacks (Kerberoasting, Pass-the-Hash, Golden Ticket) dominate red team playbooks.

## Windows Authentication Basics

Windows authenticate several ways:
- **Kerberos** — default for domain: AS-REQ/AS-REP (ticket granting), TGS
- **NTLM** — legacy challenge/response
- **Kerberos AD components**: Domain Controller (DC) runs KDC

## Event IDs You MUST Know (SOC-Speak)

| Event ID | Meaning |
|----------|---------|
| 4624 | Successful logon |
| 4625 | Failed logon |
| 4648 | Logon with explicit credentials (runas) |
| 4688 | New process created (with CommandLine if enabled) |
| 4720 | New user created |
| 4728/4732/4756 | User added to privileged groups |
| 7045 | New service installed (WITHOUT MSI) — persistence! |
| 1102 | Security log cleared (eradication!) |

## Registry

Registry stores config in a hierarchy: HKLM, HKCU, HKCR, HKU, HKCC. Attackers use it for **persistence**:

\`\`\`powershell
# Rabbit hole: malicious run key
New-Item "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" -Force
Set-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" \\
  -Name "UpdateSvc" -Value "C:\\programdata\\evil.exe"
\`\`\`

Defenders audit: Run/RunOnce keys, services, WMI event subscriptions, scheduled tasks, startup folders.

## Active Directory Attack Surface (Teaser)

- **Kerberoasting** — request service tickets, crack offline
- **AS-REP Roasting** — find accounts with pre-auth disabled
- **Pass-the-Hash** — reuse NTLM hash, no password needed
- **Golden Ticket** — forge a TGT with the KRBTGT hash
- **BloodHound** — map privilege paths visually

## Windows Processes/Logs Every Analyst Knows

- \`svchost.exe\` — service host (many legit instances; a rogue one outside System32 is suspicious)
- \`lsass.exe\` — Local Security Authority (memory theft → Mimikatz)
- \`explorer.exe\` — shell (child processes outside Explorer are odd)
- \`powershell.exe\` — script execution (rarely needed legitimately on endpoints; \`-enc\` = malicious flag)
`,
      defaultCode: `# PowerShell: query security-relevant settings
# Get process of interest
Get-Process -Name svchost -ErrorAction SilentlyContinue | Select-Object Id, Path

# List Run keys (persistence hunting)
reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"
reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"

# Check scheduled tasks
schtasks /query /fo CSV | Select-String -Pattern "Update|MS|System"`,
      solution: `Query persistence locations: Run keys, scheduled tasks, services. These are the classic Windows persistence points.`,
      hint: "Event ID 7045 + a Run key + a scheduled task = the trio of Windows persistence.",
      challenge: `**Home Lab — Windows Persistence Hunt (TEST VM only):**
1. On a Windows TEST VM (never your main machine), review Event Viewer → Security for IDs 4624/4625/4688.
2. Audit persistence: Run keys, \`schtasks\`, \`Get-Service\` services that point to non-System32 paths.
3. Research 3 persistence techniques the antivirus wouldn't flag, and how to detect each.
4. Document the "attack chain" a virus using service+Run key would show in your logs.
5. Skill check: if you saw Event 7045 for \`C:\\Users\\Public\\x.exe\`, what questions would you immediately ask?`,
    },
    {
      id: 4,
      slug: "04-identity-authentication",
      title: "Authentication, Passwords & MFA",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "What makes authentication secure, password hashing, MFA methods, and the attacks that break each one.",
      content: `
# Authentication, Passwords & MFA

## Authentication = Who You Claim to Be + Proof

Three factors:
1. **Something you know** — password, PIN
2. **Something you have** — phone, hardware key
3. **Something you are** — fingerprint, face, iris

## Why Passwords Are Broken

- Humans reuse them ("password", "123456")
- Breaches leak them by the millions
- They can be guessed, phished, sniffed, keylogged

**Solution stack:** password managers + MFA + biometrics + passkeys. And never reuse.

## Password Storage Done Right

Servers must NEVER store plaintext or reversible-encrypted passwords. They store:

- **Hash** — one-way (SHA-256 style)
- **Salted + slowed** — bcrypt/argon2/scrypt with a random per-user salt

\`\`\`bash
# password hash with salt via htpasswd (bcrypt)
htpasswd -bnBC 10 "" "MyPass123" | tr -d ':\\n'
# $2y$10$<salt...>$<bcrypt hash>
\`\`\`

The salt defeats rainbow tables; the "cost" factor (slowness) defeats GPU cracking.

## Offline Password Cracking

An attacker with the hash can crack offline at millions of guesses/sec:

- **Dictionary attack** — common words
- **Brute force** — all combinations
- **Rule-based** — "passworD1!", "p@ssw0rd"
- **Rainbow tables** — precomputed hash chains (defeated by salt)

Known tooling: hashcat, John the Ripper. *Determining the hash type (e.g., \`$2y$\` = bcrypt, \`$6$\` = sha512crypt, NTLM = 32 hex) is half the battle.*

## MFA Methods & Their Weaknesses

| Factor | Strength | Attack |
|--------|----------|--------|
| SMS codes | Weak | SIM swap, SMS interception, phishing forwards |
| TOTP app (Google Auth/Authy) | Medium | Phishing (MFA fatigue, real-time relay) |
| Push notification | Medium | "MFA fatigue" prompts — user approves anyway |
| Hardware key (YubiKey) | Strong | Needs physical possession; very hard to phish |
| Passkeys (WebAuthn) | Strong | Resistant to MITM phishing |

## Best Practice Authentication Stack

1. Password manager for unique random passwords
2. Phishing-resistant MFA (hardware key/passkeys) for critical accounts
3. Never SMS if avoidable
4. Enforce (and educate): no hint, no reuse
5. On the service side: lockout/wait after repeated failures (throttling defeats online brute force)
`,
      defaultCode: `#!/bin/bash
# Generate a bcrypt hash for a test password (lab only!)
# Requires htpasswd (apache2-utils)
htpasswd -bnBC 10 "user" "Test@12345"
echo "Above: salt starts after \\$2y\\$10\\$ — never share real hashes!"`,
      solution: `htpasswd -bnBC 10 "user" "Test@12345" outputs a bcrypt hash with format \$2y\$10\$salt\$hash. This is what secure password storage looks like.`,
      hint: "Salt is random per user; cost factor 10+ slows cracking.",
      challenge: `**Home Lab — Crack a Hash (Your Own!):**
1. Generate three hashes with DIFFERENT algorithms: bcrypt (above), MD5 (\`echo -n password | md5sum\`), and sha256 (\`echo -n password | sha256sum\`).
2. Time how fast a password cracker (hashcat or John) can break the MD5 and sha256 ones with a small wordlist. Try bcrypt — feel the difference.
3. In your notes: which hash type is industry standard now, and what "cost factor" means.
4. Bonus: Using hashcat rules (\`-r rockyou.rule\`), try turning "password" into "Password1!" variants.`,
    },
    {
      id: 5,
      slug: "05-os-hardening",
      title: "Linux & Windows Hardening",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Reduce attack surface: patches, least privilege, secure config, logging, and the CIS benchmarks that define 'hardened'.",
      content: `
# Linux & Windows Hardening

## The Principle of Least Privilege

Give every user and process the minimum privilege needed. Root/SYSTEM for nothing that doesn't need it. Admin accounts are the keys to the kingdom — an attacker who gets one has the kingdom.

## The Hardening Mindset

"Assume compromise." Remove what you don't need, minimize what you keep, and log everything you can't remove.

## Linux Hardening Checklist

\`\`\`bash
# 1. Update/patches
apt update && apt upgrade -y        # never skip this
# 2. Remove unnecessary services
systemctl disable --now cups       # (example — adjust)
# 3. SSH hardening
sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
# 4. Firewall default-deny
ufw default deny incoming
ufw allow OpenSSH
ufw enable
# 5. Fail2ban for brute force
apt install fail2ban
\`\`\`

> **SSH: disable password auth, use keys, disable root login.** Fail2ban bans IPs that repeatedly fail.

## Windows Hardening Checklist

\`\`\`powershell
# 1. Enable logging (crucial for detection)
#    (Device Guard/Defender, Sysmon for process/network detail)
# 2. Disable unnecessary services & features
#    (e.g., SMBv1 — the WannaCry vector via EternalBlue)
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol
# 3. Least privilege: users are Users, not Administrators
# 4. LAPS for local admin passwords (unique per machine)
# 5. Update management: WSUS/Intune patching with a test ring
\`\`\`

## The CIS Benchmarks

**Center for Internet Security (CIS)** publishes free hardening benchmarks for every OS, browser, DB, and cloud platform. Professionals implement "grey-box" hardening — following benchmarks then trimming for their environment.

**STIGs** (from the US DoD) are the strictest reference.

## Patching Cadence & Risk-Based Patching

Not all patches are equal:
- **Critical (CVSS ≥ 9.0)** — patch within days
- **High** — within a week or two
- **Medium** — within a month

> Exploitability matters more than CVSS alone: if an exploit is public (or "weaponized" per EPSS), move it to the top.

## Why Hardening Alone Isn't Enough

Hardening reduces the attack surface — but you must also **detect** the attempts that get through. Layers: hardening + AV/EDR + firewalls + SIEM + plans + people. Defense in depth.
`,
      defaultCode: `#!/bin/bash
# Quick hardening status audit (Linux)
echo "=== PATCH TRACKING ==="
apt list --upgradable 2>/dev/null | wc -l
echo "=== SSH CONFIG ==="
grep -E "^(PermitRootLogin|PasswordAuthentication)" /etc/ssh/sshd_config
echo "=== LISTENING PORTS ==="
ss -tulnp
echo "=== FAIL2BAN ==="
systemctl is-active fail2ban 2>/dev/null || echo "not installed"`,
      solution: `Run on your Ubuntu VM. A hardened box: no root SSH, key-only auth, few listening ports, fail2ban active, few pending patches.`,
      hint: "Audit first, then harden each item you find weak.",
      challenge: `**Home Lab — Harden Your Server:**
1. Take a snapshot of your Ubuntu VM first (rollback insurance).
2. Apply the Linux checklist above.
3. Re-test: SSH with password should fail; with key should work. Scan with nmap — which ports remain?
4. Install fail2ban, trigger 5 bad SSH logins, and watch the ban in \`fail2ban-client status sshd\`.
5. Now do the equivalent on a Windows test VM (enable Sysmon, disable SMBv1, set a logon banner).
6. Write a 1-page personal "hardening standard" you'd apply to any new server.`,
    },
  ],
};