import type { Module } from "../curriculum";

export const module04: Module = {
  id: "module-04",
  slug: "04-security-programming",
  title: "Programming for Security",
  description:
    "Python, Bash and basic web for security practitioners — writing your own scanners, parsers, and analysis tools.",
  language: "Security Coding",
  lessons: [
    {
      id: 1,
      slug: "01-python-fundamentals",
      title: "Python Fundamentals for Security",
      level: "beginner",
      tag: "lab",
      duration: "45 min",
      description:
        "Variables, data structures, control flow, and files — the Python you need before touching any security tool.",
      content: `
# Python Fundamentals for Security

## Why Python

Python is the language of security tooling: Metasploit modules, Scapy, Volatility2 plugins, custom exploits, and parsing scripts. Readable, batteries-included, cross-platform.

## Essential Types

\`\`\`python
name = "alice"          # str
count = 3                # int
ratio = 0.93             # float
present = True           # bool
items = [1, 2, 3]        # list  (ordered, mutable)
record = {"ip": "10.0.0.1", "port": 22}   # dict
unique = {1, 2, 2, 3}    # set   (no duplicates)
\`\`\`

## Conditionals & Loops

\`\`\`python
for ip in ["10.0.0.1", "10.0.0.2"]:
    if ip.startswith("10.0"):
        print("internal:", ip)
    else:
        print("external:", ip)

while True:
    line = input("data> ")
    if line == "exit":
        break
\`\`\`

## Files

\`\`\`python
# Read a log line by line
with open("access.log", "r") as f:
    for line in f:
        parts = line.split()
        ip = parts[0]
        if ip == "192.168.1.50":
            print("SUSPECT:", line.strip())
\`\`\`

## List Comprehensions (Security Gold)

\`\`\`python
ips = [l.split()[0] for l in open("access.log") if "curl" in l]
unique_ips = set(ips)
print(len(unique_ips), "unique IPs used curl")
\`\`\`

## The "parse-everything" habit

Security = parsing. You'll parse logs, packets, configs, hashes, JSON, CSV constantly. Python's \`json\`, \`csv\`, \`re\` (regex) modules make this fast.

> **Golden rule:** understand the data before you analyze it. Run \`print(type(x))\`, \`print(len(x))\`, and peek at the first few items.
`,
      defaultCode: `# Parse failed logins from a log file
try:
    with open("/var/log/auth.log", "r") as f:
        failed = {}
        for line in f:
            if "Failed password" in line:
                ip = line.split()[-4]
                failed[ip] = failed.get(ip, 0) + 1
        for ip, count in sorted(failed.items(), key=lambda x: -x[1])[:5]:
            print(f"{count:4d} failures  {ip}")
except FileNotFoundError:
    print("Log not found — run this on Linux (or adjust path).")`,
      solution: `Parses auth.log for failed password attempts and prints top offenders. On Windows the path won't exist — that's handled gracefully.`,
      hint: "line.split()[-4] grabs the IP field in Ubuntu auth.log format.",
      challenge: `**Home Lab — Parse Real Data:**
1. Generate a real log to parse: install ssh on your Ubuntu VM and attempt 10 wrong passwords + 1 right one.
2. Write the parser above; verify it counts your failures.
3. Extend it: track usernames too (which user was attacked?).
4. Write it to fail-open: if the file doesn't exist, still run with sample data.
5. Save your script — it's the seed of an auth brute-force detector.`,
    },
    {
      id: 2,
      slug: "02-web-security-programming",
      title: "Web Programming Basics for Security",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "HTML, forms, requests, cookies and the DOM — understand what web apps do so you can understand (and break) them.",
      content: `
# Web Programming Basics for Security

## HTML & Forms

Web apps are built from HTML + forms + scripts:

\`\`\`html
<form action="/login" method="POST">
  <input name="user" type="text">
  <input name="pass" type="password">
  <button type="submit">Sign in</button>
</form>
\`\`\`

The browser sends \`user=alice&pass=secret\` to \`/login\`. Attack surface: every input field is trust boundary.

## HTTP Requests in Python

\`\`\`python
import requests

session = requests.Session()

# Login (URL-encode params)
r = session.post("http://testapp/login", data={"user": "alice", "pass": "wrong"})
print(r.status_code, r.headers.get("Set-Cookie"))
print(session.cookies.get_dict())

# Access an authenticated page
r2 = session.get("http://testapp/dashboard")
print(r2.text[:200])
\`\`\`

A **requests session** persists cookies — just like a browser. This is how security testers script multi-step attacks.

## Cookies & Sessions In Code

The server sets a session cookie; subsequent requests send it back:

\`\`\`python
# Manually send a stolen cookie
r = requests.get("http://testapp/private", headers={
    "Cookie": "session=IMPOSTER_VALUE"
})
\`\`\`

> **The lesson:** if the server trusts the cookie alone (no IP check, no MFA re-check), a stolen session cookie = full account takeover.

## Enumerating Endpoints

\`\`\`python
import requests
for path in ["/admin", "/robots.txt", "/backup.zip", "/.git/config"]:
    r = requests.get("http://testapp" + path, timeout=3)
    print(f"{r.status_code:3d}  /{path}" + ("  <-- interesting" if r.status_code in (200, 301, 401) else ""))
\`\`\`

This endpoint enumeration is the heart of recon. You'll also do it with tools (gobuster, ffuf) — but now you understand what they do.

## The DOM & JavaScript

The DOM is the browser's in-memory model of the page. JS runs client-side. **XSS** (cross-site scripting) happens when user input lands in the DOM without sanitization — letting an attacker run their JS in the victim's browser.
`,
      defaultCode: `import requests

def check_status(path):
    try:
        r = requests.get("http://testapp" + path, timeout=3)
        return r.status_code
    except requests.exceptions.RequestException:
        return "ERR"

for path in ["/", "/login", "/admin", "/api/users", "/uploads/", "/config.php"]:
    print(f"{check_status(path):>5}  {path}")`,
      solution: `Runs against a local vulnerable app (DVWA/WebGoat). 200/401/301 on unexpected paths = recon fodder.`,
      hint: "Point it at a lab app (DVWA, WebGoat, Juice Shop) — never a public site without permission.",
      challenge: `**Home Lab — Interact with a Real Vulnerable App:**
1. Deploy OWASP Juice Shop (Docker or standalone) in your lab.
2. Log in, note the session cookie in DevTools → Application → Cookies.
3. Using Python requests, script a login + fetch of an authenticated page.
4. Enumerate endpoints using the script above. Note which return 200 that shouldn't.
5. Answer: what information did endpoint enumeration reveal about the app's structure?`,
    },
    {
      id: 3,
      slug: "03-python-scanners-tools",
      title: "Writing Your Own Security Tools",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Build a port scanner, a banner grabber, a hash cracker, and a log analyzer from scratch — own your tools.",
      content: `
# Writing Your Own Security Tools

## Why Build Your Own

Readiness + understanding. You'll use Nmap, hashcat, and Burp daily — but knowing how a scanner works demystifies evasion and detection.

## A Simple Port Scanner

\`\`\`python
import socket

def scan(host, ports):
    for port in ports:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        try:
            s.connect((host, port))
            print(f"{host}:{port} OPEN")
        except (socket.timeout, ConnectionRefusedError):
            pass  # filtered or closed
        finally:
            s.close()

scan("10.0.0.5", [22, 80, 443, 3389, 445])
\`\`\`

## Banner Grabbing (Recon Gold)

\`\`\`python
import socket

def grab_banner(host, port):
    s = socket.socket()
    s.settimeout(5)
    try:
        s.connect((host, port))
        s.send(b"HEAD / HTTP/1.1\\r\\nHost: " + host.encode() + b"\\r\\n\\r\\n")
        print(f"{host}:{port} ->", s.recv(1024).decode(errors="ignore").strip())
    except Exception as e:
        print(f"{host}:{port} -> {e}")
    finally:
        s.close()
\`\`\`

Banners reveal the exact software + version → exploit search (searchsploit) for the version.

## A Mini Hash Cracker (Wordlist)

\`\`\`python
import hashlib

target = "5f4dcc3b5aa765d61d8327deb882cf99"  # md5("password")
with open("rockyou-small.txt", "r", encoding="latin-1") as f:
    for word in f:
        w = word.strip()
        if hashlib.md5(w.encode()).hexdigest() == target:
            print("CRACKED:", w)
            break
    else:
        print("Not in wordlist")
\`\`\`

**Why professionals use hashcat instead:** GPU acceleration + millions of guesses/sec vs a Python loop at thousands/sec. But seeing the loop teaches the concept.

## A Log Analyzer (Blue Team)

\`\`\`python
import re, collections

pattern = re.compile(r'(\\d+\\.\\d+\\.\\d+\\.\\d+)')
failures = collections.Counter()

for line in open("access.log"):
    if "401" in line:  # unauthorized
        m = pattern.search(line)
        if m: failures[m.group(1)] += 1

for ip, count in failures.most_common(10):
    print(count, ip)
\`\`\`

## Ethics Warning (Always)

Building these tools is legal and good. **Using them against systems you don't own and don't have written permission to test is illegal.** Lab-only. Always.
`,
      defaultCode: `import socket

# Full experiment: combine banner grab with version search idea
def probe(host, port):
    s = socket.socket()
    s.settimeout(3)
    try:
        s.connect((host, port))
        banner = s.recv(256).decode(errors="ignore")
        return banner
    except Exception:
        return None
    finally:
        s.close()

for port in range(1, 25):
    banner = probe("10.0.0.5", port)
    if banner:
        print(port, "->", banner.strip()[:60])`,
      solution: `Scans ports 1-24 and reports banners. Point at your OWN lab server hosting e.g. SSH/Nginx to see real banners.`,
      hint: "Run sshd or nginx in your lab so there are banners to grab.",
      challenge: `**Home Lab — Build the Toolkit:**
1. Write the port scanner + banner grabber. Test against your Ubuntu VM.
2. Install a service (\\\`sudo apt install apache2\\\`) and re-grab banners. Note the version string.
3. Use \\\`searchsploit\\\` to find exploits for that exact version. (Research only — do NOT exploit outside your lab.)
4. Write the hash cracker against a small rockyou subset (download the real rockyou file — wordlist).
5. Bundle the three scripts with usage text and comments. Portfolio material!`,
    },
    {
      id: 4,
      slug: "04-sql-basics-security",
      title: "SQL Basics: Reading & Attacking Databases",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "SELECT, WHERE, JOIN and UNION — the SQL you need to understand SQL injection when you meet it.",
      content: `
# SQL Basics: Reading & Attacking Databases

## Databases Store the Crown Jewels

Users, passwords, credit cards, business secrets. SQL injection (SQLi) is the attack that reads/writes them through a web app. To defend and attack properly, you must speak SQL.

## Core Queries

\`\`\`sql
-- Everything
SELECT * FROM users;

-- Filter
SELECT username, role FROM users WHERE role = 'admin';

-- Count
SELECT COUNT(*) FROM logins WHERE success = 0;

-- Combined
SELECT u.username, u.email FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.amount > 1000;
\`\`\`

## UNION: The Injection Superpower

\`UNION\` combines results from two queries — and it's how attackers exfiltrate data when they only have a SELECT injection point.

\`\`\`sql
-- Legit query (searches products)
SELECT name, price FROM products WHERE id = '$id'

-- Injection: id = 1 UNION SELECT username, password FROM users --
SELECT name, price FROM products WHERE id = '1'
UNION SELECT username, password FROM users -- '
\`\`\`

If the app concatenates user input into the SQL string, the attacker adds columns to the result. The app then renders the password alongside the product name.

## How Injection Happens (Bad Code)

\`\`\`python
# BAD — string concatenation
q = "SELECT * FROM users WHERE name = '" + username + "'"

# GOOD — parameterized
q = "SELECT * FROM users WHERE name = %s"  # driver fills in
cursor.execute(q, (username,))
\`\`\`

**Parameterized queries (prepared statements)** make the database treat user input as DATA, not as SQL. That is the #1 fix.

## Detecting & Exploiting (Red Team View)

Test:
- Input a single quote: \`'\` → error? Likely injectable
- \`1' OR '1'='1\` → does it list more than it should?
- \`1 UNION SELECT NULL, NULL, NULL\` → count columns by null error
- Order columns until you find giants: \`1 UNION SELECT username,password,NULL\`

> Always validate the injection only on YOUR OWN lab apps (DVWA, WebGoat, PortSwigger Academy).

## Defending (Blue Team View)

1. Parameterized queries — always
2. Input validation/whitelisting — reject chars not expected
3. Least-privileged DB accounts (app user can't \`DROP\`)
4. Web Application Firewall (WAF) as defense-in-depth
5. Log + alert on suspicious patterns (\`UNION\`, \`OR 1=1\`, quote errors)
`,
      defaultCode: `-- Practice on a lab DB (SQLite counts)
-- Create a tiny table yourself:
-- CREATE TABLE users (id INT, username TEXT, password TEXT, role TEXT);
-- INSERT INTO users VALUES (1,'alice','secret1','admin'),(2,'bob','guess','user');

-- Then run: show all admins
SELECT username FROM users WHERE role = 'admin';

-- Then the injection that would dump it:
-- SELECT username, password FROM users WHERE id = '1' UNION SELECT username, password FROM users WHERE '1'='1'`,
      solution: `Practice in SQLite (python3 -c "import sqlite3; ..."). Understand that UNION needs matching column counts — try 1, 2, 3 columns till it works.`,
      hint: "COUNT the columns both queries return — UNION demands equal widths.",
      challenge: `**Home Lab — Learn SQLi Hands-On (Lab Only):**
1. Install DVWA (Damn Vulnerable Web App) — or use PortSwigger Web Security Academy (free online).
2. Try the SQLi exercise: single quote test, OR 1=1 bypass, UNION admin dump.
3. Now look at the SAME app's "secure" version — note the parameterized query fix.
4. Write the secure version of the query in Python with parameter binding.
5. Answer in notes: after seeing it done, could you explain SQLi to a junior? Write that explanation.`,
    },
    {
      id: 5,
      slug: "05-linux-python-automation",
      title: "Scripting for Offense & Defense",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "Automate recon, analysis and detection with Python + Bash in real workflows — the daily job of every analyst.",
      content: `
# Scripting for Offense & Defense

## The Analyst's Daily Loop

1. **Collect** — logs, packets, endpoints, alerts
2. **Normalize** — put it in one format
3. **Enrich** — add context (geo, whois, blocklists)
4. **Analyze** — patterns, anomalies
5. **Act/Roll back** — block, alert, escalate

Everything above is scripts.

## Practical Collection Script

\`\`\`python
import datetime, json

logs = []
with open("/var/log/auth.log") as f:
    for line in f:
        if "Failed password" in line:
            parts = line.split()
            logs.append({
                "time": parts[0] + " " + parts[1],
                "user": parts[-3] if len(parts) > 3 else "?",
                "ip": parts[-4] if len(parts) > 4 else "?",
                "source": line.strip(),
            })
print(json.dumps(logs[:3], indent=2))
print("total:", len(logs))
\`\`\`

## Enrichment: WHOIS / DNS in Python

\`\`\`python
import socket
try:
    ip = socket.gethostbyname("evil.example.com")
    print("resolved:", ip)
except socket.gaierror:
    print("no resolution")
\`\`\`

> Real analysts query VirusTotal, Shodan, WHOIS APIs — but always for authorized purposes and with API keys stored safely.

## Defense Automations You Will Write

- **Baseline diffing** — snapshot listening ports, files, processes daily; alert on diffs
- **Alert on new admin users**: parse \`Get-LocalUser\` (PowerShell) and compare
- **Hash a directory daily** to detect file modification
- **Parse SIEM output** into a Python dashboard

## Offense Automation You Will Write (Lab-Only)

- **Recon loop**: iterate subdomains, scan each discovered host
- **Password spray** (careful, CREDENTIAL-STUFFING) against your OWN test app with throttling
- **Nmap parser**: run nmap, parse the XML output (\`-oX\`), summarize services
- **Exploit helper**: pass a banner → searchsploit output → candidate CVE list

## The Automation Golden Rules

1. **Never automate against systems you lack permission for** — scripted attacks hit many targets fast and are LOUD.
2. **Always throttle & log** — a fast scanner = DoS + detection.
3. **Idempotent + rerunnable** — re-run scripts safely.
4. **Determinism** — same input → same output; no surprises.
`,
      defaultCode: `#!/usr/bin/env python3
# Baseline golden: snapshot listening ports + admin users daily
import subprocess, json, datetime, os

def get_ports():
    out = subprocess.run(["ss", "-tulnp"], capture_output=True, text=True)
    return out.stdout

def get_admins():
    # Linux group (rw): members of 'sudo'
    out = subprocess.run(["getent", "group", "sudo"], capture_output=True, text=True)
    return out.stdout

STATE = os.path.expanduser("~/security-baseline.json")
now = datetime.date.today().isoformat()

data = {"date": now, "ports": get_ports(), "admins": get_admins()}
if os.path.exists(STATE):
    prev = json.load(open(STATE))
    if prev.get("ports") != data["ports"]:
        print("[!] LISTENING PORTS CHANGED SINCE LAST RUN")
    if prev.get("admins") != data["admins"]:
        print("[!] ADMIN GROUP CHANGED")
json.dump(data, open(STATE, "w"), indent=2)
print("baseline saved", now)`,
      solution: `Snapshots ports and admin members, diffs against previous run. Run daily (cron) to detect drift/compromise.`,
      hint: "Combine with cron (Linux) or Task Scheduler (Windows) for daily runs.",
      challenge: `**Home Lab — Build Real Automations:**
1. Deploy the baseline script; run it twice; change something (open a port) and see it flag.
2. Set a cron: run baseline daily at 07:00, append to a log.
3. Write a log-watcher: a 24/7 loop that tails auth.log and prints + flags new attacker IPs to a file.
4. Write the Nmap-XML parser: summarize open services per host into a clean table.
5. Document each script's purpose and output format. This is a min-rule SOC toolkit.`,
    },
  ],
};