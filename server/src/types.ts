// import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

export type MyContext = {
  // em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: { userId?: number } };
  res: Response;
  redis: Redis;
  dataSource: DataSource;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
