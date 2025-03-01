// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeartIcon } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { toast } from "sonner";
import Particles from "@/components/reactbits/Particles";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Define the function parameter type
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use direct redirect instead of handling it manually
      await signIn("credentials", {
        login,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });

      // We won't reach this code if redirect is true
    } catch (error: unknown) {
      toast.error("Помилка при вході");
      console.error("Login error:", error);

      let errorMessage = "Невідома помилка";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(`Помилка при вході: ${errorMessage}`);
      toast.error(`Помилка при вході: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 -z-10 w-full h-svh">
        <Particles
          particleColors={["#fa00e5", "#fa00e5"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={true}
          disableRotation={true}
        />
      </div>
      <div className="relative flex min-h-svh items-center justify-center p-4">
        <header className="absolute top-0 right-0 p-4">
          <ModeToggle />
        </header>
        <Card className="w-full max-w-md bg-background border border-pink-200 dark:border-pink-900">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950">
              <HeartIcon className="h-6 w-6 text-pink-500 dark:text-pink-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              Щоденні повідомлення кохання
            </CardTitle>
            <CardDescription>Увійдіть у акаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Логін</Label>
                <Input
                  id="login"
                  type="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Твій логін"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <p className="rounded bg-red-100 dark:bg-red-900/30 p-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Вхід..." : "Увійти"}
              </Button>
            </form>

            {/* Test credentials */}
            <div className="mt-4 rounded border border-dashed border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Тестові дані:</p>
              <p>Admin: Tester / tester12</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
