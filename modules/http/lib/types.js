/**
 * @fileoverview
 * @author Taketoshi Aono
 */
System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function ____$_react_mvi_module_reference_bug_fix__dummy_$____() { }
    exports_1("____$_react_mvi_module_reference_bug_fix__dummy_$____", ____$_react_mvi_module_reference_bug_fix__dummy_$____);
    var HttpMethod, ResponseType, UploadEventType;
    return {
        setters: [],
        execute: function () {/**
             * @fileoverview
             * @author Taketoshi Aono
             */
            /**
             * The methods of the Http request.
             */
            (function (HttpMethod) {
                HttpMethod[HttpMethod["GET"] = 1] = "GET";
                HttpMethod[HttpMethod["POST"] = 2] = "POST";
                HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
                HttpMethod[HttpMethod["DELETE"] = 4] = "DELETE";
            })(HttpMethod || (HttpMethod = {}));
            exports_1("HttpMethod", HttpMethod);
            /**
             * Response type of the Http request.
             */
            (function (ResponseType) {
                ResponseType[ResponseType["JSON"] = 1] = "JSON";
                ResponseType[ResponseType["BLOB"] = 2] = "BLOB";
                ResponseType[ResponseType["ARRAY_BUFFER"] = 3] = "ARRAY_BUFFER";
                ResponseType[ResponseType["FORM_DATA"] = 4] = "FORM_DATA";
                ResponseType[ResponseType["TEXT"] = 5] = "TEXT";
                ResponseType[ResponseType["STREAM"] = 6] = "STREAM";
            })(ResponseType || (ResponseType = {}));
            exports_1("ResponseType", ResponseType);
            (function (UploadEventType) {
                UploadEventType[UploadEventType["PROGRESS"] = 1] = "PROGRESS";
                UploadEventType[UploadEventType["ERROR"] = 2] = "ERROR";
                UploadEventType[UploadEventType["ABORT"] = 3] = "ABORT";
                UploadEventType[UploadEventType["COMPLETE"] = 4] = "COMPLETE";
            })(UploadEventType || (UploadEventType = {}));
            exports_1("UploadEventType", UploadEventType);
            ;
        }
    };
});
