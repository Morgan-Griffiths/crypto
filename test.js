require('dotenv').config()
// const Window = require('window');
// const window = new Window();
const Tx = require('ethereumjs-tx').Transaction;
const {ChainId,Token,Fetcher,WETH,Route,Trade,TokenAmount,TradeType,Percent,Router} = require('@uniswap/sdk')
const UNISWAP = require('@uniswap/sdk')
const { ethers } = require("ethers");
const { FACTORY_ADDRESS, INIT_CODE_HASH } = require('@uniswap/sdk');
const { pack, keccak256 } = require('@ethersproject/solidity');
const { getCreate2Address } = require('@ethersproject/address');
const axios = require('axios')
const log = require('ololog').configure({ time: true })
const ansi = require('ansicolor').nice
const Web3 = require('web3');
const util = require('util');
const factory_abi = require('./uniswap_abi.js')

// TOKEN ADDRESSES
daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
rinkeby_dai = Web3.utils.toChecksumAddress('0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea')
rinkeby_usdcAddress = Web3.utils.toChecksumAddress('0xfa444d7d643b0c8abcbab14772dc2dcba946ff88')
rinkeby_WETH = '0xc778417E063141139Fce010982780140Aa0cD5Ab'

console.log(rinkeby_dai)

const Exchange_abi = factory_abi.Exchange_abi
const Router_abi = factory_abi.Router_abi

// var provider = new ethers.providers.InfuraProvider(null,apiKey=process.env.INFURA_ACCESS_TOKEN);
const mainnet = `https://mainnet.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`
const rinkeby = `https://rinkeby.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`
const url = `http://geth.dappnode:8545`
// const web3 = new Web3(new Web3.providers.HttpProvider(url))
// const web3 = new Web3(new Web3.providers.HttpProvider(rinkeby))
// const web3 = new Web3(window.web3.currentProvider);
const provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`);
const signer = new ethers.Wallet(Buffer.from(process.env.PRIVATE_KEY, "hex"))
const account = signer.connect(provider);
const chainId = ChainId.RINKEBY
const web3 = new Web3(new Web3.providers.HttpProvider(rinkeby))
console.log(`chainId ${chainId}`)
web3.eth.defaultAccount = process.env.TEST_WALLET_ADDRESS
PRIVATE_KEY = process.env.TEST_PRIVATE_KEY

const getCurrentGasPrices = async () => {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
    let prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10
    }
    console.log("\r\n")
    log (`Current ETH Gas Prices (in GWEI):`.cyan)
    console.log("\r\n")
    log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green)
    log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow)
    log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red)
    console.log("\r\n")
   
    return prices
  }
async function sendMoney(amountToSend) {
    // const wallet = Number(await web3.eth.getBalance(web3.eth.defaultAccount))
    let myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount)
    let myBalance = web3.utils.fromWei(myBalanceWei, 'ether')
    log(`Your wallet balance is currently ${myBalance} ETH`.green)
    let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount)
    log(`The outgoing transaction count for your wallet address is: ${nonce}`.magenta)
    let gasPrices = await getCurrentGasPrices()
    let details = {
        "to": process.env.WALLET_ADDRESS,
        "value": web3.utils.toHex(web3.utils.toWei(amountToSend, 'ether')),
        "gas": 21000,
        "gasPrice": web3.utils.toHex(web3.utils.toWei(`${gasPrices.medium}`, 'gwei')), // converts the gwei price to wei
        "nonce": nonce,
        "chainId": 4 // EIP 155 chainId - mainnet: 1, rinkeby: 4
      }
    const transaction = new Tx(details,{'chain':'rinkeby'})
    const privateKey = Buffer.from(PRIVATE_KEY,'hex')
    transaction.sign(privateKey)
    const serializedTransaction = transaction.serialize()
    const transactionId = await web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'))
    console.log(transactionId)
    const url = `https://rinkeby.etherscan.io/tx/${transactionId.transactionHash}`
    log(url.cyan)
    log(`Note: please allow for 30 seconds before transaction appears on Etherscan`.magenta)
    process.exit()
}

async function getHighestPrice() {
    const pending = await web3.eth.getBlock('pending',true);
    const pendingTransactions = pending.transactions
    // console.log(pendingTransactions)
    const highest = pendingTransactions.filter((v,idx,arr) => {
        if (v.transactionIndex == 0) {
            return v
        }
    })
    const highestCheck = pendingTransactions.sort((a,b) => {
        return b.gasPrice - a.gasPrice
    }).slice(0,1);
    return highest
}

async function UniswapLiquidity() {

    daiPair = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"
    daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    // Get pair address for token
    // print(uniswap_wrapper.get_pair(xcore_address,WETH_address))
}

const executeTrade = async (provider,account,tokenSend,tokenReceive,uniswap,tradeParams) => {
    console.group('executeTrade')
    console.log(`Spending ${util.inspect(tokenSend)}, Receiving ${util.inspect(tokenReceive)}`);
    // const gasPrice = await provider.getGasPrice();
    // const gasPrice = ethers.BigNumber.from(tradeParams.gasPrice) // in wei
    console.log('gasPrice',tradeParams.gasPrice,parseInt(tradeParams.gasPrice._hex,16))
    console.log('gasLimit',tradeParams.gasLimit,parseInt(tradeParams.gasLimit._hex,16))

    const pair = await Fetcher.fetchPairData(tokenReceive, tokenSend, provider); // use the provider, otherwise you'll get a warning
    const route = new Route([pair], tokenSend);

    // swap 1 ether
    const trade = new Trade(route, new TokenAmount(tokenSend, ethers.utils.parseEther(tradeParams.amountIn)), TradeType.EXACT_INPUT);
    const inputAmount = trade.inputAmount.raw;
    const inputAmountHex = ethers.BigNumber.from(inputAmount.toString()).toHexString(); 
    console.log("execution price: $" + trade.executionPrice.toSignificant(6));
    console.log("price impact: " + trade.priceImpact.toSignificant(6) + "%"); // always > 0.3%

    const slippageTolerance = tradeParams.slippageTolerance;
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    console.log('amountOutMin',amountOutMin)
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
    const path = [tokenSend.address, tokenReceive.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 1; // 1 mins time
    const tx = await uniswap.swapExactETHForTokens(
        amountOutMinHex,
        path,
        account.address,
        deadline,
        { 
            value: inputAmountHex, 
            gasPrice: tradeParams.gasPrice.toHexString(),
            gasLimit: tradeParams.gasLimit.toHexString()
        }
    );
    console.log(tx)
}

const returnEC20Contract = async (address,account) => {
    // declare the DAI contract interfaces
    const contract = new ethers.Contract(
        address,
        ['function balanceOf(address owner) external view returns (uint)',
            'function decimals() external view returns (uint8)'],
        account
      );
    return contract
}

function sendSigned(txData,cb) {
    const privateKey = Buffer.from(PRIVATE_KEY,'hex')
    const transaction = new Tx(txData,{'chain':chainId})
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    web3.eth.sendSignedTransaction('0x'+serializedTx,cb)
}

async function swapEth(contract,) {

}

async function testFunc() {
    // const highest = getHighestPrice()
    // console.log('highest',highest)
    // const amountToSend = "0.1"
    // sendMoney(amountToSend)
    // const DAI = new Token(chainId, tokenAddress, decimals)
    // const DAI = await Fetcher.fetchTokenData(chainId, tokenAddress)
    ///////
    const weth = WETH[chainId];
    const USDC = new Token(chainId, usdcAddress, 6)
    const DAI = await Fetcher.fetchTokenData(
        chainId,
        rinkeby_dai,
        provider,
        'DAI',
        'Dai Stablecoin'
      )
    const pair = await Fetcher.fetchPairData(DAI, weth, provider);
    const route = new Route([pair], WETH[DAI.chainId])
    // const route = new Route([pair], WETH[DAI.chainId])
    const routerContract = new web3.eth.Contract(JSON.parse(Router_abi), process.env.UNISWAP_ROUTER_ADDRESS,
        (error,result) => {if (error) {console.log(error)}})
    // Trade impact
    // const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], '1000000000000000000'), TradeType.EXACT_INPUT)
    // Execute trade
    const amountIn = web3.utils.toWei("0.1", 'ether') // 0.1 WETH
    const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], amountIn), TradeType.EXACT_INPUT)
    log('WETH DAI trade'.magenta)
    log(`Execution price ${trade.executionPrice.toSignificant(6)}`.green)
    log(`Next mid price ${trade.nextMidPrice.toSignificant(6)}`.red)
    const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%
    // Fix this
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw // needs to be converted to e.g. hex
    console.log(amountOutMin)
    const addressFrom = web3.eth.defaultAccount
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5 // 20 minutes from the current Unix time
    const tx = routerContract.methods.swapExactETHForTokens(web3.utils.toHex(6*10**2),[route.input.address,route.output.address],addressFrom,deadline)
    const encodedABI = tx.encodeABI()
    let gasPrices = await getCurrentGasPrices()
    web3.eth.getTransactionCount(addressFrom).then(txCount => {
      // construct the transaction data
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex('300000'),
        gasPrice: web3.utils.toHex(web3.utils.toWei(`${gasPrices.medium}`, 'gwei')),
        to: process.env.UNISWAP_ROUTER_ADDRESS,
        from: addressFrom,
        data: encodedABI,
        value: web3.utils.toHex(amountIn)
      }
      // fire away!
      sendSigned(txData, function(err, result) {
        if (err) return console.log(err)
        console.log(`sent https://rinkeby.etherscan.io/tx/${result}`)
      })
    })
    
    // const path = [route.input.address,route.output.address]
    
    // const contract = new ethers.Contract(
    //     web3.eth.defaultAccount,
    //     ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
    //     account
    //   );
    // console.log(`${Object.getOwnPropertyNames(contract.swapExactETHForTokens)}`)
    // const transact = contract.swapExactETHForTokens(amountOutMin,path,'',deadline,{value:web3.utils.toHex(amountIn),gasPrice:21e9})
    // console.log(`Transaction hash: ${transact.hash}`)
    // console.log(`${Object.getOwnPropertyNames(transact)}`)
    // const receipt = await transact.wait();
    // log('WETH DAI trade'.magenta)
    // log('Midprice',route.midPrice.toSignificant(6)) // 201.306
    // log('Inverted midprice',route.midPrice.invert().toSignificant(6)) // 0.00496756

    // Trade invert
    // const USDCWETHPair = await Fetcher.fetchPairData(USDC, WETH[ChainId.MAINNET])
    // const DAIUSDCPair = await Fetcher.fetchPairData(DAI, USDC)

    // const route = new Route([USDCWETHPair, DAIUSDCPair], WETH[ChainId.MAINNET])
    // log('USDC DAI trade'.magenta)
    // log(route.midPrice.toSignificant(6).green) // 202.081
    // log(route.midPrice.invert().toSignificant(6).red) // 0.00494851

    // const path = [WETH[DAI.chainId].address, DAI.address]
    // const to = '' // should be a checksummed recipient address
    // const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
    // const value = trade.inputAmount.raw // // needs to be converted to e.g. hex
    // ethers.exchangeContract.methods.ethToTokenSwapOutput(tokens_bought, deadline).send({value: ethValue})
    // let tx = await exchangeContract.ethToTokenSwapOutput(tokens_bought, deadline, overrides);
    // const uniswap = new ethers.Contract(
    //     process.env.UNISWAP_ROUTER_ADDRESS,
    //     ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
    //     account
    //   );
    // let gasPrices = await getCurrentGasPrices()
    // const tradeParams = {
    //     gasPrice: ethers.BigNumber.from(gasPrices.low * 1000000000), // in wei
    //     gasLimit: ethers.BigNumber.from(2000000),
    //     amountIn:"0.0", // in Ether
    //     slippageTolerance:new Percent('50', '10000'), // in thousands
    // }
    // await executeTrade(provider,account,weth,DAI,uniswap,tradeParams) 
}

// testFunc()

// const amountToSend = "0.0"
// sendMoney(amountToSend)
// console.log(Web3)
// let myBalanceWei = 
// console.log(myBalanceWei)
// let myBalance = web3.fromWei(myBalanceWei, 'ether')
// console.log(myBalance)
// console.log(`Your wallet balance is currently ${myBalance} ETH`.green)