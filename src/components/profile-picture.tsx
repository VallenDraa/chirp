import Image from "next/image";
import Link from "next/link";
import React from "react";

export type ProfilePictureProps = {
  profileUrl: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const ProfilePicture: React.FC<ProfilePictureProps> = (props) => {
  const { profileUrl, alt, ...others } = props;

  return (
    <Link href={profileUrl}>
      <Image className="rounded-full" alt={alt} {...others} />
    </Link>
  );
};
