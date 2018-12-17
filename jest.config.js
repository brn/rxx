/**
 * @fileoverview
 * @author Taketoshi Aono
 */

module.exports = {
  globals: {
    "ts-jest": {
      babelConfig: {
        presets: ["@babel/preset-env", "babel-preset-power-assert"]
      }
    }
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.js$": "babel-jest"
  },
  roots: ["<rootDir>/src"],
  testRegex: "(__tests__/(?!flycheck_)(.*?|(\\.|/))(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
