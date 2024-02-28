import { readFileSync, writeFileSync } from 'fs';
import { getLogger } from 'loguru';
const logger = getLogger();
import { RETRY_COUNT } from './settings';
import { sleep } from './utils/sleeping';

async function retry(func) {
    return async function wrapper(...args) {
        let retries = 0;
        while (retries <= RETRY_COUNT) {
            try {
                const result = await func(...args);
                return result;
            } catch (error) {
                logger.error(`Error | ${error.message}`);
                await sleep(10000, 20000); // Sleep for 10-20 seconds
                retries++;
            }
        }
    };
}

function remove_wallet(privateKey) {
    const accountsFilePath = 'accounts.txt';

    try {
        let lines = readFileSync(accountsFilePath, 'utf8').split('\n');
        lines = lines.filter(line => !line.includes(privateKey));
        writeFileSync(accountsFilePath, lines.join('\n'));
    } catch (error) {
        logger.error(`Error while removing wallet: ${error.message}`);
    }
}

async function getRunAccounts() {
  try {
    const data = await fs.readFile("data/run_accounts.json");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading run_accounts.json:", error);
    return { accounts: [] }; // Return an empty object if there's an error
  }
}

async function updateRunAccounts(id, method) {
  try {
    let runAccounts = await getRunAccounts();

    if (method === "add") {
      runAccounts.accounts.push(id);
    } else if (method === "remove") {
      runAccounts.accounts = runAccounts.accounts.filter(
        (accountId) => accountId !== id
      );
    } else {
      runAccounts.accounts = [];
    }

    await fs.writeFile(
      "data/run_accounts.json",
      JSON.stringify(runAccounts, null, 2)
    );
  } catch (error) {
    console.error("Error updating run_accounts.json:", error);
    // Handle the error as per your application logic
  }
}

export default {
    retry,
    remove_wallet
};