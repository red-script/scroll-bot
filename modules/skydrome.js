import { info } from "winston";
import { checkGas } from "../utils/gasChecker";
import { retry } from "../utils/helpers";
import { Account } from "./account";
import {
  SKYDROME_ROUTER_ABI,
  SKYDROME_CONTRACTS,
  SCROLL_TOKENS,
} from "./config";
import _ from "lodash";

class Skydrome extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.swapContract = this.getContract(
      SKYDROME_CONTRACTS.router,
      SKYDROME_ROUTER_ABI
    );
  }

  async getMinAmountOut(fromToken, toToken, amount, slippage) {
    const minAmountOut = await this.swapContract.methods
      .getAmountOut(amount, SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken])
      .call();
    return parseInt(minAmountOut - (minAmountOut / 100) * slippage);
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

    const contractTxn = this.swapContract.methods
      .swapExactETHForTokens(
        minAmountOut,
        [[SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken], 1]],
        this.address,
        deadline
      )
      .encodeABI();

    return contractTxn;
  }

  async swapToEth(fromToken, toToken, amount, slippage) {
    const tokenAddress = SCROLL_TOKENS[fromToken];

    await this.approve(amount, tokenAddress, SKYDROME_CONTRACTS.router);

    const txData = await this.getTxData();

    const deadline = Math.floor(Date.now() / 1000) + 1000000;

    const minAmountOut = await this.getMinAmountOut(
      fromToken,
      toToken,
      amount,
      slippage
    );

    const contractTxn = this.swapContract.methods
      .swapExactTokensForETH(
        amount,
        minAmountOut,
        [[SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken], 1]],
        this.address,
        deadline
      )
      .encodeABI();

    return contractTxn;
  }

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
    const [amountWei, amount, balance] = await this.getAmount(
      fromToken,
      minAmount,
      maxAmount,
      decimal,
      allAmount,
      minPercent,
      maxPercent
    );

    info(
      `[${this.accountId}][${this.address}] Swap on Skydrome – ${fromToken} -> ${toToken} | ${amount} ${fromToken}`
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
      contractTxn = await this.swapToEth(
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

export default { Skydrome };
