const { ethers } = require("ethers");
const { DMAIL_CONTRACT, DMAIL_ABI } = require("./config");
const { checkGas } = require("./utils/gas_checker");
const { retry } = require("./utils/helpers");
const { sha256 } = require("crypto");
const { Account } = require("./account");

class Dmail extends Account {
    constructor(account_id, private_key, recipient) {
        super(account_id, private_key, "scroll", recipient);
        this.contract = this.getContract(DMAIL_CONTRACT, DMAIL_ABI);
    }

    @retry
    @checkGas
    async sendMail() {
        console.log(`[${this.account_id}][${this.address}] Send email`);

        const email = sha256((1e11 * Math.random()).toString()).digest("hex");
        const theme = sha256((1e11 * Math.random()).toString()).digest("hex");

        const data = this.contract.interface.encodeFunctionData("send_mail", [email, theme]);

        const txData = await this.getTxData();
        txData.data = data;
        txData.to = ethers.utils.getAddress(DMAIL_CONTRACT);
        txData.gasPrice = await this.provider.getGasPrice();

        const signedTxn = await this.sign(txData);
        const txnHash = await this.sendRawTransaction(signedTxn);

        await this.waitUntilTxFinished(txnHash);
    }
}