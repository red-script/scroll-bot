import { ethers } from "ethers";
import _ from "lodash";
const { RPC, ERC20_ABI, SCROLL_TOKENS } = require("./config");
const { GAS_MULTIPLIER, MAX_PRIORITY_FEE } = require("./settings");
const { sleep } = require("./utils/sleeping");

class Account {
  constructor(account_id, private_key, chain) {
    this.account_id = account_id;
    this.private_key = private_key;
    this.chain = chain;
    this.explorer = RPC.chain.explorer;
    this.token = RPC.chain.token;

    const rpcUrl = _.sample(RPC.sepolia.rpc);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(private_key, this.provider);
    this.address = this.wallet.address;
  }

  async getTxData(value = 0, gasPrice = true) {
    try {
      const chainId = await this.provider.getChainId();
      const nonce = await this.provider.getTransactionCount(this.address);

      const tx = {
        chainId: chainId,
        from: this.address,
        value: value,
        nonce: nonce,
      };

      if (gasPrice) {
        const gasPrice = await this.provider.getGasPrice();
        tx.gasPrice = gasPrice;
      }

      return tx;
    } catch (error) {
      console.error("Error in getTxData:", error.message);
      throw error;
    }
  }

  //Creating a new instance of a Contract connects
  getContract(contractAddress, abi = null) {
    try {
      contractAddress = ethers.utils.getAddress(contractAddress);
      if (!abi) {
        abi = ERC20_ABI;
      }
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      return contract;
    } catch (error) {
      console.error("Error in getContract:", error.message);
    }
  }

  async getBalance(contractAddress) {
    try {
      contractAddress = ethers.utils.getAddress(contractAddress);
      const contract = this.getContract(contractAddress);
      const symbol = await contract.symbol();
      const decimal = await contract.decimals();
      const balanceWei = await contract.balanceOf(address);
      const balance = ethers.utils.formatUnits(balanceWei, decimal);

      return {
        balanceWei: balanceWei.toString(),
        balance: balance.toString(),
        symbol: symbol,
        decimal: decimal,
      };
    } catch (error) {
      console.error("Error in getBalance:", error.message);
      throw error;
    }
  }

  async getAmount(
    fromToken,
    minAmount,
    maxAmount,
    decimal,
    allAmount,
    minPercent,
    maxPercent
  ) {
    const randomAmount = _.round(_.random(minAmount, maxAmount), decimal);
    const randomPercent = _.random(minPercent, maxPercent);
    const percent = randomPercent === 100 ? 1 : randomPercent / 100;

    let balance, amountWei, amount;

    if (fromToken === "ETH") {
      balance = await getEthBalance();
      amountWei = allAmount
        ? _.parseInt(_.multiply(balance, percent))
        : _.parseInt(_.multiply(randomAmount, 1e18));
      amount = allAmount ? _.divide(balance, 1e18) : randomAmount;
    } else {
      //const tokenAddress = SCROLL_TOKENS[fromToken];
      balance = await getTokenBalance(SCROLL_TOKENS[fromToken]);
      amountWei = allAmount
        ? balance.balanceWei.mul(percent)
        : ethers.utils.parseUnits(randomAmount.toString(), balance.decimal);
      amount = allAmount ? balance.balance.mul(percent) : randomAmount;
      balance = balance.balanceWei;
    }

    return [amountWei, amount, balance];
  }

  async checkAllowance(tokenAddress, contractAddress) {
    try {
      // Convert addresses to checksum format
      tokenAddress = ethers.utils.getAddress(tokenAddress);
      contractAddress = ethers.utils.getAddress(contractAddress);

      // Get the contract instance
      const contract = this.getContract(tokenAddress, ERC20_ABI);

      // Get the allowance
      const amountApproved = await contract.allowance(address, contractAddress);

      return amountApproved.toString();
    } catch (error) {
      console.error("Error in checkAllowance:", error.message);
      throw error;
    }
  }

  async approve(amount, tokenAddress, contractAddress) {
    try {
      // Convert addresses to checksum format
      tokenAddress = ethers.utils.getAddress(tokenAddress);
      contractAddress = ethers.utils.getAddress(contractAddress);

      // Get the contract instance
      const contract = this.getContract(tokenAddress, ERC20_ABI);

      // Get allowance amount
      const allowanceAmount = await checkAllowance(
        tokenAddress,
        contractAddress
      );

      // Decide whether to make an approval transaction
      if (amount > allowanceAmount || amount === 0) {
        console.log(`[${this.accountId}][${this.address}] Make approve`);

        const approveAmount =
          amount > allowanceAmount ? ethers.constants.MaxUint128 : 0;

        // Get transaction data
        const txData = await this.getTxData();

        // Build transaction
        const transaction = await contract.populateTransaction.approve(
          contractAddress,
          approveAmount,
          txData
        );

        // Sign transaction
        const signedTx = await this.sign(transaction);

        // Send transaction
        const tx = await provider.sendTransaction(signedTx);

        // Wait for transaction confirmation
        await tx.wait();

        // Sleep for a while
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Sleep for 5 seconds
      }
    } catch (error) {
      console.error("Error in approve:", error.message);
      throw error;
    }
  }

  async waitUntilTxFinished(hash, maxWaitTime = 180) {
    const start = Date.now();

    while (true) {
      try {
        const receipt = await this.provider.getTransactionReceipt(hash);
        if (receipt && receipt.status === 1) {
          console.log(`Transaction ${hash} successfully mined!`);
          return;
        } else if (!receipt) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          console.error(`Transaction ${hash} failed!`);
          return;
        }
      } catch (error) {
        if (Date.now() - start > maxWaitTime * 1000) {
          console.error(
            `Timed out waiting for transaction ${hash} to be mined!`
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  async sign(transaction, private_key, maxPriorityFeePerGas = null) {
    const signer = new ethers.Wallet(private_key, provider);

    if (!transaction.gasPrice) {
      const maxFeePerGas = await this.provider.getGasPrice();
      transaction.maxFeePerGas = maxFeePerGas;
      if (maxPriorityFeePerGas !== null) {
        transaction.maxPriorityFeePerGas = maxPriorityFeePerGas;
      }
    }

    const gasLimit = await signer.estimateGas(transaction);
    const gas = Math.ceil(gasLimit.toNumber() * GAS_MULTIPLIER);

    transaction.gasLimit = gas;

    const signedTx = await signer.signTransaction(transaction);

    return signedTx;
  }

  //Submits transaction to the network to be mined.
  async sendRawTransaction(signedTx) {
    const tx = await this.provider.sendTransaction(signedTx);
    return tx.hash;
  }
}

module.exports = Account;