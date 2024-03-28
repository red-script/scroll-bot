const { BigNumber, utils } = require("ethers");
const { checkGas } = require("./utils/gas_checker");
const { retry } = require("./utils/helpers");
const { sleep } = require("./utils/sleeping");
const { Account } = require("./account");

class ZkStars extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
  }

  async mint(contracts, minMint, maxMint, mintAll, sleepFrom, sleepTo) {
    const quantityMint = utils.randomNumber(minMint, maxMint);

    contracts = mintAll
      ? contracts
      : utils.shuffle(contracts).slice(0, quantityMint);

    logger.info(
      `[${this.accountId}][${this.address}] Mint ${quantityMint} StarkStars NFT`
    );

    for (let i = 0; i < contracts.length; i++) {
      const contract = this.getContract(
        utils.getAddress(contracts[i]),
        ZKSTARS_ABI
      );

      const mintPrice = await contract.getPrice();
      const nftId = await contract.name();

      logger.info(`[${this.accountId}][${this.address}] Mint #${nftId} NFT`);

      const txData = await this.getTxData();
      txData.value = mintPrice;

      const transaction = {
        to: utils.getAddress(contract),
        data: contract.interface.encodeFunctionData("safeMint", [
          utils.getAddress("0x1C7FF320aE4327784B464eeD07714581643B36A7"),
        ]),
        nonce: txData.nonce,
        gasLimit: txData.gasLimit,
        gasPrice: txData.gasPrice,
        value: txData.value,
        chainId: txData.chainId,
      };

      const signedTxn = await this.sign(transaction);
      const txHash = await this.sendRawTransaction(signedTxn);
      await this.waitUntilTxFinished(txHash);

      if (i !== contracts.length - 1) {
        await sleep(sleepFrom, sleepTo);
      }
    }
  }
}

module.exports = { ZkStars };
