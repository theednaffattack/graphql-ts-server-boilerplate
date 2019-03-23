import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";

import internalIp from "internal-ip";
import chalk from "chalk";

import { createTypeOrmConn } from "./utils/createTypeormConnection";
import { GraphQLSchema } from "graphql";

// import { makeExecutableSchema } from "graphql-tools";

// const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

// import { resolvers } from "./resolvers";
// import { AddressInfo } from "net";

// import { createConnection } from "typeorm";
export const port = process.env.PORT || 4000;

export const host = internalIp.v4.sync();

export const startServer = async () => {
  const foilders = fs.readdirSync(path.join(__dirname, "./modules"));
  const schemas: GraphQLSchema[] = [];

  foilders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  await createTypeOrmConn();

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });
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
