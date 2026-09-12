import type { Module } from "../curriculum";

export const module27: Module = {
  id: "module-27",
  slug: "27-scanning-enumeration",
  title: "Scanning & Enumeration Deep",
  description:
    "Port scanning, service enumeration, OS fingerprinting, vulnerability scanning, and the protocol-level enumeration that uncovers paths into systems.",
  language: "Offensive",
  lessons: [
    {
      id: 1,
      slug: "01-port-scanning-types",
      title: "Port Scanning: SYN, Connect, UDP & Timing",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Scan types, their fingerprint differences, IDS evasion via timing, and interpreting open/closed/filtered.",
      content: `
# Port Scanning: SYN, Connect, UDP & Timing

## Port states mean something

- **Open**: service listening, accepting connections
- **Closed**: port reachable, no listener (useful: reveals host is alive)
- **Filtered**: firewall or ACL drops your packets

## Scan types

\`\`\`
# SYN stealth (needs root) — leaves no full connection
sudo nmap -sS -T2 10.0.0.20 -oN stealth.txt

# TCP Connect (no root needed) — full handshake, logged by service
nmap -sT -T3 10.0.0.20

# UDP (slow, noisy) — find SNMP, DNS, TFTP
sudo nmap -sU --top-ports 50 10.0.0.20

# Comprehensive (all ports, versions, scripts, OS)
sudo nmap -sS -sV -sC -O -p- --min-rate 1000 10.0.0.20 -oA full
\`\`\`

## Timing and IDS evasion

\`\`\`
nmap -T1 target   # paranoid slow — avoids most IDS
nmap -T5 target   # insane fast — loud, likely blocked
nmap --scan-delay 100ms target   # pace to avoid rate limits
nmap -f target    # fragment packets (less modern IDS worry)
\`\`\`

## How services are detected

- Banner grabbing: the service's "hello" string (ssh, smtp, ftp banners)
- nmap probes: after finding open, sends service-specific probes
- service and version (-sV) detection: fingerprint libraries vs. behavior

## What a big scan reveals

- Exotic ports (3389 RDP, 5900 VNC) = privileged access by mistake
- Different OSes = possible dev/test servers forgotten
- Multiple versions = upgrade gaps and decision debt

> "Scan fast for hosts, scan narrow for ports, scan deep on interesting ones." A professional scan respects time budgets and target fragility.
`,
      defaultCode: `# Time a scan to tune noise vs speed
time sudo nmap -sS -T2 --top-ports 100 10.0.0.20 > nmap-slow.txt
time sudo nmap -sS -T5 --top-ports 100 10.0.0.20 > nmap-fast.txt
diff <(cat nmap-slow.txt) <(cat nmap-fast.txt) | head`,
      solution: `time sudo nmap -sS -T2 --top-ports 100 10.0.0.20 > nmap-slow.txt
time sudo nmap -sS -T5 --top-ports 100 10.0.0.20 > nmap-fast.txt
diff <(cat nmap-slow.txt) <(cat nmap-fast.txt) | head`,
      hint: "Start fast and narrow (host list), then go deep on confirmed services.",
      challenge: `**Home Lab — Scan Timing Lab:**
1. Run nmap -sS -T2 --top-ports 20 and compare wall-clock to nmap -sS -T5 --top-ports 20.
2. Does the open-port list differ? Note your IDS (if any) logging.
3. Run a UDP scan on top 10 ports — observe slowness.
4. Practice: save to .nmap format, then parse for "open" ports only.
5. Write: which scan speed gives you the least noise in a real engagement, and why.`,
    },
    {
      id: 2,
      slug: "02-service-enum",
      title: "Service Enumeration Deep",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Enumerate SMB, LDAP, SNMP, RPC, DNS, MySQL — extract machine-readable intelligence from services that talk too much.",
      content: `
# Service Enumeration Deep

## Service-by-service enumeration

### SMB (445/139)

\`\`\`
nmap -p 445 --script smb-enum-shares,smb-enum-users 10.0.0.20
smbclient -L //10.0.0.20 -N            # null session
enum4linux -a 10.0.0.20                # one-stop shop
\`\`\`
Shares named "backup" or "finance" are gold — check permissions.

### LDAP (389/636)

\`\`\`
ldapsearch -x -h 10.0.0.20 -b "dc=domain,dc=local" "objectclass=*"
# Kali has: ldapsearch, ldapenum, ad-enum modules
\`\`\`
Users, groups, service accounts, group policies — AD in a few queries.

### SNMP (161/162)

\`\`\`
snmpwalk -v2c -c public 10.0.0.20 1.3.6.1.2.1
snmp-check 10.0.0.20 -c public
\`\`\`
Default community "public" is an attacker's cheat sheet.

### RPC (111 TCP/UDP, 135 TCP)

\`\`\`
nmap -sV -p 111,135 --script rpcinfo 10.0.0.20
rpcclient -U '' 10.0.0.20 -N           # null session (Windows legacy)
\`\`\`

## Interpret what you find

Every service response has:
- Config evidence (sysdescr, firmware versions)
- Weak auth (anonymous access, default creds)
- Enabled methods (WRITE shares, bind permissions, LDAP modify)

## Documentation discipline

\`\`\`
echo "ENUM: SMB shares for 10.0.0.20" > enum-smb.txt
smbclient -L //10.0.0.20 -N >> enum-smb.txt
\`\`\`
Save everything. Your future self needs this during exploitation and writing the report.
`,
      defaultCode: `# A basic multi-service enumeration sweep (lab target)
echo "=== SMB ===" && nmap -p 445 --script smb-enum-shares 10.0.0.20 -oN smb.txt
echo "=== SNMP ===" && snmp-check 10.0.0.20 -c public -o snmp.txt
echo "=== LDAP ===" && ldapsearch -x -h 10.0.0.20 -b "dc=domain,dc=local" > ldap.txt
echo "Done — check files."; ls *.txt`,
      solution: `echo "=== SMB ===" && nmap -p 445 --script smb-enum-shares 10.0.0.20 -oN smb.txt
echo "=== SNMP ===" && snmp-check 10.0.0.20 -c public -o snmp.txt
echo "=== LDAP ===" && ldapsearch -x -h 10.0.0.20 -b "dc=domain,dc=local" > ldap.txt
echo "Done — check files."; ls *.txt`,
      hint: "Each service leaks data on anonymous access. Enumerating is info, not attack.",
      challenge: `**Home Lab — Enumerate a Vuln Lab:**
1. Run smbclient -L (null session) on Metasploitable 2; list shares.
2. Try snmp-check on a default-config host (enable SNMP for the lab).
3. nmap LDAP scripts against a domain controller in your lab or a public example.
4. For each: write 3 enumerated items and what an attacker would do next.
5. Document: which services should be ACL'd tightly in production and why.`,
    },
    {
      id: 3,
      slug: "03-os-fingerprinting",
      title: "OS Fingerprinting: Passive, Active & TCP/IP Stacks",
      level: "intermediate",
      tag: "lab",
      duration: "35 min",
      description:
        "nmap OS detection, passive fingerprinting (p0f), TCP/IP stack fingerprinting, and the defenses that confuse it.",
      content: `
# OS Fingerprinting: Passive, Active & TCP/IP Stacks

## Active OS detection (nmap)

\`\`\`
sudo nmap -O --osscan-guess 10.0.0.20
\`\`\`
nmap sends unusual probes; the TCP/IP stack's quirks (TTL, window size, IPID, TCP options) are a unique fingerprint.

## Passive fingerprinting (p0f)

\`\`\`
sudo p0f -i eth0
# captures SYN and SYN/ACK to identify remote OS by packet fields
\`\`\`
p0f is invisible — it never sends anything.

## What the fingerprint reveals

| OS | Default TTL | TCP Window | Common quirks |
|----|-------------|------------|---------------|
| Linux | 64 | ~64k, varies | Window = 1460*n |
| Windows | 128 | ~8k–16k | Windows-scaling options differ |
| macOS | 64 | 65k+ | Option order unique |

## Why it matters

- Lateral movement: if you know the target's OS, you pick the right exploit
- Evasion: banners can lie; OS fingerprinting is harder to spoof than a service banner

## Fingerprint confusion / defense

- Host-based firewalls, proxies, and NAT mangle TTLs
- Normalization in IDS can alter observable windows
- False positives: Windows-like fingerprints on a Linux behind certain proxies

> Professional rule: trust service versions + OS fingerprint together, not either in isolation. The service version is your exploitation lead; the OS is your payload selector.
`,
      defaultCode: `# Active OS detection (sudo required)
sudo nmap -O --osscan-guess 10.0.0.20 -oN os.txt
cat os.txt | grep 'Running OS'

# passive (on a Linux host, observe without sending):
# sudo p0f -i eth0
# generate traffic: curl http://10.0.0.20
# p0f should log OS from the host`,
      solution: `sudo nmap -O --osscan-guess 10.0.0.20 -oN os.txt
cat os.txt | grep 'Running OS'
# Then passive: sudo p0f -i eth0 and generate traffic; p0f logs it.`,
      hint: "Active = noisy, passive = invisible. Use both to corroborate.",
      challenge: `**Home Lab — Fingerprint Your Lab:**
1. nmap -O your lab targets; record guessed OS + confidence.
2. Compare across a Linux VM and a Windows VM.
3. (If you have p0f) install and watch — can it guess the OS passively?
4. What network change would break the fingerprint? (Hint: TTL / NAT)
5. Write a paragraph: when does OS fingerprinting disagree with service version? What do you trust more?`,
    },
    {
      id: 4,
      slug: "04-vuln-scan-to-exploit",
      title: "From Vulnerability Scan to Exploit Candidate",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Turn scanner output (OpenVAS/Nessus/nmap NSE) into exploit candidates, rank them by context, and verify reproducibly.",
      content: `
# From Vulnerability Scan to Exploit Candidate

## The workflow

\`\`\`
OpenVAS scan (or Nessus)
  -> extract top CVEs + CVSS
  -> check NSE script vulns to corroborate
  -> searchsploit / exploit-db for each CVE
  -> map to Metasploit if an exploit module exists
  -> record: host, port, service, CVE, exploit path, prereqs
  -> rank: exploitability (know-how) + asset value
\`\`\`

## Reading scanner output critically

- Scanner "High" = numeric CVSS; you must verify actual accessibility and prereqs
- A "critical" network vuln on a host with no exploitable service is "informational" for you
- Stack context matters: old CVEs without public exploit → lower urgency

## Searching for exploits

\`\`\`
searchsploit openssh 7.2
searchsploit apache 2.4.29
# match services + versions to exploits
# read the exploit header in exploit-db for prereqs
\`\`\`

## Verifying in lab

Before writing "exploitable":

1. Attempt the exploit against a **replica** lab target
2. Verify the exact prereq (auth required? DoS only? RCE?)
3. Document the exact commands (or Metasploit module path)
4. Note constraints (ASLR/RELRO/stack canary for binary exploits)

## Triage as a table

\`\`\`
| Host | Port | Service | CVE     | Exploit | Exploitability | Priority |
| 10.0.0.20 | 80 | Apache 2.4.29 | CVE-2018-xxxx | msf module | know-how: Low | P30 |
| 10.0.0.30 | 445 | SMBv1       | CVE-2017-0143 | eternalblue | know-how: High | P0  |
\`\`\`

> A vulnerability without a verified path is a hypothesis. A hypothesis becomes a report finding only when you have a documented repro.
`,
      defaultCode: `// Rank findings by exploitability x value
const findings = [
  { cve:'CVE-2017-0143', host:'10.0.0.30', exploit:true, value:9, exploitability:9 },
  { cve:'CVE-2018-xxxx', host:'10.0.0.20', exploit:true, value:7, exploitability:3 }
];
findings.sort((a,b) => (b.value*b.exploitability)-(a.value*a.exploitability));
console.log('Top finding:', findings[0].cve, findings[0].host);`,
      solution: `const findings = [
  { cve:'CVE-2017-0143', host:'10.0.0.30', exploit:true, value:9, exploitability:9 },
  { cve:'CVE-2018-xxxx', host:'10.0.0.20', exploit:true, value:7, exploitability:3 }
];
findings.sort((a,b) => (b.value*b.exploitability)-(a.value*a.exploitability));
console.log('Top finding:', findings[0].cve, findings[0].host);`,
      hint: "Rank by impact AND exploitability — the attacker's cost to weaponize it.",
      challenge: `**Home Lab — Exploit Triage Table:**
1. Run OpenVAS/Nessus on your lab; pull top 10 CVEs.
2. For each, search exploit-db or Metasploit: is there a public exploit?
3. Build the triage table above; assign Priority (P0/P7/P30/P90).
4. For the #1 finding, attempt or outline the exploitation path in your lab.
5. Write: what stopped you from proving it (if anything) and what you would fix first.`,
    },
    {
      id: 5,
      slug: "05-active-directory-enum",
      title: "Active Directory Enumeration (Without Exploitation)",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Enumerate AD from a domain-joined (or unauthenticated) position: BloodHound, ldapsearch, Kerberos user-enum, GPP/CPassword, and trusts.",
      content: `
# Active Directory Enumeration (Without Exploitation)

## Why AD is the prey

Most enterprise Windows environments = AD. AD is where attacker value lies: users, groups, trusts, Kerberos tickets, group policies. Adversaries take days here — you learn it in a week.

## Unauthenticated enumeration (no creds)

\`\`\`
# nmap LDAP scripts
nmap -p 389,636 --script ldap-search,ldap-rootdse 10.0.0.30

# null session queries (legacy)
ldapsearch -x -h 10.0.0.30 -b "dc=domain,dc=local" "(objectClass=user)" sAMAccountName

# dnsrecon + nslookup against DC
\`\`\`

## Authenticated enumeration (with creds)

\`\`\`
# BloodHound (graph AD paths to 'Domain Admin')
bloodhound-python -u user -p 'pass' -d corp.local -ns 10.0.0.30 -c All
# then visualize the AD graph

# PowerView (PowerShell, but can run from Kali via wine/Invoke)
# but for Kali: ldapsearch with authenticated bind

# kerberos user enum (no creds) -> AS-REP Roast check
kerbrute userenum --dc corp.local -d corp.local users.txt
\`\`\`

## GPP / CPassword / stored creds

- SYSVOL may contain Group Policy Preferences (GPP) with AES-encrypted passwords
- AES key is public (MS14-025)
- Find with: \`find \\\\dc\\sysvol -name Groups.xml -type f\`
- Decrypt with: \`gpp-decrypt <CPassword>\`

## Trusts & lateral paths

\`\`\`
ldapsearch ... "(objectClass=trustedDomain)"   # trust relationships
\`\`\`
A forest trust or domain trust is a privileged pathway — map it.

## Opsec of AD enumeration

- Loud on the DC logs (Event IDs 4624, 4768, 4771...)
- Use a dedicated test lab DC (hyperv-inception or ESXi)
- Never run AD attacks on a real employer's prod DC without written RoE

> Professional AD enumeration = documenting the attack graph before you attack. Maps save time and provide evidence.
`,
      defaultCode: `# LDAP root DSE for basic domain info (may work unauthenticated)
ldapsearch -x -h 10.0.0.30 -b "" -s base "(objectclass=*)"

# search for user objects
ldapsearch -x -h 10.0.0.30 -b "dc=corp,dc=local" "(objectClass=user)" sAMAccountName

# Kerberos user enum with a wordlist
kerbrute userenum --dc corp.local -d corp.local /usr/share/wordlists/usernames.txt`,
      solution: `ldapsearch -x -h 10.0.0.30 -b "" -s base "(objectclass=*)"
ldapsearch -x -h 10.0.0.30 -b "dc=corp,dc=local" "(objectClass=user)" sAMAccountName
kerbrute userenum --dc corp.local -d corp.local /usr/share/wordlists/usernames.txt`,
      hint: "AD data lives in LDAP. Enumerate quietly, build the map.",
      challenge: `**Home Lab — Build an AD Map:**
1. Deploy a lab DC (Windows Server trial or a Cloud option).
2. Unauthenticated: ldapsearch root DSE and list domain info.
3. Authenticated: BloodHound-python (or SharpHound) and map 1 attack path to Domain Admin.
4. Check SYSVOL for any GPP CPassword artifacts.
5. Draw the trust and path diagram you found.`,
    },
  ],
};