"use client";

import React from "react";
import Image from "next/image";

const LoadingSpinner = ({ size = "md", text = "Loading...", showLogo = true }) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10",
    xl: "h-14 w-14",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {showLogo && (
        <Image
          src="/cashtrack-icon-theme.svg"
          alt="CashTrack"
          width={size === "xl" ? 48 : size === "lg" ? 40 : 32}
          height={size === "xl" ? 48 : size === "lg" ? 40 : 32}
          className="animate-pulse"
        />
      )}
      <div className={`relative ${sizeClasses[size]}`} aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--cash-wash)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--cash-teal)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cash-emerald)]" />
        </div>
      </div>
      {text && <p className={`${textSizes[size]} font-semibold text-[var(--cash-muted)]`}>{text}</p>}
    </div>
  );
};

export const FullPageLoader = ({ text = "Loading CashTrack..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--cash-mist-rgb)/0.95)] px-6 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-8 text-center shadow-[var(--cash-shadow-preview)]">
      <LoadingSpinner size="xl" text={text} showLogo />
      <div className="mx-auto mt-7 h-1.5 w-full overflow-hidden rounded-full bg-[var(--cash-wash)]">
        <div className="h-full w-3/5 animate-pulse rounded-full bg-[var(--cash-teal)]" />
      </div>
      <p className="mt-3 text-xs text-[var(--cash-muted)]">Preparing your financial dashboard...</p>
    </div>
  </div>
);

export const CardLoader = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-paper)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[var(--cash-wash)]" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded-full bg-[var(--cash-wash)]" />
            <div className="h-2.5 w-16 rounded-full bg-[var(--cash-wash)]" />
          </div>
        </div>
        <div className="h-5 w-16 rounded-full bg-[var(--cash-wash)]" />
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-3 rounded-full bg-[var(--cash-wash)]" />
        <div className="h-2 rounded-full bg-[var(--cash-wash)]" />
      </div>
    </div>
  </div>
);

export const TableLoader = ({ rows = 5 }) => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-paper)]">
    <div className="grid grid-cols-4 gap-4 border-b border-[var(--cash-line)] bg-[var(--cash-mist)] px-6 py-4">
      {[1, 2, 3, 4].map((item) => <div key={item} className="h-3 rounded-full bg-[var(--cash-wash)]" />)}
    </div>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="grid grid-cols-4 gap-4 border-b border-[var(--cash-line)] px-6 py-4 last:border-b-0">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-3 rounded-full bg-[var(--cash-wash)]" />)}
      </div>
    ))}
  </div>
);

export const ChartLoader = () => (
  <div className="animate-pulse">
    <div className="h-5 w-28 rounded-full bg-[var(--cash-wash)]" />
    <div className="mt-7 flex h-56 items-end justify-around gap-3 border-b border-[var(--cash-line)] px-4">
      {[42, 68, 52, 86, 60, 76].map((height, index) => (
        <div key={index} className="w-full max-w-12 rounded-t-xl bg-[var(--cash-wash)]" style={{ height: `${height}%` }} />
      ))}
    </div>
  </div>
);

export const ButtonLoader = ({ size = "md" }) => {
  const sizeClasses = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  return <span className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/35 border-t-white`} aria-hidden="true" />;
};

export const AIAdviceLoader = () => (
  <div className="animate-pulse rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-paper)] p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[var(--cash-wash)]" />
        <div className="h-4 w-32 rounded-full bg-[var(--cash-wash)]" />
      </div>
      <div className="h-6 w-20 rounded-full bg-[var(--cash-wash)]" />
    </div>
    <div className="mt-6 grid grid-cols-3 gap-3">
      {[1, 2, 3].map((item) => <div key={item} className="h-14 rounded-2xl bg-[var(--cash-mist)]" />)}
    </div>
    <div className="mt-4 space-y-2 rounded-2xl bg-[var(--cash-mist)] p-4">
      <div className="h-3 rounded-full bg-[var(--cash-wash)]" />
      <div className="h-3 w-3/4 rounded-full bg-[var(--cash-wash)]" />
    </div>
  </div>
);

export default LoadingSpinner;
