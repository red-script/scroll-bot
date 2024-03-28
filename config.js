import fs from "fs";

// Read JSON files and parse the data
const RPC = JSON.parse(fs.readFileSync("./Data/rpc.json"));
const ACCOUNTS = fs
  .readFileSync("./accounts.txt", "utf8")
  .split("\n")
  .map((account) => account.trim())
  .filter((account) => account);
const DMAIL_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/dmail/abi.json", "utf-8")
);
const NFTS2ME_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/nfts2me/abi.json", "utf-8")
);
const OMNISEA_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/omnisea/abi.json", "utf-8")
);
const WETH_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/scroll/weth.json", "utf-8")
);
const ZERIUS_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/zerius/abi.json", "utf-8")
);
const SKYDROME_ROUTER_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/skydrome/abi.json", "utf-8")
);
const SYNCSWAP_CLASSIC_POOL_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/syncswap/classic_pool.json", "utf-8")
);
const SYNCSWAP_CLASSIC_POOL_DATA_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/syncswap/classic_pool_data.json", "utf-8")
);
const LAYERBANK_ABI = JSON.parse(
  fs.readFileSync("./Data/abi/layerbank/abi.json", "utf-8")
);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SCROLL_TOKENS = {
  ETH: "0x5300000000000000000000000000000000000004",
  WETH: "0x5300000000000000000000000000000000000004",
  USDC: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
};

const SKYDROME_CONTRACTS = {
  router: "0xaa111c62cdeef205f70e6722d1e22274274ec12f",
};
const SYNCSWAP_CONTRACTS = {
  router: "0x80e38291e06339d10aab483c65695d004dbd5c69",
  classic_pool: "0x37bac764494c8db4e54bde72f6965bea9fa0ac2d",
};
const LAYERBANK_CONTRACT = "0xec53c830f4444a8a56455c6836b5d2aa794289aa";
const LAYERBANK_WETH_CONTRACT = "0x274C3795dadfEbf562932992bF241ae087e0a98C";

const DMAIL_CONTRACT = "0x47fbe95e981c0df9737b6971b451fb15fdc989d9";
const OMNISEA_CONTRACT = "0x46ce46951d12710d85bc4fe10bb29c6ea5012077";
const ZERIUS_CONTRACT = "0xeb22c3e221080ead305cae5f37f0753970d973cd";

export {
  RPC,
  ACCOUNTS,
  ZERO_ADDRESS,
  SCROLL_TOKENS,
  DMAIL_ABI,
  DMAIL_CONTRACT,
  NFTS2ME_ABI,
  OMNISEA_ABI,
  OMNISEA_CONTRACT,
  WETH_ABI,
  ZERIUS_CONTRACT,
  ZERIUS_ABI,
  SKYDROME_CONTRACTS,
  SKYDROME_ROUTER_ABI,
  SYNCSWAP_CONTRACTS,
  SYNCSWAP_CLASSIC_POOL_DATA_ABI,
  SYNCSWAP_ROUTER_ABI,
  SYNCSWAP_CLASSIC_POOL_ABI,
};
