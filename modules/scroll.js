const { logger } = require('loguru'); // Replace 'loguru' with your logging library
const { checkGas } = require('./utils/gas_checker');
const { retry } = require('./utils/helpers');
const { Account } = require('./account');
const { BRIDGE_CONTRACTS, DEPOSIT_ABI, WITHDRAW_ABI, ORACLE_ABI, SCROLL_TOKENS, WETH_ABI } = require('./config');

class Scroll extends Account {
    constructor(accountId, privateKey, chain, recipient) {
        super(accountId, privateKey, chain, recipient);
    }

    @retry
    @checkGas
    async deposit(minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent) {
        const [amountWei, amount, balance] = await this.getAmount("ETH", minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent);
        logger.info(`[${this.accountId}][${this.address}] Bridge to Scroll | ${amount} ETH`);

        const contract = this.getContract(BRIDGE_CONTRACTS.deposit, DEPOSIT_ABI);
        const contractOracle = this.getContract(BRIDGE_CONTRACTS.oracle, ORACLE_ABI);

        const fee = await contractOracle.estimateCrossDomainMessageFee(168000).call();

        const txData = await this.getTxData(amountWei + fee, false);

        const transaction = await contract.depositETH(amountWei, 168000).buildTransaction(txData);

        const signedTxn = await this.sign(transaction);
        const txnHash = await this.sendRawTransaction(signedTxn);

        await this.waitUntilTxFinished(txnHash);
    }

    @retry
    @checkGas
    async withdraw(minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent) {
        const [amountWei, amount, balance] = await this.getAmount("ETH", minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent);
        logger.info(`[${this.accountId}][${this.address}] Bridge from Scroll | ${amount} ETH`);

        const contract = this.getContract(BRIDGE_CONTRACTS.withdraw, WITHDRAW_ABI);
        const txData = await this.getTxData(amountWei);
        const transaction = await contract.withdrawETH(amountWei, 0).buildTransaction(txData);

        const signedTxn = await this.sign(transaction);
        const txnHash = await this.sendRawTransaction(signedTxn);

        await this.waitUntilTxFinished(txnHash);
    }

    @retry
    @checkGas
    async wrapEth(minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent) {
        const [amountWei, amount, balance] = await this.getAmount("ETH", minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent);
        const wethContract = this.getContract(SCROLL_TOKENS.WETH, WETH_ABI);

        logger.info(`[${this.accountId}][${this.address}] Wrap ${amount} ETH`);

        const txData = await this.getTxData(amountWei);
        const transaction = await wethContract.deposit().buildTransaction(txData);

        const signedTxn = await this.sign(transaction);
        const txnHash = await this.sendRawTransaction(signedTxn);

        await this.waitUntilTxFinished(txnHash);
    }

    @retry
    @checkGas
    async unwrapEth(minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent) {
        const [amountWei, amount, balance] = await this.getAmount("WETH", minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent);
        const wethContract = this.getContract(SCROLL_TOKENS.WETH, WETH_ABI);

        logger.info(`[${this.accountId}][${this.address}] Unwrap ${amount} ETH`);

        const txData = await this.getTxData();
        const transaction = await wethContract.withdraw(amountWei).buildTransaction(txData);

        const signedTxn = await this.sign(transaction);
        const txnHash = await this.sendRawTransaction(signedTxn);

        await this.waitUntilTxFinished(txnHash);
    }
}

module.exports = Scroll;
