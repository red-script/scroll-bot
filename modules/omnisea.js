import _ from "lodash";
import winston from "winston";
import { OMNISEA_CONTRACT, OMNISEA_ABI } from "./config";
import { checkGas } from "./utils/gas_checker";
import { retry } from "./utils/helpers";
import Account from "./account";

class Omnisea extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.contract = this.getContract(OMNISEA_CONTRACT, OMNISEA_ABI);
  }

  static generateCollectionData() {
    const title = _.sampleSize(_.range(97, 123), _.random(5, 15))
      .map((code) => String.fromCharCode(code))
      .join("");
    const symbol = _.sampleSize(_.range(65, 91), _.random(3, 6))
      .map((code) => String.fromCharCode(code))
      .join("");
    return { title, symbol };
  }

  @retry
  @checkGas
  async create() {
    try {
      winston.info(
        `[${this.accountId}][${this.address}] Create NFT collection on Omnisea`
      );

      const { title, symbol } = Omnisea.generateCollectionData();

      const txData = await this.getTxData();

      const unixTime = Math.floor(new Date().getTime() / 1000) + 1000000;

      const transaction = await this.contract.methods
        .create([title, symbol, "", "", 0, true, 0, unixTime])
        .send(txData);

      const signedTxn = await this.sign(transaction);
      const txHash = await this.sendRawTransaction(signedTxn);

      await this.waitUntilTxFinished(txHash);
    } catch (error) {
      console.error("Error in create:", error.message);
      throw error;
    }
  }
}

module.exports = Omnisea;
