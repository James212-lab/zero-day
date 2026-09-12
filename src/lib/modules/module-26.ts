import type { Module } from "../curriculum";

export const module26: Module = {
  id: "module-26",
  slug: "26-reconnaissance-osint",
  title: "Reconnaissance & OSINT Deep",
  description:
    "Footprinting, DNS recon, Google dorking, Shodan/Censys, certificate transparency, dark-web intel and AI-assisted OSINT — the pre-attack science.",
  language: "OSINT",
  lessons: [
    {
      id: 1,
      slug: "01-footprinting-foundations",
      title: "Footprinting: The Recon Discipline",
      level: "intermediate",
      tag: "concept",
      duration: "30 min",
      description:
        "Passive vs active footprinting, footprinting objectives and how every test starts with WHO's the target and WHAT they expose.",
      content: `
# Footprinting: The Recon Discipline

## What footprinting is

The systematic collection of information about a target **before touching it**. Passive footprinting gathers what already exists publicly; active footprinting sends traffic that reveals responses.

| | Passive | Active |
|--|---------|--------|
| Contact with target | None (except public records) | Yes (packets you send) |
| Examples | DNS, WHOIS, search engines, job posts, breach data, cert logs | Port scans, banner grabs, HTTP probes |
| Legal risk | Low | Higher; needs scope |
| Detection risk | Low | High (you will be logged) |

## Objectives

1. **Inventory**: domains, subdomains, IPs, ASN, hosting, technologies
2. **People**: employees, emails, job titles, personal accounts
3. **Org posture**: policies, suppliers, tech stack from job posts
4. **Seams**: forgotten subdomains, dev servers, exposed repos

## The footprinting loop

\`\`\`
Domain -> whois (registrar, contacts)
        -> DNS (A, AAAA, MX, TXT/SPF, NS, SOA)
        -> cert transparency (crt.sh)   (subdomains you'd miss)
        -> ASN & IP ranges (bgp.he.net, whois)
        -> hosting (AS, cloud provider buckets)
        -> web: robots.txt, sitemap, headers, tech fingerprint
\`\`\`

## Technology fingerprinting

- HTTP headers reveal server, framework, versions
- \`whatweb\`, \`wappalyzer\` (browser), response patterns (WordPress, Shopify)
- Error pages, favicon hashes, cookie names — fingerprinting fuel

## What good footprinting produces

A **target map** you shall use all engagement: hosts, services, versions, tech, people. The better the map, the smaller the later scan surface. "Footprint first, scan second" is a professional habit, not a formality.
`,
      defaultCode: `// The footprinting inventory you are building
const footprint = {
  domain: 'example.com',
  subdomains: ['api', 'blog', 'dev'],
  tech: ['nginx','php','wordpress'],
  emails: ['admin', 'support'],
  ipRanges: ['93.184.216.0/24']
};
console.log('Targets:', footprint.subdomains.length + footprint.ipRanges.length);`,
      solution: `const footprint = {
  domain: 'example.com',
  subdomains: ['api', 'blog', 'dev'],
  tech: ['nginx','php','wordpress'],
  emails: ['admin', 'support'],
  ipRanges: ['93.184.216.0/24']
};
console.log('Targets:', footprint.subdomains.length + footprint.ipRanges.length);`,
      hint: "Never scan before you footprint. The map shrinks the search.",
      challenge: `**Home Lab — Footprint a Domain You Own:**
1. Run whois on your domain; note registrar, expiry, contacts.
2. dig: A, MX, TXT, NS records. Explain each record's security role.
3. Pull crt.sh for subdomains; check Shodan for that IP.
4. Curl the root page headers — fingerprint the stack.
5. Write your one-paragraph "target map" summary.`,
    },
    {
      id: 2,
      slug: "02-dns-recon-deep",
      title: "DNS Reconnaissance Deep",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Zone walking, subdomain enumeration, DNS exfiltration tricks, and how DNS makes or breaks a target map.",
      content: `
# DNS Reconnaissance Deep

## Why attackers love DNS

DNS is public, distributed, and usually unfiltered for inbound resolution. It reveals the entire architecture if misconfigured.

## The record types that matter

| Record | What it leaks |
|--------|---------------|
| **A / AAAA** | Host IPs |
| **NS** | Nameservers (attack surface + zone controls) |
| **MX** | Mail servers (spoofing candidates) |
| **TXT** | SPF, DMARC (email security posture), random secrets people paste |
| **SOA** | Zone transfer control + serial |
| **CNAME** | Aliases; sometimes reveal internal names |
| **PTR** | Reverse hints for internal hostnames |

## Zone walking & transfers (rarely allowed by hosts)

\`\`\`
# Manual
dig axfr example.com @ns1.example.com   # usually REFUSED (good)
# Subdomain brute with a good wordlist
dnsrecon -d example.com -t brt -D /usr/share/wordlists/dnsrecon/subdomains-top1million.txt
# Subdomain via HTTP fuzzing
ffuf -w subdomains.txt -u http://FUZZ.example.com
\`\`\`

## IPv6 & PTR tricks

- IPv6 ranges are huge — easy to hide hosts
- PTR records sometimes expose internal naming conventions
- Enumerating internal DNS (if you reach it) = architecture blueprint

## DNS and exfiltration

- **DNS tunneling**: encode data in DNS queries to a domain you control (e.g., iodine, dnscat2) — data leaves even where HTTP is blocked
- **DNS exfil detection**: blue teams watch odd subdomain patterns & high query volumes

## Defenders' mirror

Zone transfer open → fix immediately. SPF/DMARC configured → spammers blocked. Internal hostnames hidden → architecture not leaked. DNS hygiene is recon hygiene.
`,
      defaultCode: `# DNS recon on a demo domain
dig any example.com
dig mx example.com
dig txt example.com
dig ns example.com
dnsrecon -d example.com -t std       # standard enumeration
dnsrecon -d example.com -t brt -D /usr/share/wordlists/dnsrecon/subdomains-top1million.txt`,
      solution: `dig any example.com
dig mx example.com
dig txt example.com
dig ns example.com
dnsrecon -d example.com -t std
dnsrecon -d example.com -t brt -D /usr/share/wordlists/dnsrecon/subdomains-top1million.txt`,
      hint: "DNS = free architecture map. Query records, try zone walks (expect REFUSED).",
      challenge: `**Home Lab — DNS Map a Domain:**
1. Pick a domain (use example.com and one you control if you have it).
2. dig each record type; record every value.
3. Try a zone transfer (dig axfr) — note the REFUSED result.
4. Enumerate subdomains with dnsrecon (or ffuf on a self-hosted subdomain).
5. Write: what did DNS reveal about hosting, email, backup infra?`,
    },
    {
      id: 3,
      slug: "03-google-dorking-shodan",
      title: "Google Dorking, Shodan & Censys",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "Search-engine and internet-scanning superpowers: dork operators, Shodan facets, Censys, and the exposed-internet mindset.",
      content: `
# Google Dorking, Shodan & Censys

## Google dorking: search operators as exploit starters

\`\`\`
site:ex.com filetype:sql            config dumps
site:ex.com filetype:env            environment secrets
site:ex.com intitle:"index of"      open directories
site:ex.com inurl:admin             admin portals
"password" "ex.com" filetype:log    leaked credentials
inurl:"/api/" filetype:json         API surface
\`\`\`

The point isn't to find "one password" — it is to map **what data leaks by default** and prove it in a report.

## Shodan: the internet's scanner

- Search banners, ports, services, org names
- Query ideas:
\`\`\`
org:"Example Corp"                           all exposed assets
port:22 country:US                          SSH sweep (academic)
product:OpenSSH version:8.2p1                version pinpoint
vuln:CVE-2021-44228 product:Log4Shell        (curiosity) - note ethics: scanning is shown as research
\`\`\`
- **Facets**: Shodan groups by country/port/org — instant inventory

## Censys: certificate & service search

- \`services.port:443\` web; certificate name search finds certs for subdomains
- Search a company's cert names -> subdomain inventory (with crt.sh overlap)

## The exposed-internet mindset

- Attackers: "what can I reach without credentials?" = billions of Shodan rows
- Defenders: "what do we expose that should be internal?" — this is YOUR daily job
- Every exposed admin panel, database, or debug API you can demonstrate is a finding with a mitigation

## Ethics police check

Search engines and Shodan offer **public data**. Using them responsibly (scoped, for inventory of your own assets, for threat research) is standard. Probing/attacking systems you find is NOT without authorization.
`,
      defaultCode: `# example queries you can legally run
# https://www.shodan.io/search?query=org%3A%22...%22  -> browser search
# curl the Shodan API with YOUR key:
curl -s 'https://api.shodan.io/shodan/host/93.184.216.34?key=SEARCH_API_KEY_USER_FILLS' | head`,
      solution: `# In a browser: site:example.com intitle:"index of"
# Shodan API host search requires your free account key.
curl -s 'https://api.shodan.io/shodan/host/93.184.216.34?key=YOURKEY' | jq '.ports'`,
      hint: "Dork = search for config leaks. Shodan = inventory the internet responsibly.",
      challenge: `**Home Lab — Public Data, Private Findings:**
1. Run 5 Google dorks against example.com (or your own domain).
2. Open Shodan, search your own home IP and one example.com address; list 3 public services.
3. On crt.sh, dump all cert names for domain of your choice.
4. Write a fake-but-realistic 'exposure finding' — title, repro, impact, fix.
5. Reflect (2 sentences): how should defenders think about 'public data'?`,
    },
    {
      id: 4,
      slug: "04-dark-web-intel",
      title: "Dark Web Intelligence & Threats",
      level: "advanced",
      tag: "concept",
      duration: "35 min",
      description:
        "What the dark web is, what trade happens there, and the legal/brand-risk angles of dark-web monitoring for your org.",
      content: `
# Dark Web Intelligence & Threats

## Dark web, deep web, surface — the clarity

- **Surface web**: indexed by search engines
- **Deep web**: not indexed (paywalls, DB-backed content, private accounts) — the large majority of the internet
- **Dark web**: small overlay networks (Tor, I2P) requiring special software; anonymity-first communities

## What crime looks like there

- **Marketplaces**: stolen credentials, CC dumps, exploit kits, ransomware-as-a-service (RaaS) panels
- **Forums**: zero-day chatter, leaked DBs, "dox" services, cybercrime tutorials
- **Ransomware sites**: leak sites where victims' data is published
- **Hackers-for-hire**: persistence-as-a-service, DDoS-for-pay

## The defender's dark-web program

Monitor (via vetted sources/Tor + professional services):

- Brand abuse (fake domains, phishing kit lineage)
- Leaked corporate credentials (before they're sold again)
- Ransomware mentions of your org/industry
- Zero-day chatter about your stack

## Dark-web monitoring tools (defensive)

- **Professional services**: Recorded Future, Flashpoint, IntelligenceX, Dehashed (also feeds)
- **Open**: ThreatFox (abuse.ch), MalwareBazaar samples, Ahmia (search engine over .onion, legal to read), OnionScan (historical)
- Internal: OSINT triage dashboards + alerting on key phrases

## Ethics & legality

- **Reading** market listings to understand intel = generally lawful (via Tor public)
- **Buying/brokerage** or facilitating = serious crime
- Balance: the surveillance-inverse — the same skills that spot leaked credentials could (if untethered) invade privacy. Scope and purpose keep it professional.

> The dark web is 90% noise and 10% high-value signals. Professional practice is filtering: brand, creds, ransomware, zero-day mention — alerted into your workflow, not doom-scrolled.
`,
      defaultCode: `// Track relevant dark-web signals you care about
const watchlist = [
  'CorpName',
  'corpname.com',
  'ransomware-variant-of-interest',
  'credentialdumps'
];
console.log('Monitoring signals:', watchlist.length);
console.log('Scope: own brand + industry, defense only');`,
      solution: `const watchlist = [
  'CorpName',
  'corpname.com',
  'ransomware-variant-of-interest',
  'credentialdumps'
];
console.log('Monitoring signals:', watchlist.length);
console.log('Scope: own brand + industry, defense only');`,
      hint: "Monitor brand + creds + ransomware chatter defensively.",
      challenge: `**Home Lab — Threat Feeds 101:**
1. Sign up for abuse.ch (ThreatFox, MalwareBazaar, URLhaus) — free feeds.
2. Pull the latest IoCs for one malware family into a spreadsheet.
3. Build a simple weekly checklist: brand mentions, leaked-cred reports, ransomware-family xainment for your region.
4. Write a one-page 'dark-web monitoring plan' for a fake mid-size company.
5. Note 3 sources you'd subscribe to and why.`,
    },
    {
      id: 5,
      slug: "05-ai-assisted-osint",
      title: "AI-Assisted OSINT",
      level: "intermediate",
      tag: "lab",
      duration: "35 min",
      description:
        "Language models as research accelerators: turn noisy dumps into structured intel, draft queries, and stay safe with AI hallucinations.",
      content: `
# AI-Assisted OSINT

## Why AI helps OSINT

OSINT produces piles of text: scan outputs, leaked lists, articles, CVEs. LLMs can summarize, structure, and cross-reference. They do NOT verify facts — verify before reporting.

## Safe patterns

1. **Structuring output**: paste a log → ask for a cleaned host/service table
2. **Query drafting**: "write 10 Google dorks for discovering exposed S3 buckets"
3. **Cross-referencing**: give it CVE list + your stack → risk ranking
4. **Report drafting**: convert your raw notes into a finding skeleton
5. **Red-teamer's assistant**: brainstorm technique chains (technique → detection bounds)

## Red flags (always)

- **Hallucination**: models invent CVE numbers, IPs, and citations. Verify EVERYTHING.
- **Data leakage**: upload customer/employee data to a public model = a breach of your own. Redact or use self-hosted / enterprise controls.
- **Tool echo**: don't paste API keys or secrets into prompts.

## A practical workflow

\`\`\`
1. Gather raw (dig, crt.sh, nmap -oA)
2. From the shell, pipe into your AI (CLI tools)
   es)  cat scan.txt | your_ai 'list hosts/services, flag unusual'
3. Receive structured summary
4. Verify each item (dig it, connect it)
5. Only then report
\`\`\`

## OPSEC of your AI use

- Prompt = data. Keep it clean.
- Add 'web-search' mode and 'cite sources' prompts
- Prefer local/self-hosted models for private target work

> The professional's rule: AI drafts the skeleton; the analyst provides the verified bones. Never put a hallucinated CVE in a report.
`,
      defaultCode: `// A discipline: every claim has a source
const claims = [];
function verifiedClaim(text, source) {
  claims.push({ text, source });
  console.log('verified:', text.slice(0, 40), '->', source);
}
verifiedClaim('host opens 22', 'dig/nmap output');`,
      solution: `const claims = [];
function verifiedClaim(text, source) {
  claims.push({ text, source });
  console.log('verified:', text.slice(0, 40), '->', source);
}
verifiedClaim('host opens 22', 'dig/nmap output');`,
      hint: "AI accelerates; you verify. Cite your sources.",
      challenge: `**Home Lab — AI-Assisted Intel Flow:**
1. Take a raw nmap/dig output from an earlier lab.
2. Paste it into your AI assistant and ask for a structured host/service table.
3. Cross-check 3 items it claims by running the actual query yourself.
4. Ask it to draft 5 Google dorks for exposed S-m buckets; run 2 of them legally.
5. Write a note: which AI outputs did you trust, which felt shaky, and why verification is non-negotiable.`,
    },
  ],
};