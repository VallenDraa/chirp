import React from "react";

export const PageLayout = (props: React.PropsWithChildren) => {
  return (
    <main className="flex min-h-screen justify-center">
      <div className="h-full w-full max-w-screen-md bg-slate-900 shadow-lg shadow-slate-900">
        {props.children}
      </div>
    </main>
  );
};
