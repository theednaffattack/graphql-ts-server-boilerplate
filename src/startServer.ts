import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import internalIp from "internal-ip";
import chalk from "chalk";
import * as connectRedis from "connect-redis";
import * as rateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";

// connections
import { redis } from "./redis";
// import { createConnection } from "typeorm";
// imported functions
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";
import { redisSessionPrefix } from "./constants";
// import { createTypeOrmConn } from "./utils/createTypeormConnection";
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
        client: redis as any,
        prefix: redisSessionPrefix
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

  server.express.use(
    new rateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    })
  );

  // let origin;

  const cors = {
    credentials: true,
    origin: process.env.FRONTEND_HOST
  };

  server.express.get("/confirm/:id", confirmEmail);

  // createConnection()
  // await createTypeOrmConn();
  // .then(async () => {
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
  // }
  // )
  // .catch((error: string) =>
  //   console.error("typeORM connection error\n" + error)
  // );
};
