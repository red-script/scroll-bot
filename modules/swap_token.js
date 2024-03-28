import { BigNumber } from "ethers";
import { sleep } from "./utils/sleeping";
import { SyncSwap } from "./modules";
import { sample, shuffle } from "lodash";
import { Account } from "./account";

class SwapTokens extends Account {
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
    tokens,
    sleepFrom,
    sleepTo,
    slippage,
    minPercent,
    maxPercent
  ) {
    const shuffledTokens = shuffle(tokens);

    logger.info(`[${this.accountId}][${this.address}] Start swap tokens`);

    for (let i = 0; i < shuffledTokens.length; i++) {
      const token = shuffledTokens[i];
      if (token === "ETH") {
        continue;
      }

      const balance = await this.getBalance(SCROLL_TOKENS[token]);

      if (balance.balanceWei > 0) {
        const SwapModule = this.getSwapModule(useDex);
        const swapModule = new SwapModule(this.accountId, this.privateKey);
        await swapModule.swap(
          token,
          "ETH",
          balance.balance,
          balance.balance,
          balance.decimal,
          slippage,
          true,
          minPercent,
          maxPercent
        );
      }

      if (i + 1 !== shuffledTokens.length) {
        await sleep(sleepFrom, sleepTo);
      }
    }
  }
}

export default { SwapTokens };
