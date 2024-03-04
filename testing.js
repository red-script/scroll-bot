import crypto from "crypto";
import _ from "lodash";

const email = crypto
  .createHash("sha256")
  .update(_.random(1e11).toString())
  .digest("hex");

console.log(email);
