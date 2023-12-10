import * as esbuild from "esbuild";
import { argv } from "process";

const buildHandlers = async (...sourceNames: string[]) => {
  console.log("build handlers: ");
  for (const sourceName of sourceNames) {
    console.log(sourceName);
    await esbuild.build({
      entryPoints: [`./resources/${sourceName}.ts`],
      tsconfig: "./tsconfig.builder.json",
      bundle: true,
      platform: "node",
      outdir: `dist/${sourceName}`,
    });
  }
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
      buildHandlers("importParse", "importProduct");
      break;
    case "products":
      buildHandlers(
        "getProductsList",
        "getProductById",
        "createProduct",
        "catalogBatchProcess"
      );
      break;
    default:
      throw new Error("Wrong type on builder!");
  }
});
