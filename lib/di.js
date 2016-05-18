// -*- mode: typescript -*-
/**
 * @fileoverview
 * @author Taketoshi Aono
 */
System.register(['./di/injector', './di/abstract-module', './di/method-proxy', './di/inject'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var injector_1;
    return {
        setters:[
            function (injector_1_1) {
                injector_1 = injector_1_1;
            },
            function (abstract_module_1_1) {
                exports_1({
                    "AbstractModule": abstract_module_1_1["AbstractModule"],
                    "createModule": abstract_module_1_1["createModule"]
                });
            },
            function (method_proxy_1_1) {
                exports_1({
                    "MethodInvocation": method_proxy_1_1["MethodInvocation"]
                });
            },
            function (inject_1_1) {
                exports_1({
                    "inject": inject_1_1["inject"]
                });
            }],
        execute: function() {
            exports_1("Injector", injector_1.default);
        }
    }
});
