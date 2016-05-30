SystemJS.config({
  baseURL: "",  // notice the empty baseURL, also seems to work with "/base"
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  }
});
