import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import * as Redis from "ioredis";

import internalIp from "internal-ip";
import chalk from "chalk";

import { createTypeOrmConn } from "./utils/createTypeormConnection";
import { GraphQLSchema } from "graphql";
import { User } from "./entity/User";

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

  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  server.express.get("/confirm/:id", async (req: any, res: any) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      const myId: string = userId === null ? "nope" : userId.toString();

      await User.update({ id: myId.toString() }, { confirmed: true });
      await redis.del(id);
      res.send("ok");
    } else {
      res.send("invalid");
    }
  });

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
