import { Resolver } from "../types/graphql-utils";
import * as chalk from "chalk";

const { log } = console;

export const logger = (resolver: Resolver, args: any, context: any) => {
  log(`

  🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥
  --------------------------
  ${chalk.default.bgBlueBright.black("Resolver:")} ${resolver}

  ${chalk.default.bgGreenBright.black("Session:")} ${JSON.stringify(
    context.session,
    null,
    2
  )}

  ${chalk.default.bgYellowBright.black("Args sent:")} ${args}
  --------------------------
  🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥

  `);
};
