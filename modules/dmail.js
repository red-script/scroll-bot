import _ from lodash;
import ethers from ethers;
import { sha256 } from "crypto";
import winston from "winston";
import { DMAIL_CONTRACT, DMAIL_ABI } from "./config";
import { checkGas } from "./utils/gas_checker";
import { retry } from "./utils/helpers";
import { Account } from "./account";

class Dmail extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.contract = this.getContract(DMAIL_CONTRACT, DMAIL_ABI);
  }

  async sendMail() {
    try {
      logger.info(`[${this.accountId}][${this.address}] Send email`);

      const email = sha256(`${1e11 * Math.random()}`).toString("hex");
      const theme = sha256(`${1e11 * Math.random()}`).toString("hex");

      const txData = await this.contract.populateTransaction.send_mail(email, theme);
      txData.gasPrice = await this.w3.eth.getGasPrice();

      const signedTx = await this.sign(txData);

      const tx = await this.sendRawTransaction(signedTx);
      await this.waitUntilTxFinished(tx.hash);
    } catch (error) {
      console.error("Error in sendMail:", error.message);
      throw error;
    }
  }
}

export default { Dmail };