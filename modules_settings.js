import { checkTx } from "./modules/tx_checker.js";

// async function deposit_scroll(account_id, key, recipient) {
//   // Deposit from official bridge
//   // ______________________________________________________
//   // all_amount - bridge from min_percent to max_percent

//   min_amount = 0.001;
//   max_amount = 0.002;
//   decimal = 4;

//   all_amount = True;

//   min_percent = 1;
//   max_percent = 1;

//   scroll = Scroll(account_id, key, "ethereum", recipient);
//   await scroll.deposit(
//     min_amount,
//     max_amount,
//     decimal,
//     all_amount,
//     min_percent,
//     max_percent
//   );
// }

// async function withdraw_scroll(account_id, key, recipient) {
//   // Withdraw from official bridge
//   // ______________________________________________________
//   // all_amount - withdraw from min_percent to max_percent

//   min_amount = 0.0012;
//   max_amount = 0.0012;
//   decimal = 4;

//   all_amount = True;

//   min_percent = 10;
//   max_percent = 10;

//   scroll = Scroll(account_id, key, "scroll", recipient);
//   await scroll.withdraw(
//     min_amount,
//     max_amount,
//     decimal,
//     all_amount,
//     min_percent,
//     max_percent
//   );
// }

// async function bridge_orbiter(account_id, key, recipient) {
//   // Bridge from orbiter
//   // ______________________________________________________
//   // from_chain – ethereum, base, polygon_zkevm, arbitrum, optimism, zksync, scroll | Select one
//   // to_chain – ethereum, base, polygon_zkevm, arbitrum, optimism, zksync, scroll | Select one

//   from_chain = "scroll";
//   to_chain = "base";

//   min_amount = 0.005;
//   max_amount = 0.0051;
//   decimal = 4;

//   all_amount = False;

//   min_percent = 5;
//   max_percent = 10;

//   orbiter = Orbiter(
//     (account_id = account_id),
//     (private_key = key),
//     (chain = from_chain),
//     (recipient = recipient)
//   );
//   await orbiter.bridge(
//     to_chain,
//     min_amount,
//     max_amount,
//     decimal,
//     all_amount,
//     min_percent,
//     max_percent
//   );
// }

// async function wrap_eth(account_id, key, recipient) {
//   // Wrap ETH
//   // ______________________________________________________
//   // all_amount - wrap from min_percent to max_percent

//   min_amount = 0.001;
//   max_amount = 0.002;
//   decimal = 4;

//   all_amount = True;

//   min_percent = 5;
//   max_percent = 10;

//   scroll = Scroll(account_id, key, "scroll", recipient);
//   await scroll.wrap_eth(
//     min_amount,
//     max_amount,
//     decimal,
//     all_amount,
//     min_percent,
//     max_percent
//   );
// }

// async function unwrap_eth(account_id, key, recipient) {
//   // Unwrap ETH
//   // ______________________________________________________
//   // all_amount - unwrap from min_percent to max_percent

//   min_amount = 0.001;
//   max_amount = 0.002;
//   decimal = 4;

//   all_amount = True;

//   min_percent = 100;
//   max_percent = 100;

//   scroll = Scroll(account_id, key, "scroll", recipient);
//   await scroll.unwrap_eth(
//     min_amount,
//     max_amount,
//     decimal,
//     all_amount,
//     min_percent,
//     max_percent
//   );
// }

// async function swap_skydrome(account_id, key, recipient) {
//   // Make swap on Skydrome
//   // ______________________________________________________
//   // from_token – Choose SOURCE token ETH, USDC | Select one
//   // to_token – Choose DESTINATION token ETH, USDC | Select one

//   // Disclaimer - You can swap only ETH to any token or any token to ETH!
//   // ______________________________________________________
//   // all_amount - swap from min_percent to max_percent

//   from_token = "USDC";
//   to_token = "ETH";

//   min_amount = 0.0001;
//   max_amount = 0.0002;
//   decimal = 6;
//   slippage = 1;

//   all_amount = True;

//   min_percent = 100;
//   max_percent = 100;

//   skydrome = Skydrome(account_id, key, recipient);
//   await skydrome.swap(
//     from_token,
//     to_token,
//     min_amount,
//     max_amount,
//     decimal,
//     slippage,
//     all_amount,
//     min_percent,
//     max_percent
//   );
// }

// async function swap_syncswap(account_id, key, recipient) {
//   // Make swap on SyncSwap

//   // from_token – Choose SOURCE token ETH, USDC | Select one
//   // to_token – Choose DESTINATION token ETH, USDC | Select one

//   // Disclaimer – Don't use stable coin in from and to token | from_token USDC to_token USDT DON'T WORK!!!
//   // ______________________________________________________
//   // all_amount - swap from min_percent to max_percent

//   from_token = "USDC";
//   to_token = "ETH";

//   min_amount = 1;
//   max_amount = 2;
//   decimal = 6;
//   slippage = 1;

//   all_amount = True;

//   min_percent = 100;
//   max_percent = 100;

//   syncswap = SyncSwap(account_id, key, recipient);
//   await syncswap.swap(
//     from_token,
//     to_token,
//     min_amount,
//     max_amount,
//     decimal,
//     slippage,
//     all_amount,
//     min_percent,
//     max_percent
//   );
// }

async function deposit_layerbank(accountId, key) {
  // Make deposit on LayerBank
  // ______________________________________________________
  // make_withdraw - True, if need withdraw after deposit
  // all_amount - deposit from min_percent to max_percent

  const minAmount = 0.0001;
  const maxAmount = 0.0002;
  const decimal = 5;

  const sleepFrom = 5;
  const sleepTo = 24;

  const makeWithdraw = true;

  const allAmount = true;

  const minPercent = 5;
  const maxPercent = 10;

  const layerbank = new LayerBank(accountId, key);
  await layerbank.deposit(
    minAmount,
    maxAmount,
    decimal,
    sleepFrom,
    sleepTo,
    makeWithdraw,
    allAmount,
    minPercent,
    maxPercent
  );
}

// async function mint_nft(account_id, key, recipient) {
//   // Mint NFT on NFTS2ME
//   // ______________________________________________________
//   // contracts - list NFT contract addresses

//   contracts = [""];

//   minter = Minter(account_id, key, recipient);
//   await minter.mint_nft(contracts);
// }

// #########################################
// ########### NO NEED TO CHANGE ###########
// #########################################
async function withdraw_layerbank(account_id, key) {
  layerbank = Layerbank(account_id, key);
  await layerbank.withdraw();
}

// async function send_mail(account_id, key, recipient) {
//   dmail = Dmail(account_id, key, recipient);
//   await dmail.send_mail();
// }

// async function create_omnisea(account_id, key, recipient) {
//   omnisea = Omnisea(account_id, key, recipient);
//   await omnisea.create();
// }

// async function deploy_contract(account_id, key, recipient) {
//   deployer = Deployer(account_id, key, recipient);
//   await deployer.deploy_token();
// }

export async function get_tx_count() {
  await checkTx();
}

// export default {
//   //   deposit_scroll,
//   //   withdraw_scroll,
//   //   bridge_orbiter,
//   //   wrap_eth,
//   //   unwrap_eth,
//   //   swap_skydrome,
//   //   swap_syncswap,
//   //   mint_zerius,
//   //   create_omnisea,
//   //   mint_nft,
//   //   send_mail,
//   //   deploy_contract,
//   get_tx_count,
// };
