require('dotenv').config()
const Tx = require('ethereumjs-tx');
var Web3 = require('web3');
const {ChainId,Token,Fetcher,WETH} = require('@uniswap/sdk')
const { ethers } = require("ethers");
const { FACTORY_ADDRESS, INIT_CODE_HASH } = require('@uniswap/sdk');
const { pack, keccak256 } = require('@ethersproject/solidity');
const { getCreate2Address } = require('@ethersproject/address');

const chainId = ChainId.MAINNET
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // must be checksummed
const decimals = 18
// const decimals =async function getDecimals(chainId: ChainId, tokenAddress: string): Promise<number> {
//     // implementation details
//   }

// You can use any standard network name or standard Chain ID
//  - "homestead" or 1 (or omit; this is the default network)
//  - "ropsten"   or 3
//  - "rinkeby"   or 4
//  - "goerli"    or 5
//  - "kovan"     or 42

var provider = new ethers.providers.InfuraProvider(null,apiKey=process.env.INFURA_ACCESS_TOKEN);
const mainnet = `https://mainnet.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`
const web3 = new Web3(new Web3.providers.HttpProvider(mainnet))
web3.eth.defaultAccount = process.env.WALLET_ADDRESS
// console.log(web3.givenProvider)

const main = async () => {

    getPair(address tokenA, address tokenB)

    // Fetcher.fetchTokenData(chainId, tokenAddress,provider=provider,"DAI", "Dai Stablecoin").then(token => {
    //     console.log(token)
    // }).catch(console.error)
    // const dai = await Fetcher.fetchTokenData(chainId, tokenAddress, provider, "DAI", "Dai Stablecoin");
    // console.log(dai)
    // const weth = WETH[chainId];
    // const pair = Fetcher.fetchPairData(dai, weth, provider);
    // const route = new Route([pair], weth);

    // swap 1 ether
    // const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther("1.0")), TradeType.EXACT_INPUT);
    // console.log("execution price: $" + trade.executionPrice.toSignificant(6));
    // console.log("price impact: " + trade.priceImpact.toSignificant(6) + "%");

    // const tx = await uniswap.swapExactETHForTokens(
    //     amountOutMinHex,
    //     path,
    //     account.address,
    //     deadline,
    //     { 
    //         value: inputAmountHex, 
    //         gasPrice: gasPrice.toHexString(),
    //         gasLimit: ethers.BigNumber.from(150000).toHexString()
    //     }
    // );

    // const DAI = new Token(chainId, tokenAddress, decimals)
    // Balance
    // web3.eth.getBalance(web3.eth.defaultAccount)
    // .then(myBalanceWei => {
    //     // You can use balance here
    //     console.log(web3.utils.fromWei(myBalanceWei, 'ether'))
    // })
    // .catch(console.error);
    // let myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber()
    // console.log(myBalanceWei)
    // let myBalance = web3.fromWei(myBalanceWei, 'ether')
    // console.log(myBalance)
    // console.log(`Your wallet balance is currently ${myBalance} ETH`.green)

    // Transactions
    // web3.eth.getTransactionCount(account1, (err, txCount) => {
    //     // Build the transaction
    //       const txObject = {
    //         nonce:    web3.utils.toHex(txCount),
    //         to:       contract_Address,
    //         value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
    //         gasLimit: web3.utils.toHex(2100000),
    //         gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
    //         data: myData  
    //       }
    //         // Sign the transaction
    //         const tx = new Tx(txObject);
    //         tx.sign(privateKey1);
        
    //         const serializedTx = tx.serialize();
    //         const raw = '0x' + serializedTx.toString('hex');
        
    //         // Broadcast the transaction
    //         const transaction = web3.eth.sendSignedTransaction(raw, (err, tx) => {
    //             console.log(tx)
    //         });
    //     });
  }
   
  main()

// Web3.setProvider('homestead')
// var web3 = new Web3(Web3.givenProvider);
// web3.eth.getAccounts(console.log);
// web3.eth.getBlockNumber().then((result) => {
//     console.log("Latest Ethereum Block is ",result);
//   });

// let provider = ethers.getDefaultProvider('homestead');

// The network will be automatically detected; if the network is
// changed in MetaMask, it causes a page refresh.

// let provider = new ethers.providers.Web3Provider(web3.currentProvider);