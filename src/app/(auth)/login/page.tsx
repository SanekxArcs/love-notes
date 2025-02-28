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
      console.error("Login error:", error);
      
      let errorMessage = "Невідома помилка";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(`Помилка при вході: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
            <HeartIcon className="h-6 w-6 text-pink-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-pink-600">
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
              <p className="rounded bg-red-50 p-2 text-sm text-red-500">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вхід..." : "Увійти"}
            </Button>
          </form>

          {/* Test credentials */}
          <div className="mt-4 rounded border border-dashed border-gray-200 p-2 text-xs text-gray-500">
            <p>Тестові дані:</p>
            <p>User: girlfriend / lovenotes123</p>
            <p>Admin: admin / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
