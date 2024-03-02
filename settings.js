const settings = {
  RANDOM_WALLET: True,

  QUANTITY_RUN_ACCOUNTS: 5,

  SLEEP_FROM: 500, // Milliseconds
  SLEEP_TO: 1000, // Milliseconds

  MAX_PRIORITY_FEE: {
    ethereum: 0.01,
  },

  GAS_MULTIPLIER: 1,

  RETRY_COUNT: 3,
};

export default settings;
