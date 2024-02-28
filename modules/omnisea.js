const { ethers } = require('ethers');
const { logger } = require('./loguru');
const { checkGas } = require('./utils/gas_checker');
const { retry } = require('./utils/helpers');
const { Account } = require('./account');

class Omnisea extends Account {
    constructor(accountId, privateKey, recipient) {
        super(accountId, privateKey, "scroll", recipient);

        this.contract = this.getContract(OMNISEA_CONTRACT, OMNISEA_ABI);
    }

    static generateCollectionData() {
        const title = Array.from({ length: Math.floor(Math.random() * (15 - 5 + 1) + 5) }, () => String.fromCharCode(Math.floor(Math.random() * (122 - 97 + 1) + 97))).join('');
        const symbol = Array.from({ length: Math.floor(Math.random() * (6 - 3 + 1) + 3) }, () => String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1) + 65))).join('');
        return [title, symbol];
    }

    @retry
    @checkGas
    async create() {
        logger.info(`[${this.accountId}][${this.address}] Create NFT collection on Omnisea`);

        const [title, symbol] = Omnisea.generateCollectionData();

        const txData = await this.getTxData();

        const transaction = await this.contract.functions.create([
            title,
            symbol,
            "",
            "",
            0,
            true,
            0,
            Math.floor(Date.now() / 1000) + 1000000
        ]).buildTransaction(txData);

        const signedTxn = await this.sign(transaction);

        const sentTx = await this.w3.eth.sendTransaction(signedTxn);

        await sentTx.wait();
    }
}

module.exports = Omnisea;