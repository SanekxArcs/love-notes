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
import { HeartIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        login,
        password,
        callbackUrl: "/dashboard",
        redirect: false, 
      });

      if (!result?.ok) {
        let errorMessage = "Помилка входу";
        
        // Check for specific error types from NextAuth
        if (result?.error === "CredentialsSignin") {
          toast.error("Неправильний логін або пароль");
          errorMessage = "Неправильний логін або пароль";
        } else if (result?.error) {
          toast.error(`Помилка: ${result.error}`);
          errorMessage = `Помилка: ${result.error}`;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Successful login - redirect manually
        window.location.href = result.url || "/dashboard";
      }
    } catch (error: unknown) {
      // Handle unexpected errors
      console.error("Login error:", error);
      
      let errorMessage = "Невідома помилка сервера";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Твій логін"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          {error && (
            <p className="rounded bg-red-100 dark:bg-red-900/30 p-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <ViewTransition name="login">
            <Button
              id="login"
              type="submit"
              className="w-full bg-pink-600 transition-all hover:bg-pink-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вхід
                </>
              ) : (
                "Увійти"
              )}
            </Button>
          </ViewTransition>

          <div className="text-center text-sm">
            Ще не маєш профіль?{" "}
            <Link href="/register" className="underline text-primary">
              Реєстрація
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
