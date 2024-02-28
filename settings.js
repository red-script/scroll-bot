const settings = {
  RANDOM_WALLET: true, // true/false

  // REMOVE_WALLET: false, // true/false
  QUANTITY_RUN_ACCOUNTS: 5,

  SLEEP_FROM: 500, // Milliseconds
  SLEEP_TO: 1000, // Milliseconds

  // QUANTITY_THREADS: 1,

  // THREAD_SLEEP_FROM: 5, // Seconds
  // THREAD_SLEEP_TO: 5, // Seconds

  CHECK_GWEI: false, // true/false
  MAX_GWEI: 20,

  MAX_PRIORITY_FEE: {
    ethereum: 0.01,
    // polygon: 40,
    // arbitrum: 0.1,
    // base: 0.1,
    // zksync: 0.25,
  },

  GAS_MULTIPLIER: 1,
  GAS_LIMIT_MULTIPLIER: 1.3,

  RETRY_COUNT: 3,

  // LAYERSWAP_API_KEY: "",
};

export default settings;
