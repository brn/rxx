/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import ts from "typescript";
import fs from "fs-extra";
import pathutil from "path";
import glob from "glob";
import { getSources } from "./modules";
import "colors";

function compile(fileNames: string[], options: ts.CompilerOptions): number {
  let program = ts.createProgram(fileNames, options);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
          .yellow
      );
    } else {
      console.log(
        `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
          .yellow
      );
    }
  });

  const exitCode = emitResult.emitSkipped
    ? 1
    : allDiagnostics.length > 0
      ? 1
      : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  return exitCode;
}

const configFileReadResult = ts.readConfigFile("tsconfig.json", path =>
  fs.readFileSync(path, "utf8")
);
if (configFileReadResult.error) {
  throw configFileReadResult.error;
}
const tsconfig = ts.parseJsonConfigFileContent(
  configFileReadResult.config,
  ts.sys,
  "./"
);

process.exit(
  ["development", "production"].reduce((exitCode, env) => {
    const { sourceMap, ...config } = tsconfig.options;
    return (
      compile(getSources(), {
        ...config,
        outDir: `lib/${env}`,
        declaration: true,
        removeComments: env === "production",
        inlineSourceMap: env === "development"
      }) || exitCode
    );
  }, 0)
);
