/**
 * @fileoverview
 * @author Taketoshi Aono
 */
/**
 * The methods of the Http request.
 */
export var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 1] = "GET";
    HttpMethod[HttpMethod["POST"] = 2] = "POST";
    HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 4] = "DELETE";
})(HttpMethod || (HttpMethod = {}));
/**
 * Response type of the Http request.
 */
export var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["JSON"] = 1] = "JSON";
    ResponseType[ResponseType["BLOB"] = 2] = "BLOB";
    ResponseType[ResponseType["ARRAY_BUFFER"] = 3] = "ARRAY_BUFFER";
    ResponseType[ResponseType["FORM_DATA"] = 4] = "FORM_DATA";
    ResponseType[ResponseType["TEXT"] = 5] = "TEXT";
})(ResponseType || (ResponseType = {}));
;
export function ____$_react_mvi_module_reference_bug_fix__dummy_$____() { }
