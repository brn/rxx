/**
 * @fileoverview
 * @author Taketoshi Aono
 */

[
  "Object",
  "Function",
  "Array",
  "Boolean",
  "Symbol",
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "Number",
  "Math",
  "Date",
  "String",
  "RegExp",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "ArrayBuffer",
  "DataView",
  "JSON",
  "Promise",
  "Generator",
  "GeneratorFunction",
  "Reflect",
  "Proxy",
  "Intl",
  "eval",
  "uneval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape",
  "Infinity",
  "NaN",
  "undefined",
  "null"
].forEach(p => {
  try {
    global[p] && (window[p] = global[p]);
  } catch (e) {}
});
const oldWindow = window;
global.window = new Proxy(oldWindow, {
  set(target, property, value, receiver) {
    target[property] = value;
    global[property] = value;
    return true;
  }
});

require("core-js");
require("whatwg-fetch");

class Storage {
  constructor() {
    this._stores = {};
  }

  setItem(key, value) {
    this._stores[key] = String(value);
  }

  getItem(key) {
    return this._stores[key];
  }

  length() {
    return Object.keys(this._stores).length;
  }

  keys() {
    return Object.keys(this._stores);
  }

  removeItem(key) {
    delete this._stores[key];
  }

  clear() {
    this._stores = {};
  }
}

global.window.localStorage = new Storage();
global.window.sessionStorage = new Storage();
window.__test__ = true;
