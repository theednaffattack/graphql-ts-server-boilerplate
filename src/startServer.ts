import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";

import { redis } from "./redis";

import { createTypeOrmConn } from "./utils/createTypeormConnection";
import internalIp from "internal-ip";
import chalk from "chalk";

import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";

export const port = process.env.PORT || 4000;

export const host = internalIp.v4.sync();

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeOrmConn();

  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });

  console.log(`
  Graphql server is running!
  ${chalk.green("localhost")}: http://localhost:${chalk.green(port.toString())}
  ${chalk.green("LAN")}: http://${host}:${chalk.green(port.toString())}
  `);

  return app;
};
