import Userbtn from "./Userbtn";
import RSS from "../RSS/RSS";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const TOGGLE_ID = "drawer-sidebar";

function NavBarContent() {
  return (
    <div className="navbar bg-base-100 shadow-sm relative z-50">
      <div className="navbar-start gap-2">
        <label
          htmlFor={TOGGLE_ID}
          className="btn btn-square btn-ghost drawer-button"
          aria-label="open sidebar"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>

        <Link className="btn btn-ghost text-xl" href="/">
          N4
        </Link>
        <RSS />
      </div>

      <div className="navbar-end">
        <Userbtn />
      </div>
    </div>
  );
}

function DrawerSide() {
  return (
    <div className="drawer-side">
      <label
        htmlFor={TOGGLE_ID}
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>

      <ul className="menu bg-base-200 min-h-full w-80 p-4">
        <li>
          <div className="divider divider-start">Navigate</div>
          <Link href="/">
            <Image
              src="/icons/home.svg"
              alt="Homepage"
              width={24}
              height={24}
            />
            主页
          </Link>
        </li>
        <li>
          <Link href="/blog">
            <Image src="/icons/blog.svg" alt="Blogs" width={24} height={24} />
            博客
          </Link>
        </li>
        <li>
          <Link href="/about">
            <Image src="/icons/about.svg" alt="About" width={24} height={24} />
            关于本站
          </Link>
        </li>
        <li>
          <Link href="/commentboard">
            <Image
              src="/icons/commentboard.svg"
              alt="Comment Board"
              width={24}
              height={24}
            />
            留言板
          </Link>
        </li>
        <div className="divider divider-start">Playground</div>
        <li>
          <Link href="/">
            <Image
              src="/icons/question.svg"
              alt="Unknown"
              width={24}
              height={24}
            />
            ！！未知领域！！
          </Link>
        </li>
        <div className="divider divider-start">Credits</div>
        <li>
          <Link href="/gitversions">
            <Image
              src="/icons/versions.svg"
              alt="Versions"
              width={24}
              height={24}
            />
            建设历史
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default function Navbar({ children }: { children?: ReactNode }) {
  return (
    <div className="drawer">
      <input id={TOGGLE_ID} type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">
        <NavBarContent />
        {children}
      </div>

      <DrawerSide />
    </div>
  );
}
