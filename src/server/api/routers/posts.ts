import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filter-user-for-client";
import type { Post } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

const addUserDataToPosts = async (posts: Post[]) => {
  // get user data from clerk api
  const users = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.authorId),
    limit: 100,
  });

  const filteredUsers = users.map(filterUserForClient);

  return posts.map((post) => {
    const author = filteredUsers.find((user) => user.id === post.authorId);

    if (!author || !author.username) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author Not Found !",
      });
    }

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return addUserDataToPosts(posts);
  }),

  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;

      const posts = await ctx.prisma.post.findMany({
        where: { authorId: userId },
        take: 100,
        orderBy: { createdAt: "desc" },
      });

      return addUserDataToPosts(posts);
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .regex(/^[^\d]*$/, "No numbers, only emoji !")
          .emoji("Please only input emoji !")
          .min(1)
          .max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUserId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
