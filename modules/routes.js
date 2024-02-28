const { logger } = require('./loguru');
const { sleep } = require('./utils/sleeping');
const { Account } = require('./account');

class Routes extends Account {
    constructor(accountId, privateKey, recipient) {
        super(accountId, privateKey, "scroll", recipient);
    }

    processModule(module) {
        if (Array.isArray(module)) {
            return this.processModule(module[Math.floor(Math.random() * module.length)]);
        } else if (Array.isArray(module)) {
            const result = [];
            const [subModule, minCount, maxCount] = module;
            const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            for (let i = 0; i < count; i++) {
                result.push(this.processModule(subModule));
            }
            return result;
        } else {
            return module;
        }
    }

    runModules(useModules) {
        const modulesToRun = [];
        for (const module of useModules) {
            const result = this.processModule(module);
            if (Array.isArray(result)) {
                modulesToRun.push(...result);
            } else {
                modulesToRun.push(result);
            }
        }
        return modulesToRun;
    }

    async start(useModules, sleepFrom, sleepTo, randomModule) {
        logger.info(`[${this.accountId}][${this.address}] Start using routes`);

        const runModules = this.runModules(useModules);

        if (randomModule) {
            runModules.sort(() => Math.random() - 0.5);
        }

        for (const module of runModules) {
            if (module === null) {
                logger.info(`[${this.accountId}][${this.address}] Skip module`);
                continue;
            }

            await module(this.accountId, this.privateKey, this.recipient);

            await sleep(sleepFrom, sleepTo);
        }
    }
}

module.exports = Routes;