import type { Module } from "../curriculum";

export const module10: Module = {
  id: "module-10",
  slug: "10-penetration-testing",
  title: "Penetration Testing & Ethical Hacking",
  description:
    "The full pentest methodology: recon, scanning, exploitation, post-exploitation, and responsible reporting.",
  language: "Offensive Security",
  lessons: [
    {
      id: 1,
      slug: "01-pentest-methodology",
      title: "Pentesting Methodology & Rules of Engagement",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "The phases of a pentest, scope, rules of engagement, and the ethics that separate professionals from criminals.",
      content: `
# Pentesting Methodology & Rules of Engagement

## Why Pentesting Exists

You find the holes *before* the criminals do. A pentest is an **authorized**, scoped simulation of an attack, with a professional report.

## The Standard Methodology (PTES/OWASP)

1. **Pre-engagement** â€” scope, permissions, rules of engagement (RoE)
2. **Reconnaissance** â€” passive (OSINT) then active (scanning)
3. **Scanning/Enumeration** â€” ports, services, vulnerabilities
4. **Exploitation** â€” gain access
5. **Post-exploitation** â€” pivot, escalate, collect proof
6. **Reporting** â€” findings, risk, recommended fixes

## Rules of Engagement (THE LEGAL BOUNDARY)

Before ANY test, written agreement must cover:

- **Scope** â€” WHICH systems (by IP/range/domain), and EXCLUDES (e.g., "not the patient database")
- **Authorized test types** â€” network, web, social engineering, physical?
- **Hours** â€” test only during X
- **Impact limits** â€” "do not deliberately crash the production ERP"
- **Emergency contacts** â€” if you find something live and bad
- **Handling of findings** â€” disclosure, PII handling
- **Legal guardrails** â€” signed contract = your permission slip

> **Bright-line rule:** without written authorization, it's a crime. Period. "Hack-back" is also illegal. Permission is the whole difference between a pentester and a criminal.

## The Reporting Discipline

A pentest is judged by its REPORT, not by the hacks:

Components:
1. **Executive summary** â€” what did we find, how bad, in business terms
2. **Technical findings** â€” each: asset, vuln, CVE, CVSS, reproduction steps, screenshots
3. **Risk ratings** â€” Critical/High/Medium/Low by likelihood Ã— impact
4. **Remediation guidance** â€” prioritized fixes
5. **Appendices** â€” tools, raw data

**The retest** â€” after fixes, re-run to confirm closure. That's the value loop.

## The Ethics Rules

1. Written authorization â€” always
2. Least-impact testing â€” don't blow up production
3. Protect data â€” never exfiltrate real PII; mask it
4. Report to the RIGHT people â€” no public proof-of-hack theater
5. Hand over everything to the client, no retention

> **Your career dies in one day on a criminal act.** Reputation + a clean legal record is everything in offensive security.
`,
      defaultCode: `// Build a RoE checklist (use at every engagement start)
const roe = {
  scopeIps: "10.10.10.0/24, 172.16.5.0/28",
  exclusions: ["10.10.10.99 (prod DB)", "*.erp.example"],
  windows: "09:00-18:00 Mon-Fri",
  allowedTests: ["network", "webapp"],
  noDoS: true,
  emergencyContact: "CISO 555-0100",
  reportDeadline: "2026-03-01",
  signedBy: "Client legal + lead pentester",
};
console.log("RoE locked:", Object.keys(roe).every(k => roe[k] !== undefined && roe[k] !== ""));`,
  solution: `The checklist verifies every engagement has a documented, agreed boundary. Never start without it.`,
  hint: "No RoE signed? No engagement. It's the #1 professional rule.",
  challenge: `**Home Lab â€” Write a RoE for Yourself:**
1. Write a 1-page RoE for testing YOUR OWN lab VMs (scope you'll test today, methods, hours, no-DoS, contacts).
2. List 3 examples of what's IN scope and 3 that are OUT (and why).
3. Practice writing a pentest finding: pick any issue (e.g., open SSH with password auth), and write: title, severity, description, evidence, remediation.
4. Read 2 public pentest report examples (SANS or a communications company template) â€” borrow their structure.
5. Print your RoE and stick it to the lab wall. Professional habit.`,
    },
    {
      id: 2,
      slug: "02-reconnaissance-osint",
      title: "Reconnaissance & OSINT",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description: "Passive intel gathering: DNS, WHOIS, search techniques, GitHub history, and how attackers map a target blind.",
      content: `
# Reconnaissance & OSINT

## Passive vs Active Recon

- **Passive** â€” collect info WITHOUT touching the target (never triggers alerts): WHOIS, DNS, search engines, GitHub, public records
- **Active** â€” touch the target: port scans, HTTP requests, banners

Always start passive.

## The OSINT Toolkit

\`\`\`bash
# WHOIS â€” who owns the domain, when registered
whois example.com

# DNS enumeration
dig example.com any
dig example.com txt   # SPF/DKIM (authentication posture!)
dig -x 8.8.8.8        # reverse lookup

# Subdomain brute-force (with wordlist)
# subfinder -d example.com
# amass enum -d example.com
\`\`\`

## Search-Engine OSINT (Google Dorks)

Google dorks find exposed files and web pages:

\`\`\`
site:example.com filetype:pdf
site:example.com intitle:"index of"    # open directory listings
site:example.com inurl:admin
site:example.com "password" "config"
\`\`\`

## GitHub & Code OSINT

- Search public repos: \`api. / key. / token / secret\`
- **Git history** contains old secrets â€” \`git log\`, or grep the clone for leaked keys
- Employee GitHub = org tech stack hints

> Sinai example: the Uber 2016 breach â€” an employee's converged GitHub commit with an AWS key.

## Metadata & Shodan

- **Exif** in photos (location, device)
- **Shodan** â€” searchable index of exposed services on the internet ("camera with default login on port 21")
- Scans: 0.0.0.0/0; queries by service/server type

## Social & Human OSINT

- LinkedIn â†’ employees, roles, org chart
- Job listings â†’ tech stack (which software/certs) â†’ vulnerability targeting
- Breach dumps â†’ reused passwords (correlate with the target's domains)
- Social media â†’ phishing personas (module 09)

## Document Everything

OSINT is a **dossier-building** exercise. Analysts and pentesters keep the findings structured:
- Domains & IPs
- Services & version (â†’ CVEs)
- Known accounts
- Leaked credentials (scope-specific)
- People, org, tech stack draws

> **Ethics:** OSINT on a target is legal *passive* research â€” as long as you don't touch systems without authorization and you stay within friendly engagements. Never cross into active probing without scope.
`,
      defaultCode: `#!/bin/bash
# Passive recon starter (scope-only; run on YOUR OWN domain)
DOMAIN="example.com"
echo "== WHOIS =="; whois \$DOMAIN 2>/dev/null | grep -iE "registrant|creation|expiration" | head -5
echo "== DNS A =="; dig +short A \$DOMAIN
echo "== DNS MX =="; dig +short MX \$DOMAIN
echo "== DNS TXT (SPF/DKIM/DMARC) =="; dig +short TXT \$DOMAIN
echo "== subdomains (if subfinder installed) =="; subfinder -d \$DOMAIN -silent 2>/dev/null | head -20`,
  solution: `Runs passive WHOIS + DNS enumeration on your own domain â€” education for understanding attackers, and a recon starter.`,
  hint: "Exchange example.com for YOUR domain in scope.",
  challenge: `**Home Lab â€” OSINT Dossier on Yourself:**
1. Run the recon script on YOUR OWN domain/name (or \`example.com\`).
2. Google-dork your own name/company â€” what's publicly exposed? Is any of it embarrassing or exploitable?
3. Check your GitHub history for accidentally committed secrets (search \`token\`, \`key\`, \`password\`).
4. Write a dossier: your "attack surface" from a stranger's perspective.
5. Remediate ONE leak you found (rotate a key, remove a file). This is the practice before you ever do it professionally.`,
    },
    {
      id: 3,
      slug: "03-scanning-vulnerability",
      title: "Scanning & Vulnerability Discovery",
      level: "intermediate",
      tag: "lab",
      duration: "55 min",
      description: "Nmap mastery, service enumeration, CVSS scoring, and vulnerability scanning with Nessus/OpenVAS.",
      content: `
# Scanning & Vulnerability Discovery

## Nmap: The Scanner You'll Never Stop Using

\`\`\`bash
# Host discovery
nmap -sn 10.0.0.0/24          # ping sweep
# Port scanning
nmap -sS 10.0.0.5              # TCP SYN (stealth)
nmap -sT 10.0.0.5              # TCP connect
nmap -sU --top-ports 100 10.0.0.5   # UDP
nmap -p- 10.0.0.5              # ALL ports
# Service + version + OS
nmap -sV -O -p 22,80,443 10.0.0.5
# Script (NSE) â€” tons of detections
nmap --script default,http-enum,smb-vuln* 10.0.0.5
# Timing: -T4 aggressive
# Output: -oA out â†’ all formats
\`\`\`

Read the output:
- \`open\` â€” responded, service listening
- \`filtered\` â€” firewall dropped
- \`closed\` â€” reached, nothing there
- Service/version â†’ search exploits (\`searchsploit <service> <version>\`)

## From Open Ports to Vulnerability

Open port â†’ service + version â†’ CVE search:

\`\`\`bash
# Identify the exact version to target
# e.g., Apache httpd 2.4.49 â†’ CVE-2021-41773 path traversal!
nmap -sV -p 80 10.0.0.5
searchsploit "apache 2.4.49"
\`\`\`

## CVSS Scoring (Read It Right)

CVSS 3.x = 0-10 score + vector:
- **Base** â€” intrinsic (attack vector, complexity, privileges, user interaction)
- **Temporal** â€” availability of exploit, patches
- **Environmental** â€” your specific setup (damage to YOUR assets)

> CVSS â‰  risk. A CVSS 7 on an edge box exposed to the internet is riskier than the same 7 on an internal test server you're about to patch. Context, context, context.

## Vulnerability Scanners: Nessus / OpenVAS

\`\`\`bash
# OpenVAS (open-source) workflow:
# 1. Create target  â†’  2. Create scan config â†’ 3. Launch â†’ 4. Review results
# Nessus (commercial) similar, web GUI
\`\`\`

**How they work:**
- Port scan first
- Version fingerprint
- Match against a plugin database (CVEs)
- Return: plugins, CVEs, CVSS, suggested fixes

**Limits:** scanners produce *potential* vulns; they need verification (module follows). They find low-hanging fruit, not architecture flaws, and can false-positive badly.

## The Vulnerability Management Loop

1. **Discover** (scan, agent)
2. **Assess** (verify, prioritize)
3. **Remediate** (patch, config, mitigation)
4. **Re-verify** (rescan)
5. **Report** (trend to execs)

> This loop runs weekly in every SOC/security team. You'll live it.
`,
      defaultCode: `#!/bin/bash
# Lab-only: scan your OWN target and map to CVEs
echo "== scan =="
nmap -sS -sV -p 22,80,443,445,3389 10.0.0.5 -oA labscan
echo "== expressed ports/services =="
grep -E "open|filtered" labscan.nmap
# How to search CVEs from the version strings above:
#   searchsploit <service> <version>
echo "Then: searchsploit <service> <version>"`,
  solution: `Scans your lab target, records to files, and reminds you to search CVEs for each service version.`,
  hint: "For each OPEN port, grab the version, then searchsploit/CVE search.",
  challenge: `**Home Lab â€” Scan & Score Your Lab:**
1. Boot your Ubuntu target. Run the scan above.
2. Identify 2-3 open services. For each, searchsploit (or CVE database search) for known CVEs.
3. Assign CVSS base scores â€” which is worst?
4. Now run vulnerability scanner OpenVAS against the same target â€” compare its findings to your manual ones.
5. Write the "vulnerability assessment summary": hosts, services, CVEs, CVSS, priority.`,
    },
    {
      id: 4,
      slug: "04-exploitation-metasploit",
      title: "Exploitation with Metasploit",
      level: "intermediate",
      tag: "lab",
      duration: "60 min",
      description: "Metasploit architecture, remote & local exploits, and payloads â€” with strict lab only discipline.",
      content: `
# Exploitation with Metasploit

## What Metasploit Does

Framework of exploit modules + payloads + auxiliary tools. You use it for many things:
- Launch an exploit against an unpatched service
- Deliver a payload (reverse shell)
- Post-exploitation: elevate, collect, pivot

## Core Terms

- **Exploit** â€” the code that triggers the vuln (e.g., \`exploit/multi/http/apache_mod_php\`)
- **Payload** â€” what runs after (e.g., \`reverse_tcp\` shell)
- **Reverse shell** â€” target connects BACK to you (works through firewalls)
- **Bind shell** â€” target opens a port you connect to (often blocked)
- **RHOSTS/LHOST/LPORT** â€” remote target / your listener

## Quick Workflow: Remote Exploit

\`\`\`bash
msfconsole

search vsftpd
use exploit/unix/ftp/vsftpd_234_backdoor   # classic example
set RHOSTS 10.0.0.5
run
# â†’ meterpreter session (a powerful shell)
\`\`\`

## Post-Exploitation (Meterpreter)

\`\`\`bash
sysinfo         # target info
getuid          # who am I?
shell           # OS shell
uploads/ download
run post/multi/recon/local_exploit_suggester   # check for privesc
migrate <pid>   # hide inside a process
background      # keep the session alive
\`\`\`

**Key discipline:** after landing, the chain = privilege escalate â†’ persist â†’ pivot â†’ collect â†’ report. Never actually do damage; prove the path, then document.

## The Exploit Process (Retell the Steps)

1. **Version identified** (from scan)
2. **Search** matching module (\`search <version>\`)
3. **Set options** (RHOSTS, payload, LHOST)
4. **Run** â†’ shell
5. **Verify** â€” that's the pentest deliverable: reproducible step-by-step "here's HOW I got in"

## Two-Sided Discipline: Defenders Read This Too

Every Metasploit module = a detection opportunity:

| Attack | Detection |
|--------|-----------|
| Reverse shell on odd port | EDR + netflow outbound anomaly |
| Meterpreter process injection | process anomaly (psexec, rundll32 child) |
| vfstpd backdoor | odd traffic on 21 |
| MS17-010 EternalBlue | SMB exploit signatures |

> **Red team + blue team are two sides of the same coin.** The best defenders can articulate the attack they're catching. Running the lab yourself makes you a better analyst.
`,
      defaultCode: `# msfconsole session starter (LAB ONLY â€” your own VM!)
msfconsole -q
# search <vuln-name>          â†’ find modules
# use <module>                 â†’ load it
# show options                 â†’ what to set
# set RHOSTS <lab-target-ip>   â†’ who to attack
# set LHOST <your-ip>          â†’ where the shell connects back
# run                          â†’ GO (authorized lab target only)`,
  solution: `The standard msfconsole flow. Only against your own lab target â€” anything else is a crime.`,
  hint: "Check LHOST/IP carefully â€” a wrong RHOSTS is an attack on the wrong box.",
  challenge: `**Home Lab â€” Metasploit Workflow:**
1. Boot a VULNERABLE lab target (TryHackMe 'Blue' or a manually-aged service like vsftpd 2.3.4 / MS17-010).
2. Run the assumption: port scan â†’ version â†’ search â†’ exploit â†’ shell.
3. From meterpreter: sysinfo, getuid, local_exploit_suggester.
4. TRY to escalate to root (lab!). Document the path.
5. Write the exploit into a pentest-format finding with evidence & remediation. Revert your target.`,
    },
  ],
};