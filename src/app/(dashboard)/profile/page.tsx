"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import QRCode from "react-qr-code";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Clipboard,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  RotateCcw,
  QrCode,
  ScanQrCode,
  Share2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { BackButton } from "@/components/ui/back-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCAN_LANGUAGES } from "@/lib/languages";

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
  geminiApiKey: string;
  partnerInfo: string;
  aiScanLanguage: string;
  localScanLanguage: string;
  image?: {
    asset?: {
      _ref: string;
    };
  };
}

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
  };
}

export default function UserProfile() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  }) as { data: ExtendedSession | null };

  const [userData, setUserData] = useState<UserData | null>(null);
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.login) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/users/profile?login=${session.user.login}`
        );

        if (!response.ok) {
          throw new Error("Не вдалося отримати дані користувача");
        }

        const data = await response.json();
        setUserData(data);
        setOriginalUserData(JSON.parse(JSON.stringify(data))); 
      } catch (error) {
        console.error("Помилка при отриманні даних користувача:", error);
        toast.error("Не вдалося завантажити профіль користувача");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [session]);

  useEffect(() => {
    async function fetchPartnerInfo() {
      const partnerId = userData?.partnerIdToReceiveFrom;

      if (!partnerId || partnerId.trim() === "") {
        setPartnerName(null);
        return;
      }

      try {
        setLoadingPartner(true);
        const response = await fetch(
          `/api/users/partner-info?partnerId=${partnerId}`
        );

        if (!response.ok) {
          throw new Error("Не вдалося отримати інформацію про партнера");
        }

        const data = await response.json();
        setPartnerName(data.name || "Невідомий партнер");
      } catch (error) {
        toast.error("Не вдалося отримати інформацію про партнера");
        console.error("Помилка при отриманні інформації про партнера:", error);
        setPartnerName(null);
      } finally {
        setLoadingPartner(false);
      }
    }

    fetchPartnerInfo();
  }, [userData?.partnerIdToReceiveFrom]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const hasChanges = () => {
    if (!userData || !originalUserData) return false;

    return (
      userData.name !== originalUserData.name ||
      userData.password !== originalUserData.password ||
      userData.phone !== originalUserData.phone ||
      userData.partnerIdToSend !== originalUserData.partnerIdToSend ||
      userData.partnerIdToReceiveFrom !==
        originalUserData.partnerIdToReceiveFrom ||
      userData.dayMessageLimit !== originalUserData.dayMessageLimit ||
      userData.geminiApiKey !== originalUserData.geminiApiKey ||
      userData.partnerInfo !== originalUserData.partnerInfo ||
      userData.aiScanLanguage !== originalUserData.aiScanLanguage ||
      userData.localScanLanguage !== originalUserData.localScanLanguage
    );
  };

  const copyToClipboard = () => {
    if (!userData?.partnerIdToSend) return;

    navigator.clipboard
      .writeText(userData.partnerIdToSend)
      .then(() => {
        setCopied(true);
        toast.success("ID партнера скопійовано в буфер обміну!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Не вдалося скопіювати в буфер обміну");
      });
  };

  const shareId = async () => {
    if (!userData?.partnerIdToSend) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Мій ID для Love Notes",
          text: userData.partnerIdToSend,
        });
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.error("Помилка поширення ID:", error);
          toast.error("Не вдалося поділитися ID");
        }
      }
    } else {
      copyToClipboard();
      toast.info("Поширення недоступне на цьому пристрої — ID скопійовано");
    }
  };

  const generateUUID = () => {
    try {
      const newUUID = crypto.randomUUID();

      setUserData((prev) =>
        prev ? { ...prev, partnerIdToSend: newUUID } : null
      );

      toast.success("Новий ID згенеровано!");
    } catch (error) {
      console.error("Помилка генерації UUID:", error);
      toast.error("Не вдалося згенерувати новий ID");
    }
  };

  const openQrScanner = () => {
    qrFileInputRef.current?.click();
  };

  const decodeQrFromFile = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas is not supported"));
            return;
          }

          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          resolve(code?.data ?? null);
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image"));
      };

      image.src = objectUrl;
    });
  };

  const handleQrFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsScanningQr(true);
    try {
      const partnerId = await decodeQrFromFile(file);

      if (!partnerId) {
        toast.error("QR-код не розпізнано. Спробуйте ще раз при кращому світлі.");
        return;
      }

      setUserData((prev) =>
        prev ? { ...prev, partnerIdToReceiveFrom: partnerId } : null
      );
      toast.success("ID партнера розпізнано з QR-коду!");
    } catch (error) {
      console.error("Помилка сканування QR-коду:", error);
      toast.error("Не вдалося розпізнати QR-код");
    } finally {
      setIsScanningQr(false);
    }
  };

  const generatePassword = () => {
    try {
      // Define character sets
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const special = "!@#$%^&*()_-+=<>?";

      const allChars = lowercase + uppercase + numbers + special;
      let password = "";

      for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
      }

      setUserData((prev) => (prev ? { ...prev, password } : null));

      toast.success("Новий пароль згенеровано!");
    } catch (error) {
      console.error("Помилка при генерації паролю:", error);
      toast.error("Не вдалося згенерувати новий пароль");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData || !hasChanges()) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Не вдалося оновити профіль");
      }

      setOriginalUserData(JSON.parse(JSON.stringify(userData)));
      toast.success("Профіль успішно оновлено!");
    } catch (error) {
      console.error("Помилка оновлення профілю:", error);
      toast.error("Не вдалося оновити профіль");
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    if (originalUserData) {
      setUserData(JSON.parse(JSON.stringify(originalUserData)));
      toast.info("Зміни скасовано");
    }
  };

  if (isLoading) {
    return (
      <div className="container  max-w-3xl mx-auto  py-10">
        <BackButton text="Профіль" />
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
    <div className="container max-w-3xl mx-auto py-10">
      <BackButton text="Профіль" />
      <Card>
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
                <CustomTooltip
                  text={showPassword ? "Приховати пароль" : "Показати пароль"}
                >
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="outline"
                    size="icon"
                    title={
                      showPassword ? "Приховати пароль" : "Показати пароль"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </CustomTooltip>
                <CustomTooltip text="Згенерувати новий пароль">
                  <Button
                    type="button"
                    onClick={generatePassword}
                    variant="outline"
                    size="icon"
                    title="Згенерувати новий пароль"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CustomTooltip>
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
                value={userData?.dayMessageLimit}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                Денний ліміт для твого партнера
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geminiApiKey">Gemini API ключ</Label>
              <div className="flex gap-2">
                <Input
                  id="geminiApiKey"
                  name="geminiApiKey"
                  type={showGeminiApiKey ? "text" : "password"}
                  value={userData?.geminiApiKey || ""}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <CustomTooltip
                  text={showGeminiApiKey ? "Приховати ключ" : "Показати ключ"}
                >
                  <Button
                    type="button"
                    onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                    variant="outline"
                    size="icon"
                    title={
                      showGeminiApiKey ? "Приховати ключ" : "Показати ключ"
                    }
                  >
                    {showGeminiApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </CustomTooltip>
              </div>
              <p className="text-xs text-gray-500">
                Потрібен для генерації повідомлень через AI. Отримати ключ
                можна на{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  aistudio.google.com
                </a>
                .
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerInfo">Інформація про партнера (для AI)</Label>
              <Textarea
                id="partnerInfo"
                name="partnerInfo"
                value={userData?.partnerInfo || ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Інтереси, спільні жарти, як ви познайомились..."
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Використовується для персоналізації AI-згенерованих
                повідомлень
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiScanLanguage">Мова перекладу при AI-скануванні</Label>
              <Select
                value={userData?.aiScanLanguage || "uk"}
                onValueChange={(value) =>
                  setUserData((prev) =>
                    prev ? { ...prev, aiScanLanguage: value } : null
                  )
                }
              >
                <SelectTrigger className="w-full" id="aiScanLanguage">
                  <SelectValue placeholder="Виберіть мову" />
                </SelectTrigger>
                <SelectContent>
                  {SCAN_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Текст, розпізнаний AI на фото, буде перекладено цією мовою
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localScanLanguage">
                Мова розпізнавання для локального сканування
              </Label>
              <Select
                value={userData?.localScanLanguage || "uk"}
                onValueChange={(value) =>
                  setUserData((prev) =>
                    prev ? { ...prev, localScanLanguage: value } : null
                  )
                }
              >
                <SelectTrigger className="w-full" id="localScanLanguage">
                  <SelectValue placeholder="Виберіть мову" />
                </SelectTrigger>
                <SelectContent>
                  {SCAN_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Мова тексту на фото для сканування без AI (локально, офлайн)
              </p>
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
                <CustomTooltip text="Копіювати">
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
                </CustomTooltip>
                <CustomTooltip text="Згенерувати новий ID">
                  <Button
                    type="button"
                    onClick={generateUUID}
                    variant="outline"
                    size="icon"
                    title="Згенерувати новий ID"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CustomTooltip>
                <CustomTooltip text="Показати QR-код">
                  <Button
                    type="button"
                    onClick={() => setIsQrDialogOpen(true)}
                    variant="outline"
                    size="icon"
                    title="Показати QR-код"
                    disabled={!userData?.partnerIdToSend}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </CustomTooltip>
              </div>

              <p className="text-xs text-gray-500">
                Поділіться цим ID з вашим партнером, щоб він міг надсилати вам
                повідомлення — покажіть йому QR-код або скопіюйте ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerIdToReceiveFrom">
                ID вашого партнера
                {loadingPartner && (
                  <p className="text-xs text-gray-500">Пошук партнера...</p>
                )}
                {!loadingPartner && partnerName && (
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {partnerName}
                  </p>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="partnerIdToReceiveFrom"
                  name="partnerIdToReceiveFrom"
                  value={userData?.partnerIdToReceiveFrom || ""}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <CustomTooltip text="Сканувати QR-код партнера">
                  <Button
                    type="button"
                    onClick={openQrScanner}
                    variant="outline"
                    size="icon"
                    title="Сканувати QR-код партнера"
                    disabled={isScanningQr}
                  >
                    <ScanQrCode className="h-4 w-4" />
                  </Button>
                </CustomTooltip>
              </div>
              <input
                ref={qrFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleQrFileSelected}
              />
              <p className="text-xs select-none text-gray-500">
                Введіть ID вашого партнера, скопіюйте його або відскануйте
                QR-код з екрана партнера
              </p>

              {!loadingPartner &&
                userData?.partnerIdToReceiveFrom &&
                !partnerName && (
                  <p className="text-sm text-red-500">
                    Партнера не знайдено. Перевірте ID.
                  </p>
                )}
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

      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Ваш QR-код</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {userData?.partnerIdToSend ? (
              <div className="rounded-lg bg-white p-4">
                <QRCode value={userData.partnerIdToSend} size={200} />
              </div>
            ) : null}
            <p className="text-center text-sm text-muted-foreground">
              Покажіть цей код партнеру — він може відсканувати його кнопкою{" "}
              &quot;Сканувати QR-код партнера&quot; біля поля{" "}
              &quot;ID вашого партнера&quot; у своєму профілі.
            </p>
            <Button type="button" onClick={shareId} className="w-full">
              <Share2 className="mr-2 h-4 w-4" /> Надіслати в месенджер
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
