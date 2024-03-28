import winston from "winston";
import { ZERIUS_CONTRACT, ZERIUS_ABI } from "../config";
import { sleep } from "./utils/sleeping";
import { Account } from "./account";
import { sample } from "lodash";

class Zerius extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");

    this.contract = this.getContract(ZERIUS_CONTRACT, ZERIUS_ABI);

    this.chainIds = {
      arbitrum: 110,
      optimism: 111,
      polygon: 109,
      bsc: 102,
      avalanche: 106,
    };
  }

  async getNftId(txnHash) {
    const receipts = await this.w3.eth.getTransactionReceipt(txnHash);
    const nftId = parseInt(
      receipts.logs[0].topics[receipts.logs[0].topics.length - 1],
      16
    );
    return nftId;
  }

  async getEstimateFee(chain, nftId) {
    const fee = await this.contract.methods
      .estimateSendFee(this.chainIds[chain], this.address, nftId, false, "0x")
      .call();

    return parseInt(fee[0] * 1.2);
  }

  async mint() {
    winston.info(`[${this.accountId}][${this.address}] Mint Zerius NFT`);

    const mintFee = await this.contract.methods.mintFee().call();

    const txData = await this.getTxData(mintFee);

    const transaction = this.contract.methods.mint().encodeABI();
    const signedTxn = await this.sign(transaction);

    const txnHash = await this.sendRawTransaction(signedTxn);
    await this.waitUntilTxFinished(txnHash);

    return txnHash;
  }

  async bridge(chain, sleepFrom, sleepTo) {
    const chainId = sample(chain);
    const mintNft = await this.mint();
    const nftId = await this.getNftId(mintNft);

    await sleep(sleepFrom, sleepTo);

    const l0Fee = await this.getEstimateFee(chainId, nftId);
    const baseBridgeFee = await this.contract.methods.bridgeFee().call();

    const txData = await this.getTxData(l0Fee + baseBridgeFee);

    const transaction = this.contract.methods
      .sendFrom(
        this.address,
        this.chainIds[chainId],
        this.address,
        nftId,
        ZERO_ADDRESS,
        ZERO_ADDRESS,
        "0x0001000000000000000000000000000000000000000000000000000000000003d090"
      )
      .encodeABI();

    const signedTxn = await this.sign(transaction);
    const txnHash = await this.sendRawTransaction(signedTxn);

    await this.waitUntilTxFinished(txnHash);
  }
}

export default { Zerius };
