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

    const runModules = [];

    _.forEach(useModules, (module) => {
      if (_.isArray(module)) {
        runModules.push(_.sample(module));
      } else if (_.isArray(module) && module.length === 3) {
        const [mod, min, max] = module;
        _.times(_.random(min, max), () => runModules.push(mod));
      } else {
        runModules.push(module);
      }
    });

    if (randomModule) {
      _.shuffle(runModules);
    }

    for (const module of runModules) {
      if (_.isNil(module)) {
        logger.info(`[${accountId}] Skip module`);
        continue;
      }

      await module(accountId, privateKey);
      await sleep(_.random(sleepFrom, sleepTo));
    }
  }
}

export default { Routes };

// for (let i = 0; i < useModules.length; i++) {
//   let module;
//   if (randomModule) {
//     module = sample(useModules);
//     pull(useModules, module);
//   } else {
//     module = useModules[i];
//   }

//   module = Array.isArray(module) ? sample(module) : module;

//   await module(this.accountId, this.privateKey);
//   await sleep(random(sleepFrom, sleepTo));
// }