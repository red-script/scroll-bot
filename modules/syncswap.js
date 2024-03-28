import { winston } from "winston";
import { Account } from "./account";
import {
  SCROLL_TOKENS,
  SYNCSWAP_CLASSIC_POOL_ABI,
  ZERO_ADDRESS,
  SYNCSWAP_CONTRACTS,
  SYNCSWAP_ROUTER_ABI,
  SYNCSWAP_CLASSIC_POOL_DATA_ABI,
} from "./config";
import { checkGas } from "./utils/gas_checker";
import { retry } from "./utils/helpers";
import { utils } from "ethers";
const { abi } = utils;

class SyncSwap extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
    this.swapContract = this.getContract(
      SYNCSWAP_CONTRACTS.router,
      SYNCSWAP_ROUTER_ABI
    );
  }

  async getPool(fromToken, toToken) {
    const contract = this.getContract(
      SYNCSWAP_CONTRACTS.classic_pool,
      SYNCSWAP_CLASSIC_POOL_DATA_ABI
    );
    const poolAddress = await contract.functions
      .getPool(SCROLL_TOKENS[fromToken], SCROLL_TOKENS[toToken])
      .call();
    return poolAddress;
  }

  async getMinAmountOut(poolAddress, tokenAddress, amount, slippage) {
    const poolContract = this.getContract(
      poolAddress,
      SYNCSWAP_CLASSIC_POOL_DATA_ABI
    );
    const minAmountOut = await poolContract.functions
      .getAmountOut(tokenAddress, amount, this.address)
      .call();
    return parseInt(minAmountOut - (minAmountOut / 100) * slippage);
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
    const tokenAddress = SCROLL_TOKENS[fromToken];
    const [amountWei, amount, balance] = await this.getAmount(
      fromToken,
      minAmount,
      maxAmount,
      decimal,
      allAmount,
      minPercent,
      maxPercent
    );

    winston.info(
      `[${this.accountId}][${this.address}] Swap on SyncSwap – ${fromToken} -> ${toToken} | ${amount} ${fromToken}`
    );

    const poolAddress = await this.getPool(fromToken, toToken);

    if (poolAddress !== ZERO_ADDRESS) {
      const txData = await this.getTxData();

      if (fromToken === "ETH") {
        txData.value = amountWei;
      } else {
        await this.approve(amountWei, tokenAddress, SYNCSWAP_CONTRACTS.router);
      }

      const minAmountOut = await this.getMinAmountOut(
        poolAddress,
        tokenAddress,
        amountWei,
        slippage
      );

      const steps = [
        {
          pool: poolAddress,
          data: abi.encode(
            ["address", "address", "uint8"],
            [tokenAddress, this.address, 1]
          ),
          callback: ZERO_ADDRESS,
          callbackData: "0x",
        },
      ];

      const paths = [
        {
          steps: steps,
          tokenIn: fromToken === "ETH" ? ZERO_ADDRESS : tokenAddress,
          amountIn: amountWei,
        },
      ];

      const deadline = Math.floor(Date.now() / 1000) + 1000000;

      const contractTxn = await this.swapContract.functions
        .swap(paths, minAmountOut, deadline)
        .buildTransaction(txData);

      const signedTxn = await this.sign(contractTxn);
      const txnHash = await this.sendRawTransaction(signedTxn);
      await this.waitUntilTxFinished(txnHash.hex());
    } else {
      winston.error(
        `[${this.accountId}][${this.address}] Swap path ${fromToken} to ${toToken} not found!`
      );
    }
  }
}

export default { SyncSwap };
