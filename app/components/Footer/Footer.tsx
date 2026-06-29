import Image from "next/image";

export default function Footer() {
  return (
    <div>
      <footer className="footer sm:footer-horizontal bg-white text-black border border-black items-center p-4">
        <aside className="grid-flow-col items-center">
          <Image src="/icons/logo.svg" alt="Logo" width={45} height={40} />
          <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
        </aside>
        <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <a
            href="https://space.bilibili.com/297659910?spm_id_from=333.1007.0.0"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Image
              src="/icons/bilibili.svg"
              alt="Bilibili"
              width={40}
              height={40}
            />
          </a>
          <a
            href="https://github.com/WangJie-Mant"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Image
              src="/icons/github.svg"
              alt="GitHub"
              width={40}
              height={40}
            />
          </a>
        </nav>
      </footer>
    </div>
  );
}
