const Web3 = require('web3');
const { Account } = require('eth-lib');
const { table } = require('table');

const { ACCOUNTS, RPC } = require('./config');

async function getNonce(address) {
    const web3 = new Web3(new Web3.providers.HttpProvider(randomRpcUrl()));
    const nonce = await web3.eth.getTransactionCount(address);
    return nonce;
}

async function checkTx() {
    console.log("Start transaction checker");
    const tasks = ACCOUNTS.map(async (pk, index) => {
        const address = Account.fromPrivate(pk).address;
        const nonce = await getNonce(address);
        return [index + 1, address, nonce];
    });

    const result = await Promise.all(tasks);
    const tableData = [['#', 'Address', 'Nonce'], ...result];
    console.log(table(tableData));
}

function randomRpcUrl() {
    const rpcUrls = RPC.scroll.rpc;
    const randomIndex = Math.floor(Math.random() * rpcUrls.length);
    return rpcUrls[randomIndex];
}

checkTx();
