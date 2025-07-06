"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  CircleDollarSign,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function MobileNav({ isOpen, onClose }) {
  const menuList = useMemo(() => [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "Incomes",
      icon: CircleDollarSign,
      path: "/dashboard/incomes",
    },
    {
      id: 3,
      name: "Budgets",
      icon: PiggyBank,
      path: "/dashboard/budgets",
    },
    {
      id: 4,
      name: "Expenses",
      icon: ReceiptText,
      path: "/dashboard/expenses",
    },
  ], []);
  
  const path = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center">
            <Image 
              src="/cashtrack-icon.svg" 
              alt="CashTrack logo" 
              width={32} 
              height={32}
              priority
            />
            <span className="text-blue-800 font-bold text-lg ml-2">CashTrack</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        {/* Navigation Menu */}
        <nav className="p-5 space-y-2">
          {menuList.map((menu) => {
            const isActive = path === menu.path;
            return (
              <Link href={menu.path} key={menu.id} onClick={onClose}>
                <div
                  className={`flex gap-3 items-center
                    text-gray-500 font-medium
                    p-4 cursor-pointer rounded-xl
                    transition-all duration-200
                    ${isActive 
                      ? "text-primary bg-blue-100 shadow-sm" 
                      : "hover:text-primary hover:bg-blue-50"
                    }
                  `}
                >
                  <menu.icon size={20} />
                  <span>{menu.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-800 mb-1">CashTrack AI</h3>
            <p className="text-sm text-gray-600">
              Your intelligent financial companion
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileNav;
