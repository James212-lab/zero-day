import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "src/lib/modules";

function transform(src) {
  const out = [];
  let inTemplate = false;
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (!inTemplate) {
      if (ch === "`") {
        inTemplate = true;
        out.push("`");
        i++;
      } else {
        out.push(ch);
        i++;
      }
      continue;
    }
    if (ch === "\\") {
      // preserve existing escape sequences exactly (e.g. \`, \\, \n, \$)
      out.push(ch);
      if (i + 1 < src.length) out.push(src[i + 1]);
      i += 2;
      continue;
    }
    if (ch === "`") {
      let j = i + 1;
      while (j < src.length && (src[j] === " " || src[j] === "\t")) j++;
      const next = src[j];
      if (next === "," || next === "}") {
        inTemplate = false;
        out.push("`");
        i++;
        continue;
      }
      out.push("\\`");
      i++;
      continue;
    }
    out.push(ch);
    i++;
  }
  return out.join("");
}

for (const f of readdirSync(dir)) {
  if (!f.endsWith(".ts")) continue;
  const file = join(dir, f);
  const orig = readFileSync(file, "utf8");
  const fixed = transform(orig);
  writeFileSync(file, fixed, "utf8");
  console.log("transformed", f);
}