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

async function sellbotsell(job) {
  job.destroy();
  let sales = 0;
  let tx;
  const sellbotsell = cron.schedule("* * * * *", async () => {
    const balance = await api.balance();
    const highestPending = await api.getHighestPrice();
    const gasPrice = utils.fromWei(highestPending.gasPrice, "gwei");
    if (sales < 3) {
      if (sales !== 2) {
        const amountIn = balance * .5
        tx = await api.swapToEth(inputToken, amountIn);
      } else {
        tx = await api.swapToEth(inputToken, balance);
      }
    } else {
      stopBot(sellbotsell);
    }
    sales++;
  });
}

async function cancelTx(job, { txCount, gasPrice }) {
  job.destroy();
  const newGasPrice = gasPrice * 1.1;
  await api.cancelTx(txCount, newGasPrice);
}

function stopBot(job) {
  job.destroy();
}
