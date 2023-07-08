import type { AppProps, AppType } from "next/app";
import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import React from "react";
import type { NextPage } from "next";
import { PageLayout } from "~/components/layout";

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout || ((page) => <PageLayout>{page}</PageLayout>);

  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Chirp 💀</title>
        <meta name="description" content="💀" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          className: "bg-slate-800",
        }}
      />
      {getLayout(<Component {...pageProps} />)}
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
