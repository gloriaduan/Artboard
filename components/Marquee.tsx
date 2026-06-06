"use client";

import Image from "next/image";
import { motion } from "motion/react";

const row1 = [
  {
    src: "/landing/a-sunday-on-la-grande-jatte.jpg",
    alt: "A Sunday on La Grande Jatte",
    orientation: "landscape",
  },
  {
    src: "/landing/american-gothic.jpg",
    alt: "American Gothic",
    orientation: "portrait",
  },
  {
    src: "/landing/at-the-moulin-rouge.jpg",
    alt: "At the Moulin Rouge",
    orientation: "landscape",
  },
  { src: "/landing/bedroom.jpg", alt: "The Bedroom", orientation: "landscape" },
  {
    src: "/landing/carnival-in-arcueil.jpg",
    alt: "Carnival in Arcueil",
    orientation: "landscape",
  },
];

const row2 = [
  {
    src: "/landing/nighthawks.jpg",
    alt: "Nighthawks",
    orientation: "landscape",
  },
  {
    src: "/landing/self-portrait.jpg",
    alt: "Self-Portrait",
    orientation: "portrait",
  },
  {
    src: "/landing/stacks-of-wheat.jpg",
    alt: "Stacks of Wheat",
    orientation: "landscape",
  },
  {
    src: "/landing/the-basket-of-apples.jpg",
    alt: "The Basket of Apples",
    orientation: "landscape",
  },
  {
    src: "/landing/two-sisters.jpg",
    alt: "Two Sisters",
    orientation: "portrait",
  },
  {
    src: "/landing/woman-at-her-toilette.jpg",
    alt: "Woman at Her Toilette",
    orientation: "landscape",
  },
];

const DURATION = 30; // seconds for one full loop

function ImageTrack({
  images,
  reverse,
  priority,
}: {
  images: typeof row1;
  reverse: boolean;
  priority: boolean;
}) {
  return (
    <motion.div
      className="flex gap-3 shrink-0 pr-3"
      initial={{ x: reverse ? "-100%" : "0%" }}
      animate={{ x: reverse ? "0%" : "-100%" }}
      transition={{ duration: DURATION, repeat: Infinity, ease: "linear" }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className={`relative shrink-0 rounded-xl overflow-hidden h-64 ${
            img.orientation === "portrait" ? "w-44" : "w-80"
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover"
            sizes="320px"
            draggable={false}
            loading={priority && i === 0 ? "eager" : "lazy"}
            priority={priority && i === 0}
          />
        </div>
      ))}
    </motion.div>
  );
}

function MarqueeRow({
  images,
  reverse,
  priority,
}: {
  images: typeof row1;
  reverse: boolean;
  priority: boolean;
}) {
  return (
    <div className="overflow-hidden flex w-full">
      <ImageTrack images={images} reverse={reverse} priority={priority} />
      <ImageTrack images={images} reverse={reverse} priority={false} />
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <MarqueeRow images={row1} reverse={false} priority={true} />
      <MarqueeRow images={row2} reverse={true} priority={false} />
    </div>
  );
}
