import React, { useEffect, useRef } from 'react';
// @ts-ignore - TWallpaper types issue
import { TWallpaper } from 'twallpaper';

interface TWallpaperBackgroundProps {
  fps?: number;
  tails?: number;
  animate?: boolean;
  scrollAnimate?: boolean;
  colors?: string[];
  pattern?: {
    image?: string;
    background?: string;
    blur?: number;
    size?: string;
    opacity?: number;
    mask?: boolean;
  };
}

export const TWallpaperBackground: React.FC<TWallpaperBackgroundProps> = ({
  fps = 106,
  tails = 31,
  animate = true,
  scrollAnimate = true,
  colors = ["#dbddbb", "#a4956a", "#dfd587", "#9f6c27"],
  pattern = {
    image: "/images/star_wars.svg",
    background: "#000",
    blur: 0,
    size: "420px",
    opacity: 0.5,
    mask: false
  }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wallpaperRef = useRef<TWallpaper | null>(null);

  useEffect(() => {
    if (containerRef.current && !wallpaperRef.current) {
      // Initialize TWallpaper
      wallpaperRef.current = new TWallpaper(containerRef.current, {
        fps,
        tails,
        animate,
        scrollAnimate,
        colors,
        pattern
      });

      wallpaperRef.current.init();
    }

    return () => {
      if (wallpaperRef.current) {
        wallpaperRef.current.dispose();
        wallpaperRef.current = null;
      }
    };
  }, []);

  // Update options when props change
  useEffect(() => {
    if (wallpaperRef.current) {
      wallpaperRef.current.updateColors(colors);
      wallpaperRef.current.updateFrametime(fps);
      wallpaperRef.current.updateTails(tails);
      wallpaperRef.current.updatePattern(pattern);
      wallpaperRef.current.animate(animate);
      wallpaperRef.current.scrollAnimate(scrollAnimate);
    }
  }, [fps, tails, animate, scrollAnimate, colors, pattern]);

  return (
    <div
      ref={containerRef}
      className="tw-wrap"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -3,
        pointerEvents: 'none'
      }}
    />
  );
};
