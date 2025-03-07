"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clipboard, Check, RefreshCw, Eye, EyeOff, RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";

interface UserData {
  _id: string;
  name: string;
  login: string;
  password: string;
  phone: string;
  role: string;
  partnerIdToSend: string;
  partnerIdToReceiveFrom: string;
  dayMessageLimit: number;
  image?: {
    asset?: {
      _ref: string;
    };
  };
}

// This ensures the user property is correctly typed
interface ExtendedSession {
  user: {
    login?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    id?: string;
    partnerIdToSend?: string;
    partnerIdToReceiveFrom?: string;
  }
}

export default function UserProfile() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  }) as { data: ExtendedSession | null };

  const [userData, setUserData] = useState<UserData | null>(null);
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.login) return ;

      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/profile?login=${session.user.login}`);
        
        if (!response.ok) {
          throw new Error('Не вдалося отримати дані користувача');
        }
        
        const data = await response.json();
        setUserData(data);
        setOriginalUserData(JSON.parse(JSON.stringify(data))); // Create a deep copy of the data
      } catch (error) {
        console.error('Помилка при отриманні даних користувача:', error);
        toast.error('Не вдалося завантажити профіль користувача');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // Check if there are changes in the user data
  const hasChanges = () => {
    if (!userData || !originalUserData) return false;
    
    // Compare each relevant field to detect changes
    return (
      userData.name !== originalUserData.name ||
      userData.password !== originalUserData.password ||
      userData.phone !== originalUserData.phone ||
      userData.partnerIdToSend !== originalUserData.partnerIdToSend ||
      userData.partnerIdToReceiveFrom !== originalUserData.partnerIdToReceiveFrom ||
      userData.dayMessageLimit !== originalUserData.dayMessageLimit
    );
  };

  const copyToClipboard = () => {
    if (!userData?.partnerIdToSend) return;
    
    navigator.clipboard.writeText(userData.partnerIdToSend)
      .then(() => {
        setCopied(true);
        toast.success('ID партнера скопійовано в буфер обміну!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Не вдалося скопіювати в буфер обміну');
      });
  };

  const generateUUID = () => {
    try {
      // Generate a new UUID
      const newUUID = crypto.randomUUID();
      
      // Update the userData state with the new UUID
      setUserData((prev) => prev ? { ...prev, partnerIdToSend: newUUID } : null);
      
      toast.success('Новий ID згенеровано!');
    } catch (error) {
      console.error('Помилка генерації UUID:', error);
      toast.error('Не вдалося згенерувати новий ID');
    }
  };

  const generatePassword = () => {
    try {
      // Define character sets
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const special = '!@#$%^&*()_-+=<>?';
      
      const allChars = lowercase + uppercase + numbers + special;
      let password = '';
      
      // Generate a password with 12 characters
      for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
      }
      
      // Update the userData state with the new password
      setUserData((prev) => prev ? { ...prev, password } : null);
      
      toast.success('Новий пароль згенеровано!');
    } catch (error) {
      console.error('Помилка при генерації паролю:', error);
      toast.error('Не вдалося згенерувати новий пароль');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData || !hasChanges()) return;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Не вдалося оновити профіль');
      }
      
      setOriginalUserData(JSON.parse(JSON.stringify(userData))); // Update the original data
      toast.success('Профіль успішно оновлено!');
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      toast.error('Не вдалося оновити профіль');
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    if (originalUserData) {
      setUserData(JSON.parse(JSON.stringify(originalUserData)));
      toast.info('Зміни скасовано');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Ваш Профіль</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Ім&apos;я</Label>
              <Input
                id="name"
                name="name"
                value={userData?.name || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">Логін</Label>
              <Input
                id="login"
                name="login"
                value={userData?.login || ""}
                onChange={handleInputChange}
                disabled
              />
              <p className="text-xs text-gray-500">Логін не можна змінити</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={userData?.password || ""}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  variant="outline"
                  size="icon"
                  title={showPassword ? "Приховати пароль" : "Показати пароль"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={generatePassword}
                  variant="outline"
                  size="icon"
                  title="Згенерувати новий пароль"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефону</Label>
              <Input
                id="phone"
                name="phone"
                value={userData?.phone || ""}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                Номер телефону потрібен для можливості коли закінчаться
                повідомлення на день кохана людина змогла зателефонувати
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dayMessageLimit">Денний ліміт повідомлень</Label>
              <Input
                id="dayMessageLimit"
                name="dayMessageLimit"
                type="number"
                min="1"
                max="10"
                value={userData?.dayMessageLimit || 2}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerIdToSend">Ваш ID для поширення</Label>
              <div className="flex gap-2">
                <Input
                  id="partnerIdToSend"
                  name="partnerIdToSend"
                  value={userData?.partnerIdToSend || ""}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                  title="Копіювати в буфер обміну"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={generateUUID}
                  variant="outline"
                  size="icon"
                  title="Згенерувати новий ID"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Поділіться цим ID з вашим партнером, щоб він міг надсилати вам
                повідомлення
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerIdToReceiveFrom">ID вашого партнера</Label>
              <Input
                id="partnerIdToReceiveFrom"
                name="partnerIdToReceiveFrom"
                value={userData?.partnerIdToReceiveFrom || ""}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                Введіть ID вашого партнера, щоб надсилати йому повідомлення
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isSaving || !hasChanges()} 
                className="flex-1"
              >
                {isSaving ? "Збереження..." : "Зберегти профіль"}
              </Button>

              {hasChanges() && (
                <Button 
                  type="button" 
                  onClick={resetChanges}
                  variant="outline"
                  className="flex gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Скасувати зміни
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
