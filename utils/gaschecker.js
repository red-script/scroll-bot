const { ethers } = require('ethers');
const RPC = require('./config').RPC;
const { CHECK_GWEI, MAX_GWEI } = require('./settings');
const { getLogger } = require('loguru');
const logger = getLogger();

async function getGas() {
    try {
        const provider = new ethers.providers.JsonRpcProvider(random.choice(RPC["ethereum"]["rpc"]));
        const gasPrice = await provider.getGasPrice();
        const gwei = ethers.utils.formatUnits(gasPrice, 'gwei');
        return parseFloat(gwei);
    } catch (error) {
        logger.error(error);
    }
}

async function waitGas() {
    logger.info("Get GWEI");
    while (true) {
        const gas = await getGas();

        if (gas > MAX_GWEI) {
            logger.info(`Current GWEI: ${gas} > ${MAX_GWEI}`);
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds
        } else {
            logger.success(`GWEI is normal | current: ${gas} < ${MAX_GWEI}`);
            break;
        }
    }
}

function checkGas(func) {
    return async function _wrapper(...args) {
        if (CHECK_GWEI) {
            await waitGas();
        }
        return await func(...args);
    };
}

module.exports = {
    getGas,
    waitGas,
    checkGas
};