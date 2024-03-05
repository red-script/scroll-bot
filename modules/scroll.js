import { info } from "winston";
import { SCROLL_TOKENS, WETH_ABI } from "./config";
import { checkGas } from "./utils/gasChecker";
import { retry } from "./utils/helpers";
import Account from "./account";

class Scroll extends Account {
  constructor(accountId, privateKey, chain) {
    super(accountId, privateKey, chain);
  }

  @retry
  @checkGas
  async wrapEth(
    minAmount,
    maxAmount,
    decimal,
    allAmount,
    minPercent,
    maxPercent
  ) {
    try {
      const [amountWei, amount, balance] = await this.getAmount(
        "ETH",
        minAmount,
        maxAmount,
        decimal,
        allAmount,
        minPercent,
        maxPercent
      );

      const wethContract = this.getContract(SCROLL_TOKENS.WETH, WETH_ABI);

      info(`[${this.accountId}][${this.address}] Wrap ${amount} ETH`);

      const txData = await this.getTxData();
      txData.value = amountWei;
      txData.gasPrice = await this.w3.eth.getGasPrice();

      const transaction = await wethContract.methods.deposit().send(txData);

      const signedTxn = await this.sign(transaction);
      const txHash = await this.sendRawTransaction(signedTxn);

      await this.waitUntilTxFinished(txHash);
    } catch (error) {
      console.error("Error in wrapEth:", error.message);
      throw error;
    }
  }

  @retry
  @checkGas
  async unwrapEth(
    minAmount,
    maxAmount,
    decimal,
    allAmount,
    minPercent,
    maxPercent
  ) {
    try {
      const [amountWei, amount, balance] = await this.getAmount(
        "WETH",
        minAmount,
        maxAmount,
        decimal,
        allAmount,
        minPercent,
        maxPercent
      );

      const wethContract = this.getContract(SCROLL_TOKENS.WETH, WETH_ABI);

      info(`[${this.accountId}][${this.address}] Unwrap ${amount} ETH`);

      const txData = await this.getTxData();
      txData.gasPrice = await this.w3.eth.getGasPrice();

      const transaction = await wethContract.methods
        .withdraw(amountWei)
        .send(txData);

      const signedTxn = await this.sign(transaction);
      const txHash = await this.sendRawTransaction(signedTxn);

      await this.waitUntilTxFinished(txHash);
    } catch (error) {
      console.error("Error in unwrapEth:", error.message);
      throw error;
    }
  }
}

export default Scroll;
