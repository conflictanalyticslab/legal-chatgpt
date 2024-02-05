"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
// initialize constants
var llama2_queue = [];
var llama2_processing = false;
var url = 'https://Llama-2-70b-chat-openjustice-serverless.eastus2.inference.ai.azure.com/v1/chat/completions';
//   const apiKey = process.env.LLAMA2_API_KEY;
var apiKey = "OgWjb3oPCHbqfyMuTQ4pA2WoAxqtWtZ3";
// helper function: if queue is not empty and not processing, pop a request out and send to the api, wait for 1 second, then call itself again
var processQueue = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, resolve, reject, messages, response, _b, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                // check if queue is empty, if so, set processing to false (so we are not currently processing any api requests) and return
                if (llama2_queue.length === 0) {
                    llama2_processing = false;
                    return [2 /*return*/];
                }
                // if queue is not empty, set processing to true and pop a request out of the queue as { data, resolve, reject }
                llama2_processing = true;
                _a = llama2_queue.shift(), data = _a.data, resolve = _a.resolve, reject = _a.reject;
                messages = JSON.stringify(data);
                console.log(messages);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + apiKey
                        },
                        body: messages
                    })];
            case 2:
                response = _c.sent();
                // check if response is ok, if not, throw error
                if (!response.ok) {
                    throw new Error("HTTP error! status: ".concat(response.status));
                }
                //   console.log("llama2 queue: " + llama2_queue);
                // resolve the promise with the content of pdf sent back from the api
                _b = resolve;
                return [4 /*yield*/, response.json()];
            case 3:
                //   console.log("llama2 queue: " + llama2_queue);
                // resolve the promise with the content of pdf sent back from the api
                _b.apply(void 0, [_c.sent()]);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                // log the error if something went wrong and reject with the error
                console.error("queryLlama2 failed in queryLlama2: " + error_1);
                reject(error_1);
                return [3 /*break*/, 5];
            case 5:
                // wait for 1 second, then call itself again to process the next request in the queue
                setTimeout(processQueue, 1000);
                return [2 /*return*/];
        }
    });
}); };
// check if apiKey exists, then push new request and call processQueue if not processing
var queryLlama2 = function (data) {
    if (!apiKey) {
        console.error(apiKey);
        throw new Error("Llama2 api key not provided, need to provided api key to invoke the endpoint");
    }
    return new Promise(function (resolve, reject) {
        llama2_queue.push({ data: data, resolve: resolve, reject: reject });
        if (!llama2_processing) {
            processQueue();
        }
    });
};
exports.default = queryLlama2;
