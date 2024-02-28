import { readFileSync } from 'fs';

// Read JSON files and parse the data
const RPC = JSON.parse(readFileSync('data/rpc.json'));
const ERC20_ABI = JSON.parse(readFileSync('data/abi/erc20_abi.json'));
const DEPOSIT_ABI = JSON.parse(readFileSync('data/abi/bridge/deposit.json'));
const WITHDRAW_ABI = JSON.parse(readFileSync('data/abi/bridge/withdraw.json'));
const ORACLE_ABI = JSON.parse(readFileSync('data/abi/bridge/oracle.json'));
const WETH_ABI = JSON.parse(readFileSync('data/abi/scroll/weth.json'));
const SYNCSWAP_ROUTER_ABI = JSON.parse(readFileSync('data/abi/syncswap/router.json'));
const SYNCSWAP_CLASSIC_POOL_ABI = JSON.parse(readFileSync('data/abi/syncswap/classic_pool.json'));
const SYNCSWAP_CLASSIC_POOL_DATA_ABI = JSON.parse(readFileSync('data/abi/syncswap/classic_pool_data.json'));
const SKYDROME_ROUTER_ABI = JSON.parse(readFileSync('data/abi/skydrome/abi.json'));
const ZEBRA_ROUTER_ABI = JSON.parse(readFileSync('data/abi/zebra/abi.json'));
const AAVE_ABI = JSON.parse(readFileSync('data/abi/aave/abi.json'));
const LAYERBANK_ABI = JSON.parse(readFileSync('data/abi/layerbank/abi.json'));
const ZERIUS_ABI = JSON.parse(readFileSync('data/abi/zerius/abi.json'));
const L2PASS_ABI = JSON.parse(readFileSync('data/abi/l2pass/abi.json'));
const DMAIL_ABI = JSON.parse(readFileSync('data/abi/dmail/abi.json'));
const OMNISEA_ABI = JSON.parse(readFileSync('data/abi/omnisea/abi.json'));
const NFTS2ME_ABI = JSON.parse(readFileSync('data/abi/nft2me/abi.json'));
const SAFE_ABI = JSON.parse(readFileSync('data/abi/gnosis/abi.json'));
const DEPLOYER_ABI = JSON.parse(readFileSync('data/deploy/abi.json'));
const ZKSTARS_ABI = JSON.parse(readFileSync('data/abi/zkstars/abi.json'));
const RUBYSCORE_VOTE_ABI = JSON.parse(readFileSync('data/abi/rubyscore/abi.json'));
const L2TELEGRAPH_MESSAGE_ABI = JSON.parse(readFileSync('data/abi/l2telegraph/send_message.json'));
const L2TELEGRAPH_NFT_ABI = JSON.parse(readFileSync('data/abi/l2telegraph/bridge_nft.json'));
const NFT_ORIGINS_ABI = JSON.parse(readFileSync('data/abi/nft-origins/abi.json'));

// Define other constants
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const BRIDGE_CONTRACTS = {
    "deposit": "0xf8b1378579659d8f7ee5f3c929c2f3e332e41fd6",
    "withdraw": "0x4C0926FF5252A435FD19e10ED15e5a249Ba19d79",
    "oracle": "0x987e300fDfb06093859358522a79098848C33852"
};

const ORBITER_CONTRACT = "0x80c67432656d59144ceff962e8faf8926599bcf8";

const SCROLL_TOKENS = {
    "ETH": "0x5300000000000000000000000000000000000004",
    "WETH": "0x5300000000000000000000000000000000000004",
    "USDC": "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4"
};

const SYNCSWAP_CONTRACTS = {
    "router": "0x80e38291e06339d10aab483c65695d004dbd5c69",
    "classic_pool": "0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d"
};

const SKYDROME_CONTRACTS = {
    "router": "0xAA111C62cDEEf205f70E6722D1E22274274ec12F"
};

const ZEBRA_CONTRACTS = {
    "router": "0x0122960d6e391478bfe8fb2408ba412d5600f621"
};

const AMBIENT_CONTRACTS = {
    "router": "0xaaaaaaaacb71bf2c8cae522ea5fa455571a74106",
    "impact": "0xc2c301759B5e0C385a38e678014868A33E2F3ae3"
};

const XYSWAP_CONTRACT = {
    "router": "0x22bf2a9fcaab9dc96526097318f459ef74277042",
    "use_ref": false  // If you use true, you support me 1% of the transaction amount
};

const AAVE_CONTRACT = "0xff75a4b698e3ec95e608ac0f22a03b8368e05f5d";

const AAVE_WETH_CONTRACT = "0xf301805be1df81102c957f6d4ce29d2b8c056b2a"

const LAYERBANK_CONTRACT = "0xec53c830f4444a8a56455c6836b5d2aa794289aa"

const LAYERBANK_WETH_CONTRACT = "0x274C3795dadfEbf562932992bF241ae087e0a98C"

const ZERIUS_CONTRACT = "0xeb22c3e221080ead305cae5f37f0753970d973cd"

const DMAIL_CONTRACT = "0x47fbe95e981c0df9737b6971b451fb15fdc989d9"

const OMNISEA_CONTRACT = "0x46ce46951d12710d85bc4fe10bb29c6ea5012077"

const SAFE_CONTRACT = "0xa6b71e26c5e0845f74c812102ca7114b6a896ab2"

const RUBYSCORE_VOTE_CONTRACT = "0xe10Add2ad591A7AC3CA46788a06290De017b9fB4"

const L2TELEGRAPH_MESSAGE_CONTRACT = "0x9f63dbdf90837384872828d1ed6eb424a7f7f939"

const L2TELEGRAPH_NFT_CONTRACT = "0xdc60fd9d2a4ccf97f292969580874de69e6c326e"

const NFT_ORIGINS_CONTRACT = "0x74670A3998d9d6622E32D0847fF5977c37E0eC91"