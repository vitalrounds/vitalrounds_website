"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ScrollFadeImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
};

export default function ScrollFadeImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
}: ScrollFadeImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const updateOpacity = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const fadeStart = viewportHeight * 0.36;
      const fadeEnd = viewportHeight * 0.08;
      const progress = (rect.bottom - fadeEnd) / (fadeStart - fadeEnd);

      setOpacity(Math.min(1, Math.max(0.28, progress)));
    };

    updateOpacity();
    window.addEventListener("scroll", updateOpacity, { passive: true });
    window.addEventListener("resize", updateOpacity);

    return () => {
      window.removeEventListener("scroll", updateOpacity);
      window.removeEventListener("resize", updateOpacity);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className="transition-opacity duration-200 ease-out will-change-opacity"
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
      />
    </div>
  );
}
