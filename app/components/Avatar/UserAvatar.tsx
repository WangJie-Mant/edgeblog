import Link from "next/link";

interface UserAvatarProps {
  id: string;
  src: string;
  size?: number; // px
  href?: string;
}

export default function UserAvatar({
  id,
  src,
  size = 96,
  href,
}: UserAvatarProps) {
  const content = (
    <div
      className="rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={`Avatar of user ${id}`}
        className="w-full h-full object-cover"
      />
    </div>
  );

  return (
    <div className="avatar">
      {href ? (
        <Link href={href} aria-label={`View profile of ${id}`}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
