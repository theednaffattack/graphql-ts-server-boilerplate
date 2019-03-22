import "reflect-metadata";
import internalIp from "internal-ip";
import chalk from "chalk";
// import {createConnection} from "typeorm";
import { GraphQLServer } from "graphql-yoga";

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_: any, { name }: any) => `Goodbye ${name || "World"}`
  }
};

const port = process.env.PORT || 4000;

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() =>
  console.log(`
Graphql server is running!
${chalk.green("localhost")}: http://localhost:${chalk.green(port.toString())}
${chalk.green("LAN")}: http://${internalIp.v4.sync()}:${chalk.green(
    port.toString()
  )}
`)
);
