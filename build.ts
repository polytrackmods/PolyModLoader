import { readdirSync } from "fs";
import { build } from "bun";
import { dts } from '@anymud/bun-plugin-dts';

const versions = readdirSync("./src");


for (const v of versions) {
  await build({
    entrypoints: [`src/${v}/main.mod.ts`],
    outdir: `dist/${v}`,
    plugins: [dts()],
    format: "esm",
    minify: false
  });
}