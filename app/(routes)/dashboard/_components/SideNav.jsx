import React, { useMemo } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
function SideNav() {
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

  return (
    <div className="h-screen p-5 border shadow-sm bg-white">
      <div className="flex flex-row items-center mb-8">
        <Image
          src="/logo.svg"
          alt="CashTrack Logo"
          width={40}
          height={40}
          className="mr-3"
        />
        <span className="text-blue-800 font-bold text-xl">CashTrack</span>
      </div>

      <nav className="space-y-2">
        {menuList.map((menu) => {
          const isActive = path === menu.path;
          return (
            <Link href={menu.path} key={menu.id}>
              <div
                className={`flex gap-3 items-center
                  text-gray-500 font-medium
                  p-4 cursor-pointer rounded-xl
                  smooth-hover
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
    </div>
  );
}

export default SideNav;
