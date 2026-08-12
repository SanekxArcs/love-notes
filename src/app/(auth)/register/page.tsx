"use client";

import { Suspense, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Eye, EyeOff, HeartIcon, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationPartnerId = searchParams.get("invite")?.trim() ?? "";
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  
  const loginInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const loginId = useId();
  const passwordId = useId();

  const generatePassword = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let generatedPassword = "";
    for (let i = 0; i < 8; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPassword);
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success("Пароль згенеровано та скопійовано в буфер обміну. Його можна вставити на сторінці входу.");
    } catch {
      toast.info("Пароль згенеровано. Збережіть його, щоб увійти до акаунта.");
    }
  };

  const checkLoginAvailability = async (loginToCheck: string) => {
    if (!loginToCheck.trim()) {
      setLoginStatus('idle');
      return true;
    }
    
    setLoginStatus('checking');
    try {
      const response = await fetch(`/api/users/check-login?login=${encodeURIComponent(loginToCheck)}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.available) {
          setLoginStatus('available');
          return true;
        } else {
          setLoginStatus('taken');
          toast.error("Цей логін вже зайнятий. Будь ласка, оберіть інший.");
          return false;
        }
      } else {
        setLoginStatus('idle');
        return true;
      }
    } catch (error) {
      console.error("Error checking login availability:", error);
      setLoginStatus('idle');
      return true; 
    }
  };

  const handleLoginBlur = async () => {
    if (login.trim()) {
      const isAvailable = await checkLoginAvailability(login);
      if (!isAvailable && loginInputRef.current) {
        loginInputRef.current.focus();
      }
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
    if (loginStatus !== 'idle') {
      setLoginStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name.trim() || !login.trim() || !password.trim()) {
      setError("Name, login, and password are required.");
      setIsLoading(false);
      return;
    }

    if (loginStatus !== 'available') {
      const isAvailable = await checkLoginAvailability(login);
      if (!isAvailable) {
        setIsLoading(false);
        if (loginInputRef.current) {
          loginInputRef.current.focus();
        }
        return;
      }
    }

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          login,
          password,
          partnerIdToReceiveFrom: invitationPartnerId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      toast.success("Реєстрація успішна!");
      router.push(`/login?registered=1${invitationPartnerId ? `&invite=${encodeURIComponent(invitationPartnerId)}` : ""}`);
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to register";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(`Registration error: ${errorMessage}`);
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
    <Card className="w-full gap-0 overflow-hidden rounded-[2.1rem] border border-white/65 bg-white/55 py-0 shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_24px_70px_rgba(88,38,70,.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-zinc-950/55">
      <CardHeader className="relative px-5 pt-5 pb-4 text-center sm:px-7 sm:pt-7">
        <Button asChild variant="ghost" size="icon" className="absolute h-10 w-10 rounded-[1rem] border border-white/60 bg-white/45 text-zinc-600 hover:bg-white/70 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300">
          <Link href="/" aria-label="На головну">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-white/65 bg-[linear-gradient(145deg,rgba(255,135,181,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.7),0_10px_24px_rgba(207,49,112,.28)]">
          <HeartIcon className="h-6 w-6 fill-current" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-[-.03em]">Створити профіль</CardTitle>
        <CardDescription className="mt-1">Почни ваш щоденний ритуал теплих слів</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 sm:px-7 sm:pb-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={nameId}>Ім&apos;я</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Твоє ім'я"
              required
              autoComplete="name"
              className="h-12 rounded-[1rem] border-white/70 bg-white/45 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,.75)] dark:border-white/10 dark:bg-white/6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={loginId}>Логін</Label>
            <div className="relative">
              <Input
                id={loginId}
                type="text"
                ref={loginInputRef}
                value={login}
                onChange={handleLoginChange}
                onBlur={handleLoginBlur}
                placeholder="Твій логін наприклад user123"
                required
                autoComplete="username"
                className={`h-12 rounded-[1rem] border-white/70 bg-white/45 px-4 pr-11 shadow-[inset_0_1px_0_rgba(255,255,255,.75)] transition-colors dark:border-white/10 dark:bg-white/6 ${
                  loginStatus === "available"
                    ? "border-green-500 focus-visible:ring-green-500/20"
                    : loginStatus === "taken"
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                }`}
              />
              {loginStatus === "checking" ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              {loginStatus === "available" ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              ) : null}
              {loginStatus === "taken" ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={passwordId}>Пароль</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                className="rounded-[.85rem] border-white/70 bg-white/45 text-xs dark:border-white/10 dark:bg-white/6"
              >
                Згенерувати
              </Button>
            </div>
            <div className="relative">
              <Input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="h-12 rounded-[1rem] border-white/70 bg-white/45 px-4 pr-12 shadow-[inset_0_1px_0_rgba(255,255,255,.75)] dark:border-white/10 dark:bg-white/6"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 rounded-[.85rem] hover:bg-white/60 dark:hover:bg-white/10"
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
            <p className="pl-2 text-[10px] text-red-500">
              Не пиши свій справжній пароль!
            </p>
          </div>

          {error ? (
            <p className="rounded-[1rem] border border-red-200/60 bg-red-50/65 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-12 w-full rounded-[1.1rem] border border-white/50 bg-[linear-gradient(145deg,rgba(255,120,176,.98),rgba(225,52,118,.94))] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.6),0_10px_24px_rgba(207,49,112,.24)] hover:brightness-105"
            disabled={
              isLoading ||
              loginStatus === "taken" ||
              loginStatus === "checking" ||
              password === "" ||
              password.length < 8
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Збереження...
              </>
            ) : (
              "Зареєструватися"
            )}
          </Button>

          <div className="pt-1 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Вже маєш профіль?{" "}
            <Link href="/login" className="font-semibold text-pink-700 hover:underline dark:text-pink-200">
              Вхід
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
