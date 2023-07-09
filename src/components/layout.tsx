import React from "react";

export const PageLayout = (props: React.PropsWithChildren) => {
  return (
    <main className="mx-auto min-h-screen w-full max-w-screen-md bg-slate-900 shadow-lg shadow-slate-900">
      {props.children}
    </main>
  );
};
