import { ethers } from "ethers";
import winston from "winston";
import { RPC, ACCOUNTS } from "../config.js";
import _ from "lodash";
import Table from "table";

async function getNonce(address) {
  try {
    const rpcUrl = _.sample(RPC.sepolia.rpc);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const nonce = await provider.getTransactionCount(address);
    return nonce;
  } catch (error) {
    console.error("Error in getNonce:", error.message);
    throw error;
  }
}

export async function checkTx() {
  try {
    winston.info("Start transaction checker");
    const tasks = [];

    for (const [index, privateKey] of ACCOUNTS.entries()) {
      const wallet = new ethers.Wallet(privateKey);
      tasks.push(
        getNonce(wallet.address)
          .then((nonce) => [index + 1, wallet.address, nonce])
          .catch((error) => [
            index + 1,
            wallet.address,
            "Error:" + error.message,
          ])
      );
    }

    const results = await Promise.all(tasks);

    const data = results.map((row) => [row[0], row[1], row[2]]);
    const config = {
      columns: {
        0: { alignment: "center" },
        1: { alignment: "center" },
        2: { alignment: "center" },
      },
    };
    const table = Table.table(data, config);

    console.log(table);
    winston.info(table);
  } catch (error) {
    winston.error("Error in checkTx:", error.message);
  }
}
