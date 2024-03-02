import fs from "fs";

// Read JSON files and parse the data
const RPC = JSON.parse(fs.readFileSync("./Data/rpc.json"));
const ACCOUNTS = fs
  .readFileSync("./accounts.txt", "utf8")
  .split("\n")
  .map((account) => account.trim())
  .filter((account) => account);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SCROLL_TOKENS = {
  ETH: "0x5300000000000000000000000000000000000004",
  WETH: "0x5300000000000000000000000000000000000004",
  USDC: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
};

export { RPC, ACCOUNTS, ZERO_ADDRESS, SCROLL_TOKENS };
