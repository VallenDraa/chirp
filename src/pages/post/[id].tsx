import { GetServerSideProps, type NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";
import React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const SinglePostPage: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded, user } = useUser();
  const router = useRouter();

  // so that the data is downloaded early
  // and cached
  api.posts.getAll.useQuery();

  // return empty div if user isn't loaded
  if (!userLoaded) {
    return <div />;
  }

  return (
    <>
      <Head>
        <title></title>
      </Head>
      <main className="flex min-h-screen justify-center"></main>
    </>
  );
};

export default SinglePostPage;
