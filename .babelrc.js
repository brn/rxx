const C = (module.exports = {
  presets: ["@babel/preset-env", "babel-preset-power-assert"],
  plugins: ["@babel/plugin-proposal-class-properties"]
});

if (process.env.NODE_ENV === "test") {
  C.plugins.push("require-context-hook");
}
