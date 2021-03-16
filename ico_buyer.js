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
        while (_) try {
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
var _this = this;
require("dotenv").config();
var utils = require("web3").utils;
var API = require("./trading_class").API;
var cron = require("node-cron");
var _a = require("@uniswap/sdk"), Token = _a.Token, Pair = _a.Pair;
var CHAINID = 4;
var api = new API(process.env.DEFAULT_ACCOUNT, process.env.PRIVATE_KEY, CHAINID);
console.log(process.argv, process.argv.length);
if (process.argv.length < 4) {
    throw new Error("ERROR: Missing token address and amount inputs");
}
var inputToken = process.argv[process.argv.length - 2];
var inputAmount = process.argv[process.argv.length - 1];
var gasUsed = 125000;
console.log(inputToken);
console.log(inputAmount);
var buybotbuy = cron.schedule("* * * * * *", function () { return __awaiter(_this, void 0, void 0, function () {
    var balance, maxProfit, liquidityBool, highestPending, memPendGasHigh;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, api.balance()];
            case 1:
                balance = _a.sent();
                maxProfit = balance * 2;
                console.log(maxProfit);
                console.log(balance);
                return [4 /*yield*/, api.checkLiquidity(inputToken)];
            case 2:
                liquidityBool = _a.sent();
                return [4 /*yield*/, api.getHighestPrice()];
            case 3:
                highestPending = _a.sent();
                memPendGasHigh = utils.fromWei(highestPending.gasPrice, "ether");
                console.log("memPendGasHigh", memPendGasHigh);
                return [2 /*return*/];
        }
    });
}); });
function stopbuybot() {
    // buybotbuy.
}
var testTrade = function (token) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/];
}); }); };
