import "reflect-metadata";
import "dotenv-safe/config";
import { AppDataSource } from "./app-data-source";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

const main = async () => {
  await AppDataSource.initialize()
    .then(() => {
      // here you can start to work with your database
    })
    .catch((error) => console.log(error));
  await AppDataSource.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  // const redisClient = createClient({ legacyMode: true });
  // await redisClient.connect();
  const redisClient = new Redis(process.env.REDIS_URL);

  app.use(
    cors({
      origin: [
        `http://localhost:${process.env.PORT}`,
        process.env.CORS_ORIGIN,
        "https://studio.apollographql.com",
      ],
      credentials: true,
    })
  );

  app.set("trust proxy", 1);
  app.set("Access-Control-Allow-Origin", [
    "https://studio.apollographql.com",
    process.env.CORS_ORIGIN,
  ]);
  app.set("Access-Control-Allow-Credentials", true);
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf, set to lax when from frontend, and none when from apollo sandbox
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis: redisClient,
      dataSource: AppDataSource,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    // cors: {
    //   origin: [
    //     `http://localhost:${process.env.PORT}`,
    //     process.env.CORS_ORIGIN,
    //     "https://studio.apollographql.com",
    //   ],
    //   credentials: true,
    // },
  });

  app.listen(parseInt(process.env.PORT), () => {
    console.log(`server started on localhost:${process.env.PORT}`);
  });
};

main().catch((err) => {
  console.log(err);
});
