"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Logout() {
  return (
    <>
      <Button onClick={() => signOut()}>
        Вийти
        <LogOut />
      </Button>
    </>
  );
}
