SystemJS.config({
  baseURL: (typeof __karma__ !== "undefined") ? "base" : "/",
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  }
});
