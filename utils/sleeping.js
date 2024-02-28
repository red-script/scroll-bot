import winston from 'winston';
import { random } from "lodash";

async function sleep(sleepFrom, sleepTo) {
    const delay = random(sleepFrom, sleepTo);

    winston.info(`💤 Sleep ${delay} s.`);

    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, delay * 1000);
    });
}

module.exports = { sleep };