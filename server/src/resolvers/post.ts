import { MyContext } from "src/types";
import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth) // Only allow user to upvote if user is logged in
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req, dataSource }: MyContext
  ) {
    const isUpvote = value >= 0;
    const realValue = isUpvote ? 1 : -1;
    const { userId } = req.session;
    console.log(req.session);

    const upvote = await Upvote.findOne({ where: { userId, postId } });

    // user has voted on the post before but are changing their vote
    if (upvote && upvote.value !== realValue) {
      await dataSource.transaction(async (tm) => {
        await tm.query(`
          update upvote 
          set value = ${realValue}
          where "postId" = ${postId} and "userId" = ${userId}
        `);

        await tm.query(`
          update post
          set points = points + ${2 * realValue}
          where id = ${postId}
        `);
      });
    } else if (!upvote) {
      // User has not voted on the post before
      await dataSource.transaction(async (tm) => {
        await tm.query(`
          insert into upvote ("userId", "postId", value)
          values (${userId}, ${postId}, ${realValue})
        `);

        await tm.query(`
          update post
          set points = points + ${realValue}
          where id = ${postId}
        `);
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req, dataSource }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const userId = req.session.userId ? req.session.userId : null;

    const qb = dataSource
      .getRepository(Post)
      .createQueryBuilder("post")
      .innerJoinAndSelect("post.creator", "user", 'user.id = post."creatorId"')
      .leftJoin("post.upvotes", "upvote", `upvote."userId" = ${userId}`)
      .addSelect("upvote.value", "post_voteStatus")
      .orderBy("post.createdAt", "DESC")
      .take(realLimitPlusOne);

    if (cursor) {
      qb.where('post."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await qb.getMany();
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req, dataSource }: MyContext
  ): Promise<Post | null> {
    const result = await dataSource
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
