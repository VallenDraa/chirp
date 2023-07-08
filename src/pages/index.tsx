import { type NextPage } from "next";
import { SignInButton, useUser } from "@clerk/nextjs";
import { type RouterOutputs, api } from "~/utils/api";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "~/components/loading-spinner";
import Link from "next/link";
import toast from "react-hot-toast";
import { ProfilePicture } from "~/components/profile-picture";

dayjs.extend(relativeTime);

const CreatePostWizard: React.FC = () => {
  const { user } = useUser();
  const [input, setInput] = React.useState("");

  const ctx = api.useContext();

  const { mutate: createPost, isLoading: isPosting } =
    api.posts.create.useMutation({
      onSuccess: () => {
        setInput("");
        void ctx.posts.getAll.invalidate();
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;

        if (errorMessage) {
          toast.error(
            errorMessage[0] ?? "Failed to post! please try again later."
          );
        }
      },
    });

  if (!user || !user.username) {
    return null;
  }

  return (
    <div className="flex flex-grow items-center">
      <ProfilePicture
        profileUrl={`/@${user.username}`}
        src={user.profileImageUrl}
        alt={user.username ?? "User image"}
        height={56}
        width={56}
      />

      <input
        type="text"
        className="flex-grow bg-transparent px-4 py-2 font-bold text-slate-300 transition-colors placeholder:text-slate-400 focus:outline-none disabled:text-slate-500"
        placeholder="Write your thoughts in emoji📝"
        value={input}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            createPost({ content: input });
          }
        }}
        onChange={(e) => setInput(e.target.value)}
      />

      {input !== "" && !isPosting && (
        <button
          className="px-4 py-2 text-lg text-emerald-500 underline-offset-2 transition-colors hover:underline disabled:text-slate-400"
          type="submit"
          disabled={isPosting}
          onClick={() => createPost({ content: input })}
        >
          Post
        </button>
      )}

      {isPosting && <LoadingSpinner size={28} />}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <li className="flex items-center gap-4 rounded-lg bg-slate-800 p-4 shadow-slate-800">
      <div className="min-w-[48px]">
        <ProfilePicture
          profileUrl={`/@${author.username}`}
          src={author.profileImageUrl}
          alt={author.username ?? "User image"}
          height={48}
          width={48}
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <Link
            href={`/@${author.username}`}
            className="text-emerald-500 underline-offset-2 hover:underline"
          >{`@${author.username}`}</Link>

          <span className="text-slate-500">•</span>

          <Link href={`/post/${post.id}`}>
            <span className="text-sm text-slate-400 underline-offset-2 hover:underline">{`${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>

        <p className="text-2xl">{post.content}</p>
      </div>
    </li>
  );
};

const Feed = () => {
  const { data: posts, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) {
    return (
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoadingSpinner />;
      </div>
    );
  }

  if (!posts) {
    return <span>Something went wrong</span>;
  }

  return (
    <ul className="m-4 space-y-4">
      {posts.map(({ post, author }) => {
        return <PostView author={author} post={post} key={post.id} />;
      })}
    </ul>
  );
};

const Home: NextPage = () => {
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
      <main className="flex min-h-screen justify-center">
        <div className="h-full w-full max-w-screen-md bg-slate-900">
          <div className="sticky top-0 flex w-full bg-slate-800 p-4 shadow shadow-slate-900">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}

            {isSignedIn && <CreatePostWizard />}
          </div>

          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
