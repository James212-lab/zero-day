let total = 0;
for (let n = 1; n <= 20; n++) {
  const suffix = String(n).padStart(2, "0");
  const name = `module-${suffix}`;
  const key = `module${suffix}`;
  const m = await import(`../src/lib/modules/${name}.ts`);
  const mod = m[key];
  total += mod.lessons.length;
  console.log(`${name} (${mod.lessons.length})`);
}
console.log("TOTAL LESSONS:", total);