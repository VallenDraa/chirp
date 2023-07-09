import type { RouterOutputs } from "~/utils/api";
import { ProfilePicture } from "./profile-picture";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <li className="flex items-center gap-4 rounded-lg bg-slate-800 p-4 shadow-slate-800">
      <div className="min-w-[56px] self-start">
        <ProfilePicture
          profileUrl={`/@${author.username}`}
          src={author.profileImageUrl}
          alt={author.username ?? "User image"}
          height={56}
          width={56}
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
