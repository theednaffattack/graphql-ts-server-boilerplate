import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";

import internalIp from "internal-ip";
import chalk from "chalk";
// import { makeExecutableSchema } from "graphql-tools";

const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

import { resolvers } from "./resolvers";

const server = new GraphQLServer({ typeDefs, resolvers });

import { createConnection } from "typeorm";
export const port = process.env.PORT || 4000;

export const host = internalIp.v4.sync();

export const startServer = async () => {
  await createConnection();

  const app = await server.start();
  // {
  // port: process.env.NODE_ENV === "test" ? 0 : 4000
  // }
  console.log(`
  Graphql server is running!
  ${chalk.green("localhost")}: http://localhost:${chalk.green(port.toString())}
  ${chalk.green("LAN")}: http://${host}:${chalk.green(port.toString())}
  `);
  return app;
};
