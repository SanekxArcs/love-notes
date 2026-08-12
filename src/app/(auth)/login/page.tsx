"use client";

import { type ChangeEvent, Suspense, useCallback, useId, useState } from "react";
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
import { ArrowLeft, HeartIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginId = useId();
  const passwordId = useId();

  const handleLoginChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setLogin(event.target.value),
    [],
  );
  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
    [],
  );
  const togglePasswordVisibility = useCallback(
    () => setShowPassword((isVisible) => !isVisible),
    [],
  );

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
        const invitationPartnerId = searchParams.get("invite")?.trim();
        if (invitationPartnerId) {
          window.location.href = `/invite?from=${encodeURIComponent(invitationPartnerId)}`;
          return;
        }
        if (searchParams.get("registered") === "1") {
          window.location.href = "/profile";
          return;
        }
        const onboarding = await fetch("/api/users/onboarding?step=profile")
          .then((response) => response.json())
          .catch(() => ({ show: false }));
        window.location.href = onboarding.show ? "/profile" : result.url || "/dashboard";
      }
    } catch (error: unknown) {
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
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 230, damping: 26 }}
      className="w-full max-w-md"
    >
      <Card className="gap-0 overflow-hidden rounded-[2.1rem] border border-white/65 bg-white/55 py-0 shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_24px_70px_rgba(88,38,70,.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-zinc-950/55">
      <CardHeader className="relative px-5 pt-5 pb-4 text-center sm:px-7 sm:pt-7">
        <Button asChild variant="ghost" size="icon" className="absolute h-10 w-10 rounded-[1rem] border border-white/60 bg-white/45 text-zinc-600 hover:bg-white/70 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300">
          <Link href="/" aria-label="На головну">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-white/65 bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.7),0_10px_24px_rgba(207,49,112,.28)]">
          <HeartIcon className="h-6 w-6 fill-current" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-[-.03em] text-zinc-900 dark:text-white">
          Раді бачити знову
        </CardTitle>
        <CardDescription className="mt-1">Увійди, щоб відкрити сьогоднішній лист</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 sm:px-7 sm:pb-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={loginId}>Логін</Label>
            <Input
              id={loginId}
              type="text"
              value={login}
              onChange={handleLoginChange}
              placeholder="Твій логін"
              required
              autoComplete="username"
              className="h-12 rounded-[1rem] border-white/70 bg-white/45 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,.75)] dark:border-white/10 dark:bg-white/6"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={passwordId}>Пароль</Label>
            <div className="relative">
              <Input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-12 rounded-[1rem] border-white/70 bg-white/45 px-4 pr-12 shadow-[inset_0_1px_0_rgba(255,255,255,.75)] dark:border-white/10 dark:bg-white/6"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 rounded-[.85rem] hover:bg-white/60 dark:hover:bg-white/10"
                onClick={togglePasswordVisibility}
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
          {error ? (
            <p className="rounded-[1rem] border border-red-200/60 bg-red-50/65 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-12 w-full rounded-[1.1rem] border border-white/50 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.6),0_10px_24px_rgba(207,49,112,.24)] hover:brightness-105"
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

          <div className="pt-1 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Ще не маєш профіль?{" "}
            <Link href="/register" className="font-semibold text-pink-700 hover:underline dark:text-pink-200">
              Реєстрація
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
