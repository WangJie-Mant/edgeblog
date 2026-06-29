"use client";

import { useMemo } from "react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import Image from "next/image";
import { useAuth } from "../auth/AuthProvider";

export default function Userbtn() {
  const { user, loading, logout } = useAuth();

  const trigger = useMemo(() => {
    if (user?.avatar_data) {
      return (
        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            <img
              src={user.avatar_data}
              alt="User avatar"
              className="object-cover"
            />
          </div>
        </div>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="inline-block h-5 w-5 stroke-current"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
        ></path>
      </svg>
    );
  }, [user]);

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-square btn-ghost"
        aria-label="user menu"
      >
        {trigger}
      </label>
      {!loading && (
        <div tabIndex={0} className="dropdown-content z-[1]">
          {user ? (
            <ProfileMenu
              nickname={user.nickname || "User"}
              avatarSrc={user.avatar_data || undefined}
              role={user.role}
              onLogout={logout}
            />
          ) : (
            <ProfileMenu isGuest />
          )}
        </div>
      )}
    </div>
  );
}
