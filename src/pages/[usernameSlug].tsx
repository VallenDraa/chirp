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

type PageProps = {
  trpcState: DehydratedState;
  username: string;
};

const ProfilePage: NextPage<PageProps> = (props) => {
  const { username } = props;

  const { isLoading, data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) {
    return (
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingSpinner />;
      </div>
    );
  }

  if (!data ?? !data?.username) {
    return <div>404</div>;
  }

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <main className="flex min-h-screen justify-center">
        <h1>{data.username}</h1>
      </main>
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
