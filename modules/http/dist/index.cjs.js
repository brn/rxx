"use strict";function ____$_react_mvi_module_reference_bug_fix__dummy_$____(){}function qs(e){var t=[];return serialize(e,t),t.join("&")}function getType(e){return TO_STRING.call(e).match(TYPE_MATCHER)[1]}function serialize(e,t,r){void 0===r&&(r="");var n=getType(e);if("Object"===n)for(var o in e){var s=getType(e[o]),p=(r?r+".":"")+o;"String"===s||"Number"===s||"RegExp"===s||"Boolean"===s?t.push(encodeURIComponent(p)+"="+encodeURIComponent(e[o])):"Date"===s?t.push(encodeURIComponent(p)+"="+encodeURIComponent(String(+e[o]))):"Object"===s?serialize(e[o],t,o):"Array"===s&&serialize(e[o],t,o)}else if("Array"===n)for(var i=0,a=e.length;i<a;i++)t.push(encodeURIComponent(r[i])+"="+encodeURIComponent(e[i]))}Object.defineProperty(exports,"__esModule",{value:!0});var _reactMvi_core=require("@react-mvi/core"),rxjs_Rx=require("rxjs/Rx");!function(e){e[e.GET=1]="GET",e[e.POST=2]="POST",e[e.PUT=3]="PUT",e[e.DELETE=4]="DELETE"}(exports.HttpMethod||(exports.HttpMethod={})),function(e){e[e.JSON=1]="JSON",e[e.BLOB=2]="BLOB",e[e.ARRAY_BUFFER=3]="ARRAY_BUFFER",e[e.FORM_DATA=4]="FORM_DATA",e[e.TEXT=5]="TEXT",e[e.STREAM=6]="STREAM"}(exports.ResponseType||(exports.ResponseType={})),function(e){e[e.PROGRESS=1]="PROGRESS",e[e.ERROR=2]="ERROR",e[e.ABORT=3]="ABORT",e[e.COMPLETE=4]="COMPLETE"}(exports.UploadEventType||(exports.UploadEventType={})),function(e){e[e.RESPONSE=1]="RESPONSE",e[e.UPLOAD_PROGRESS=2]="UPLOAD_PROGRESS"}(exports.ResponseObjectType||(exports.ResponseObjectType={}));var HttpResponseImpl=function(){function e(e,t,r,n,o){void 0===o&&(o=null),this._ok=e,this._status=t,this._headers=r,this._response=n,this._error=o,this.type=exports.ResponseObjectType.RESPONSE}return Object.defineProperty(e.prototype,"ok",{get:function(){return this._ok},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"headers",{get:function(){return this._headers},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"status",{get:function(){return this._status},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"response",{get:function(){return this._response},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"error",{get:function(){return this._error},enumerable:!0,configurable:!0}),e}(),HttpUploadProgressImpl=function(){function e(e,t){this.event=e,this.xhr=t,this.type=exports.ResponseObjectType.UPLOAD_PROGRESS}return Object.defineProperty(e.prototype,"percent",{get:function(){return this.event.loaded/this.event.total},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"total",{get:function(){return this.event.total},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"loaded",{get:function(){return this.event.loaded},enumerable:!0,configurable:!0}),e.prototype.cancel=function(){this.xhr.abort()},e}(),TYPE_MATCHER=/\[object ([^\]]+)\]/,TO_STRING=Object.prototype.toString,__extends=function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])};return function(t,r){function n(){this.constructor=t}e(t,r),t.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n)}}(),__awaiter=function(e,t,r,n){return new(r||(r=Promise))(function(o,s){function p(e){try{a(n.next(e))}catch(e){s(e)}}function i(e){try{a(n.throw(e))}catch(e){s(e)}}function a(e){e.done?o(e.value):new r(function(t){t(e.value)}).then(p,i)}a((n=n.apply(e,t||[])).next())})},__generator=function(e,t){function r(e){return function(t){return n([e,t])}}function n(r){if(o)throw new TypeError("Generator is already executing.");for(;a;)try{if(o=1,s&&(p=s[2&r[0]?"return":r[0]?"throw":"next"])&&!(p=p.call(s,r[1])).done)return p;switch(s=0,p&&(r=[0,p.value]),r[0]){case 0:case 1:p=r;break;case 4:return a.label++,{value:r[1],done:!1};case 5:a.label++,s=r[1],r=[0];continue;case 7:r=a.ops.pop(),a.trys.pop();continue;default:if(p=a.trys,!(p=p.length>0&&p[p.length-1])&&(6===r[0]||2===r[0])){a=0;continue}if(3===r[0]&&(!p||r[1]>p[0]&&r[1]<p[3])){a.label=r[1];break}if(6===r[0]&&a.label<p[1]){a.label=p[1],p=r;break}if(p&&a.label<p[2]){a.label=p[2],a.ops.push(r);break}p[2]&&a.ops.pop(),a.trys.pop();continue}r=t.call(e,a)}catch(e){r=[6,e],s=0}finally{o=p=0}if(5&r[0])throw r[1];return{value:r[0]?r[1]:void 0,done:!0}}var o,s,p,i,a={label:0,sent:function(){if(1&p[0])throw p[1];return p[1]},trys:[],ops:[]};return i={next:r(0),throw:r(1),return:r(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i},DEFAULT_ERROR_STATUS=500,HttpHandler=function(e){function t(t){var r=e.call(this,t,{request:["get","post","put","delete","upload"],response:"getResponse"})||this;return r.history=[],r}return __extends(t,e),Object.defineProperty(t,"maxHistoryLength",{set:function(e){this._maxHistoryLength=e},enumerable:!0,configurable:!0}),Object.defineProperty(t,"maxHistoryLenght",{get:function(){return this._maxHistoryLength},enumerable:!0,configurable:!0}),t.prototype.subscribe=function(e){var t=this,r=new rxjs_Rx.Subscription;if(e.http){for(var n in e.http)!function(n){var o=e.http[n];r.add(o.subscribe(function(e){return t.push(n,e)}))}(n);for(var n in e.http){var o=e.http[n];(o instanceof rxjs_Rx.ConnectableObservable||"function"==typeof o.connect)&&o.connect()}}return r},t.prototype.push=function(e,r){var n=this;if("RETRY"===e){var o=this.history[this.history.length-("number"==typeof r?r+1:1)];if(!o)return new Promise(function(e,t){return t(new Error("Invlaid retry number specified."))});e=o.key,r=o.args}else this.history.length>t._maxHistoryLength&&this.history.shift(),this.history.push({key:e,args:r});if(!r)return new Promise(function(e,t){return t(new Error("Config required."))});var s=r;s.reduce||(s.reduce=function(e){return e});var p=this.store.get(e);if(s.upload)return this.upload(s).then(function(e){n.handleUploadResonse(p,e,s)});return this.handleResponse(s,function(e,t){var r=n.processHeaders(e),o=new HttpResponseImpl(e.ok,e.status,r,e.ok?t:null,e.ok?null:t);p.forEach(function(e){return e.next(s.reduce({data:o,state:n.state}))})},function(e,t){var r=new HttpResponseImpl(!1,e&&e.status?e.status:DEFAULT_ERROR_STATUS,{},null,t);p.forEach(function(e){return e.next(s.reduce({data:r,state:n.state}))})})},t.prototype.handleUploadResonse=function(e,t,r){var n=this,o=t.subscribe(function(t){if(t.type!==exports.UploadEventType.PROGRESS){o.unsubscribe();var s=t.type!==exports.UploadEventType.COMPLETE,p=t.xhr.getResponseHeader("Content-Type")||"",i=r.responseType===exports.ResponseType.JSON||p.indexOf("application/json")>-1?JSON.parse(t.xhr.responseText):t.xhr.responseText,a={};t.xhr.getAllResponseHeaders().split("\n").forEach(function(e){var t=e.split(":"),r=t[0],n=t[1];r&&n&&(a[r.trim()]=n.trim())}),e.forEach(function(e){var o=new HttpResponseImpl(t.type===exports.UploadEventType.COMPLETE,t.xhr.status,a,s?i:null,s?null:i);e.next(r.reduce({data:o,state:n.state}))})}else e.forEach(function(e){var o=new HttpUploadProgressImpl(t.event,t.xhr);e.next(r.reduce({data:o,state:n.state}))})})},t.prototype.handleResponse=function(e,t,r){return __awaiter(this,void 0,void 0,function(){var n,o,s,p,i,a,u,c=this;return __generator(this,function(f){switch(f.label){case 0:return f.trys.push([0,4,,11]),[4,function(){switch(e.method){case exports.HttpMethod.GET:return c.get(e);case exports.HttpMethod.POST:return c.post(e);case exports.HttpMethod.PUT:return c.put(e);case exports.HttpMethod.DELETE:return c.delete(e);default:return c.get(e)}}()];case 1:if(!(n=f.sent()).ok)throw n;if(!n.url){o="url";try{n[o]=e.url}catch(e){}}return(i=this.getResponse(e.responseType,n))&&i.then?[4,i]:[3,3];case 2:s=f.sent(),t(n,s),f.label=3;case 3:return[3,11];case 4:if(!(p=f.sent())||"function"!=typeof p.json)return[3,9];if(!(i=this.getResponse(e.responseType,p))||!i.then)return[3,8];f.label=5;case 5:return f.trys.push([5,7,,8]),[4,i];case 6:return a=f.sent(),r(p,a),[3,8];case 7:return u=f.sent(),r(p,u),[3,8];case 8:return[3,10];case 9:r(p,p),f.label=10;case 10:return[3,11];case 11:return[2]}})})},t.prototype.processHeaders=function(e){var t={};return e.headers.forEach(function(e,r){return t[r]=e}),t},t.prototype.getFetcher=function(){return fetch},t.prototype.get=function(e){var t=e.url,r=e.headers,n=void 0===r?{}:r,o=e.data,s=void 0===o?null:o,p=e.mode;return this.getFetcher()(s?""+t+qs(s):t,{method:"GET",headers:n,mode:p||"same-origin"})},t.prototype.post=function(e){var t=e.url,r=e.headers,n=void 0===r?{}:r,o=e.data,s=void 0===o?{}:o,p=e.json,i=void 0===p||p,a=e.form,u=void 0!==a&&a,c=e.mode;return this.getFetcher()(t,{headers:n,method:"POST",mode:c||"same-origin",body:i?JSON.stringify(s):u?qs(s):s})},t.prototype.put=function(e){var t=e.url,r=e.headers,n=void 0===r?{}:r,o=e.data,s=void 0===o?{}:o,p=e.json,i=void 0===p||p,a=e.form,u=void 0!==a&&a,c=e.mode;return this.getFetcher()(t,{headers:n,method:"PUT",mode:c||"same-origin",body:i?JSON.stringify(s):u?qs(s):s})},t.prototype.delete=function(e){var t=e.url,r=e.headers,n=void 0===r?{}:r,o=e.data,s=void 0===o?{}:o,p=e.json,i=void 0===p||p,a=e.form,u=void 0!==a&&a,c={headers:n,method:"DELETE",mode:e.mode||"same-origin"};return _reactMvi_core.isDefined(s)&&(c.body=i?JSON.stringify(s):u?qs(s):s),this.getFetcher()(t,c)},t.prototype.upload=function(e){var t=e.method,r=e.url,n=e.headers,o=void 0===n?{}:n,s=e.data,p=void 0===s?{}:s,i=(e.mode,new XMLHttpRequest),a=new rxjs_Rx.Subject,u={},c=function(e,t,r,n){void 0===n&&(n=!1),u[t]=function(t){if(n)for(var o in u)e.removeEventListener(o,u[o]);r(t)},e.addEventListener(t,u[t],!1)};i.upload&&c(i.upload,"progress",function(e){return a.next({type:exports.UploadEventType.PROGRESS,event:e,xhr:i})}),c(i,"error",function(e){return a.next({type:exports.UploadEventType.ERROR,event:e,xhr:i})},!0),c(i,"abort",function(e){return a.next({type:exports.UploadEventType.ABORT,event:e,xhr:i})},!0),c(i,"load",function(e){i.upload||a.next({type:exports.UploadEventType.PROGRESS,event:{total:1,loaded:1},xhr:i}),a.next({type:exports.UploadEventType.COMPLETE,event:e,xhr:i})},!0),i.open(exports.HttpMethod[t],r,!0);for(var f in o)i.setRequestHeader(f,o[f]);return i.send(p),Promise.resolve(a)},t.prototype.getResponse=function(e,t){switch(e){case exports.ResponseType.ARRAY_BUFFER:return t.arrayBuffer();case exports.ResponseType.BLOB:return t.blob();case exports.ResponseType.FORM_DATA:return t.formData();case exports.ResponseType.JSON:return t.json();case exports.ResponseType.TEXT:return t.text();case exports.ResponseType.STREAM:return Promise.resolve(t.body);default:return t.text()}},t.prototype.getResponseTypeFromHeader=function(e){var t=e.headers.get("content-type");return t.indexOf("text/plain")>-1?exports.ResponseType.TEXT:t.indexOf("text/json")>-1||t.indexOf("application/json")>-1?exports.ResponseType.JSON:/^(?:image|audio|video|(?:application\/zip)|(?:application\/octet-stream))/.test(t)?exports.ResponseType.BLOB:exports.ResponseType.TEXT},t._maxHistoryLength=10,t}(_reactMvi_core.StateHandler),__extends$1=function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])};return function(t,r){function n(){this.constructor=t}e(t,r),t.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n)}}(),HttpHandlerMock=function(e){function t(t,r){var n=e.call(this,r)||this;return n.methods=t,n.fetchFunction=function(e,t){return new Promise(function(r,o){setTimeout(function(){var s=n.methods[(t.method||"get").toLowerCase()];if("function"==typeof s){var p=s;try{return r(p(e,t))}catch(e){return o(e)}}r(new Response(t.body,{status:200,statusText:"OK"}))},100)})},n}return __extends$1(t,e),Object.defineProperty(t.prototype,"fetch",{get:function(){return this.fetchFunction},enumerable:!0,configurable:!0}),t}(HttpHandler);exports.____$_react_mvi_module_reference_bug_fix__dummy_$____=____$_react_mvi_module_reference_bug_fix__dummy_$____,exports.HttpResponseImpl=HttpResponseImpl,exports.HttpUploadProgressImpl=HttpUploadProgressImpl,exports.HttpHandler=HttpHandler,exports.HttpHandlerMock=HttpHandlerMock;