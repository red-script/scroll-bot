import _ from "lodash";
import { crypto } from "crypto";
import winston from "winston";
import { DMAIL_CONTRACT, DMAIL_ABI } from "../config";
import { checkGas } from "./utils/gas_checker"; //decorators for check gas and retry
import { retry } from "./utils/helpers";
import { Account } from "./account";

class Dmail extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.contract = this.getContract(DMAIL_CONTRACT, DMAIL_ABI);
  }

  async sendMail() {
    try {
      winston.info(`[${this.accountId}][${this.address}] Send email`);

      const email = crypto
        .createHash("sha256")
        .update(_.random(1e11).toString())
        .digest("hex");
      const theme = crypto
        .createHash("sha256")
        .update(_.random(1e11).toString())
        .digest("hex");

      const txData = await this.contract.populateTransaction.send_mail(
        email,
        theme
      );
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
