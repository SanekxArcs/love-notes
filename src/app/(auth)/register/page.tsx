"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { HeartIcon, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  
  const loginInputRef = useRef<HTMLInputElement>(null);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let generatedPassword = "";
    for (let i = 0; i < 8; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPassword);
    toast.info("Пароль згенеровано!");
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
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      toast.success("Реєстрація успішна!");
      router.push("/help");
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
    <Card className="w-full max-w-md bg-background border border-pink-200 dark:border-pink-900">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950">
          <HeartIcon className="h-6 w-6 text-pink-500 dark:text-pink-400" />
        </div>
        <CardTitle> <ViewTransition name="create-profile">Створити профіль</ViewTransition></CardTitle>
        <CardDescription>Введи необхідні дані для реєстрації</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ім&apos;я</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Твоє ім'я"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login">Логін</Label>
            <div className="relative">
              <Input
                id="login"
                type="text"
                ref={loginInputRef}
                value={login}
                onChange={handleLoginChange}
                onBlur={handleLoginBlur}
                placeholder="Твій логін наприклад user123"
                required
                className={`transition-colors ${
                  loginStatus === "available"
                    ? "border-green-500 focus-visible:ring-green-500/20"
                    : loginStatus === "taken"
                      ? "border-red-500 focus-visible:ring-red-500/20"
                      : ""
                }`}
              />
              {loginStatus === "checking" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {loginStatus === "available" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {loginStatus === "taken" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Пароль</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
              >
                Згенерувати
              </Button>
            </div>
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
            <p className="text-red-500 pl-2 text-[10px]">
              Не пиши свій справжній пароль!
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефону (необов&apos;язково)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+123456789"
            />
          </div>

          {error && (
            <p className="rounded bg-red-100 dark:bg-red-900/30 p-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Збереження...
              </>
            ) : (
              "Зареєструватися"
            )}
          </Button>

          <div className="text-center text-sm">
            Вже маєш профіль?
            <Link href="/login" className="underline text-primary">
              Вхід
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
