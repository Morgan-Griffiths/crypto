require("dotenv").config();
const Tokens = require("./tokens.js");
const { API } = require("./trading_class.js");

const address = process.env.TEST_WALLET_ADDRESS;
const private_key = process.env.TEST_PRIVATE_KEY;
const chainId = 1;
const bot = new API(address, private_key, chainId);
// let token = bot.tokenLookup('DAI')
// console.log(token)
// let fromEth = bot.getPairAddress(token.address)
// bot.checkLiquidity('DAI')
// bot.swapToEth(token)
bot.main();
// bot.test()
