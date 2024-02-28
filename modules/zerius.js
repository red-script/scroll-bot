const { logger } = require('./loguru');
const { Account } = require('./account');
const { ZERIUS_CONTRACT, ZERIUS_ABI, ZERO_ADDRESS } = require('./config');
const { checkGas, retry } = require('./utils');

class Zerius extends Account {
    constructor(accountId, privateKey, recipient) {
        super(accountId, privateKey, "scroll", recipient);
        this.contract = this.getContract(ZERIUS_CONTRACT, ZERIUS_ABI);
        this.chainIds = {
            "arbitrum": 110,
            "optimism": 111,
            "polygon": 109,
            "bsc": 102,
            "avalanche": 106
        };
    }

    async getNftId(txnHash) {
        const receipts = await this.w3.eth.getTransactionReceipt(txnHash);
        const nftId = parseInt(receipts.logs[0].topics[receipts.logs[0].topics.length - 1], 16);
        return nftId;
    }

    async getEstimateFee(chain, nftId) {
        const fee = await this.contract.estimateSendFee(
            this.chainIds[chain],
            this.address,
            nftId,
            false,
            "0x"
        );
        return Math.floor(fee[0] * 1.2);
    }

    @retry
    @checkGas
    async mint() {
        logger.info(`[${this.accountId}][${this.address}] Mint Zerius NFT`);

        const mintFee = await this.contract.mintFee();
        const txData = await this.getTxData(mintFee);

        const transaction = await this.contract.mint().populateTransaction(txData);
        const signedTxn = await this.signTransaction(transaction);
        const txHash = await this.sendRawTransaction(signedTxn);

        await this.waitUntilTxFinished(txHash);

        return txHash;
    }

    @retry
    @checkGas
    async bridge(chain, sleepFrom, sleepTo) {
        const chainId = chain[Math.floor(Math.random() * chain.length)];
        const mintNft = await this.mint();
        const nftId = await this.getNftId(mintNft);

        await sleep(sleepFrom, sleepTo);

        const l0Fee = await this.getEstimateFee(chainId, nftId);
        const baseBridgeFee = await this.contract.bridgeFee();

        const txData = await this.getTxData(l0Fee + baseBridgeFee);

        const transaction = await this.contract.sendFrom(
            this.address,
            this.chainIds[chainId],
            this.address,
            nftId,
            ZERO_ADDRESS,
            ZERO_ADDRESS,
            "0x0001000000000000000000000000000000000000000000000000000000000003d090"
        ).populateTransaction(txData);

        const signedTxn = await this.signTransaction(transaction);
        const txHash = await this.sendRawTransaction(signedTxn);

        await this.waitUntilTxFinished(txHash);
    }
}

module.exports = Zerius;
