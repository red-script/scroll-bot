import fs from "fs";

// Read JSON files and parse the data
const RPC = JSON.parse(fs.readFileSync("./Data/rpc.json"));
const ACCOUNTS = fs
  .readFileSync("./accounts.txt", "utf8")
  .split("\n")
  .map((account) => account.trim())
  .filter((account) => account);

// Define other constants
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export { RPC, ACCOUNTS, ZERO_ADDRESS };
