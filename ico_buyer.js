require('dotenv').config()
const { utils } = require("web3");
const { API } = require('./trading_class');
const cron = require('node-cron');
const api = new API(process.env.DEFAULT_ACCOUNT, process.env.PRIVATE_KEY, 1);
const inputToken = process.argv[process.argv.length-1];
const inputAmount = process.argv[process.argv.length-1];
const gasUsed = 125000;

const buybotbuy = cron.schedule('* * * * * *', async() => {
    const liquidityBool = await api.checkLiquidity(inputToken);
    if (liquidityBool) {
        const highestPending = await api.getHighestPrice()
        const memPendGasHigh = utils.fromWei(highestPending.gasPrice, 'ether');
        const predETHTxFee = memPendGasHigh * gasUsed; // Use to determine whether or not tx is worth it.
        const gasPrice = utils.fromWei(highestPending.gasPrice, 'gwei');
        console.log(predETHTxFee)
        // let res = api.swapFromEth(inputToken, inputAmount, gasPrice);
        // if(typeof res !== 'error') {
        //     stopbuybot();
        // }
    }
});

function stopbuybot() {
    // buybotbuy.
}

const testTrade = async(token) => {

}