import { BigNumber, utils } from "ethers";
import { checkGas } from "./utils/gas_checker";
import { retry } from "./utils/helpers";
import { Account } from "./account";

class GnosisSafe extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.contract = this.getContract(SAFE_CONTRACT, SAFE_ABI);
  }

  async createSafe() {
    logger.info(`[${this.accountId}][${this.address}] Create gnosis safe`);

    const setupData = this.contract.interface.encodeFunctionData("setup", [
      [this.address],
      1,
      ZERO_ADDRESS,
      "0x",
      "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
      ZERO_ADDRESS,
      BigNumber.from(0),
      ZERO_ADDRESS,
    ]);

    const txData = await this.getTxData();
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);

    const transaction = {
      to: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
      data: setupData,
      nonce: txData.nonce,
      gasLimit: txData.gasLimit,
      gasPrice: txData.gasPrice,
      value: 0,
      chainId: txData.chainId,
      timestamp: currentTimestamp,
    };

    const signedTxn = await this.sign(transaction);
    const txHash = await this.sendRawTransaction(signedTxn);
    await this.waitUntilTxFinished(txHash);
  }
}

export default { GnosisSafe };
