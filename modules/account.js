const { ethers } = require("ethers");
const { ERC20_ABI, SCROLL_TOKENS } = require("./config");
const { GAS_MULTIPLIER, MAX_PRIORITY_FEE, GAS_LIMIT_MULTIPLIER } = require("./settings");
const { sleep } = require("./utils/sleeping");

class Account {
    constructor(account_id, private_key, chain, recipient) {
        this.account_id = account_id;
        this.private_key = private_key;
        this.chain = chain;
        this.explorer = RPC[chain]["explorer"];
        this.token = RPC[chain]["token"];
        this.recipient = recipient;

        this.provider = new ethers.providers.JsonRpcProvider(randomRpcUrl());
        this.wallet = new ethers.Wallet(private_key, this.provider);
        this.address = this.wallet.address;
    }

    async getTxData(value = 0, gas_price = true) {
        const chainId = await this.provider.getNetwork().then(network => network.chainId);
        const nonce = await this.provider.getTransactionCount(this.address);
        const tx = { chainId, from: this.address, value, nonce };
        if (gas_price) {
            const gasPrice = await this.provider.getGasPrice();
            tx.gasPrice = gasPrice;
        }
        return tx;
    }

    async transactionFee(txData) {
        const gasPrice = await this.provider.getGasPrice();
        const gas = await this.wallet.estimateGas(txData);
        return gas.mul(gasPrice);
    }

    getContract(contractAddress, abi = null) {
        contractAddress = ethers.utils.getAddress(contractAddress);
        if (!abi) abi = ERC20_ABI;
        return new ethers.Contract(contractAddress, abi, this.wallet);
    }

    async getBalance(contractAddress) {
        contractAddress = ethers.utils.getAddress(contractAddress);
        const contract = this.getContract(contractAddress);
        const [symbol, decimal, balanceWei] = await Promise.all([
            contract.symbol(),
            contract.decimals(),
            contract.balanceOf(this.address)
        ]);
        const balance = ethers.utils.formatUnits(balanceWei, decimal);
        return { balanceWei, balance, symbol, decimal };
    }

    async getAmount(fromToken, minAmount, maxAmount, decimal, allAmount, minPercent, maxPercent) {
        const randomAmount = parseFloat((Math.random() * (maxAmount - minAmount) + minAmount).toFixed(decimal));
        const randomPercent = Math.floor(Math.random() * (maxPercent - minPercent + 1) + minPercent);
        const percent = randomPercent === 100 ? 1 : randomPercent / 100;

        let balance, amountWei, amount;
        if (fromToken === "ETH") {
            balance = await this.provider.getBalance(this.address);
            amountWei = allAmount ? balance.mul(percent) : ethers.utils.parseEther(randomAmount.toString());
            amount = allAmount ? ethers.utils.formatEther(balance.mul(percent)) : randomAmount;
        } else {
            const tokenAddress = SCROLL_TOKENS[fromToken];
            balance = await this.getBalance(tokenAddress);
            amountWei = allAmount ? balance.balanceWei.mul(percent) : ethers.utils.parseUnits(randomAmount.toString(), balance.decimal);
            amount = allAmount ? balance.balance.mul(percent) : randomAmount;
            balance = balance.balanceWei;
        }

        return [amountWei, amount, balance];
    }

    async checkAllowance(tokenAddress, contractAddress) {
        tokenAddress = ethers.utils.getAddress(tokenAddress);
        contractAddress = ethers.utils.getAddress(contractAddress);
        const contract = this.getContract(tokenAddress, ERC20_ABI);
        return contract.allowance(this.address, contractAddress);
    }

    async approve(amount, tokenAddress, contractAddress) {
        tokenAddress = ethers.utils.getAddress(tokenAddress);
        contractAddress = ethers.utils.getAddress(contractAddress);
        const contract = this.getContract(tokenAddress, ERC20_ABI);

        const allowanceAmount = await this.checkAllowance(tokenAddress, contractAddress);

        if (amount > allowanceAmount) {
            console.log(`[${this.account_id}][${this.address}] Make approve`);
            const approveAmount = amount > allowanceAmount ? ethers.constants.MaxUint256 : 0;
            const txData = await this.getTxData();
            const transaction = await contract.populateTransaction.approve(contractAddress, approveAmount);
            const signedTxn = await this.sign(transaction);
            const txnHash = await this.sendRawTransaction(signedTxn);
            await this.waitUntilTxFinished(txnHash);
            await sleep(5, 20);
        }
    }

    async waitUntilTxFinished(hash, maxWaitTime = 180) {
        const startTime = Date.now();
        while (true) {
            try {
                const receipt = await this.provider.getTransactionReceipt(hash);
                const status = receipt.status;
                if (status === 1) {
                    console.log(`[${this.account_id}][${this.address}] ${this.explorer}${hash} successfully!`);
                    return;
                } else if (status === null) {
                    await sleep(300);
                } else {
                    console.error(`[${this.account_id}][${this.address}] ${this.explorer}${hash} transaction failed!`);
                    return;
                }
            } catch (error) {
                if (Date.now() - startTime > maxWaitTime * 1000) {
                    console.log(`FAILED TX: ${hash}`);
                    return;
                }
                await sleep(1000);
            }
        }
    }

    async sign(transaction) {
        if (transaction.gasPrice === undefined) {
            const maxPriorityFeePerGas = ethers.utils.parseUnits(MAX_PRIORITY_FEE["ethereum"].toString(), "gwei");
            const maxFeePerGas = await this.provider.getGasPrice();
            transaction.maxPriorityFeePerGas = maxPriorityFeePerGas;
            transaction.maxFeePerGas = maxFeePerGas;
        } else {
            transaction.gasPrice = parseInt(transaction.gasPrice * GAS_LIMIT_MULTIPLIER);
        }
        let gas = await this.wallet.estimateGas(transaction);
        gas = gas.mul(GAS_MULTIPLIER);
        transaction.gasLimit = gas;

        const signedTxn = await this.wallet.signTransaction(transaction);
        return signedTxn;
    }

    async sendRawTransaction(signedTxn) {
        const txn = await this.provider.sendTransaction(signedTxn);
        return txn.hash;
    }
}

function randomRpcUrl() {
    const rpcUrls = RPC.scroll.rpc;
    const randomIndex = Math.floor(Math.random() * rpcUrls.length);
    return rpcUrls[randomIndex];
}
