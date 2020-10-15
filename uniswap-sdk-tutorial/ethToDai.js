/*
    Copyright (c) 2020, Cameron Hamilton-Rich

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    note: Copy env to .env and update the private key to your account.

    ethToDai.js

    Exchange some eth for dai on Uniswap
*/
require('dotenv').config();
var Web3 = require('web3');
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent,Token } = require('@uniswap/sdk');
const ethers = require('ethers');
var networks = require('@ethersproject/networks');
const util = require('util');
const { isBytesLike } = require('ethers/lib/utils');

const url = process.env.URL;
console.log("url: " + url);

// ABI imports
const uniswapV2ExchangeAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; 
const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const chainId = ChainId.MAINNET;

const XCORE_ETH = {
    token: {name:'XCORE',symbol:'XCORE'}
}

const ETH_XCORE = {

}

const returnBalance = async (tokenContract,account) => {
    let balance = await tokenContract.balanceOf(account.address);
    const decimals = await tokenContract.decimals();
    console.log("Balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
    return ethers.utils.formatUnits(balance.toString(), decimals)

    // Balance
    // web3.eth.getBalance(web3.eth.defaultAccount)
    // .then(myBalanceWei => {
    //     // You can use balance here
    //     console.log(web3.utils.fromWei(myBalanceWei, 'ether'))
    // })
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
}

const executeTokenTrade = async (provider,account,tokenSend,tokenReceive,uniswap,decimals,tradeParams) => {
    console.group('executeTokenTrade')
    console.log(`Spending ${util.inspect(tokenSend)}, Receiving ${util.inspect(tokenReceive)}`);
    // const gasPrice = await provider.getGasPrice();
    // const gasPrice = ethers.BigNumber.from(tradeParams.gasPrice) // in wei
    console.log('gasPrice',tradeParams.gasPrice,parseInt(tradeParams.gasPrice._hex,16))
    console.log('gasLimit',tradeParams.gasLimit,parseInt(tradeParams.gasLimit._hex,16))

    const pair = await Fetcher.fetchPairData(tokenReceive, tokenSend, provider); // use the provider, otherwise you'll get a warning
    const route = new Route([pair], tokenSend);

    // swap 1 ether ;
    const trade = new Trade(route, new TokenAmount(tokenSend, tradeParams.amountIn), TradeType.EXACT_INPUT);
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
    // do the swap
    const tx = await uniswap.swapExactTokensForETH(
        inputAmountHex,
        amountOutMinHex,
        path,
        account.address,
        deadline,
        {
            // value: inputAmountHex, 
            gasPrice: tradeParams.gasPrice.toHexString(),
            gasLimit: tradeParams.gasLimit.toHexString()
        }
    ).catch((err) => { console.error(err); });
}

const init = async () => {
    console.group("Main")
    // pick who your provider
    const provider = new ethers.providers.JsonRpcProvider(url);
    const signer = new ethers.Wallet(Buffer.from(process.env.PRIVATE_KEY, "hex"))
    const account = signer.connect(provider);


    const weth = WETH[chainId];
    const uniswap_address = self.Web3.utils.toChecksumAddress('0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f') // Uni:Token input exchange ex: UniV2:DAI
    let weth_balance = .balanceOf(uniswap_address).call()
    weth_balance = self.Web3.fromWei(weth_balance,'ether')
    console.log(`WETH quantity in Uniswap Pool = ${weth_balance}`)
    // const checksum_addy = Web3.utils.toChecksumAddress(process.env.XCORE_ADDRESS)
    // const XCORE = new Token(ChainId.MAINNET, checksum_addy, 18)

    // // note that you may want/need to handle this async code differently,
    // // Get pair price
    // const pair = await Fetcher.fetchPairData(XCORE, WETH[XCORE.chainId],provider)

    // const route = new Route([pair], WETH[XCORE.chainId])

    // console.log(route.midPrice.toSignificant(6)) // 201.306
    // console.log(route.midPrice.invert().toSignificant(6)) // 0.00496756
    // const tradeParams = {
    //     gasPrice: ethers.BigNumber.from(20_000_000_000), // in wei
    //     gasLimit: ethers.BigNumber.from(150_000),
    //     amountIn:"1.0", // in Ether
    //     slippageTolerance:new Percent('2000', '10000'), // in thousands
    // }
    // const dai = await Fetcher.fetchTokenData(chainId, daiAddress, provider, "Dai", "Dai stablecoin");
    // const XCoreAddress = Web3.utils.toChecksumAddress(process.env.XCORE_ADDRESS)
    // const XCore = await Fetcher.fetchTokenData(chainId, XCoreAddress, provider, "XCORE","XCORE Token");
    // const CoreAddress = Web3.utils.toChecksumAddress(process.env.CORE_ADDRESS)
    // const Core = await Fetcher.fetchTokenData(chainId, XCoreAddress, provider, "CORE","Core Token");
    // const weth = WETH[chainId];

    // Buy Dai
    // const uniswap = new ethers.Contract(
    //     uniswapV2ExchangeAddress,
    //     ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
    //     account
    //   );
    // await executeTrade(provider,account,weth,dai,uniswap,tradeParams) 


    // const daiContract = new ethers.Contract(
    //     daiAddress,
    //     ['function balanceOf(address owner) external view returns (uint)',
    //         'function decimals() external view returns (uint8)'],
    //     account
    //   );
    // const decimals = await daiContract.decimals();
    // // Buy Eth
    // const uniswap = new ethers.Contract(
    //     uniswapV2ExchangeAddress,
    //     ['function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'],account
    //   );
    // await executeTokenTrade(provider,account,dai,weth,uniswap,decimals,tradeParams) 

    // const daiContract = new ethers.Contract(
    //     process.env.CORE_ADDRESS,
    //     ['function balanceOf(address owner) external view returns (uint)',
    //         'function decimals() external view returns (uint8)'],
    //     account
    //   );
    // const decimals = await daiContract.decimals();
    // // Buy Eth
    // const uniswap = new ethers.Contract(
    //     uniswapV2ExchangeAddress,
    //     ['function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'],
    //     account
    //   );
    // await executeTokenTrade(provider,account,dai,weth,uniswap,decimals,tradeParams) 

    // const uniswap = new ethers.Contract(
    //     uniswapV2ExchangeAddress,
    //     ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
    //     account
    //   );
    // const daiContract = new ethers.Contract(
    //     daiAddress,
    //     ['function balanceOf(address owner) external view returns (uint)',
    //         'function decimals() external view returns (uint8)'],
    //     account
    //   );

    // work out our current balance
    // let balance = await daiContract.balanceOf(account.address);
    // const decimals = await daiContract.decimals();
    // console.log("initial balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
    // await executeTrade(provider,account,dai,weth,uniswap,tradeParams)
    // balance = await coreContract.balanceOf(account.address);
    // console.log("initial balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
    // const checksum_addy = Web3.utils.toChecksumAddress(process.env.CORE_ADDRESS)
    // console.log('checksum_addy',checksum_addy)
    // const DAI = await Fetcher.fetchTokenData(chainId, checksum_addy,provider)
    // console.log(DAI)
    // const dai = await Fetcher.fetchTokenData(chainId, process.env.CORE_ADDRESS, provider, "CORE");
    // console.log(util.inspect(dai));
    // const weth = WETH[chainId];
    // const pair = await Fetcher.fetchPairData(dai, weth, provider); // use the provider, otherwise you'll get a warning
    // const route = new Route([pair], weth);

    // // swap 1 ether
    // const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther("1.0")), TradeType.EXACT_INPUT);
    // console.log("execution price: $" + trade.executionPrice.toSignificant(6));
    // console.log("price impact: " + trade.priceImpact.toSignificant(6) + "%"); // always > 0.3%

    // const slippageTolerance = new Percent('50', '10000');
    // console.log('slippageTolerance',slippageTolerance)
    // const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    // console.log('amountOutMin',amountOutMin)
    // const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();

    // const path = [weth.address, dai.address];
    // const deadline = Math.floor(Date.now() / 1000) + 60 * 1; // 1 mins time
    // const inputAmount = trade.inputAmount.raw;
    // const inputAmountHex = ethers.BigNumber.from(inputAmount.toString()).toHexString(); 
    // // declare the DAI contract interfaces
    // const daiContract = new ethers.Contract(
    //     process.env.CORE_ADDRESS,
    //     ['function balanceOf(address owner) external view returns (uint)',
    //         'function decimals() external view returns (uint8)'],
    //     account
    //   );

    // // work out our current balance
    // let balance = await daiContract.balanceOf(account.address);
    // const decimals = await daiContract.decimals();
    // console.log("initial balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
    
    // // declare the Uniswap contract interface
    // const uniswap = new ethers.Contract(
    //     uniswapV2ExchangeAddress,
    //     ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
    //     account
    //   );

    // const gasPrice = await provider.getGasPrice();
    // console.log('gasPrice',gasPrice)

    // // do the swap
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

    // // display the final balance
    // balance = await daiContract.balanceOf(account.address);
    // console.log("Transaction: ", tx);
    // console.log("final balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
}

init();
