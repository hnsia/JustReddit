import "reflect-metadata";
import "dotenv-safe/config";
import path from "path";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { Upvote } from "./entities/Upvote";
import { User } from "./entities/User";
import { __prod__ } from "./constants";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false, // auto sync migrations without needing to do it manually, convenient for development mode, set to false for fresh db or production
  logging: true,
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [Post, User, Upvote],
});
