/**
 * @fileoverview
 * @author Taketoshi Aono
 */
"use strict";
/**
 * The methods of the Http request.
 */
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 1] = "GET";
    HttpMethod[HttpMethod["POST"] = 2] = "POST";
    HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 4] = "DELETE";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
/**
 * Response type of the Http request.
 */
var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["JSON"] = 1] = "JSON";
    ResponseType[ResponseType["BLOB"] = 2] = "BLOB";
    ResponseType[ResponseType["ARRAY_BUFFER"] = 3] = "ARRAY_BUFFER";
    ResponseType[ResponseType["FORM_DATA"] = 4] = "FORM_DATA";
    ResponseType[ResponseType["TEXT"] = 5] = "TEXT";
    ResponseType[ResponseType["STREAM"] = 6] = "STREAM";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));
var UploadEventType;
(function (UploadEventType) {
    UploadEventType[UploadEventType["PROGRESS"] = 1] = "PROGRESS";
    UploadEventType[UploadEventType["ERROR"] = 2] = "ERROR";
    UploadEventType[UploadEventType["ABORT"] = 3] = "ABORT";
    UploadEventType[UploadEventType["COMPLETE"] = 4] = "COMPLETE";
})(UploadEventType = exports.UploadEventType || (exports.UploadEventType = {}));
;
function ____$_react_mvi_module_reference_bug_fix__dummy_$____() { }
exports.____$_react_mvi_module_reference_bug_fix__dummy_$____ = ____$_react_mvi_module_reference_bug_fix__dummy_$____;
