import winston from "winston";
import _ from "lodash";

export async function sleep(sleepFrom, sleepTo) {
  const delay = _.random(sleepFrom, sleepTo);

  winston.info(`💤 Sleep ${delay} s.`);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay * 1000);
  });
}
