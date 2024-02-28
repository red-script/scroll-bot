const { ethers } = require('ethers');
const { logger } = require('loguru'); // You need to replace this with the correct logger library for Node.js
const { SCROLL_TOKENS, SYNCSWAP_CONTRACTS, SYNCSWAP_ROUTER_ABI, SYNCSWAP_CLASSIC_POOL_ABI, SYNCSWAP_CLASSIC_POOL_DATA_ABI, ZERO_ADDRESS } = require('./config');
const { checkGas } = require('./utils/gas_checker');
const { retry } = require('./utils/helpers');
const { Account } = require('./account');
const abi = require('ethereumjs-abi'); // For encoding ABI

class SyncSwap extends Account {
    constructor(accountId, privateKey, recipient) {
        super(accountId, privateKey, "scroll", recipient);
        this.swapContract = this.getContract(SYNCSWAP_CONTRACTS.router, SYNCSWAP_ROUTER_ABI);
    }

    async getPool(fromToken, toToken) {
        const contract = this.getContract(SYNCSWAP_CONTRACTS.classic_pool, SYNCSWAP_CLASSIC_POOL_ABI);
        const poolAddress = await contract.getPool(
            ethers.utils.getAddress(SCROLL_TOKENS[fromToken]),
            ethers.utils.getAddress(SCROLL_TOKENS[toToken])
        );
        return poolAddress;
    }

    async getMinAmountOut(poolAddress, tokenAddress, amount, slippage) {
        const poolContract = this.getContract(poolAddress, SYNCSWAP_CLASSIC_POOL_DATA_ABI);
        const minAmountOut = await poolContract.getAmountOut(tokenAddress, amount, this.address);
        return minAmountOut.sub(minAmountOut.mul(slippage).div(100)).toNumber();
    }

    @retry
    @checkGas
    async swap(fromToken, toToken, minAmount, maxAmount, decimal, slippage, allAmount, minPercent, maxPercent) {
        const tokenAddress = ethers.utils.getAddress(SCROLL_TOKENS[fromToken]);
        const [amountWei, amount, balance] = await this.getAmount(fromToken, minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent);

        logger.info(`[${this.accountId}][${this.address}] Swap on SyncSwap – ${fromToken} -> ${toToken} | ${amount} ${fromToken}`);

        const poolAddress = await this.getPool(fromToken, toToken);

        if (poolAddress !== ZERO_ADDRESS) {
            const txData = await this.getTxData();

            if (fromToken === "ETH") {
                txData.value = amountWei;
            } else {
                await this.approve(amountWei, tokenAddress, ethers.utils.getAddress(SYNCSWAP_CONTRACTS.router));
            }

            const minAmountOut = await this.getMinAmountOut(poolAddress, tokenAddress, amountWei, slippage);

            const steps = [{
                pool: poolAddress,
                data: abi.encode(["address", "address", "uint8"], [tokenAddress, this.address, 1]),
                callback: ZERO_ADDRESS,
                callbackData: "0x"
            }];

            const paths = [{
                steps,
                tokenIn: ZERO_ADDRESS || tokenAddress,
                amountIn: amountWei
            }];

            const deadline = Math.floor(Date.now() / 1000) + 1000000; // Current timestamp + 1000000 seconds

            const contractTxn = await this.swapContract.swap(paths, minAmountOut, deadline).buildTransaction(txData);
            const signedTxn = await this.sign(contractTxn);
            const txnHash = await this.sendRawTransaction(signedTxn);

            await this.waitUntilTxFinished(txnHash);
        } else {
            logger.error(`[${this.accountId}][${this.address}] Swap path ${fromToken} to ${toToken} not found!`);
        }
    }
}

module.exports = SyncSwap;
