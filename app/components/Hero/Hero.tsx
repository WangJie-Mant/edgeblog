"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import TextRotate from "../TextRotate/TextRotate";

export default function Hero() {
  const [imageDone, setImageDone] = useState(false);

  return (
    <section className="relative h-screen overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 10.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        onAnimationComplete={() => setImageDone(true)}
        className="absolute inset-0"
      >
        <Image
          src="/hero-background.jpeg"
          alt="hero"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageDone ? 0.55 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 bg-black"
      />

      <motion.div
        initial="hidden"
        animate={imageDone ? "show" : "hidden"}
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.18, delayChildren: 0.2 },
          },
        }}
        className="relative z-10 flex h-full flex-col items-center justify-center text-white"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
          className="text-center"
        >
          <TextRotate />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
          className="mt-4 text-center text-lg text-white/90"
        >
          何物徒留名字？何物遍开幽谷？何物映自身于镜水？何物象征拯救世界的孤独牺牲？
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="/blog"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg transition hover:scale-105"
          >
            博客
          </a>
          <a
            href="/about"
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            介绍
          </a>
          <a
            href="/commentboard"
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            留言板
          </a>
          <a
            href="/register"
            className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            注册账号
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
