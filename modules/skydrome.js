const { logger } = require('./loguru');
const { Account } = require('./account');
const { SKYDROME_ROUTER_ABI, SKYDROME_CONTRACTS, SCROLL_TOKENS } = require('./config');
const { checkGas, retry } = require('./utils');

class Skydrome extends Account {
    constructor(accountId, privateKey, recipient) {
        super(accountId, privateKey, "scroll", recipient);
        this.swapContract = this.getContract(SKYDROME_CONTRACTS.router, SKYDROME_ROUTER_ABI);
    }

    async getMinAmountOut(fromToken, toToken, amount, slippage) {
        const { amountOut, swapType } = await this.swapContract.callStatic.getAmountOut(
            amount,
            SCROLL_TOKENS[fromToken],
            SCROLL_TOKENS[toToken]
        );
        return [amountOut.sub(amountOut.mul(slippage).div(100)), swapType];
    }

    async swapToToken(fromToken, toToken, amount, slippage) {
        const deadline = Math.floor(Date.now() / 1000) + 1000000;
        const [minAmountOut, swapType] = await this.getMinAmountOut(fromToken, toToken, amount, slippage);
        const txData = await this.getTxData(amount);
        
        const transaction = await this.swapContract.populateTransaction.swapExactETHForTokens(
            minAmountOut,
            [[SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken], swapType]],
            this.address,
            deadline,
            txData
        );
        return transaction;
    }

    async swapToETH(fromToken, toToken, amount, slippage) {
        const tokenAddress = SCROLL_TOKENS[fromToken];
        await this.approve(amount, tokenAddress, SKYDROME_CONTRACTS.router);
        
        const deadline = Math.floor(Date.now() / 1000) + 1000000;
        const [minAmountOut, swapType] = await this.getMinAmountOut(fromToken, toToken, amount, slippage);
        const txData = await this.getTxData();
        
        const transaction = await this.swapContract.populateTransaction.swapExactTokensForETH(
            amount,
            minAmountOut,
            [[SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken], swapType]],
            this.address,
            deadline,
            txData
        );
        return transaction;
    }

    @retry
    @checkGas
    async swap(fromToken, toToken, minAmount, maxAmount, decimal, slippage, allAmount, minPercent, maxPercent) {
        const [amountWei, amount, balance] = await this.getAmount(fromToken, minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent);
        
        logger.info(`[${this.accountId}][${this.address}] Swap on Skydrome – ${fromToken} -> ${toToken} | ${amount} ${fromToken}`);
        
        let transaction;
        if (fromToken === "ETH") {
            transaction = await this.swapToToken(fromToken, toToken, amountWei, slippage);
        } else {
            transaction = await this.swapToETH(fromToken, toToken, amountWei, slippage);
        }

        const signedTx = await this.signTransaction(transaction);
        const txResponse = await this.sendRawTransaction(signedTx);
        await this.waitUntilTxFinished(txResponse.hash);
    }
}

module.exports = Skydrome;
