const { ethers } = require('ethers');
const { logger } = require('./loguru');
const { checkGas } = require('./utils/gas_checker');
const { retry } = require('./utils/helpers');
const { Account } = require('./account');
const { ORBITER_CONTRACT } = require('./config');

class Orbiter extends Account {
    constructor(accountId, privateKey, chain, recipient) {
        super(accountId, privateKey, chain, recipient);

        this.chainIds = {
            "ethereum": "1",
            "arbitrum": "42161",
            "optimism": "10",
            "zksync": "324",
            "nova": "42170",
            "zkevm": "1101",
            "scroll": "534352",
            "base": "8453",
            "linea": "59144",
            "zora": "7777777",
        };
    }

    async getBridgeAmount(fromChain, toChain, amount) {
        const provider = new ethers.providers.JsonRpcProvider();
        const url = "https://openapi.orbiter.finance/explore/v3/yj6toqvwh1177e1sexfy0u1pxx5j8o47";

        const data = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "orbiter_calculatedAmount",
            "params": [`${this.chainIds[fromChain]}-${this.chainIds[toChain]}:ETH-ETH`, parseFloat(amount)]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!responseData.result.error) {
                return parseInt(responseData.result._sendValue);
            } else {
                const errorData = responseData.result.error;

                logger.error(`[${this.accountId}][${this.address}] Orbiter error | ${errorData}`);

                return false;
            }
        } catch (error) {
            logger.error(`[${this.accountId}][${this.address}] Error fetching bridge amount: ${error.message}`);
            return false;
        }
    }

    @retry
    @checkGas
    async bridge(destinationChain, minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent) {
        const [amountWei, amount, balance] = await this.getAmount("ETH", minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent);

        logger.info(`[${this.accountId}][${this.address}] Bridge ${this.chain} -> ${destinationChain} | ${amount} ETH`);

        if (!ORBITER_CONTRACT) {
            logger.error(`[${this.accountId}][${this.address}] Don't have orbiter contract`);
            return;
        }

        const bridgeAmount = await this.getBridgeAmount(this.chain, destinationChain, amount);

        if (bridgeAmount === false) {
            return;
        }

        const ethBalance = await this.w3.eth.getBalance(this.address);

        if (bridgeAmount > ethBalance) {
            logger.error(`[${this.accountId}][${this.address}] Insufficient funds!`);
        } else {
            const txData = await this.getTxData(bridgeAmount);
            txData.to = this.w3.utils.toChecksumAddress(ORBITER_CONTRACT);

            const signedTxn = await this.sign(txData);
            
            try {
                const sentTx = await this.w3.eth.sendSignedTransaction(signedTxn.rawTransaction);
                await sentTx.wait();
            } catch (error) {
                logger.error(`[${this.accountId}][${this.address}] Error sending transaction: ${error.message}`);
            }
        }
    }
}

module.exports = Orbiter;