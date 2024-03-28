import { BigNumber } from "ethers";
import { sleep } from "./utils/sleeping";
import { SyncSwap } from "./modules";
import { sample, random, times } from "lodash";
import { Account } from "./account";

class Multiswap extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.swapModules = {
      syncswap: SyncSwap,
      skydrome: Skydrome,
      zebra: Zebra,
    };
  }

  getSwapModule(useDex) {
    const swapModule = sample(useDex);
    return this.swapModules[swapModule];
  }

  async swap(
    useDex,
    sleepFrom,
    sleepTo,
    minSwap,
    maxSwap,
    slippage,
    randomSwapToken,
    minPercent,
    maxPercent
  ) {
    const quantitySwap = random(minSwap, maxSwap);

    const path = randomSwapToken
      ? times(quantitySwap, () => sample(["ETH", "USDC"]))
      : times(quantitySwap, (i) => (i % 2 === 0 ? "ETH" : "USDC"));

    logger.info(
      `[${this.accountId}][${this.address}] Start MultiSwap | quantity swaps: ${quantitySwap}`
    );

    for (let i = 0; i < path.length; i++) {
      const token = path[i];
      const toToken = token === "ETH" ? "USDC" : "ETH";
      const decimal = token === "ETH" ? 6 : 18;

      let balance, minAmount, maxAmount;
      if (token === "ETH") {
        balance = await this.provider.getBalance(this.address);
        minAmount = BigNumber.from(balance)
          .div(100)
          .mul(minPercent)
          .div(10 ** 6)
          .toNumber();
        maxAmount = BigNumber.from(balance)
          .div(100)
          .mul(maxPercent)
          .div(10 ** 6)
          .toNumber();
      } else {
        balance = await this.getBalance(SCROLL_TOKENS["USDC"]);
        minAmount =
          balance.balance <= 1
            ? balance.balance
            : (balance.balance / 100) * minPercent;
        maxAmount =
          balance.balance <= 1
            ? balance.balance
            : (balance.balance / 100) * maxPercent;
      }

      const SwapModule = this.getSwapModule(useDex);
      const swapModule = new SwapModule(this.accountId, this.privateKey);
      await swapModule.swap(
        token,
        toToken,
        minAmount,
        maxAmount,
        decimal,
        slippage,
        false,
        minPercent,
        maxPercent
      );

      if (i + 1 !== path.length) {
        await sleep(sleepFrom, sleepTo);
      }
    }
  }
}

export default { Multiswap };
