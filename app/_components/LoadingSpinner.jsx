"use client";
import React from 'react';
import Image from 'next/image';

// Main Loading Spinner Component
const LoadingSpinner = ({ size = "md", text = "Loading...", showLogo = true }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {showLogo && (
        <div className="relative">
          <Image 
            src="/cashtrack-icon.svg" 
            alt="CashTrack" 
            width={size === "xl" ? 48 : size === "lg" ? 40 : 32} 
            height={size === "xl" ? 48 : size === "lg" ? 40 : 32}
            className="animate-pulse"
          />
        </div>
      )}
      
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-blue-100 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {text && (
        <p className={`${textSizes[size]} text-gray-600 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Full Page Loading Component
export const FullPageLoader = ({ text = "Loading CashTrack..." }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} showLogo={true} />
        
        {/* Loading progress bar */}
        <div className="mt-6 w-64 bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" 
               style={{ width: '60%' }}></div>
        </div>
        
        <p className="mt-3 text-sm text-gray-500">
          Preparing your financial dashboard...
        </p>
      </div>
    </div>
  );
};

// Card Loading Skeleton
export const CardLoader = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// Table Loading Skeleton
export const TableLoader = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-6 py-4 border-b last:border-b-0">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chart Loading Skeleton
export const ChartLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-end space-x-2">
              <div className={`bg-gray-200 rounded-t w-12`} 
                   style={{ height: `${Math.random() * 100 + 50}px` }}></div>
              <div className={`bg-gray-300 rounded-t w-12`} 
                   style={{ height: `${Math.random() * 80 + 30}px` }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Button Loading State
export const ButtonLoader = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
  );
};

// AI Advice Loading Component
export const AIAdviceLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full animate-spin"></div>
            <div className="h-5 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/70 rounded-lg p-3">
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white/50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
