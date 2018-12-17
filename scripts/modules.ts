/**
 * @fileoverview
 * @author Taketoshi Aono
 */

import glob from "glob";

export function getSources() {
  return glob.sync(`src/**/*.ts`);
}
