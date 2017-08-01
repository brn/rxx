"use strict";
/**
 * The MIT License (MIT)
 * Copyright (c) Taketoshi Aono
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline");
var util_1 = require("util");
var Interaction = (function () {
    function Interaction() {
    }
    Interaction.collectInformation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var rl, question, getAppName, appName, flagInstallAddtional, additionalModules, additionalModuleNames, getLanguage, language;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rl = readline.createInterface({
                            input: process.stdin,
                            output: process.stdout
                        });
                        question = util_1.promisify(function (question, callback) {
                            rl.question(question, callback.bind(null, null));
                        });
                        getAppName = function () { return __awaiter(_this, void 0, void 0, function () {
                            var appName;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, question('Application name?')];
                                    case 1:
                                        appName = _a.sent();
                                        if (!!appName) return [3 /*break*/, 3];
                                        console.warn('Application name is required!');
                                        return [4 /*yield*/, getAppName()];
                                    case 2: return [2 /*return*/, _a.sent()];
                                    case 3:
                                        if (!!/^[a-zA-Z$][a-zA-Z-_$0-9]+$/.test(appName)) return [3 /*break*/, 5];
                                        console.warn('Invalid application name!');
                                        return [4 /*yield*/, getAppName()];
                                    case 4: return [2 /*return*/, _a.sent()];
                                    case 5: return [2 /*return*/, appName];
                                }
                            });
                        }); };
                        appName = getAppName();
                        return [4 /*yield*/, question('Install addition module? (y/n)')];
                    case 1:
                        flagInstallAddtional = _a.sent();
                        additionalModules = [];
                        if (!flagInstallAddtional) return [3 /*break*/, 3];
                        return [4 /*yield*/, question('Input additional module names (comma separeated list like "react,read-dom")')];
                    case 2:
                        additionalModuleNames = _a.sent();
                        additionalModules = additionalModuleNames.split(',').map(function (v) { return v.trim(); });
                        _a.label = 3;
                    case 3:
                        getLanguage = function () { return __awaiter(_this, void 0, void 0, function () {
                            var language;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, question('Language are you want to use? (default ts) [ts/js]')];
                                    case 1:
                                        language = _a.sent();
                                        if (!(language !== 'ts' && language !== 'js')) return [3 /*break*/, 3];
                                        return [4 /*yield*/, getLanguage()];
                                    case 2: return [2 /*return*/, _a.sent()];
                                    case 3: return [2 /*return*/, language === 'ts' ? 1 /* TS */ : 2 /* JS */];
                                }
                            });
                        }); };
                        return [4 /*yield*/, getLanguage()];
                    case 4:
                        language = _a.sent();
                        return [2 /*return*/, {
                                appName: appName,
                                additionalModules: additionalModules,
                                language: language
                            }];
                }
            });
        });
    };
    return Interaction;
}());
exports.Interaction = Interaction;
