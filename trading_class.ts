require("dotenv").config();
const Tx = require("ethereumjs-tx").Transaction;
const { FACTORY_ADDRESS, INIT_CODE_HASH } = require("@uniswap/sdk");
const { pack, keccak256 } = require("@ethersproject/solidity");
const { getCreate2Address } = require("@ethersproject/address");
const axios = require("axios");
const log = require("ololog").configure({ time: true });
const Tokens = require("./tokens.js");
const factory_abi = require("./uniswap_abi.js");
const Router_abi = factory_abi.Router_abi;
const JSBI = require("jsbi");

import {
  ChainId,
  Token,
  Fetcher,
  WETH,
  Route,
  Trade,
  TokenAmount,
  TradeType,
  Percent,
  Router,
  Pair,
} from "@uniswap/sdk";
import Web3 from "web3";
import { BigNumber, ethers } from "ethers";
import pino from "pino";

const APPROVE_JSON = {
  constant: false,
  inputs: [
    {
      name: "_spender",
      type: "address",
    },
    {
      name: "_value",
      type: "uint256",
    },
  ],
  name: "approve",
  outputs: [
    {
      name: "",
      type: "bool",
    },
  ],
  payable: false,
  stateMutability: "nonpayable",
  type: "function",
};

var web3;
var provider;
var signer;
var account;

export const logger = pino(
  { level: process.env.LOG_LEVEL || "debug" },
  pino.destination("app.log")
);

export function logging(
  target: any,
  name: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  if (typeof original === "function") {
    descriptor.value = function (...args) {
      logger.info(`Arguments: ${args}`);
      try {
        const result = original.apply(this, args);
        logger.info(`Result: ${result}`);
        return result;
      } catch (e) {
        logger.info(`Error: ${e}`);
        throw e;
      }
    };
  }
  return descriptor;
}

type address = string;
export class API {
  address: address;
  private_key: string;
  chainId: number;
  chain_dict: object;
  network: string;
  networkTokens: object;
  weth: Token;
  chain_name: string;
  provider_url: string;
  transaction_url: string;
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.Wallet;
  account: ethers.Wallet;
  constructor(address: string, private_key: string, chainId: number) {
    this.address = address;
    this.private_key = private_key;
    this.chainId = chainId;
    this.chain_dict = {
      1: "mainnet",
      4: "rinkeby",
    };
    this.network = this.chain_dict[this.chainId];
    this.networkTokens = Tokens[this.network.toUpperCase()];
    this.weth = WETH[chainId];
    this.chain_name = this.chain_dict[chainId];
    this.provider_url = `https://${this.chain_name}.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`;
    this.transaction_url =
      chainId != 1
        ? `https://${this.chain_name}.etherscan.io/tx/`
        : `https://etherscan.io/tx/`;
    provider = new ethers.providers.JsonRpcProvider(this.provider_url);
    signer = new ethers.Wallet(Buffer.from(private_key, "hex"));
    account = signer.connect(provider);
    web3 = new Web3(new Web3.providers.HttpProvider(this.provider_url));
    web3.eth.defaultAccount = address;
  }

  @logging
  async main() {
    const DAI: Token = await Fetcher.fetchTokenData(
      this.chainId,
      this.networkTokens["DAI"].tokenAddress,
      this.provider,
      "DAI",
      "Dai Stablecoin"
    );
    const LINK: Token = await Fetcher.fetchTokenData(
      this.chainId,
      this.networkTokens["LINK"].tokenAddress,
      this.provider,
      "LINK"
    );
    // console.log(web3.utils.toChecksumAddress("0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"))
    // const amountIn = web3.utils.toWei("0.1", 'ether') // 10**17
    const amountIn = `${50 * 10 ** DAI.decimals}`;
    // console.log(typeof amountIn,amountIn)
    this.swapToEth(DAI, amountIn);
    // this.swapFromEth(DAI,amountIn)
    // this.testTrade()
    // this.checkLiquidity('DAI')
  }

  async testTrade() {
    // var abi = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x06fdde03"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x095ea7b3"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x18160ddd"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x23b872dd"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x313ce567"},{"constant":true,"inputs":[],"name":"cap","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x355274ea"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x39509351"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x40c10f19"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x70a08231"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x715018a6"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x8da5cb5b"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x8f32d59b"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x95d89b41"},{"constant":false,"inputs":[{"name":"account","type":"address"}],"name":"addMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x983b2d56"},{"constant":false,"inputs":[],"name":"renounceMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x98650275"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xa457c2d7"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xa9059cbb"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"isMinter","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xaa271e1a"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xdd62ed3e"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xf2fde38b"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"account","type":"address"}],"name":"MinterAdded","type":"event","signature":"0x6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f6"},{"anonymous":false,"inputs":[{"indexed":true,"name":"account","type":"address"}],"name":"MinterRemoved","type":"event","signature":"0xe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb66692"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event","signature":"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event","signature":"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event","signature":"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"}]'

    var abi =
      '[{"name": "TokenPurchase", "inputs": [{"type": "address", "name": "buyer", "indexed": true}, {"type": "uint256", "name": "eth_sold", "indexed": true}, {"type": "uint256", "name": "tokens_bought", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "EthPurchase", "inputs": [{"type": "address", "name": "buyer", "indexed": true}, {"type": "uint256", "name": "tokens_sold", "indexed": true}, {"type": "uint256", "name": "eth_bought", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "AddLiquidity", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "eth_amount", "indexed": true}, {"type": "uint256", "name": "token_amount", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "RemoveLiquidity", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "eth_amount", "indexed": true}, {"type": "uint256", "name": "token_amount", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "Transfer", "inputs": [{"type": "address", "name": "_from", "indexed": true}, {"type": "address", "name": "_to", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "Approval", "inputs": [{"type": "address", "name": "_owner", "indexed": true}, {"type": "address", "name": "_spender", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "setup", "outputs": [], "inputs": [{"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 175875}, {"name": "addLiquidity", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_liquidity"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 82605}, {"name": "removeLiquidity", "outputs": [{"type": "uint256", "name": "out"}, {"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "amount"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 116814}, {"name": "__default__", "outputs": [], "inputs": [], "constant": false, "payable": true, "type": "function"}, {"name": "ethToTokenSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 12757}, {"name": "ethToTokenTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "min_tokens"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": true, "type": "function", "gas": 12965}, {"name": "ethToTokenSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": true, "type": "function", "gas": 50463}, {"name": "ethToTokenTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": true, "type": "function", "gas": 50671}, {"name": "tokenToEthSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 47503}, {"name": "tokenToEthTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_eth"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": false, "type": "function", "gas": 47712}, {"name": "tokenToEthSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}], "constant": false, "payable": false, "type": "function", "gas": 50175}, {"name": "tokenToEthTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}, {"type": "uint256", "name": "max_tokens"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}], "constant": false, "payable": false, "type": "function", "gas": 50384}, {"name": "tokenToTokenSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 51007}, {"name": "tokenToTokenTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 51098}, {"name": "tokenToTokenSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 54928}, {"name": "tokenToTokenTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "token_addr"}], "constant": false, "payable": false, "type": "function", "gas": 55019}, {"name": "tokenToExchangeSwapInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 49342}, {"name": "tokenToExchangeTransferInput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}, {"type": "uint256", "name": "min_tokens_bought"}, {"type": "uint256", "name": "min_eth_bought"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 49532}, {"name": "tokenToExchangeSwapOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 53233}, {"name": "tokenToExchangeTransferOutput", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}, {"type": "uint256", "name": "max_tokens_sold"}, {"type": "uint256", "name": "max_eth_sold"}, {"type": "uint256", "name": "deadline"}, {"type": "address", "name": "recipient"}, {"type": "address", "name": "exchange_addr"}], "constant": false, "payable": false, "type": "function", "gas": 53423}, {"name": "getEthToTokenInputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_sold"}], "constant": true, "payable": false, "type": "function", "gas": 5542}, {"name": "getEthToTokenOutputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_bought"}], "constant": true, "payable": false, "type": "function", "gas": 6872}, {"name": "getTokenToEthInputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "tokens_sold"}], "constant": true, "payable": false, "type": "function", "gas": 5637}, {"name": "getTokenToEthOutputPrice", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "uint256", "name": "eth_bought"}], "constant": true, "payable": false, "type": "function", "gas": 6897}, {"name": "tokenAddress", "outputs": [{"type": "address", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1413}, {"name": "factoryAddress", "outputs": [{"type": "address", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1443}, {"name": "balanceOf", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "_owner"}], "constant": true, "payable": false, "type": "function", "gas": 1645}, {"name": "transfer", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 75034}, {"name": "transferFrom", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 110907}, {"name": "approve", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_spender"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 38769}, {"name": "allowance", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "_owner"}, {"type": "address", "name": "_spender"}], "constant": true, "payable": false, "type": "function", "gas": 1925}, {"name": "name", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1623}, {"name": "symbol", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1653}, {"name": "decimals", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1683}, {"name": "totalSupply", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1713}]';

    // let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"));
    // the address that will send the test transaction
    const addressFrom = this.address;
    const exchange_addr = "0x416F1Ac032D1eEE743b18296aB958743B1E61E81";
    // the exchange contract address
    // const addressTo = '0xCC4d8eCFa6a5c1a84853EC5c0c08Cc54Cb177a6A'
    const addressTo = "0xaFD52EF3Cb0eE6673cA5EbE0A25686313fF0C283";
    const contract = new web3.eth.Contract(JSON.parse(abi), addressTo);
    console.log(Object.getOwnPropertyNames(contract.methods));
    const deadline = Math.floor(Date.now() / 1000) + 15; // 15 seconds
    const minEth = web3.utils.toHex(1 * 10 ** 17);
    const tokensSold = web3.utils.toHex(50 * 10 ** 18);
    const tx = contract.methods.tokenToEthTransferOutput(
      tokensSold,
      minEth,
      deadline,
      addressFrom
    );
    // const encodedABI = tx.encodeABI();

    // // get the number of transactions sent so far so we can create a fresh nonce
    // web3.eth.getTransactionCount(addressFrom).then(txCount => {

    // // construct the transaction data
    // const txData = {
    //     nonce: web3.utils.toHex(txCount),
    //     gasLimit: web3.utils.toHex(6000000),
    //     gasPrice: web3.utils.toHex(10000000000), // 10 Gwei
    //     to: addressTo,
    //     from: addressFrom,
    //     data: encodedABI,
    // }

    // // fire away!
    // this.sendSigned(txData, this.callback.bind(this))

    // })
  }
  @logging
  async balance() {
    let myBalanceWei = await web3.eth.getBalance(this.address);
    let myBalance = web3.utils.fromWei(myBalanceWei, "ether");
    log.green(`Your wallet balance is currently ${myBalance} ETH`);
    return myBalanceWei;
  }

  @logging
  async callback(err, result) {
    if (err) return console.log(err);
    console.log(`sent ${this.transaction_url}${result}`);
  }

  // Swap from eth to token
  @logging
  async swapFromEth(outToken, amountIn, gasPrice) {
    const pair = await Fetcher.fetchPairData(outToken, this.weth, provider);
    const route = new Route([pair], WETH[outToken.chainId]);
    const routerContract = new web3.eth.Contract(
      JSON.parse(Router_abi),
      process.env.UNISWAP_ROUTER_ADDRESS,
      (error, result) => {
        if (error) {
          console.log(error);
        }
      }
    );
    const trade = new Trade(
      route,
      new TokenAmount(WETH[outToken.chainId], amountIn),
      TradeType.EXACT_INPUT
    );
    log.magenta("WETH DAI trade");
    log.green(`Execution price ${trade.executionPrice.toSignificant(6)}`);
    log.red(`Next mid price ${trade.nextMidPrice.toSignificant(6)}`);
    const slippageTolerance = new Percent("50", "10000"); // 50 bips, or 0.50%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
    console.log("amountOutMin", Number(amountOutMin));
    const addressFrom = this.address;
    const deadline = Math.floor(Date.now() / 1000) + 15; // 15 seconds
    const path = route.path.map((t) => t.address);
    const tx = routerContract.methods.swapExactETHForTokens(
      web3.utils.toHex(String(amountOutMin)),
      path,
      addressFrom,
      deadline
    );
    const encodedABI = tx.encodeABI();
    return web3.eth.getTransactionCount(addressFrom).then((err, txCount) => {
      // construct the transaction data
      if (err) throw err;
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex("300000"),
        gasPrice,
        to: process.env.UNISWAP_ROUTER_ADDRESS,
        from: addressFrom,
        data: encodedABI,
        value: web3.utils.toHex(amountIn),
      };
      // fire away!
      this.sendSigned(txData, this.callback.bind(this));
      return { txCount, gasPrice };
    });
  }

  // Swap from token to eth
  @logging
  async swapToEth(inToken, amountIn) {
    // require(inToken.transferFrom(this.address, address(this), amountIn), 'transferFrom failed.');
    // require(inToken.approve(address(UniswapV2Router02), amountIn), 'approve failed.');
    // amountOutMin must be retrieved from an oracle of some kind
    const pair = await Fetcher.fetchPairData(inToken, this.weth, provider);
    const route = new Route([pair], inToken, WETH[inToken.chainId]);
    const routerContract = new web3.eth.Contract(
      JSON.parse(Router_abi),
      process.env.UNISWAP_ROUTER_ADDRESS,
      (error, result) => {
        if (error) {
          console.log(error);
        }
      }
    );
    const trade = new Trade(
      route,
      new TokenAmount(inToken, amountIn),
      TradeType.EXACT_INPUT
    );
    const slippageTolerance = new Percent("500", "10000"); // 50 bips, or 0.50%s
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
    console.log(
      "amountOutMin",
      String(amountOutMin),
      web3.utils.fromWei(String(amountOutMin), "ether")
    );
    console.log("amountIn", amountIn, web3.utils.fromWei(amountIn, "ether"));
    log.magenta("WETH DAI trade");
    log.green(`Execution price ${trade.executionPrice.toSignificant(6)}`);
    log.red(`Mid price ${trade.nextMidPrice.toSignificant(6)}`);
    log(`Inverted price ${route.midPrice.invert().toSignificant(6)}`); // 0.00496756
    const deadline = Math.floor(Date.now() / 1000) + 120; // 15 seconds
    const path = route.path.map((t) => t.address);
    let gasPrices = await this.getCurrentGasPrices();
    const addressFrom = this.address;
    const approvalTx = web3.eth.abi.encodeFunctionCall(APPROVE_JSON, [
      process.env.UNISWAP_ROUTER_ADDRESS,
      web3.utils.toHex(amountIn),
    ]);

    web3.eth.getTransactionCount(addressFrom).then((txCount) => {
      console.log("txCount", txCount);
      // construct the transaction data
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex("300000"),
        gasPrice: web3.utils.toHex(
          web3.utils.toWei(`${gasPrices.medium}`, "gwei")
        ),
        to: inToken.address,
        from: addressFrom,
        data: approvalTx,
        value: web3.utils.toHex(0),
      };
      // fire away!
      this.sendSignedAsync(txData)
        .on((err) => {
          console.log("approve err", err);
        })
        .then(() => {
          const tx = routerContract.methods.swapExactTokensForETH(
            web3.utils.toHex(amountIn),
            web3.utils.toHex(String(amountOutMin)),
            path,
            addressFrom,
            deadline
          );
          const encodedABI = tx.encodeABI();
          web3.eth.getTransactionCount(addressFrom).then((txCount) => {
            console.log("txCount", txCount);
            // construct the transaction data
            const txData = {
              nonce: web3.utils.toHex(txCount),
              gasLimit: web3.utils.toHex("300000"),
              gasPrice: web3.utils.toHex(
                web3.utils.toWei(`${gasPrices.medium}`, "gwei")
              ),
              to: process.env.UNISWAP_ROUTER_ADDRESS,
              from: addressFrom,
              data: encodedABI,
              value: web3.utils.toHex(0),
            };
            // fire away!
            this.sendSigned(txData, this.callback.bind(this));
          });
        });
    });
  }

  // Swap from token to token
  @logging
  async swapToToken(inToken, outToken, amountIn) {
    const pair = await Fetcher.fetchPairData(inToken, outToken, provider);
    const routerContract = new web3.eth.Contract(
      JSON.parse(Router_abi),
      process.env.UNISWAP_ROUTER_ADDRESS
    );
    const route = new Route([pair], inToken);
    console.log(route);
    const trade = new Trade(
      route,
      new TokenAmount(inToken, amountIn),
      TradeType.EXACT_INPUT
    );
    log.magenta("WETH DAI trade");
    // log(`Execution price ${trade.executionPrice.toSignificant(6)}`.green)
    // log(`Next mid price ${trade.nextMidPrice.toSignificant(6)}`.red)
    const slippageTolerance = new Percent("50", "10000"); // 50 bips, or 0.50%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
    // console.log('amountOutMin',Number(amountOutMin))

    console.log(Object.getOwnPropertyNames(routerContract));
    const LINK_BOUGHT = web3.utils.toHex(10 * 10 ** 18);
    const MAX_TOKEN_SOLD = web3.utils.toHex(80 * 10 ** 18);
    const MAX_ETH_SOLD = web3.utils.toHex * 1 * 10 ** 17;
    // routerContract.methods.swapExactTokensForTokens(LINK_BOUGHT,MAX_TOKEN_SOLD,MAX_ETH_SOLD,DEADLINE,addressFrom,linkTokenAddress)
    const addressFrom = this.address;
    const deadline = Math.floor(Date.now() / 1000) + 15; // 15 seconds
    const path = route.path.map((t) => t.address);
    const tx = routerContract.methods.swapExactTokensForTokens(
      web3.utils.toHex(amountOutMin),
      path,
      addressFrom,
      deadline
    );
    const encodedABI = tx.encodeABI();
    let gasPrices = await this.getCurrentGasPrices();
    web3.eth.getTransactionCount(addressFrom).then((txCount) => {
      // construct the transaction data
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex("300000"),
        gasPrice: web3.utils.toHex(
          web3.utils.toWei(`${gasPrices.medium}`, "gwei")
        ),
        to: process.env.UNISWAP_ROUTER_ADDRESS,
        from: addressFrom,
        data: encodedABI,
        value: web3.utils.toHex(amountIn),
      };
      // fire away!
      // this.sendSigned(txData, this.callback.bind(this))
    });
  }

  @logging
  async cancelTx(txCount, gasPrice) {
    const nonce = web3.utils.toHex(txCount);
    web3.eth
      .getTransactionCount(web3.eth.defaultAccount)
      .then((err, txCount) => {
        if (err) return err;
        const txData = {
          nonce,
          gasLimit: web3.utils.toHex("300000"),
          gasPrice,
          to: process.env.UNISWAP_ROUTER_ADDRESS,
          from: web3.eth.defaultAccount,
          data: null,
          value: web3.utils.toHex(0),
        };
        this.sendSigned(txData, this.callback.bind(this));
        return txCount;
      });
  }

  @logging
  async sendMoney(amountToSend) {
    let myBalance = await this.balance();
    let nonce = await web3.eth.getTransactionCount(this.address);
    log.magenta(
      `The outgoing transaction count for your wallet address is: ${nonce}`
    );
    let gasPrices = await this.getCurrentGasPrices();
    let txData = {
      to: this.address,
      value: web3.utils.toHex(web3.utils.toWei(amountToSend, "ether")),
      gas: 21000,
      gasPrice: web3.utils.toHex(
        web3.utils.toWei(`${gasPrices.medium}`, "gwei")
      ), // converts the gwei price to wei
      nonce: nonce,
      chainId: this.chainId,
    };
    this.sendSigned(txData, this.callback.bind(this));
    process.exit();
  }
  @logging
  sendSignedAsync(txData) {
    const privateKey = Buffer.from(this.private_key, "hex");
    const transaction = new Tx(txData, { chain: this.chainId });
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");
    return web3.eth.sendSignedTransaction("0x" + serializedTx);
  }

  @logging
  sendSigned(txData, cb) {
    const privateKey = Buffer.from(this.private_key, "hex");
    const transaction = new Tx(txData, { chain: this.chainId });
    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString("hex");
    web3.eth.sendSignedTransaction("0x" + serializedTx, cb);
  }
  @logging
  async getHighestPrice() {
    const pending = await web3.eth.getBlock("pending", true);
    const pendingTransactions = pending.transactions;
    const highest = pendingTransactions.filter((v, idx, arr) => {
      if (v.transactionIndex == 0) {
        return v;
      }
    });
    return highest[0];
  }

  @logging
  async getMyTxHash() {
    const pending = await web3.eth.getBlock("pending", true);
    const pendingTransactions = pending.transactions;
    const myCurrTx = pendingTransactions.filter(
      (tx) => tx.hash === web3.eth.defaultAccount
    );
    if (myCurrTx) {
      return myCurrTx.hash;
    }
    return new Error("Your transaction does not exist in the mem pool");
  }

  @logging
  async getMyReceipt(hash) {
    return await web3.eth.getTransactionReceipt(hash);
  }

  @logging
  async checkLiquidity(tokenName) {
    let token = this.tokenLookup(tokenName);
    const pair: Pair = await Fetcher.fetchPairData(token, this.weth, provider);
    const tokenLiquidity = JSBI.divide(
      pair.reserve0.numerator,
      pair.reserve0.denominator
    ).toString();
    const wethLiquidity = JSBI.divide(
      pair.reserve1.numerator,
      pair.reserve1.denominator
    ).toString();
    if (tokenLiquidity > 0 && wethLiquidity > 5000) {
      return true;
    }
    return false;
  }

  @logging
  async getCurrentGasPrices() {
    let response = await axios.get(
      "https://ethgasstation.info/json/ethgasAPI.json"
    );
    let prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10,
    };
    console.log("\r\n");
    log.cyan(`Current ETH Gas Prices (in GWEI):`);
    console.log("\r\n");
    log.green(`Low: ${prices.low} (transaction completes in < 30 minutes)`);
    log.yellow(
      `Standard: ${prices.medium} (transaction completes in < 5 minutes)`
    );
    log.red(`Fast: ${prices.high} (transaction completes in < 2 minutes)`);
    console.log("\r\n");

    return prices;
  }

  @logging
  tokenLookup(tokenName) {
    let token = this.networkTokens[tokenName];
    if (typeof token !== "undefined") {
      return new Token(
        this.chainId,
        token.tokenAddress,
        token.decimals,
        tokenName
      );
    } else {
      throw "No such token";
    }
  }

  @logging
  getPairAddress(tokenAddress) {
    let toEth = getCreate2Address(
      FACTORY_ADDRESS,
      keccak256(
        ["bytes"],
        [pack(["address", "address"], [tokenAddress, this.weth.address])]
      ),
      INIT_CODE_HASH
    );
    return toEth;
  }
}
