require("dotenv").config();
const { utils } = require("web3");
const { API } = require("./trading_class");
const cron = require("node-cron");
const api = new API(process.env.DEFAULT_ADDRESS, process.env.PRIVATE_KEY, 1);
const inputToken = process.argv[process.argv.length - 2];
const inputAmount = process.argv[process.argv.length - 1];
const gasUsed = 125000;

const checkbotcheck = cron.schedule("* * * * * *", async () => {
  const liquidityBool = await api.checkLiquidity(inputToken);
  if (liquidityBool) {
    buybotbuy();
  }
});

async function buybotbuy() {
  try {
    checkbotcheck.destroy();
    const highestPending = await api.getHighestPrice();
    const memPendGasHigh = utils.fromWei(highestPending.gasPrice, "ether");
    const predETHTxFee = memPendGasHigh * gasUsed; // Use to determine whether or not tx is worth it.
    const gasPrice = utils.fromWei(highestPending.gasPrice, "gwei");
    await api.swapFromEth(inputToken, inputAmount, gasPrice);
    const myCurrTxHash = await api.getMyTxHash();
    if (typeof myCurrTxHash === "error") {
        throw new Error(myCurrTxHash.message);
    }
    let timer = 0;
    const seebotsee = cron.schedule("* * * * * *", async () => {
      timer++;
      const receipt = api.getMyReceipt(myCurrTxHash);
      if (timer >= 15 && !receipt) {
          cancelTx(seebotsee);
      }
      if (timer < 15 && receipt.status) {
          sellbotsell(seebotsee);
      }
    });
  } catch (e) {
      console.log(e.message);
      seebotsee.destroy();
  }
}

function sellbotsell(cron) {
    cron.destroy();
}

function cancelTx(cron) {
    cron.destroy();
}

const testTrade = async (token) => {};
