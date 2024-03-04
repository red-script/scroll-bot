import _ from "lodash";
import winston from "winston";
import NFTS2ME_ABI from "../config";
import { checkGas } from "./utils/gas_checker"; //decorators for check gas and retry
import { retry } from "./utils/helpers";
import { Account } from "./account";

class Minter extends Account {
  constructor(account_id, private_key) {
    super(account_id, private_key, "scroll");
  }

  async mintNft(contracts) {
    try {
      winston.info(`[${this.accountId}][${this.address}] Mint NFT on NFTS2ME`);

      const contract = this.getContract(_.sample(contracts), NFTS2ME_ABI);
      const txData = await this.getTxData();
      txData.gasPrice = await this.w3.eth.getGasPrice();

      const transaction = await contract.methods.mint(1).send(txData);
      const signedTxn = await this.sign(transaction);
      const txHash = await this.sendRawTransaction(signedTxn);

      await this.waitUntilTxFinished(txHash);
    } catch (error) {
      winston.error(`Error in mintNFT: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Minter;
