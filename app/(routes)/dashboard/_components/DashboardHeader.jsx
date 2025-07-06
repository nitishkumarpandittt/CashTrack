import { UserButton } from '@clerk/nextjs'
import React, { useState } from 'react'
import Image from "next/image";
import { Menu, X } from "lucide-react";

function DashboardHeader({ onMenuToggle }) {
  return (
    <div className='p-4 md:p-5 shadow-sm border-b flex justify-between items-center bg-white sticky top-0 z-30'>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center">
          {/* Hamburger Menu Button */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Mobile Logo */}
          <Image
            src="/cashtrack-icon.svg"
            alt="CashTrack logo"
            width={28}
            height={28}
            priority
          />
          <span className="text-blue-800 font-bold text-lg ml-2">CashTrack</span>
        </div>

        {/* Desktop Empty Space */}
        <div className="hidden md:block"></div>

        {/* User Button */}
        <div>
            <UserButton afterSignOutUrl='/'/>
        </div>

    </div>
  )
}

export default DashboardHeader