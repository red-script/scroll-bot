import { BigNumber } from "ethers";
import { ZEBRA_ROUTER_ABI, ZEBRA_CONTRACTS, SCROLL_TOKENS } from "./config";
import { checkGas } from "./utils/gas_checker";
import { retry } from "./utils/helpers";
import { Account } from "./account";

class Zebra extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.swapContract = this.getContract(
      ZEBRA_CONTRACTS.router,
      ZEBRA_ROUTER_ABI
    );
  }

  async getMinAmountOut(fromToken, toToken, amount, slippage) {
    const minAmountOut = await this.swapContract.getAmountsOut(amount, [
      SCROLL_TOKENS[fromToken],
      SCROLL_TOKENS[toToken],
    ]);
    return BigNumber.from(minAmountOut[1]).sub(
      BigNumber.from(minAmountOut[1]).div(100).mul(slippage)
    );
  }

  async swapToToken(fromToken, toToken, amount, slippage) {
    const txData = await this.getTxData(amount);

    const deadline = Math.floor(Date.now() / 1000) + 1000000;

    const minAmountOut = await this.getMinAmountOut(
      fromToken,
      toToken,
      amount,
      slippage
    );

    const contractTxn = await this.swapContract.swapExactETHForTokens(
      minAmountOut,
      [SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken]],
      this.address,
      deadline
    );

    return contractTxn;
  }

  async swapToETH(fromToken, toToken, amount, slippage) {
    const tokenAddress = SCROLL_TOKENS[fromToken];

    await this.approve(amount, tokenAddress, ZEBRA_CONTRACTS.router);

    const txData = await this.getTxData();

    const deadline = Math.floor(Date.now() / 1000) + 1000000;

    const minAmountOut = await this.getMinAmountOut(
      fromToken,
      toToken,
      amount,
      slippage
    );

    const contractTxn = await this.swapContract.swapExactTokensForETH(
      amount,
      minAmountOut,
      [SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken]],
      this.address,
      deadline
    );

    return contractTxn;
  }

  @retry
  @checkGas
  async swap(
    fromToken,
    toToken,
    minAmount,
    maxAmount,
    decimal,
    slippage,
    allAmount,
    minPercent,
    maxPercent
  ) {
    const { amountWei, amount, balance } = await this.getAmount(
      fromToken,
      minAmount,
      maxAmount,
      decimal,
      allAmount,
      minPercent,
      maxPercent
    );

    logger.info(
      `[${this.accountId}][${this.address}] Swap on Zebra – ${fromToken} -> ${toToken} | ${amount} ${fromToken}`
    );

    let contractTxn;
    if (fromToken === "ETH") {
      contractTxn = await this.swapToToken(
        fromToken,
        toToken,
        amountWei,
        slippage
      );
    } else {
      contractTxn = await this.swapToETH(
        fromToken,
        toToken,
        amountWei,
        slippage
      );
    }

    const signedTxn = await this.sign(contractTxn);

    const txnHash = await this.sendRawTransaction(signedTxn);

    await this.waitUntilTxFinished(txnHash);
  }
}

export default { Zebra };
