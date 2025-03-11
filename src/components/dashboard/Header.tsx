"use client";

import { memo } from "react";
import Link from "next/link";
import { MailCheck, MailPlus, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { UserMenu } from "./UserMenu";
import { WraperIfAdmin } from "@/components/auth/WraperIfAdmin";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
};

const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: <MessageCircleHeart />,
    label: "Панель повідомлень",
  },
  {
    href: "/messages",
    icon: <MailPlus />,
    label: "Створити повідомлення",
  },
  {
    href: "/history",
    icon: <MailCheck />,
    label: "Історія повідомлень",
  },
];

function NavigationButton({ item }: { item: NavItem }) {
  if (item.adminOnly) {
    return (
      <WraperIfAdmin>
        <CustomTooltip text={item.label}>
          <Link href={item.href}>
            <Button size="icon" variant="outline">
              {item.icon}
            </Button>
          </Link>
        </CustomTooltip>
      </WraperIfAdmin>
    );
  }

  return (
    <CustomTooltip text={item.label}>
      <Link href={item.href}>
        <Button size="icon" variant="outline">
          {item.icon}
        </Button>
      </Link>
    </CustomTooltip>
  );
}

function HeaderComponent() {
  return (
    <header className="mx-auto lg:px-8 max-w-3xl  px-4 pt-6 flex flex-col  md:flex-row gap-6 justify-between">
      <CustomTooltip text="Повернутися на головну">
        <Link href="/dashboard">
          <h1 className="flex flex-col text-xl items-center text-pink-700 font-bold md:items-start gap-4 select-none ">
            Щоденні повідомлення кохання
          </h1>
        </Link>
      </CustomTooltip>

      <div className="flex flex-row justify-end items-end gap-2 px-4 md:px-0 lg:px-0">
        {navigationItems.map((item, index) => (
          <NavigationButton key={index} item={item} />
        ))}

        <UserMenu />
      </div>
    </header>
  );
}

export const DashboardHeader = memo(HeaderComponent);
