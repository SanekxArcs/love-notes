"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/sanity";
import {  toast } from "sonner";

export default function AdminSettings() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  // Check if user is admin
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const [settings, setSettings] = useState({
    dailyMessageLimit: 3,
    contactNumber: "+380123456789",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const fetchedSettings = await getSettings();
        if (fetchedSettings) {
          setSettings({
            dailyMessageLimit: fetchedSettings.dailyMessageLimit || 3,
            contactNumber: fetchedSettings.contactNumber || "+380123456789",
          });
        }
        toast.success("Settings loaded successfully");
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings"); // Use toast.error for errors
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

async function handleSaveSettings() {
  try {
    setIsSaving(true);

    // Save settings to Sanity via our API route
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error("Failed to save settings");
    }

    // Replace object syntax with string-based syntax
    toast.success("Settings saved successfully");
  } catch (error) {
    console.error("Error saving settings:", error);
    // Replace object syntax with string-based syntax
    toast.error("Failed to save settings");
  } finally {
    setIsSaving(false);
  }
}

  // Rest of your component remains the same
  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <h1 className="text-2xl font-bold">Налаштування</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Загальні налаштування</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4 text-gray-500">
              Завантаження налаштувань...
            </p>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="dailyLimit">Ліміт повідомлень на день</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={settings.dailyMessageLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dailyMessageLimit: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={10}
                />
                <p className="text-sm text-gray-500">
                  Кількість повідомлень, які користувач може отримати за день
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactNumber">Контактний номер</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={settings.contactNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, contactNumber: e.target.value })
                  }
                  placeholder="+380XXXXXXXX"
                />
                <p className="text-sm text-gray-500">
                  Номер для дзвінка, коли ліміт повідомлень вичерпано
                </p>
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="mt-4"
              >
                {isSaving ? "Збереження..." : "Зберегти налаштування"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
