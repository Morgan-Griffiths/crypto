require("dotenv").config();
const { utils } = require("web3");
const { API } = require("./trading_class");
const cron = require("node-cron");
const api = new API(process.env.DEFAULT_ADDRESS, process.env.PRIVATE_KEY, 1);
const inputToken = process.argv[process.argv.length - 2];
const inputAmount = process.argv[process.argv.length - 1];
const gasUsed = 125000;
let tx;

const checkbotcheck = cron.schedule("* * * * * *", async () => {
  const liquidityBool = await api.checkLiquidity(inputToken);
  if (liquidityBool) {
    buybotbuy();
  }
});

async function buybotbuy() {
  try {
    const balance = await api.balance();
    const maxProfit = balance * 2;
    checkbotcheck.destroy();
    const highestPending = await api.getHighestPrice();
    const predETHTxFee = highestPending.gasPrice * gasUsed; // Use to determine whether or not tx is worth it.
    if (predETHTxFee < maxProfit) {
      const gasPrice = utils.fromWei(highestPending.gasPrice, "gwei");
      const tx = await api.swapFromEth(inputToken, inputAmount, gasPrice);
      const myCurrTxHash = await api.getMyTxHash();
      let timer = 0;
      const seebotsee = cron.schedule("* * * * * *", async () => {
        timer++;
        const receipt = api.getMyReceipt(myCurrTxHash);
        if (timer >= 15 && !receipt) {
          cancelTx(seebotsee, tx);
        }
        if (timer < 15 && receipt.status) {
          sellbotsell(seebotsee);
        }
      });
    }
  } catch (e) {
    console.log(e.message);
  }
}

function sellbotsell(job) {
  job.destroy();
  const sellbotsell = cron.schedule("* * * * * *", async () => {});
}

async function cancelTx(job, { txCount, gasPrice }) {
  job.destroy();
  const newGasPrice = gasPrice * 1.1;
  await api.cancelTx(txCount, newGasPrice);
}

const testTrade = async (token) => {};
