import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import type { DehydratedState } from "@tanstack/react-query";
import Head from "next/head";
import { api } from "~/utils/api";
import React from "react";
import { LoadingSpinner } from "~/components/loading-spinner";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { prisma } from "~/server/db";
import { ProfilePicture } from "~/components/profile-picture";
import { PostView } from "~/components/post-view";
import Link from "next/link";

const ProfileFeed = (props: { userId: string }) => {
  const { userId } = props;

  const { data: posts, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId,
  });

  if (isLoading) {
    return (
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingSpinner />;
      </div>
    );
  }

  if (!posts || posts?.length === 0) {
    return (
      <span className="block text-center text-lg font-bold text-slate-600">
        User has no posts.
      </span>
    );
  }

  return (
    <ul className="space-y-4 p-4">
      {posts.map(({ post, author }) => {
        return <PostView key={post.id} author={author} post={post} />;
      })}
    </ul>
  );
};

type PageProps = {
  trpcState: DehydratedState;
  username: string;
};

const ProfilePage: NextPage<PageProps> = (props) => {
  const { username } = props;

  const { isLoading, data: user } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) {
    return (
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingSpinner />;
      </div>
    );
  }

  if (!user ?? !user?.username) {
    return <div>404</div>;
  }

  return (
    <>
      <Head>
        <title>{user.username}</title>
      </Head>

      {/* header */}
      <section className="border-b border-slate-600">
        {/* background */}
        <div className="h-36 w-full bg-slate-700 p-2">
          <Link
            href="/"
            className="p-4"
            style={{ textShadow: "0px 0px 1px 1px black" }}
          >
            &lt; Back
          </Link>
        </div>

        {/* username and picture */}
        <div className="-mt-24 p-4">
          <div className="w-max rounded-full border-4 border-slate-900">
            <ProfilePicture
              height={128}
              width={128}
              src={user.profileImageUrl}
              alt={user.username}
            />
          </div>
          <div className="mt-2">
            <h1 className="text-2xl font-bold">{`@${user.username}`}</h1>
          </div>
        </div>
      </section>

      {/* the profile feed */}
      <section>
        <ProfileFeed userId={user.id} />
      </section>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, currentUserId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.usernameSlug;

  if (typeof slug !== "string") {
    throw new Error("No slug was provided");
  }

  const username = slug.replace("@", "");
  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: { trpcState: ssg.dehydrate(), username },
  };
};

export default ProfilePage;
