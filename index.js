import inquirer from "inquirer";
import shuffle from "lodash/shuffle";
import random from "lodash/random";
import { depositScroll, withdrawScroll, bridgeOrbiter, wrapEth, unwrapEth, swapSkydrome, swapSyncswap, mintZerius, createOmnisea, mintNft, sendMail, deployContract, customRoutes } from "./modules_settings.mjs";
import { sleep } from "./utils/sleeping";
import { ACCOUNTS } from "./config";
import { getRunAccounts } from "./utils/helper";
import { QUANTITY_RUN_ACCOUNTS } from "./settings";
import { get_tx_count } from "./modules_settings";
import winston from 'winston';

async function getModule() {
  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "module",
        message: "Select a method to get started",
        choices: [
          { value: depositScroll, name: "1) Deposit to Scroll" },
          { value: withdrawScroll, name: "2) Withdraw from Scroll" },
          { value: bridgeOrbiter, name: "3) Bridge Orbiter" },
          { value: wrapEth, name: "4) Wrap ETH" },
          { value: unwrapEth, name: "5) Unwrap ETH" },
          { value: swapSkydrome, name: "6) Swap on Skydrome" },
          { value: swapSyncswap, name: "7) Swap on SyncSwap" },
          { value: mintZerius, name: "8) Mint and Bridge Zerius NFT" },
          { value: createOmnisea, name: "9) Create NFT collection on Omnisea", },
          { value: mintNft, name: "10) Mint NFT on NFTS2ME" },
          { value: sendMail, name: "11) Dmail send email" },
          { value: deployContract, name: "12) Deploy contract" },
          { value: customRoutes, name: "13) Use custom routes" },
          { value: "tx_checker", name: "14) Check transaction count" },
          { value: exitProgram, name: "15 Exit" },
        ],
      },
    ]);
    return answers.module;
  }
  catch (error) {
    winston.error("Error occurred while getting module:", error);
    throw error;
  }
}

//useRecipients
async function getWallets() {
    const wallets = ACCOUNTS.map((key, index) => ({
      id: index + 1,
      key: key,
    }));    
    return wallets;
}

async function run_module(module, account_id, key, sleepTime, startId) {
    if (startId !== 1) {
        await sleep(sleepTime);
    }
    while (true) {
        const runAccounts = await getRunAccounts();
        if (runAccounts.accounts.length < QUANTITY_RUN_ACCOUNTS) {
            await updateRunAccounts(account_id, "add");
            await module(account_id, key);
            await updateRunAccounts(account_id, "remove");
            break;
        } else {
            logger.info(`Current run accounts: ${runAccounts.accounts.length}`);
            await sleep(60000); // Sleep for 60 seconds
        }
    }
}

async function main(module) {
    const wallets = await getWallets();
    let sleepTime = random(SLEEP_FROM, SLEEP_TO);

    if (RANDOM_WALLET) {
      shuffle(wallets);
    }
    
    const tasks = wallets.map((wallet, index) => {
        const startId = index + 1;
        sleepTime += _.random(SLEEP_FROM, SLEEP_TO);
        return run_module(module, wallet.id, wallet.key, sleepTime, startId);
    });

    await Promise.all(tasks);
}

(async () => {
  logger.add("logging.log");

  const module = await getModule();
  if (module === "tx_checker") {
    get_tx_count(); // where is this function definition
  } else {
    main(module);
  }
})();
