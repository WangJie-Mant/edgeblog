import Image from "next/image";
import Link from "next/link";
import UserAvatar from "../Avatar/UserAvatar";
import UserGroupTag from "../Tag/UserGroupTag";

type ProfileMenuProps = {
  nickname?: string;
  avatarSrc?: string;
  role?: string;
  isGuest?: boolean;
  onLogout?: () => void;
};

export default function ProfileMenu({
  nickname,
  avatarSrc = "/file.svg",
  role,
  isGuest = false,
  onLogout,
}: ProfileMenuProps) {
  const displayName = isGuest ? "未登录" : nickname || "User";
  const groupLabel = isGuest
    ? "Guest"
    : role === "Admin"
      ? "Admin"
      : "Registered";
  const groupColor = isGuest
    ? "neutral"
    : role === "Admin"
      ? "error"
      : "success";
  const unreadMessage = 0; // TODO: fetch unread message count
  const hasUnreadMessage = unreadMessage > 0;

  return (
    <ul className="menu bg-base-200 rounded-box w-56 p-3 shadow">
      <li className="menu-title px-0 pb-2 pointer-events-none cursor-default">
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3 min-w-0">
            {!isGuest && (
              <UserAvatar id={displayName} src={avatarSrc} size={48} />
            )}
            <span className="font-bold truncate">{displayName}</span>
          </span>
          <UserGroupTag label={groupLabel} color={groupColor} />
        </span>
      </li>
      <li className="pointer-events-none">
        <div className="divider my-1 before:hidden after:hidden border-t border-base-300"></div>
      </li>
      {isGuest ? (
        <>
          <li>
            <Link href="/login">
              <Image
                src="/icons/login.svg"
                alt="Login"
                width={20}
                height={20}
                className="inline-block mr-2"
              />
              登录
            </Link>
          </li>
          <li>
            <Link href="/register">
              <Image
                src="/icons/register.svg"
                alt="Register"
                width={20}
                height={20}
                className="inline-block mr-2"
              />
              注册
            </Link>
          </li>
        </>
      ) : (
        <>
          <li>
            <Link href="/profile">
              <Image
                src="/icons/space.svg"
                alt="Edit Profile"
                width={20}
                height={20}
                className="inline-block mr-2"
              />
              个人空间
            </Link>
          </li>
          <li>
            <Link href="/messages">
              {hasUnreadMessage ? (
                <div className="indicator">
                  <span className="indicator-item status status-error" />
                  <Image
                    src="/icons/message.svg"
                    alt="Messages"
                    width={20}
                    height={20}
                    className="inline-block mr-2"
                  />
                </div>
              ) : (
                <Image
                  src="/icons/message.svg"
                  alt="Messages"
                  width={20}
                  height={20}
                  className="inline-block mr-2"
                />
              )}
              通知
            </Link>
          </li>
          <li className="pointer-events-none">
            <div className="divider before:hidden after:hidden border-t border-base-300"></div>
          </li>
          <li>
            <button onClick={onLogout} className="justify-start">
              <Image
                src="/icons/logout.svg"
                alt="Logout"
                width={20}
                height={20}
                className="inline-block mr-2"
              />
              登出账号
            </button>
          </li>
        </>
      )}
    </ul>
  );
}
