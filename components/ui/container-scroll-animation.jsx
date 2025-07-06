"use client";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Optimize scroll setup with throttling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
    layoutEffect: false // Prevent layout thrashing
  });

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();

    // Debounced resize handler for better performance
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 200);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoize transform values with reduced complexity
  const scaleDimensions = useMemo(() => {
    return isMobile ? [0.85, 0.98] : [1.01, 1];
  }, [isMobile]);

  const rotate = useTransform(scrollYProgress, [0, 1], [8, 0]); // Reduced rotation
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -30]); // Reduced translation

  if (!isClient) {
    // Server-side fallback
    return (
      <div className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20">
        <div className="py-10 md:py-40 w-full relative">
          <div className="max-w-5xl mx-auto text-center mb-8">
            {titleComponent}
          </div>
          <div className="max-w-5xl mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl">
            <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[50rem] md:h-[60rem] lg:h-[80rem] flex items-center justify-center relative p-2 md:p-10 lg:p-20"
      ref={containerRef}
    >
      <div
        className="py-5 md:py-20 lg:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = React.memo(({ translate, titleComponent }) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
});

Header.displayName = "Header";

export const Card = React.memo(({ rotate, scale, children }) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        willChange: "transform", // Optimize for animations
      }}
      className="max-w-5xl -mt-6 md:-mt-12 mx-auto h-[20rem] md:h-[30rem] lg:h-[40rem] w-full border-2 md:border-4 border-[#6C6C6C] p-1 md:p-2 lg:p-6 bg-[#222222] rounded-[20px] md:rounded-[30px] shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="h-full w-full overflow-hidden rounded-xl md:rounded-2xl bg-gray-100 dark:bg-zinc-900 p-1 md:p-2 lg:p-4">
        {children}
      </div>
    </motion.div>
  );
});

Card.displayName = "Card";
