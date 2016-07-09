SystemJS.config({
  baseURL: "/",
  paths: {
    "github:": "jspm_packages/github/",
    "npm:": "jspm_packages/npm/",
    "counter/": "src/"
  },
  browserConfig: {
    "baseURL": "/",
    "paths": {
      "main": "src/index"
    }
  }
});
