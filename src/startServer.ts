import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import internalIp from "internal-ip";
import chalk from "chalk";
import * as connectRedis from "connect-redis";
import * as rateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as passport from "passport";
import { Strategy } from "passport-twitter";

// connections
import { redis } from "./redis";
// import { createConnection } from "typeorm";
// imported functions
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";
import { redisSessionPrefix } from "./constants";
import { User } from "./entity/User";
import { createTypeOrmConn } from "./utils/createTypeormConnection";
import { createTestConn } from "./utils/createTestConnection";
// import { RedisClient } from "redis";

const RedisStore = connectRedis(session);

// config
export const port = process.env.PORT || 7777;

export const host = internalIp.v4.sync();

const SECRET: string = process.env.SESSION_SECRET || "no ENV value given";

export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    await redis.flushall();
  }

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

  let connection: any;

  if (process.env.NODE_ENV === "test") {
    await createTestConn(true);
  } else {
    connection = await createTypeOrmConn();
  }

  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
        callbackURL: "http://localhost:4000/auth/twitter/callback",
        includeEmail: true
      },
      async function(_, __, profile, cb) {
        const { id, emails } = profile;

        const query = connection
          .getRepository(User)
          .createQueryBuilder("user")
          .where("user.twitterId = :id", { id });

        let email: string | null = null;

        if (emails) {
          email = emails[0].value;

          query.orWhere("user.email = :email", { email });
        }

        let user = await query.getOne();

        // this user needs to be registered
        if (!user) {
          user = await User.create({
            twitterId: id,
            email
          }).save();
        } else if (!user.twitterId) {
          // merge account
          // we found user by email
          user.twitterId = id;
          await user.save();
        } else {
          // we have a twitterId
          // login
        }

        // console.log(cb("hello"));
        // User.findOrCreate({ twitterId: profile.id }, function(err, user) {
        //   return cb(err, user);
        // });
        return cb(null, { id: user.id });
      }
    )
  );

  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
    cors
  });

  server.express.use(passport.initialize());

  server.express.get("/auth/twitter", passport.authenticate("twitter"));

  server.express.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { session: false }), //  failureRedirect: "/login" ,
    (req, res) => {
      // Successful authentication, redirect home.
      console.log(Object.keys(req));
      (req.session as any).userId = (req.user as any).id;
      // @todo: redirect to frontend
      res.redirect("/");
    }
  );

  console.log(`
  Graphql server is running!
  ${chalk.green("localhost")}: http://localhost:${chalk.green(port.toString())}
  ${chalk.green("LAN")}: http://${host}:${chalk.green(port.toString())}
  `);
  return app;
};
