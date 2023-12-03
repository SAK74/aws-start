import * as esbuild from "esbuild";

const main = async () => {
  esbuild.build({
    entryPoints: ["./resources/importParse.ts"],
    tsconfig: "./tsconfig.builder.json",
    bundle: true,
    platform: "node",
    outdir: "dist",
  });
};

main();
