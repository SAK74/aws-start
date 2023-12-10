import * as esbuild from "esbuild";
import { argv } from "process";

const buildImportStackHandlers = async () => {
  console.log("build import handlers");
  esbuild.build({
    entryPoints: ["./resources/importParse.ts", "./resources/importProduct.ts"],
    tsconfig: "./tsconfig.builder.json",
    bundle: true,
    platform: "node",
    outdir: "dist",
  });
};

const buildProductStackHandlers = async () => {
  console.log("build products handlers");
  esbuild.build({
    entryPoints: [
      "./resources/getProductsList.ts",
      "./resources/getProductById.ts",
      "./resources/createProduct.ts",
      "./resources/catalogBatchProcess.ts",
    ],
    tsconfig: "./tsconfig.builder.json",
    bundle: true,
    platform: "node",
    outdir: "dist",
  });
};

let type: string[] | undefined;
const params = argv.slice(2);
if (
  !(type = params
    .find((it) => it.startsWith("type"))
    ?.split("=")
    .slice(-1)
    .flatMap((el) => el.split(",")))
) {
  throw new Error("Missed type param in buider");
}
type.forEach((type) => {
  switch (type) {
    case "import":
      buildImportStackHandlers();
      break;
    case "products":
      buildProductStackHandlers();
      break;
    default:
      throw new Error("Wrong type on builder!");
  }
});
