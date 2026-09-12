import type { Module } from "../curriculum";

export const module36: Module = {
  id: "module-36",
  slug: "36-network-security-defense",
  title: "Network Security & Perimeter Defense",
  description:
    "Firewalls, IDS/IPS, WAF, proxies, segmentation, VPN/ZTNA and network monitoring — the walls and windows of enterprise defense.",
  language: "NetDef",
  lessons: [
    {
      id: 1,
      slug: "01-firewalls-deep",
      title: "Firewalls: Packet, Stateful, NGFW",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "From stateless ACLs to identity-aware NGFW policies — with pfSense-style lab practice and the rule-writing craft.",
      content: `
# Firewalls: Packet, Stateful, NGFW

## The generations

| Age | Type | Decision basis |
|-----|------|----------------|
| 1 | **Packet filter** (stateless) | Header-only rules, per-packet |
| 2 | **Stateful** | Full connection state table (established/related) |
| 3 | **Application (NGFW)** | App inspection, identity, SSL/TLS visibility |

Stateless is fine for tiny networks; stateful is the baseline; NGFW earns its price on app-layer needs.

## Rule-style essentials

\`\`\`
# Cisco ASA-ish / generic: order matters (first match wins)
access-list OUT permit tcp host 10.0.0.5 any eq 443
access-list OUT deny   ip any any log
# pfSense-style:
WAN: allow 443, blocking everything else, egress to specific
LAN->WAN: allow; LAN->DMZ: only web-ports; DMZ->LAN: deny
\`\`\`

## Craft principles

1. **Explicit deny by default** (default deny, allow what's needed)
2. **Least privilege** (the smallest port/protocol/source set)
3. **Order matters** (specific rules before general)
4. **Log the denials** (a blocked thing tells you something's probing)
5. **Egress filtering** (most orgs forget outbound rules)
6. Review quarterly — the rule list rots silently

## Typical segment topology

\`\`\`
[Internet] ---- FW1 (perimeter) ---- DMZ: web, mail, vpn
                        |----+- MPLS internal
                        |    +- user VLAN
                        +--- FW2 (internal segmented zones) --- DB, mgmt
\`\`\`

## What a firewall does NOT do

- Not an anti-malware layer; not a behavioral IDS
- Cannot stop malicious-but-port-443 apps (hence NGFW + IDS)
- SSL/TLS breaking needed to 'see' encrypted malware — with cost/privacy tradeoffs

> A firewall is the gate, not the guard room. The professional firewall designer thinks in *segments, least privilege, and logging* — not 'open port 80 so the web works'.
`,
      defaultCode: `// firewall policy as data (the design mindset)
const policy = [
  { src: 'LAN', dst: 'WAN', proto: 'all', action: 'allow' },
  { src: 'WAN', dst: 'DMZ-WEB', proto: 'tcp/443', action: 'allow' },
  { src: 'DMZ', dst: 'LAN', proto: 'all', action: 'deny', log: true },
  { src: 'any', dst: 'MGMT', proto: 'all', action: 'deny', log: true }
];
for (const r of policy) console.log(r.src, '->', r.dst, r.proto, r.action);`,
      solution: `const policy = [
  { src: 'LAN', dst: 'WAN', proto: 'all', action: 'allow' },
  { src: 'WAN', dst: 'DMZ-WEB', proto: 'tcp/443', action: 'allow' },
  { src: 'DMZ', dst: 'LAN', proto: 'all', action: 'deny', log: true },
  { src: 'any', dst: 'MGMT', proto: 'all', action: 'deny', log: true }
];
for (const r of policy) console.log(r.src, '->', r.dst, r.proto, r.action);`,
      hint: "Default-deny + least privilege + logging = firewall hygiene.",
      challenge: `**Home Lab — pfSense Segmentation:**
1. Install pfSense (or OPNSense) as a lab firewall VM (2 NICs).
2. Build 2-3 zones (LAN, DMZ, IoT) with VLANs/interfaces.
3. Write rules: IoT→LAN denied, DMZ only to web-ports, everything logged.
4. Test: can your IoT-zone VM reach your LAN VM? (should fail).
5. Write the policy review: which rule would you add after a month of logs?`,
    },
    {
      id: 2,
      slug: "02-ids-ips-suricata",
      title: "IDS/IPS: Suricata, Rules, Deployments",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Network-based and host-based detection, Suricata/Snort rules, IPS inline mode, and false-positive reality.",
      content: `
# IDS/IPS: Suricata, Rules, Deployments

## NIDS vs HIDS

| Type | Sees | Blindspots |
|------|------|------------|
| **NIDS** (network) | All wire traffic | Encrypted payloads, if no TLS break; spans |
| **HIDS** (host) | Process/file/reg events | Its own visibility limits; agent cost |

## Suricata: the modern NIDS/NIPS

\`\`\`
# install + run IDS mode (suricata in Kali/lab)
sudo apt install -y suricata
sudo suricata -c /etc/suricata/suricata.yaml -i eth0
cat /var/log/suricata/fast.log

# check rules loaded:
suricatasc -c 'list rules' | head

# run IPS (inline NFQUEUE) requiring 2 NICs or a bridge:
sudo suricata --af-packet -q 0 -q 1 -c /etc/suricata/suricata.yaml
\`\`\`

## Rule anatomy (ET/open rulesets)

\`\`\`
alert tcp $HOME_NET any -> $EXTERNAL_NET 443 (msg:"POST to EURL"; \
  flow:established,to_server; content:"|00 00 00|"; \
  classtype:policy-violation; sid:1000001; rev:1;)
\`\`\`

## Deployment & tuning reality

- Rules fire on *conditions*, not judgment → FPs inevitable
- Tune per alert: suppress by source/dest, or mark as alert→log only
- **Sig-updates**: ET open rules daily; commercial weekly
- IPS (inline) risks: can't drop legit traffic → test in IDS mode first, start with 'alert, then drop'
- Correlate: an IDS alert is a *trigger*, not a verdict — pair with endpoint logs

## The analyst workflow

\`\`\`
alert -> validate in matching pcaps -> correlate host events -> decide/bloom
        -> if true positive: IR handoff; else suppress + document
\`\`\`

> A well-tuned IDS is a tripwire farm: alerts you act on. Alert-ignoring orgs run a museum of detections, not a defense.
`,
      defaultCode: `# lab sniff-and-alert loop
sudo suricata -i eth0 -c /etc/suricata/suricata.yaml
# generate (in another window): curl / nmap against a lab service
tail -f /var/log/suricata/fast.log
# note the 'S' signatures which fired.`,
      solution: `sudo suricata -i eth0 -c /etc/suricata/suricata.yaml
tail -f /var/log/suricata/fast.log`,
      hint: "IDS/IPS alerts are triggers to validate; tune FPs; start IDS-mode, graduate to IPS.",
      challenge: `**Home Lab — Rule & Tune:**
1. Run Suricata on your Kali; do a scan+nmap against it; read fast.log.
2. Pick one noisy rule; write a suppression for your source.
3. Try 'suricata -T' (test) and 'suricatasc list rules'.
4. Design one custom rule that fires when your lab hits your own honeypot.
5. Write the analyst triage checklist for a Suricata alert.`,
    },
    {
      id: 3,
      slug: "03-waf-reverse-proxy",
      title: "WAF, Reverse Proxies & Content Filters",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "ModSecurity, TLS termination, caching, URL rewriting — protections sitting in front of web apps that shield (but never replace) code security.",
      content: `
# WAF, Reverse Proxies & Content Filters

## The WAF job

A Web Application Firewall filters HTTP(S) *before* the app sees it: blocks SQLi/XSS payloads (signature + behavior), geo/rate rules, virtual patching.

## ModSecurity / OWASP CRS (the open stack)

\`\`\`
# apt install libapache2-mod-security2 (or nginx+rules)
# wire OWASP CRS into modsec:
SecRule REQUEST_URI "@contains /cgi-bin/" "deny"
# Great examples:
SecRule REQUEST_BODY "@rbl research.example" "phase:2,deny"
\`\`\`
CRS gives you out-of-the-box 2000+ rules with site-wide tuning (paranoia levels 1-4).

## Virtual patching

When an app bug can't be fixed fast, a WAF rule blocks the exploit path until the real patch lands. Essential practice for unpatcheable legacy.

## Reverse proxy duties

\`\`\`
Client --> [Proxy: TLS terminate, cache, header normalizing, limits] --> App
\`\`\`
- TLS termination & HSTS (so apps can be http internally)
- Header safety (strip client IP spoofing; enforce Host)
- Caching; CDN-like offload
- Path filtering: block /admin from external, allow internal routes

## WAF limits (honest)

- It's *before* code: logic flaws (A04) and business logic are invisible
- Bypass arms race: encodings, chunk tricks, semantic equivalence
- Never treat WAF as 'the fix' — it's a delay/cover while you patch

## Config craft

- Run in detection/log-only → tune → then enforce
- Watch false positives (blocking legit users) — the #1 WAF killer
- Multiple modes: blocklist (block known-bad) or allowlist (only-what-app-does)

> Deploy a WAF like a shield: it deflects what you know, buys time for what you don't, and never replaces armor (secure code).
`,
      defaultCode: `# a minimal modsecurity-style rule sketch
# SecRule REQUEST_URI "@contains \"sqlmap\"" "phase:1,deny,status:403"
$rules = [
  'deny /cgi-bin', 'virtual-patch: /admin?debug=1',
  'rate: login 5/min', 'block EXE download from docs'
];
foreach ($rules as $r) echo $r . PHP_EOL;`,
      solution: `$rules = [
  'deny /cgi-bin', 'virtual-patch: /admin?debug=1',
  'rate: login 5/min', 'block EXE download from docs'
];
foreach ($rules as $r) echo $r . PHP_EOL;`,
      hint: "Log-first, virtual-patch, rate-limit — and patch the code eventually.",
      challenge: `**Home Lab — Front Your App With ModSecurity:**
1. Install mod_security + CRS (Apache or nginx with Naxsi/ModSec equivalent).
2. Test: a benign request passes; a 'union select' payload blocked (verify via logs).
3. Add a virtual patch for a known lab vuln (e.g., DVWA's SQLi) and confirm it blocks.
4. Generate a false positive (a legit form with a quote) and tune it away.
5. Write: what would you Docker this stack for? what breaks?`,
    },
    {
      id: 4,
      slug: "04-segmentation-vpn-ztna",
      title: "Segmentation, VPN & ZTNA",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Islands instead of a sea: micro-segmentation, VPN flavors, beyond-VPN ZTNA, and how users access safely in a zero-trust world.",
      content: `
# Segmentation, VPN & ZTNA

## Segmentation = blast-radius control

- Split network into zones: users / servers / DBs / OT / cloud / guests
- Enforce with firewalls per-zone (stateful rules: allow only needed)
- **Micro-segmentation**: app-level segments (a DB only talks to its app server's VPC/NIC)
- 'Flat network' = every compromise is a total compromise

## VPN flavors

| VPN | Best for | Notes |
|-----|----------|-------|
| **IPsec** | Site-to-site, legacy | Strong, complex |
| **OpenVPN / WireGuard** | Client access | WG: newer, fast, simple keys |
| **SSL VPN** (portal/app) | Browser+archive access | Least native, great breadth |
| **Split vs full tunnel** | Traffic path choice | split: protect only corp; full: everything througe |

\`\`\`
# WireGuard quick (server):
wg genkey | tee privatekey | wg pubkey > publickey
[Interface] Address = 10.0.0.1/24  ListenPort = 51820
[Peer] PublicKey = CLIENT_PUB  AllowedIPs = 10.0.0.2/32
\`\`\`

## ZTNA ("VPN replacement")

- Scope: *application*, not network. 'App proxy' -> your app only.
- Identity-based (SSO/MFA) + device posture before session
- No network exposure: apps are 'invisible' to anyone else
- Cloud-control: Identity provider as the perimeter

## Choosing

- Small/simple homes: WireGuard or OpenVPN for remote admin
- Enterprise: ZTNA for users; site-to-site only for partner links
- Legacy apps: SSL-VPN portal; migrate to app-based ZTNA

## Craft rules

- 2FA on every VPN; device compliance check
- Least-privilege routes (AllowedIPs per user)
- Log sessions; geo/behavior anomaly -> challenge
> VPNs give a door; ZTNA gives a usher who verifies every visitor and only opens specific rooms. Modern access = usher, not janitor.
`,
      defaultCode: `// illustrate ZTNA app-permission model
const grants = {
  alice: ['crm', 'wiki'],
  bob: ['crm', 'code-repo']
};
function canAccess(user, app) {
  return (grants[user] || []).includes(app);
}
console.log('alice->code-repo:', canAccess('alice', 'code-repo'));
console.log('alice->crm:', canAccess('alice', 'crm'));`,
      solution: `const grants = {
  alice: ['crm', 'wiki'],
  bob: ['crm', 'code-repo']
};
function canAccess(user, app) {
  return (grants[user] || []).includes(app);
}
console.log('alice->code-repo:', canAccess('alice', 'code-repo'));
console.log('alice->crm:', canAccess('alice', 'crm'));`,
      hint: "Segmentation for blast radius; MFA+ZTNA for access; log everything.",
      challenge: `**Home Lab — Segment Like an Admin:**
1. Draw YOUR home/org network as zones with a FW policy per zone.
2. Deploy one VPN (WireGuard) between 2 lab boxes; test tunnel.
3. Write: which 3 apps would you put behind ZTNA first, and why?
4. Simulate the 'DB-is an island' micro-segment: can VM-A ping DB zone? deny — prove it.
5. Write the 'access architecture' 6-liner you'd give a CTO.`,
    },
    {
      id: 5,
      slug: "05-network-monitoring",
      title: "Network Monitoring, NetFlow & Packet Analysis",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Flow records, PCAP triage, baselining, and the detection patterns (beaconing, DGA, exfil) that live in network traffic.",
      content: `
# Network Monitoring, NetFlow & Packet Analysis

## Three lenses

\`\`\`
Flow (NetFlow/sFlow): src,dst,port,bytes,pkts — cheap, aggregates
Trace (PCAP/Zeek): full content/payload — deep, noisy
Structured (Zeek/Bro): per-protocol conn logs — the sweet spot
\`\`\`

## Collecting

- NetFlow on the router/FW → collector (nfdump, ElasticFlow, PRTG)
- Zeek on a mirror port → conn, http, dns, ssl logs
- PCAP archive for deep dive (have-a-day retention, not unlimited)

## Detection patterns in the wire

| Pattern | Signature | Appeared in |
|---------|-----------|-------------|
| **Beaconing** | periodic same-size POST to same dst | C2 |
| **DGA** | random-looking subdomains | botnets |
| **Data exfil** | sustained high bytes from a host post-login | theft |
| **Port scan** | many dst ports from one src in short time | recon |
| **Zero-day C2** | new external IP + same-timestamp conns | novel tools |

## The netmon playbook

\`\`\`
1. Baseline: traffic profiles per host/app (bytes/s, connections)
2. Watch anomaly: high flow count, new egress destinations
3. Verify with Zeek: what protocol actually ran?
4. Drill with tshark/PCAP when needed
\`\`\`

## Hands-on

\`\`\`
tshark -r big.pcap -q -z io,stat,10   # traffic overview
tshark -r big.pcap -Y 'dns' -T fields -e dns.qry.name | head
nfdump -r nfcapd.xxx 'host 10.0.0.5' | head
\`\`\`

## Blindspots

- Encrypted payload (TLS 1.3 = opaque) — rely on metadata + JA3 (fingerprint) + behavior
- NetFlow can't see content; PCAP it all for storage is rare
> Flow tells you 'where'; Zeek tells you 'what protocol'; PCAP answers 'what happened'. Together they make traffic legible.
`,
      defaultCode: `# a quick flow/tshark triage
tshark -r capture.pcap -q -z io,stat,60
tshark -r capture.pcap -Y 'dns' -T fields -e dns.qry.name
tshark -r capture.pcap -Y 'http.request' -T fields -e http.request.uri`,
      solution: `tshark -r capture.pcap -q -z io,stat,60
tshark -r capture.pcap -Y 'dns' -T fields -e dns.qry.name
tshark -r capture.pcap -Y 'http.request' -T fields -e http.request.uri`,
      hint: "Flow for scope, Zeek for protocol, PCAP for truth.",
      challenge: `**Home Lab — Watch Your Own Net:**
1. Install Zeek (or tcpdump) on your lab host; capture an hour of your own traffic.
2. Run the three tshark views (flow stats, DNS names, URIs).
3. Generate a beacon (a script hitting your lab server every 30s) and find it.
4. Write the 'network monitoring plan' — where would you put Zones/collectors in a 200-band org?
5. Add 3 detection rules (beacon/DGA/exfil) to your list.`,
    },
    {
      id: 6,
      slug: "06-perimeter-defense-craft",
      title: "Perimeter Defense Craft: The Full Stack",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Assemble the defense-in-depth perimeter: DNS security, email gateway, web filtering, SASE — and how they hand off to detection teams.",
      content: `
# Perimeter Defense Craft: The Full Stack

## The assembled perimeter

\`\`\`
[Internet]
   |  DNS filtering (block C2/bad domains - DNS Rebinding controls)
   v  Email gateway (spam/phishing sandboxing, banner, SPF/DMARC)
   v  SASE/Proxy (web filtering, TLS inspection, CASB)
   v  Firewall/NGFW + IPS (state, policy, inline threat)
   v  WAF (front of web apps)
   v  ZTNA / VPN (identity access)
   v  --- LAN/DMZ with segmentation ---
\`\`\`

## DNS filtering : overlooked gold

- Block known-malicious domains at the resolver (RPZ/domain blocklists, Cisco Umbrella-style)
- Blocks C2 beacons, phishing, DGA-callbacks — cheap, effective

## Email security = the top vector you're likely to touch

- SPF/DKIM/DMARC (sender authentication)
- Threat gateway analysis (sandbox attachments, URL rewrite deferal)
- Banner ads for external senders (training reinforcement)

## SASE route

Security Access Service Edge = converge networking+security into cloud edge (SWG, CASB, FWaaS, ZTNA). Mainstream; enterprise-al.

## Hand-off to detection

The perimeter generates its own telemetry: DNS queries to blocklist, mail quarantine events, proxy HTTP/S flows, NGFW/IPS alerts. These feed SIEM/SOAR to enrich endpoint detections.

## Building discipline

- Log-and-tune everything before blocking
- Know your choke points (a company with no email gateway = the phishing sieve)
- Test bypasses (TLS inspection-gap, DNS-over-HTTPS bypass on endpoints!)
- Document the 'block → examine → allowlist' workflow so users don't hate you

## What a strong perimeter buys

Time. Every blocked deliver/asked callback = minutes the IR team doesn't have to burn. The perimeter that quietly removes 90% of noise makes every detection that remains matter.

> Perimeter is not 'one product'. It's DNS+mail+web+firewall+WAF+identity working as ONE system that hands every alarm + context to the SOC.
`,
      defaultCode: `// choke point inventory
const perimeter = [
  { layer: 'dns', tool: 'RPZ/blocklist' },
  { layer: 'email', tool: 'spf-dmarc-gateway' },
  { layer: 'web', tool: 'proxy-casb' },
  { layer: 'network', tool: 'ngfw-ips' },
  { layer: 'app', tool: 'waf' },
  { layer: 'access', tool: 'ztna-vpn' }
];
perimeter.forEach(p => console.log(p.layer, '->', p.tool));`,
      solution: `const perimeter = [
  { layer: 'dns', tool: 'RPZ/blocklist' },
  { layer: 'email', tool: 'spf-dmarc-gateway' },
  { layer: 'web', tool: 'proxy-casb' },
  { layer: 'network', tool: 'ngfw-ips' },
  { layer: 'app', tool: 'waf' },
  { layer: 'access', tool: 'ztna-vpn' }
];
perimeter.forEach(p => console.log(p.layer, '->', p.tool));`,
      hint: "The perimeter is a system; every layer feeds detection and gets tuned against FPs.",
      challenge: `**Home Lab — Perimeter in Miniature:**
1. On your lab router, add a DNS blocklist (e.g., RPZ / Pi-hole) — block a test domain.
2. Apply a 'default deny' rule set to your 3-zone lab; verify flows.
3. Draw the 'perimeter stack' you'd propose for a 100-user org — with the logs each layer emits.
4. Identify which 2 layers MOST reduce phishing noise.
5. Write the acronym glossary: RPZ, SASE, CASB, SWG, WAF, ZTNA.`,
    },
  ],
};