import type { Module } from "../curriculum";

export const module32: Module = {
  id: "module-32",
  slug: "32-denial-of-service-evasion",
  title: "Denial-of-Service & Defense Evasion",
  description:
    "DoS/DDoS mechanics, amplification and botnets, IDS/firewall evasion, honeypots, anonymization and anti-forensics — the 'noise' discipline of attack craft.",
  language: "Offensive",
  lessons: [
    {
      id: 1,
      slug: "01-dos-ddos-types",
      title: "DoS & DDoS: Volumetric, Protocol, Application",
      level: "intermediate",
      tag: "concept",
      duration: "45 min",
      description:
        "Every flavor of knocking a service down — and the layered defenses (CDN, rate limit, WAF, capacity) that hold the line.",
      content: `
# DoS & DDoS: Volumetric, Protocol, Application

## The three classes

| Class | Attack | Examples |
|-------|--------|----------|
| **Volumetric** | Saturate bandwidth | UDP flood, ICMP flood, amplification (DNS/NTP), huge DNS queries |
| **Protocol/stateful** | Exhaust server states | SYN flood (half-open), connection exhaustion, slowloris, ping-of-death |
| **Application** | Exhaust app resources | HTTP flood, expensive-query floods, PDF bombs, login storms, zip bombs |

## Classic flavors in one place

\`\`\`
# SYN flood
#   tool: hping3 -S -p 80 --flood target   (lab only)
# DNS amplification
#   small query -> big response to spoofed victim IP
# Slowloris
#   open many HTTP conns, drip partial requests -> exhaust Apache's threads
# HTTP flood
#   many GET / requests via botnet or IP rotation
\`\`\`

## Why amplification is worst

Attacker sends 60-byte DNS query with **spoofed victim IP**; resolver answers with 4KB+. Ratio ~70:1. A small botnet of spoofers through open resolvers = a huge downstream flood.

## The layered defense

\`\`\`
Edge: CDN (Cloudflare/Akamai) absorbs volumetric
   |-> network: DDoS scrubbing centers
   |-> firewall: rate limits, SYN-proxy, stateful connection cap
   |-> WAF: filter HTTP floods, CAPTCHA for humans
   |-> app: slow-blow code, async, load-balanced, autoscaled
   |-> capacity: baseline headroom + autoscale
\`\`\`

## Detection & response favorites

- Baseline traffic (bytes/sec, connections/sec, PPS) → anomaly alerts
- Blackhole/redirect ISPs for the worst volumetric
- Source-hash authentication for SYN floods (SYN cookies)
- Human-intent detection for app floods (behavior patterns)

> DoS is a war of economics: the attacker spends pennies against your peak capacity. That's why defense is capacity + filtering + cost-shifting to CDN — never a single box.
`,
      defaultCode: `// baseline + threshold thinking
const baselineBytesPerSec = 40_000_000;
const alertBar = (baselineBytesPerSec * 5).toExponential();
console.log('Alert if sustained >', alertBar, 'bytes/sec');
console.log('Then: CDN scrub -> firewall -> WAF -> autonomy');`,
      solution: `const baselineBytesPerSec = 40_000_000;
const alertBar = (baselineBytesPerSec * 5).toExponential();
console.log('Alert if sustained >', alertBar, 'bytes/sec');
console.log('Then: CDN scrub -> firewall -> WAF -> autonomy');`,
      hint: "Detect by baseline anomaly; defend by absorption (CDN) + filtering + capacity.",
      challenge: `**Home Lab — DoS Defense Exercise (no attacking real things):**
1. Stand a tiny web server (nginx) on a lab VM.
2. Generate the *smallest* possible load test (ab -n 1000 -c 50) and watch nginx handle it.
3. Enable nginx's limit_req_zone and re-run — observe rate limiting.
4. Write a 1-page 'DoS response plan' for a 50-user SaaS (roles, thresholds, escalation).
5. NEVER attack anyone's real service — your own sandbox only.`,
    },
    {
      id: 2,
      slug: "02-botnets-amplification",
      title: "Botnets & Amplification Attacks",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "How 100k hacked webcams become a 1Tbps stream: botnet building blocks, C2 agility, and reflectors we all run by default.",
      content: `
# Botnets & Amplification Attacks

## The botnet assembly

1. **Vulnerable army**: default-creds IoT, unpatched web shells, phone apps
2. **Loader**: first-stage bins infects → downloads second-stage agent
3. **C2**: commands via IRC or (modern) HTTP/HTTPS/DNS/blockchain-based beacons
4. **Panic button**: the bot waits; when told (frequently via a central 'order board'), floods
5. **Mirai's lesson**: 600k cameras/watchdogs pounded the internet's DNS, took Dyn down (2016)

## Properties that make them hard

- **Distributed**: 1M+ IPs → near-saturation of core routers
- **Rotating**: many bot IPs change constantly (NAT/AS/potato)
- **Fast flux / DGA C2** makes takedown slow
- Volume comes from *aggregating* many modest hosts — not one giant attacker

## Amplification elements

Open resolvers (DNS), NTP monlist, SSDP (UPnP), memcached (2018, record 1.35 Tbps), CLDAP, SNMP. All answered by **anyone** with spoofable source — hence reflectors.

\`\`\`
# Why it works:             tiny query -> giant response, victim spoofed
attacker ----tiny----> reflector --------huge-------> victim(IP spoofed)
\`\`\`

## Defense roll-up

- **Ingress filtering (BCP38/BCP84)** at ISPs kills spoofing upstream — demand it
- **open resolver closure** — an org hygiene item
- DDoS-scrub center + CDN
- Keep YOUR appliances patched (don't be the botnet's bot)
- Monitor egress: if your network hosts resolve 100k memcached req/s → reflect too

## Response posture

For a 50K-employee org: CDN + ISP DDoS protection + DNS provider DDoS shielding + public 'status' page. For a home user: your ISP handles most; keep firmware updated.

> Botnet resilience comes from the same sources you defend: bad passwords, unpatched devices, open services. Patch+segment+monitor = you neither host nor reflect an attack.
`,
      defaultCode: `// quantify: amplification ratio of a reflector
const reflectors = {
  dns: 70, ntp: 560, memcached: 51000, ssdp: 30
};
for (const [svc, ratio] of Object.entries(reflectors)) {
  console.log(svc, 'amplifies ~x' + ratio);
}`,
      solution: `const reflectors = {
  dns: 70, ntp: 560, memcached: 51000, ssdp: 30
};
for (const [svc, ratio] of Object.entries(reflectors)) {
  console.log(svc, 'amplifies ~x' + ratio);
}`,
      hint: "BCP38 egress filtering + closed resolvers + patched endpoints = you're off the botnet menu.",
      challenge: `**Home Lab — Read, Don't Run:**
1. Research one historical amplification attack (Dyn 2016, GitHub memcached 2018). Note numbers.
2. Check your OWN router: is UPnP/SSDP on? (Usually yes.) Disable it.
3. On your Kali (lab), run 'dig @8.8.8.8 recurse' — see how open resolvers respond (just a query, fine).
4. Write: which 3 changes at ISP level would most reduce worldwide amplification?
5. Do NOT flood a real target ever.`,
    },
    {
      id: 3,
      slug: "03-ids-evasion",
      title: "IDS/IPS & Firewall Evasion",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "nmap evasion knobs, slow scans, polymorphism, fragmentation, and protocol tricks — against Snort/Suricata thinking like a survivor.",
      content: `
# IDS/IPS & Firewall Evasion

## Why evasion matters + ethics

Evasion studies teach you what detectors see — so you can build detections that survive real attacks. The lab target is *your own* IDS (Snort/Suricata deployed on your Kali or a VM), never a third party.

## nmap evasion palette

\`\`\`
nmap -f -D RND:10 -sS target       # fragment + decoy
nmap --ttl 128 -sS target          # weird TTL
nmap --spoof-mac <mac> target
nmap -T1 --scan-delay 500ms target # slow, low noise
nmap -g 53 target                  # source port 53 (DNS) to dodge FW rules
nmap -sS --data-length 8 -Pn target
\`\`\`

## Detection-tech basics you must know

| Detector | Sees | Evader beats with |
|----------|------|-------------------|
| **Signature IDS** | Known byte patterns | Polymorphism, encoding, fragments |
| **Anomaly IDS** | Deviations from baseline | Blend into baseline (slow, realistic) |
| **Protocol analysis** | Malformed/suspicious behavior | Use valid protocol semantics |

## Fragment & trick details

- Fragmentation: IP fragments split the intent (signature doesn't reassemble) — old-school, modern IDS reassembles
- **Session splicing / Unicode** on HTTP — case, encoding confusion
- **Encrypted payloads** (HTTPS/SSH) — IDS sees ciphertext (this is why TLS-visible DPI needs VPN/proxy layers)
- **Mimicry**: use legitimate tools in legit ways (PowerShell, normal HTTP), the highest-evasion path is 'borrowed traffic'

## The defender's counter

- **Suricata/Snort + Zeek**: reassembly off, protocol parsers, sessions
- Behavioral + correlation, not just signatures
- Log everything (even 'noisy' = find anomalies later)
- Deploy Honeypots: attackers who evade the IDS still feed the honeypot

> The way to defeat evasion is layered: signature+protocol+behavior+context. Evasion wins against single-layer detection; loses against the stack.
`,
      defaultCode: `# Your own lab IDS practice (Snort/Suricata schematic)
# install & configure basic rule set:
sudo apt install -y suricata
sudo suricata -T            # test-config
# then watch your normal + nmap traffic:
suricata -i eth0 -l /var/log/suricata
nmap -sS target            # do it FROM the lab; see alerts in fast.log
nmap -sS -f --scan-delay 300ms target   # compare alert count`,
      solution: `sudo apt install -y suricata
sudo suricata -T
suricata -i eth0 -l /var/log/suricata
nmap -sS target
nmap -sS -f --scan-delay 300ms target   # compare alert count in fast.log`,
      hint: "Test evasion against YOUR OWN Suricata; learn the detection gaps honestly.",
      challenge: `**Home Lab — Evade vs Detect Round-Trip:**
1. Configure Suricata alerting on your Kali/lab host (or use Security Onion).
2. Run plain -sS: count alerts.
3. Run with fragment+decoy+slow timing: count again. Compare.
4. Which parameter most reduced alerts? (Often timing, due to correlation windows.)
5. Write: how would a real defender compensate (baselines, session tracking, human triage)?`,
    },
    {
      id: 4,
      slug: "04-honeypots-decoy",
      title: "Honeypots & Deception",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Cowrie, honeyd, canary tokens — deceive attackers into revealing themselves, through the lab you deploy on your own network.",
      content: `
# Honeypots & Deception

## What deception buys you

The attacker who thinks they reach a server actually reaches a tripwire. Defense gets: early warning, attacker TTP visibility, and wasted attacker time.

## The family

| Type | Tool/approach | Value |
|------|---------------|-------|
| **Low-interaction** | Cowrie (SSH), Honeyd (fake TCP), dionaea (service) | Cheap, safe, false-normal |
| **High-interaction** | Real VMs the attacker abuses | Deep TTPs, risk of harming neighbors |
| **Canary tokens** | thinkst tokens: fake strings/URLs/QR with callback | Instant phishing/leak tripwire |
| **Fake data** | decoy DB records, fake creds in memory | Detect access to 'poisoned' data |

## Hands-on: Cowrie SSH honeypot

\`\`\`
sudo apt install -y cowrie
# edit cowrie.cfg listen_port = 2222 (non-priv)
sudo -u cowrie cowrie start
# A test-attacker SSH-brute/login to port 2222 gets... a fake shell.
# Watch logs: /var/log/cowrie/cowrie.json + logs/ssh-...tie
\`\`\`
Every 'whoami','uname','cat' answer is recorded; credentials captured as structs it logs attempted usernames/passwords.

## Canary tokens quick win

- Generate a token URL (thinkst / canarytokens spec)
- Drop the URL into a low-traffic internal doc (or fake credential in a config backup)
- If anything 'clicks' the URL → you get a callback ping with source IP
- Cheap, near-zero maintenance, catches real pivots

## Positioning

- Place honeypots "inside the reach" of common pivots (a server with weak SSH, a fake backup share, a token in the 'service account' file)
- MONITOR the honeypot traffic; the value is the alert + TTP PE
- Never poison production data; decoy records must be marked/inert

> A honeypot's value is proportional to its realism AND its observers. Unowned decoys are just more junk to attackers.
`,
      defaultCode: `# a canary-token conceptual alert
function handlePing(url, cb) {
  console.log('TRIPWIRE hit', url, 'source:', 'hinted IP in payload');
  cb.runPlaybook('lockbox-key-subscription');
}
handlePing('https://canary.tokens/x/abc', { runPlaybook: () => console.log('-> pager duty alert') });`,
      solution: `function handlePing(url, cb) {
  console.log('TRIPWIRE hit', url, 'source:', 'hinted IP in payload');
  cb.runPlaybook('lockbox-key-subscription');
}
handlePing('https://canary.tokens/x/abc', { runPlaybook: () => console.log('-> pager duty alert') });`,
      hint: "Decoys + tripwires must sit where attackers actually pivot, with a real alert path.",
      challenge: `**Home Lab — Deploy Deception:**
1. Run Cowrie on 2222 on a lab box. From Kali, SSH-brute/attempt login; read the cowrie.json.
2. Nextlog which usernames it logged; what commands returned?
3. Create a canary token; drop the link in a fake 'backup config' in a shared area; ping it; confirm callback.
4. Write the 'honeypot placement plan' for your home net this month.
5. Reflect: 2 lines on the cost/benefit of honeypots vs other SIEM signals.`,
    },
    {
      id: 5,
      slug: "05-anonymization",
      title: "Anonymization: VPN, Tor, Proxies & OPSEC",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "The anonymity model, Tor circuits, VPN tradeoffs, proxy chains, and why OPSEC — not tooling — is what actually keeps you anonymous.",
      content: `
# Anonymization: VPN, Tor, Proxies & OPSEC

## Why this matters (legitimately)

Threat researchers, journalists, and defenders under attack use anonymity. You should understand the *model* so you can advise, not because you need to hide.

## The anonymity toolbox

| Tool | Model | Strength | Weakness |
|------|-------|----------|----------|
| **VPN** | You → trusted provider's server → site | One hop from your IP | Provider sees everything; traffic correlation |
| **Tor** | 3 random relays, layered encryption | No single hop knows both sides | Slow; exit-node sniffing; some sites block |
| **Proxy** | Single hop (HTTP/SOCKS) | Simple | Provider logs; weak |
| **Proxychains** | Multi-hop proxy chain | Obscures path | Slows; the chain knows hops |

\`\`\`
Tor circuit:
[ Client ] -> (Guard relay) -> (Middle relay) -> (Exit relay) -> [Target]
        onion-encrypted segments visible only to each hop
\`\`\`

## The leaks that break anonymity

- **DNS requests** sent outside Tor/VPN
- **Browser fingerprinting** (canvas, plugins, webrtc IP)
- **Account associations** (you log into GMail 'anonymously')
- **Metadata** (file times, EXIF, your real timezone from fonts/timing)
- **Correlation attacks** (timing + traffic size linking entry and exit)

## OPSEC beats everything

The tools do *not* make you anonymous; a disciplined workflow does:

1. One identity per purpose; never cross accounts
2. No personal info anywhere in the persona's artefacts
3. DNS + browser + plugins consistent on the anonymized channel
4. Understand logs: the guards keep your start/end times

## When the law intersects

Anonymizing to commit crimes is still a crime. Being anonymous is legal; evading detection *softens nothing* — where laws bind, they bind regardless of network path.
`,
      defaultCode: `// A leak-check pseudo-function: model OPSEC consistency
const leaks = ['dns', 'fingerprint', 'webrtc-ip', 'account-cross', 'metadata'];
const checked = ['dns', 'webrtc-ip'];
const remaining = leaks.filter(l => !checked.includes(l));
console.log('Still leaking:', remaining.join(', '));`,
      solution: `const leaks = ['dns', 'fingerprint', 'webrtc-ip', 'account-cross', 'metadata'];
const checked = ['dns', 'webrtc-ip'];
const remaining = leaks.filter(l => !checked.includes(l));
console.log('Still leaking:', remaining.join(', '));`,
      hint: "Anonymity is OPSEC + tooling. One leak (DNS, accounts, fingerprint) breaks the model.",
      challenge: `**Home Lab — Know Your Leaks (no anonymity needed):**
1. Visit an IP/fingerprint checker from your normal browser; write your public IP + browser hash.
2. Temporarily use Tor Browser (download, legal) and RE-check: same IP? hash?
3. List 3 things that would uniquely identify you even 'anonymized'.
4. Read the Tor Browser security-privacy guide for 10 minutes.
5. Write 4 sentences: what's the difference between "anonymous" and "just unsafe-in-practice"?`,
    },
    {
      id: 6,
      slug: "06-anti-forensics-log-clearing",
      title: "Anti-Forensics & Log Clearing",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Timestamp stomping, artifact removal, log editing — and the forensic anti-anti-forensics that reconstructs the real story.",
      content: `
# Anti-Forensics & Log Clearing

## What anti-forensics is

Actions deliberately taken to hinder forensic examination: deleting artifacts, altering timestamps, filling free space, tampering logs. Legit use: your own data cleanup and IR planning. Remember: in authorized engagements, cleanup timing and scope are dictated by RoE; elsewhere it is a crime.

## Classic techniques

| Technique | Detail |
|-----------|--------|
| **Timestomping** | Set file times to plausible past (PowerShell touch; Manipulation on Windows) |
| **Artifact removal** | Delete registry keys, prefetch, AppData, USNs (USN Journal edit) |
| **Log tampering** | Change/truncate $LogFile, event logs, web logs |
| **Antivirus/persistence mirrors** | Disable tools, stop services |
| **Free-space wiping** | Overwrite slack/unallocated (sdelete-style, \`dd if=/dev/zero\` misses slack) |
| **Memory untargeting** | Avoid disk writes; live-memory-only |

## Why it fails (the forensic truth)

- **Timelines rebuild**: multiple timestamps (created/modified/accessed), $MFT, USN journal, prefetch → inconsistencies expose the stomp
- **Backups & logs elsewhere**: SIEM/hub-side logs survive a bricked workstation
- **Minifilters & memory**: deleted ≠ unrecoverable; in-memory archeology (Volatility) shows what ran
- **Cached artifacts**: Thumbs.db, pagefile/hiberfil, Volume Shadow Copies
- **The attack itself rewrites history**: the attacker's own evasion steps create NEW artifacts; forensic analysts read the *differences*

## The analyst's reconstruct toolset

\`\`\`
# timeline from artifacts (sleuth kit)
fls -r -m / mount.dd > body
mactime -b body > timeline.txt

# memory view
vol3 -f mem.dump windows.psscan   # see processes deleted from lists
\`\`\`
And the discipline: analyze many sources, hypothesize, verify.

> Anti-forensics is not 'make it invisible'; it's 'make it complicated'. The complicated part is the story forensic specialists reconstruct anyway.
`,
      defaultCode: `// Concept: multiple timestamps cross-check
const file = {
  name: 'mimikatz.exe',
  created: '2024-01-01 09:00',
  modified: '2024-01-01 09:00',
  accessed: '2024-01-05 03:12'
};
// A 'stomped' file often has created==modified but odd accessed/lastwrite mismatches
console.log('Suspicious timestamp pattern?',
  file.created === file.modified ? 'yes-check' : 'likely-normal');`,
      solution: `const file = {
  name: 'mimikatz.exe',
  created: '2024-01-01 09:00',
  modified: '2024-01-01 09:00',
  accessed: '2024-01-05 03:12'
};
console.log('Suspicious timestamp pattern?',
  file.created === file.modified ? 'yes-check' : 'likely-normal');`,
      hint: "Multiple time sources + logs elsewhere survive any local cleanup.",
      challenge: `**Home Lab — Stomp & Detect:**
1. On a THROWAWAY VM, create a file, then stomp its timestamps (PowerShell '(Get-Item f).CreationTime = ...').
2. Verify the stomp 'worked' in Explorer.
3. Now find it: compare $MFT, USN journal, or run fls/mactime to build a timeline; spot the inconsistency.
4. Also demo: a SIEM log of your actions elsewhere (or a simple syslog) survives machine-side deletion.
5. Write 3 sentences: what single artifact pattern reliably exposes timestomping?`,
    },
  ],
};