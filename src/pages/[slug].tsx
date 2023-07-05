import { type NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
import React from "react";
import Image from "next/image";
import { LoadingSpinner } from "~/components/loading-spinner";
import Link from "next/link";

const ProfilePage: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

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
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen justify-center"></main>
    </>
  );
};

export default ProfilePage;
