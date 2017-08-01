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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var ejs = require("ejs");
var child_process_1 = require("child_process");
var TEMPLATE_DIR = path.join(__dirname, '..', 'template');
/*tslint:disable:no-magic-numbers*/
var stdio = [1, 2, 3];
/*tslint:enable:no-magic-numbers*/
var REQUIRED_LIBRARIES = '@react-mvi/core @react-mvi/http react react-dom props-types rxjs';
var TYPES = '@types/react @types/react-dom @types/prop-types';
function converNameToValidJSClassNamePrefix(appName) {
    var baseName = "" + appName[0].toUpperCase() + appName.slice(1);
    return baseName
        .replace(/(?:_+|-+)([a-zA-Z])/g, function (_, $1) { return $1.toUpperCase(); });
}
var Generator = (function () {
    function Generator(_a) {
        var appName = _a.appName, additionalModules = _a.additionalModules, language = _a.language;
        this.pkg = fs.readFileSync(path.join(TEMPLATE_DIR, 'package.json.template'), 'utf8');
        this.appName = appName;
        this.additionalModules = additionalModules;
        this.language = language;
        var prefix = converNameToValidJSClassNamePrefix(this.appName);
        this.templateGenerator = language === 1 /* TS */ ?
            new TypescriptTemplateGenerator(prefix) : new JSTemplateGenerator(prefix);
    }
    Generator.prototype.generate = function () {
        this.initDependencies();
        this.templateGenerator.generate();
    };
    Generator.prototype.initDependencies = function () {
        var pkg = ejs.render(this.pkg, this);
        fs.writeFileSync('package.json', pkg);
        try {
            child_process_1.execSync("npm install " + REQUIRED_LIBRARIES + " " + (this.language === 1 /* TS */ ? TYPES : ''), { stdio: stdio });
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    return Generator;
}());
exports.Generator = Generator;
var AbstractTemplateGenerator = (function () {
    function AbstractTemplateGenerator() {
    }
    AbstractTemplateGenerator.prototype.mkdir = function (dirName) {
        try {
            fs.mkdirSync(dirName);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    return AbstractTemplateGenerator;
}());
var TypescriptTemplateGenerator = (function (_super) {
    __extends(TypescriptTemplateGenerator, _super);
    function TypescriptTemplateGenerator(classNamePrefix) {
        var _this = _super.call(this) || this;
        _this.classNamePrefix = classNamePrefix;
        return _this;
    }
    TypescriptTemplateGenerator.prototype.generate = function () {
        this.mkdir('src');
        this.deployIndex();
        this.deployStore();
        this.deployIntent();
        this.deployView();
    };
    TypescriptTemplateGenerator.prototype.deployIndex = function () {
        var index = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/index.tsx.template", 'utf8'), this);
        try {
            fs.writeFileSync('src/index.tsx', index);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    TypescriptTemplateGenerator.prototype.deployStore = function () {
        var dir = TypescriptTemplateGenerator.STORE_DIR;
        this.mkdir(dir);
        var store = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/store.ts.template", 'utf8'), this);
        try {
            fs.writeFileSync(dir + "/store.ts", store);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    TypescriptTemplateGenerator.prototype.deployIntent = function () {
        var dir = TypescriptTemplateGenerator.INTENT_DIR;
        this.mkdir(dir);
        var intent = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/intent.ts.template", 'utf8'), this);
        try {
            fs.writeFileSync(dir + "/intent.ts", intent);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    TypescriptTemplateGenerator.prototype.deployView = function () {
        var dir = TypescriptTemplateGenerator.VIEW_DIR;
        this.mkdir(dir);
        var view = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/component.tsx.template", 'utf8'), this);
        try {
            fs.writeFileSync(dir + "/app.tsx", view);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    TypescriptTemplateGenerator.STORE_DIR = 'src/stores';
    TypescriptTemplateGenerator.INTENT_DIR = 'src/intents';
    TypescriptTemplateGenerator.VIEW_DIR = 'src/views';
    return TypescriptTemplateGenerator;
}(AbstractTemplateGenerator));
var JSTemplateGenerator = (function (_super) {
    __extends(JSTemplateGenerator, _super);
    function JSTemplateGenerator(classNamePrefix) {
        var _this = _super.call(this) || this;
        _this.classNamePrefix = classNamePrefix;
        return _this;
    }
    JSTemplateGenerator.prototype.generate = function () {
        this.mkdir('lib');
        this.deployIndex();
        this.deployStore();
        this.deployIntent();
        this.deployView();
    };
    JSTemplateGenerator.prototype.deployIndex = function () {
        var index = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/index.jsx.template", 'utf8'), this);
        try {
            fs.writeFileSync('src/index.jsx', index);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    JSTemplateGenerator.prototype.deployStore = function () {
        var dir = JSTemplateGenerator.STORE_DIR;
        this.mkdir(dir);
        var store = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/store.js.template", 'utf8'), this);
        try {
            fs.writeFileSync(dir + "/store.js", store);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    JSTemplateGenerator.prototype.deployIntent = function () {
        var dir = JSTemplateGenerator.INTENT_DIR;
        this.mkdir(dir);
        var intent = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/intent.js.template", 'utf8'), this);
        try {
            fs.writeFileSync(dir + "/intent.js", intent);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    JSTemplateGenerator.prototype.deployView = function () {
        var dir = JSTemplateGenerator.VIEW_DIR;
        this.mkdir(dir);
        var view = ejs.render(fs.readFileSync(TEMPLATE_DIR + "/component.jsx.template", 'utf8'), this);
        try {
            fs.writeFileSync(dir + "/app.jsx", view);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
    JSTemplateGenerator.STORE_DIR = 'lib/stores';
    JSTemplateGenerator.INTENT_DIR = 'lib/intents';
    JSTemplateGenerator.VIEW_DIR = 'lib/views';
    return JSTemplateGenerator;
}(AbstractTemplateGenerator));
