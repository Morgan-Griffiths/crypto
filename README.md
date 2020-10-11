# crypto
crypto dev env

# Requirements

- truffle
- geth
- bitcoin (pip install bitcoin)

## truffle

```cd smartContracts```
```truffle compile```

### Create smart contract

```truffle create contract ...```

### Create migration

```truffle create migration ...```

### Testing contracts

```truffle develop```
```HelloWorldContract.deployed().then(_app => { hello = _app })```
```hello.greet()```

## Geth

```brew tap ethereum/ethereum```
```brew install ethereum```

https://medium.com/blockchain-developer/setting-up-a-pro-dev-env-for-ethereum-part-v-geth-private-blockchain-211eaccf8949

## Eth Genesis block

```python mk_genesis_block.py --extradata hash_for_#1028201_goes_here > genesis_block.json```
```./build/bin/geth --genesis genesis_block.json```

