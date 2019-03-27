import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import internalIp from "internal-ip";
import chalk from "chalk";
import * as connectRedis from "connect-redis";

// connections
import { redis } from "./redis";
import { createTypeOrmConn } from "./utils/createTypeormConnection";

// imported functions
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";
// import { RedisClient } from "redis";

const RedisStore = connectRedis(session);

// config
export const port = process.env.PORT || 7777;

export const host = internalIp.v4.sync();

const SECRET: string = process.env.SESSION_SECRET || "no ENV value given";

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      req: request
    })
  });

  server.express.use(
    session({
      name: "qid",
      secret: SECRET,
      store: new RedisStore({
        client: redis as any
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  // let origin;

  const cors = {
    credentials: true,
    origin: process.env.FRONTEND_HOST
  };

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeOrmConn();

  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
    cors
  });

  console.log(`
  Graphql server is running!
  ${chalk.green("localhost")}: http://localhost:${chalk.green(port.toString())}
  ${chalk.green("LAN")}: http://${host}:${chalk.green(port.toString())}
  `);

  return app;
};
