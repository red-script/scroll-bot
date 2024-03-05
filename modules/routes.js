import { sleep } from "./utils/sleeping";
import { winston } from "winston";
import { Account } from "./account";
import { sample, pull, random } from "lodash";

class Routes extends Account {
  constructor(accountId, privateKey) {
    super(accountId, privateKey, "scroll");
  }

  async start(useModules, sleepFrom, sleepTo, randomModule) {
    winston.info(`[${this.accountId}][${this.address}] Start using routes`);

    for (let i = 0; i < useModules.length; i++) {
      let module;
      if (randomModule) {
        module = sample(useModules);
        pull(useModules, module);
      } else {
        module = useModules[i];
      }

      module = Array.isArray(module) ? sample(module) : module;

      await module(this.accountId, this.privateKey);
      await sleep(random(sleepFrom, sleepTo));
    }
  }
}

export default { Routes };
