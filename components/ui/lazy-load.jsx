"use client";
import React, { Suspense } from 'react';

// Generic loading skeleton
export const LoadingSkeleton = ({ className = "" }) => (
  <div className={`loading-skeleton rounded-lg ${className}`} />
);

// Lazy wrapper component for better performance
export const LazyWrapper = ({ children, fallback, className = "" }) => {
  return (
    <Suspense fallback={fallback || <LoadingSkeleton className={className} />}>
      {children}
    </Suspense>
  );
};

// Chart loading skeleton
export const ChartSkeleton = () => (
  <div className="border rounded-2xl p-6 bg-white shadow-sm">
    <div className="h-6 w-24 bg-gray-200 rounded mb-4 loading-skeleton" />
    <div className="h-[300px] w-full bg-gray-100 rounded loading-skeleton" />
  </div>
);

// Card loading skeleton
export const CardSkeleton = () => (
  <div className="p-6 border rounded-2xl bg-white shadow-sm">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded loading-skeleton" />
        <div className="h-8 w-24 bg-gray-200 rounded loading-skeleton" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-xl loading-skeleton" />
    </div>
  </div>
);

// Table loading skeleton
export const TableSkeleton = () => (
  <div className="border rounded-2xl p-6 bg-white shadow-sm">
    <div className="h-6 w-32 bg-gray-200 rounded mb-4 loading-skeleton" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-4 w-4 bg-gray-200 rounded loading-skeleton" />
          <div className="h-4 flex-1 bg-gray-200 rounded loading-skeleton" />
          <div className="h-4 w-20 bg-gray-200 rounded loading-skeleton" />
          <div className="h-4 w-16 bg-gray-200 rounded loading-skeleton" />
        </div>
      ))}
    </div>
  </div>
);
