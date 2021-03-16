require("dotenv").config();
const { utils } = require("web3");
const { API } = require("./trading_class");
const cron = require("node-cron");
const Tokens = require("./tokens.js");
const { Token, Pair } = require("@uniswap/sdk");
var BN = utils.BN;
const CHAINID = 4;
const CHAIN_DICT = {
  1: "MAINNET",
  4: "RINKEBY",
};
const api = new API(
  process.env.DEFAULT_ACCOUNT,
  process.env.PRIVATE_KEY,
  CHAINID
);
const tokenName = process.argv[process.argv.length - 2];
const inputAmount = process.argv[process.argv.length - 1];
const gasUsed = 125000;
console.log(inputAmount);

const buybotbuy = cron.schedule("* * * * * *", async () => {
  const balance = await api.balance();
  const maxProfit = balance * 2;
  const liquidityBool = await api.checkLiquidity(tokenName);
  if (liquidityBool) {
    const highestPending = await api.getHighestPrice();
    const memPendGasHigh = utils.fromWei(highestPending.gasPrice, "gwei");
    const maxGasPrice = utils.toBN(maxProfit) / (utils.toBN(gasUsed) * 1000);
    console.log("highestPending.gasPrice", highestPending.gasPrice);
    console.log("Gas high in gwei", memPendGasHigh);
    console.log("Maximum gas price willing to pay", maxGasPrice, maxGasPrice);
    const predETHTxFee = memPendGasHigh * gasUsed; // Use to determine whether or not tx is worth it.
    const gasPrice = utils.fromWei(highestPending.gasPrice, "gwei");
    console.log(predETHTxFee);
    let res = api.swapFromEth(inputToken, inputAmount, gasPrice);
    if (typeof res !== "error") {
      stopbuybot();
    }
  }
});

function stopbuybot() {
  // buybotbuy.
}

const testTrade = async (token) => {};
