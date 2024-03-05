import { ethers } from "ethers";
import { RPC } from "./config";
import { CHECK_GWEI, MAX_GWEI } from "./settings";
import { info, success } from "winston";

async function getGas() {
  try {
    const provider = new ethers.JsonRpcProvider(
      random.choice(RPC.ethereum.rpc)
    );
    const gasPrice = await provider.getGasPrice();
    const gwei = ethers.utils.formatUnits(gasPrice, "gwei");
    return gwei;
  } catch (error) {
    console.error(error);
  }
}

async function waitGas() {
  info("Get GWEI");
  while (true) {
    const gas = await getGas();

    if (gas > MAX_GWEI) {
      info(`Current GWEI: ${gas} > ${MAX_GWEI}`);
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 60 seconds
    } else {
      success(`GWEI is normal | current: ${gas} < ${MAX_GWEI}`);
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

export default { checkGas };
