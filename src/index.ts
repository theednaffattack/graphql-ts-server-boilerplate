import "reflect-metadata";
import internalIp from "internal-ip";
import chalk from "chalk";
import { createConnection } from "typeorm";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";
// import { makeExecutableSchema } from "graphql-tools";

const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

import { resolvers } from "./resolvers";

const port = process.env.PORT || 4000;

const server = new GraphQLServer({ typeDefs, resolvers });

createConnection().then(() => {
  server.start(() =>
    console.log(`
Graphql server is running!
${chalk.green("localhost")}: http://localhost:${chalk.green(port.toString())}
${chalk.green("LAN")}: http://${internalIp.v4.sync()}:${chalk.green(
      port.toString()
    )}
`)
  );
});
