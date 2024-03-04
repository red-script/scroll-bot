import { readFileSync, writeFileSync } from "fs";
import {
  createLogger,
  format as _format,
  transports as _transports,
} from "winston";
import { sleep } from "./utils/sleep";
import { RETRY_COUNT } from "./settings";

const logger = createLogger({
  level: "error",
  format: _format.json(),
  transports: [new _transports.File({ filename: "error.log", level: "error" })],
});

export async function retry(func) {
  async function wrapper(...args) {
    let retries = 0;
    while (retries <= RETRY_COUNT) {
      try {
        const result = await func(...args);
        return result;
      } catch (error) {
        logger.error(`Error | ${error}`);
        await sleep(10, 20); // Sleep for 10 seconds
        retries++;
      }
    }
  }
  return wrapper;
}

// function getRunAccounts() {
//   try {
//     const data = readFileSync("data/run_accounts.json");
//     return JSON.parse(data);
//   } catch (error) {
//     logger.error(`Error reading run_accounts.json: ${error}`);
//     return { accounts: [] };
//   }
// }

// function updateRunAccounts(id, method) {
//   let runAccounts = getRunAccounts();
//   try {
//     if (method === "add") {
//       runAccounts.accounts.push(id);
//     } else if (method === "remove") {
//       runAccounts.accounts = runAccounts.accounts.filter(
//         (accountId) => accountId !== id
//       );
//     } else {
//       runAccounts.accounts = [];
//     }
//     writeFileSync("data/run_accounts.json", JSON.stringify(runAccounts));
//   } catch (error) {
//     logger.error(`Error updating run_accounts.json: ${error}`);
//   }
// }
