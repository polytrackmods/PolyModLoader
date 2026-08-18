import { readdirSync, renameSync, mkdirSync } from "fs";
import { build } from "bun";
import { dts } from '@anymud/bun-plugin-dts';

const versions = readdirSync("./src");

for (const v of versions) {
  if(v.startsWith("_")) continue;
  const outdir = `dist/${v}`;

  await build({
    entrypoints: [`src/${v}/main.mod.ts`],
    outdir,
    plugins: [dts()],
    format: "esm",
    minify: false
  });

  // Move .d.ts files out of the nested dist/<v>/<v>/ -> dist/<v>/
  const nestedDir = `${outdir}/${v}`;
  const nestedFiles = new Bun.Glob("**/*.d.ts").scanSync(nestedDir);
  for (const file of nestedFiles) {
    const src = `${nestedDir}/${file}`;
    const dest = `${outdir}/${file}`;

    mkdirSync(dest.substring(0, dest.lastIndexOf("/")), { recursive: true });
    renameSync(src, dest);
  }

  // Remove the now-empty nested dir
  await Bun.$`rm -rf ${nestedDir}`;

  // Copy JSON assets
  const assets = new Bun.Glob("**/*.{json,svg,png}").scanSync(`src/${v}`);
  for (const file of assets) {
    await Bun.write(`${outdir}/${file}`, Bun.file(`src/${v}/${file}`));
  }
}