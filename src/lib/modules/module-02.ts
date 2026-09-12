import type { Module } from "../curriculum";

export const module02: Module = {
  id: "module-02",
  slug: "02-networking-protocols",
  title: "Networking & Protocols",
  description:
    "TCP/IP, DNS, HTTP, routing, and the protocol stack — the language every attack and defense speaks across the wire.",
  language: "Networking",
  lessons: [
    {
      id: 1,
      slug: "01-osi-model",
      title: "The OSI Model & TCP/IP Stack",
      level: "beginner",
      tag: "concept",
      duration: "25 min",
      description:
        "The seven conceptual layers of networking and how they map to the real TCP/IP stack.",
      content: `
# The OSI Model & TCP/IP Stack

## The 7-Layer Model

| Layer | Name | Unit | Example Devices/Protocols |
|-------|------|------|---------------------------|
| 7 | Application | Data | HTTP, DNS, SMTP |
| 6 | Presentation | Data | TLS handshake, JPEG, SSL |
| 5 | Session | Data | NetBIOS, RPC |
| 4 | Transport | Segment | TCP, UDP |
| 3 | Network | Packet | IP, ICMP, routing |
| 2 | Data Link | Frame | Ethernet, 802.11 (Wi-Fi) |
| 1 | Physical | Bits | Cables, radio signals |

## You Don't Need to Memorize the Layers — You Need to THINK in Layers

Most security problems are layer confusion:

- **Phishing** is layer 7 (it attacks the human)
- **ARP spoofing** is layer 2 (forged MAC mapping)
- **IP spoofing** is layer 3 (forged source IP)
- **SYN flood** is layer 4 (TCP handshake abuse)
- **Route injection** is layer 3 (BGP)

## TCP/IP: The Real Stack

The OSI model is theory. The internet runs on TCP/IP — essentially 4 layers:

| TCP/IP Layer | Maps To | Key Protocols |
|--------------|---------|---------------|
| Application | L5-7 | HTTP, HTTPS, DNS, SMTP, FTP, SSH |
| Transport | L4 | TCP, UDP |
| Internet | L3 | IP, ICMP, ARP |
| Link | L1-2 | Ethernet, Wi-Fi |

## Encapsulation: The Onion

Each layer wraps the one above:

\`\`\`
[Ethernet | IP | TCP | HTTP | DATA | TCP chk | IP chk | FCS]
                                      ↑
                            the payload being protected
\`\`\`

An attacker on your Wi-Fi sees the **Ethernet frame** (L2). An attacker across the internet sees the **IP packet** (L3) with source/destination IPs. An attacker on the same LAN as the target sees everything up to the application data — unless it's encrypted.

> The whole reason HTTPS exists (TLS at the presentation layer) is that IP, TCP, routing, and the physical wire are all visible to middle devices. Without TLS, all of that exposed metadata includes your passwords.
`,
      defaultCode: `// Visualize layers with Python (conceptual)
layers = [
    ('7', 'Application', 'HTTP, DNS'),
    ('4', 'Transport', 'TCP, UDP'),
    ('3', 'Network', 'IP'),
    ('2', 'Data link', 'MAC, Ethernet'),
]
for num, name, proto in layers:
    print(f"L{num} {name}: {proto}")`,
      solution: `for num, name, proto in layers:
    print(f"L{num} {name}: {proto}")`,
      hint: "Think of each layer wrapping the one above it (encapsulation).",
      challenge: `**Home Lab — Watch Layers on the Wire:**
1. Install \`wireshark\` on your lab VM.
2. \`ping 8.8.8.8\` while capturing on the default interface.
3. In Wireshark, filter \`icmp\`. Expand the packet: Ethernet (L2), IP (L3), ICMP (L3 control).
4. Now browse a website with capture on. Filter \`http\`. What do you observe about L7 data?
5. Filter \`tls\`. Note that L7 is encrypted in TLS — but you can still see L3/L4 metadata (IPs, ports).`,
    },
    {
      id: 2,
      slug: "02-tcp-udp-details",
      title: "TCP, UDP & Ports in Depth",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "The three-way handshake, sequence numbers, UDP vs TCP, and the port numbers scanners and firewalls obsess over.",
      content: `
# TCP, UDP & Ports in Depth

## TCP Provides Order and Reliability

TCP (Transmission Control Protocol) is a reliable, ordered, byte-stream protocol built on IP. Key features:

- **3-way handshake**: SYN → SYN-ACK → ACK
- **Sequence numbers**: keep segments ordered
- **ACKs & retransmission**: guarantee delivery
- **Flow control**: window sizing
- **Congestion control**: slow start, avoid collapse

## The Three-Way Handshake

\`\`\`
Client                    Server
  |---- SYN (seq=100) ------->|
  |<-- SYN-ACK (seq=500, ack=101) ---|
  |---- ACK (seq=101, ack=501) -->|
  |          CONNECTED           |
\`\`\`
SYN → SYN-ACK → ACK. An attacker who can spoof this can hijack the connection — which requires predicting sequence numbers.

## TCP Attacks

| Attack | Mechanism |
|--------|-----------|
| SYN flood | Send endless SYNs, never ACK → server memory exhausted (half-open) |
| Sequence prediction | Guess ACK sequence to inject data |
| Session hijacking | Steal a valid session via sniffing |
| FIN/RST injection | Resent reset to kill connections |
| TCP port scan | Try to complete handshakes on each port |

## UDP: Fire and Forget

UDP has no handshake, no ordering, no reliability. Faster, but:
- No connection state (spoofing trivial)
- No delivery guarantee
- Used by: DNS, NTP, DHCP, DHCPv6, QUIC/HTTP3, some video

> **UDP spoofing** is trivial because there's no handshake to complete. An attacker forges a source IP, sends a request to an amplifier (e.g., a large DNS response), and the amplified response floods the victim — this is how **DNS amplification DDoS** works.

## Ports: The Doors

A port is a 16-bit number (0-65535) identifying an application on a host. Common ones you MUST know:

| Port | Service | Possible Attack |
|------|---------|-----------------|
| 22 | SSH | brute force, OpenSSH bugs |
| 80 | HTTP | web attacks |
| 443 | HTTPS | web attacks (TLS too) |
| 445 | SMB | EternalBlue/WannaCry |
| 3389 | RDP | brute force (FlawedAmmyy) |
| 53 | DNS | cache poisoning, reflection |
| 21 | FTP | cleartext creds |
| 1433 | MSSQL | brute force |

## Port Scanning Fundamentals

- **Open** — port responded (reachable, service present)
- **Closed** — reached but nothing listening (RST)
- **Filtered** — packet dropped (firewall)

Scanners (Nmap) send probes and read the verdicts. The scan type (SYN, connect, ACK, FIN, UDP) changes which firewall behavior you can detect.
`,
      defaultCode: `# Nmap: find open ports on 10.0.0.50
# nmap -sS -p- 10.0.0.50   (full TCP SYN scan)
# nmap -sU -p 53,123 10.0.0.50  (UDP top ports)
echo "Scan responsibly — only on your own lab."`,
      solution: `\`nmap -sS -p- target\` will enumerate every open TCP port. \`-sU\` for UDP. Always scan only authorized targets.`,
      hint: "-sS sends SYNs without completing handshakes — stealthier than connect scan.",
      challenge: `**Home Lab — Scan Your Own Lab:**
1. In your VirtualBox lab, boot your Ubuntu target VM.
2. Install nmap on Kali. Scan your target: \`nmap -sS -O <target-ip>\`.
3. Install a server (\`sudo apt install openssh-server nginx\`) and rescan. Note ports 22 and 80 now open.
4. Try \`nmap -sU <target-ip>\` — what's the difference in scan behavior/speed?
5. Document: which ports are "expected" and which would raise red flags if exposed on a public machine?`,
    },
    {
      id: 3,
      slug: "03-ip-addressing-subnetting",
      title: "IP Addressing, Subnetting & Routing",
      level: "beginner",
      tag: "concept",
      duration: "35 min",
      description:
        "IPv4/IPv6 address math, CIDR, subnet masks, and how routers really move packets between networks.",
      content: `
# IP Addressing, Subnetting & Routing

## IPv4 Addresses

An IPv4 address is 32 bits, written as four octets: \`192.168.1.100\`.

| Component | Meaning |
|-----------|---------|
| Network bits | Identify the network |
| Host bits | Identify the machine on that network |
| Subnet mask | Divides the two (e.g., /24 = 255.255.255.0) |

## CIDR Notation

- \`10.0.0.0/8\` → 16.7M addresses (large)
- \`172.16.0.0/12\` → ~1M addresses
- \`192.168.0.0/16\` → 65,536 addresses (typical home)
- \`/24\` → 256 addresses (common LAN)

The /N means N bits are "network". The rest are "host".

## Subnetting Math Rules

With /N mask: 2^(32-N) addresses per subnet. The first is the network, the last is broadcast. Usable hosts = 2^(32-N) - 2.

Example: \`192.168.1.0/24\`
- Network: 192.168.1.0
- Broadcast: 192.168.1.255
- Usable: 192.168.1.1 – 192.168.1.254

> **Security use:** subnetting/Segmentation is a core defense — you use CIDR to carve the network into zones (IoT /16, staff /24, servers /27). The subnet mask is literally your compartmentalization.

## Public vs Private & NAT

Private ranges (RFC 1918) are not routable on the internet:
- 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16

**NAT** (Network Address Translation) lets many private hosts share one public IP. The router rewrites the source IP on outbound packets and remembers the mapping (the "connection table") to route replies back.

> NAT provides a form of *obscurity* but not real security — and attackers behind NAT still get attacked. Also: NAT tables are a DoS target (entries can be exhausted).

## How Routing Works

Each router:
1. Receives a packet
2. Looks at destination IP
3. Consults its **routing table** (destination → interface/next-hop)
4. Forwards to the next hop
5. Decrements TTL (prevents infinite loops)

**Routing tables can be attacked:** route hijacking (BGP), on-path attacks, malicious default routes. A compromised router = everything routed through it is compromised.

## IPv6 Essentials

IPv6 uses 128-bit addresses (8 groups of 4 hex digits). Notable:
- Huge address space (no NAT needed typically)
- SLAAC for autoconfiguration
- Stateless address autoconfiguration → devices auto-appear on networks
> **IPv6 is often forgotten in security policies.** Attackers frequently use IPv6 tunnels to bypass IPv4-only firewalls. If you block \`::\` but allow \`0.0.0.0/0\`, attackers can tunnel out.
`,
      defaultCode: `// Simple subnet calculation (Python)
import ipaddress
net = ipaddress.ip_network('192.168.1.0/24')
print(net.network_address, net.broadcast_address)
print(len(list(net.hosts())), 'usable hosts')`,
      solution: `import ipaddress
net = ipaddress.ip_network('192.168.1.0/24')
print(net.network_address, net.broadcast_address)
print(len(list(net.hosts())), 'usable hosts')`,
      hint: "The ipaddress library does subnet math for you.",
      challenge: `**Home Lab — Map & Plan Your Subnet:**
1. Run \`ipconfig\`/\`ip addr\` — record your IP and netmask, compute the /N.
2. Scan \`nmap -sn 192.168.x.0/24\` (your subnet) to enumerate live hosts.
3. Answer: how many usable host addresses does your subnet have?
4. Plan a segmentation redesign of your home network: write down the /24 subnets you'd assign to (a) main LAN, (b) guest Wi-Fi, (c) IoT VLAN, (d) servers.
5. What would you put in each zone, and what traffic should be BLOCKED between them?`,
    },
    {
      id: 4,
      slug: "04-dns-depth",
      title: "DNS in Depth & DNS Attacks",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "Hierarchy, resolution process, record types, and the attacks that use DNS as a weapon or a covert channel.",
      content: `
# DNS in Depth & DNS Attacks

## What DNS Does

DNS maps human names (\`example.com\`) to IP addresses. It's the phone book of the internet — and one of the most attacked services.

## The Resolution Chain

\`\`\`
Browser → Local resolver → Root server (. ) → TLD server (.com) → Authoritative server (example.com)
\`\`\`

1. **Local resolver** (your router/ISP/DoH) asks about example.com
2. **Root servers** point to .com TLD
3. **TLD servers** point to the authoritative server
4. **Authoritative server** answers: "example.com = 93.184.216.34"

## Record Types

| Type | Meaning |
|------|---------|
| A | IPv4 address |
| AAAA | IPv6 address |
| CNAME | Canonical (alias) name |
| MX | Mail exchange server |
| NS | Name server |
| TXT | Arbitrary text (SPF, DKIM) |
| PTR | Reverse (IP → name) |

## DNS Attacks

### Cache Poisoning
The attacker injects a forged answer into a resolver's cache, sending victims to the attacker's server. Patch era: ID randomization + DNSSEC defend against this.

### DNS Tunneling
Data encoded inside DNS queries/responses — a stealthy **covert channel**. Example:

- \`secret1.attacker.com\` query encodes "secret1"
- The response dumps data back

Defenders must detect: suspicious domain patterns, excessive DNS traffic, unusual record types (\`TXT\`/large), high query volume without web use.

### DNS as Data Exfil / C2 Channel
Malware uses DNS to:
- Beacon ("I'm alive, here's my ID") in subdomains
- Exfiltrate secrets (encode stolen data in hostname prefix)
- Exfiltrate in TXT records encoded in hex/base64

> Detection playbooks look for: high DNS volume, long random-looking prefixes (\`.ªbleu.xyz\` 60+ chars), low TTL domains used for C2.

## Defense: DNSSEC & DNS Over HTTPS

- **DNSSEC** — digitally signs DNS records so resolvers can verify authenticity
- **DNS over HTTPS (DoH) / DNS over TLS (DoT)** — encrypts queries so ISPs/attackers can't see or tamper
- **Sinkholing** — redirect malicious domains to a collector (used by blue teams & takedown operations)
- **Blocklists** — deny known-malicious domains at the resolver
`,
      defaultCode: `# Dig: query a domain and inspect records
# dig example.com A          # IPv4
# dig example.com ANY        # all records (careful)
# dig example.com MX         # mail servers
# nslookup -type=TXT example.com
echo "Master dig/nslookup — the DNS toolkit."`,
      solution: `dig +short example.com A → the IP. \`dig example.com ANY\` shows all records. \`nslookup -type=TXT\` for TXT (SPF/DKIM).`,
      hint: "-x does reverse lookup: dig -x 8.8.8.8.",
      challenge: `**Home Lab — Be a DNS Detector:**
1. Run \`nslookup example.com\` and \`dig example.com ANY\`. List the A, AAAA, MX, TXT records.
2. Look up a random long subdomain: \`dig verylongrandomname.example.com\`. What returns?
3. Capture DNS traffic with Wireshark (\`filter dns\`), browse a site, and observe queries.
4. Set your lab's DNS to 1.1.1.1 (Cloudflare) or a DoH resolver. Note any speed/behavior difference.
5. Write one paragraph: how could you detect DNS tunneling on your home network just from the resolver's query log?`,
    },
    {
      id: 5,
      slug: "05-http-https-in-depth",
      title: "HTTP, HTTPS & TLS Deep Dive",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Request/response model, headers, methods, cookies, and the TLS handshake that makes HTTPS work.",
      content: `
# HTTP, HTTPS & TLS Deep Dive

## HTTP Fundamentals

HTTP is a request/response text protocol on top of TCP (or QUIC).

**Request:**
\`\`\`
GET /login HTTP/1.1
Host: example.com
User-Agent: curl/8.0
Cookie: session=abc123
\`\`\`

**Response:**
\`\`\`
HTTP/1.1 200 OK
Content-Type: text/html
Set-Cookie: session=def456; HttpOnly; Secure
\`\`\`

## Methods & Status Codes You MUST Know

| Method | Purpose | Dangerous? |
|--------|---------|-----------|
| GET | Retrieve | Safe-ish (but leaks data in URL) |
| POST | Create/submit | Often CSRF target |
| PUT | Replace | Unsafe (IDOR) |
| DELETE | Remove | Unsafe |
| OPTIONS | Explore allowed | Recon |
| HEAD | Headers only | Recon |

| Code | Meaning |
|------|---------|
| 200 | OK |
| 301/302 | Redirect |
| 401/403 | Auth / Forbidden |
| 404 | Not found |
| 500/502/503 | Server errors |

## Headers That Matter for Security

- \`Content-Security-Policy\` (CSP) — blocks XSS
- \`Strict-Transport-Security\` (HSTS) — force HTTPS
- \`X-Content-Type-Options: nosniff\` — stop MIME sniffing
- \`Set-Cookie: HttpOnly; Secure; SameSite\` — hardens cookies
- \`Referrer-Policy\` — stop referrer leakage

## Cookies

Cookies are the session token's vehicle. Attack surface:
- **Session fixation** — force a known session ID
- **Cookie theft** — via XSS (unless HttpOnly)
- **CSRF** — site A makes your browser send an authenticated request to site B

> **HttpOnly** prevents JavaScript reading the cookie and thus blocks the most common XSS→cookie theft chain.

## TLS: The Handshake

The HTTPS magic. Simplified handshake:

1. Client → Server: "ClientHello" (TLS version, cipher suites)
2. Server → Client: "ServerHello", certificate (with public key), cipher choice
3. Client verifies certificate (trust chain, hostname, not expired)
4. Client → Server: key exchange (e.g., ECDHE), "Finished"
5. Server: "Finished"
6. **Encrypted application data flows**

Forward secrecy (ECDHE) means each session uses a fresh ephemeral key — even if the server's long-term key leaks later, past sessions stay secret.

> TLS attacks to know: **downgrade** (force older protocol), **MITM with fake cert** (unless cert validation is strong), **heartbleed** (CVE-2014-0160 — memory leak via extension), **CRIME/BREACH** (compression side channels).
`,
      defaultCode: `# Inspect HTTPS with curl
# curl -v https://example.com        (verbose headers)
# curl -I https://example.com        (headers only)
# openssl s_client -connect example.com:443 -servername example.com
echo "These commands reveal TLS certs, ciphers, headers."`,
      solution: `curl -v shows full TLS + HTTP handshake. openssl s_client reveals certificate chain and cipher suite.`,
      hint: "openssl s_client is the low-level way to inspect TLS.",
      challenge: `**Home Lab — Probe a Website's Security Posture:**
1. \`curl -s -I https://example.com\` — list all security headers. Which are missing? Which should be added?
2. \`openssl s_client -connect example.com:443 -servername example.com </dev/null | openssl x509 -noout -issuer -dates\` — who issues the cert, when does it expire?
3. Try a plain \`curl http://example.com\` — does it redirect to HTTPS? Does it set HSTS?
4. Use Wireshark to capture one HTTPS session; filter \`tls.handshake\`. Count the ClientHello/ServerHello packets.
5. Score 3 websites against the OWASP Secure Headers Project checklist.`,
    },
    {
      id: 6,
      slug: "06-wireshark-packet-analysis",
      title: "Wireshark & Packet Analysis",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Capture, filter, decode and analyze network traffic — the #1 skill for every SOC analyst and incident responder.",
      content: `
# Wireshark & Packet Analysis

## Why Packet Analysis

The network is the attacker's narrative. Traffic analysis shows you:
- What services are talking
- Whether encryption is used
- Whether data exfiltration is happening
- Malware C2 beacons, DNS tunneling, brute force, scans

## Capture Concepts

Wireshark captures frames on an interface. Capture in **promiscuous mode** to see all traffic on the wire — but on switched networks you typically only see your own (or mirrored) traffic.

Capture files: **PCAP** (\`.pcap\`, \`.pcapng\`). Investigators analyze PCAPs that were captured by sensors, not by themselves — that's true network forensic work.

## Essential Filters

| Filter | Shows |
|--------|-------|
| \`ip.addr == 192.168.1.50\` | Traffic to/from an IP |
| \`tcp.port == 80\` | HTTP-only traffic |
| \`http.request\` | HTTP GET/POST requests |
| \`dns\` | DNS queries |
| \`tcp.flags.syn == 1\` | SYN packets (scans!) |
| \`ftp-data\` | FTP file transfers |
| \`icmp\` | Pings |
| \`frame contains "password"\` | Raw payload search |

## Following TCP Streams

Right-click a packet → **Follow → TCP Stream**. Wireshark reassembles the conversation — you can read the entire HTTP request/response including credentials in cleartext if not TLS-encrypted.

> This is how MFAs get bypassed in labs and how SOC analysts confirm data exfiltration.

## Analyzing Captures for Attacks

**Scan detection:** Many SYN packets without SYN-ACK replies → a scan.
Filter: \`tcp.flags.syn == 1 and tcp.flags.ack == 0\`

**Brute force:** Repeated 401 Unauthorized responses or repeated failed logins → dictionary attack.

**C2 beaconing:** Regular-interval packets to the same IP (e.g., every 60s) of the same size.

**Data exfil:** Large outbound transfers on unusual ports, base64-looking payloads.

## Practical Triage Workflow

1. **Statistics → Endpoints** — who's talking?
2. **Statistics → Conversations** — main volume pairs
3. **Protocol Hierarchy** — what protocols, in what volume?
4. Filter on anomalies → Follow streams → Document
`,
      defaultCode: `# tshark (Wireshark CLI) quick wins
# tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.uri
# tshark -r capture.pcap -c 100            # first 100 packets
# tshark -r capture.pcap -Y "tcp.flags.syn==1 and tcp.flags.ack==0"
echo "tshark = the same engine as Wireshark, in the terminal."`,
      solution: `tshark CLI examples above. -Y is the display filter, same syntax as Wireshark GUI.`,
      hint: "Filter first, then follow the stream to read the actual conversation.",
      challenge: `**Home Lab — Analyze Real Traffic:**
1. In your lab, generate traffic: open http://example.com in the Kali VM browser; login to a fake form on a test site (e.g., set up a local Apache with a login page).
2. Capture with Wireshark on Kali. Filter \`http\`. Follow the TCP stream of your login — can you see the password in cleartext? (Intended for a test lab only!)
3. Do an nmap scan from Kali and analyze it in Wireshark. Identify the SYN scan pattern.
4. Save the capture as \`attack.pcapng\`. Write one paragraph: "who talked to whom, when, and why" — practice your triage writeup.`,
    },
    {
      id: 7,
      slug: "07-firewalls-ids-ips",
      title: "Firewalls, IDS & IPS",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "The first line of network defense: rules, stateful filtering, intrusion detection, and intrusion prevention systems.",
      content: `
# Firewalls, IDS & IPS

## Firewall Fundamentals

A firewall sits at a trust boundary — between the internet and your network, between zones. It decides what traffic is allowed based on policy.

**Concept:** default-deny beats default-allow. Whitelist what's needed.

## Firewall Types

| Type | Inspects | Strengths | Weaknesses |
|------|----------|-----------|-----------|
| Packet filter | Headers only (L3/L4) | Fast, simple | No app awareness |
| Stateful | Tracks connections + headers | Blocks spoofed/unsolicited | No payload defense |
| NGFW | L3-L7 | App awareness, TLS, IPS integrated | Expensive, slower |
| WAF | HTTP | Protects web apps | Targeted, not general |
| Host-based (HIDS) | On the server | Local visibility | Needs agent |

## iptables/nftables (Linux) Example

\`\`\`
# Default policies: drop everything
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow SSH from admin only
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.50 -j ACCEPT

# Allow established/related
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
\`\`\`

**The "established" rule is stateful** — it only allows replies to connections *we* initiated.

## IDS vs IPS

- **IDS (Intrusion Detection System)** — detects, **alerts**, does NOT block. (Passive; often inline tap/SPAN)
- **IPS (Intrusion Prevention System)** — detects AND **blocks** inline.

| Product | Type | Signature |
|---------|------|-----------|
| Snort | IDS/IPS | Rule-based |
| Suricata | IDS/IPS | Rule-based, multi-threaded |
| Zeek (bro) | NSM | Event/log generator |
| WAF | Web-focused | Signature + behavioral |

## Detection Methods

- **Signature-based**: match known patterns (fast, known threats)
- **Anomaly-based**: baseline + flag deviations
- **Behavioral**: detect behavior chains (e.g., suspicious process launching cmd.exe)

> **Signature weakness:** evasion via encoding, fragmentation, polymorphism, TLS (encrypted payloads blind signature match). Modern stacks add TLS inspection and behavioral analytics.

## Common Evasion Techniques (Know Your Enemy)

- **Fragmentation** — split attack across packets so signatures don't match
- **Obfuscation** — URL-encoding, chunked transfer
- **Encryption** — everything inside TLS
- **Low-and-slow** — spread attack over time to bypass thresholds
`,
      defaultCode: `# iptables baseline for a Linux server
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.50 -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
echo "Run in your lab VM, not on your real machine!"`,
      solution: `Remember the ORDER matters: stateful allow first, then specific allows, then default drop.`,
      hint: "Always allow established connections BEFORE default-drop policies.",
      challenge: `**Home Lab — Build a Mini Firewall & Monitor:**
1. On your Ubuntu server VM, install \`iptables\` and \`ufw\`/nftables.
2. Apply the policy above (SSH from Kali only, drop all else). Test: SSH from Kali works, SSH from another host fails.
3. Install \`snort\` or note \`suricata\`. Do an nmap scan from Kali and check if the IDS alerts.
4. Observe: in Wireshark, which packets does the firewall drop vs reject? (Filtered vs refused.)
5. Write a paragraph: how would an attacker evade your snort rule set?`,
    },
  ],
};