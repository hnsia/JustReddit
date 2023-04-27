// import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";
import { DataSource } from "typeorm";

export type MyContext = {
  // em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: { userId?: number } };
  res: Response;
  redis: Redis;
  dataSource: DataSource;
};
