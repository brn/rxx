/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import fs from "fs-extra";
import semver from "semver";
import childProcess from "child_process";
import { getModules } from "./modules";

function prePublish(type: "patch" | "minor" | "major") {
  const pkg = JSON.parse(fs.readFileSync(`package.json`, "utf-8"));
  pkg.version = semver.inc(pkg.version, type);
  fs.writeFileSync(`package.json`, JSON.stringify(pkg, null, "  "));
}

prePublish(process.argv[2] as any);
