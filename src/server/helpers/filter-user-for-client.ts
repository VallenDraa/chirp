import { type User } from "@clerk/nextjs/dist/types/server";

export const filterUserForClient = (user: User) => {
  const { id, username, profileImageUrl } = user;

  return { id, username, profileImageUrl };
};
