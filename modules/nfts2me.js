const ethers = require('ethers');
const { logger } = require('./loguru');
const { NFTS2ME_ABI } = require('./config');
const { checkGas } = require('./utils/gas_checker');
const { retry } = require('./utils/helpers');
const { Account } = require('./account');

class Minter extends Account {
    constructor(accountId, privateKey, recipient) {
        super(accountId, privateKey, 'scroll', recipient);
    }

    @retry
    @checkGas
    async mintNFT(contracts) {
        logger.info(`[${this.accountId}][${this.address}] Mint NFT on NFTS2ME`);

        const contract = new ethers.Contract(ethers.utils.getAddress(ethers.utils.hexlify(contracts[Math.floor(Math.random() * contracts.length)])), NFTS2ME_ABI, this.signer);

        try {
            const txData = await this.getTxData();
            const transaction = await contract.connect(this.signer).mint(1, txData);
            const receipt = await transaction.wait();
            logger.success(`[${this.accountId}][${this.address}] NFT minted successfully with transaction hash: ${receipt.transactionHash}`);
        } catch (error) {
            logger.error(`[${this.accountId}][${this.address}] Error minting NFT on NFTS2ME: ${error.message}`);
        }
    }
}

module.exports = { Minter };