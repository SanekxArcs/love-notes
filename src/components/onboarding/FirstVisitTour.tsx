"use client";

import { useEffect, useState } from "react";
import {
  CalendarHeart,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lightbulb,
  MailPlus,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TourId = "profile" | "messages" | "calendar" | "notes" | "dashboard";

interface TourStep {
  title: string;
  description: string;
}

const TOURS: Record<TourId, { title: string; icon: typeof Heart; steps: TourStep[] }> = {
  profile: {
    title: "Почнемо з вашого профілю",
    icon: Settings2,
    steps: [
      {
        title: "Налаштуйте себе",
        description:
          "Тут можна змінити тему, ім’я для партнера, пароль і номер телефону. Номер потрібен лише як контакт у вашому спільному просторі.",
      },
      {
        title: "Ліміт повідомлень і AI",
        description:
          "Денний ліміт визначає, скільки повідомлень партнер зможе відкрити за день: перше — щоденне, наступні — додаткові. Gemini не є обов’язковим, але додає генерацію, сканування й AI-інструменти для нотаток.",
      },
      {
        title: "Підключіть партнера",
        description:
          "Скопіюйте свій ID або покажіть QR-код партнеру. Він вводить або сканує його у своєму профілі. Коли зв’язок готовий, ім’я партнера буде показано зеленим.",
      },
    ],
  },
  messages: {
    title: "Створюйте теплі повідомлення",
    icon: MailPlus,
    steps: [
      {
        title: "Щоденне або додаткове",
        description:
          "Щоденне повідомлення відкривається першим. Додаткові відкриваються після нього — наприклад, другим і третім, якщо денний ліміт дорівнює трьом.",
      },
      {
        title: "Пишіть або шукайте",
        description:
          "Створюйте повідомлення вручну, шукайте готові за текстом і переходьте до історії, щоб бачити вже надіслані слова.",
      },
      {
        title: "AI — за бажанням",
        description:
          "Після підключення Gemini можна згенерувати текст із промптом або без нього, вибрати довжину, врахувати нотатки та сканувати фото локально чи через AI.",
      },
    ],
  },
  calendar: {
    title: "Ваш спільний календар",
    icon: CalendarHeart,
    steps: [
      {
        title: "Важливі моменти в одному місці",
        description:
          "Оберіть день у календарі, щоб побачити події, або створіть нову: важливу дату, щоденний момент чи інший спільний план.",
      },
      {
        title: "Деталі залишаються поруч",
        description:
          "Для події можна вказати час, повторення щороку, настрій і додаткові деталі. Обраний день показує всі його події вище календаря.",
      },
    ],
  },
  notes: {
    title: "Нотатки, щоб краще знати одне одного",
    icon: Lightbulb,
    steps: [
      {
        title: "Два типи нотаток",
        description:
          "«Про партнера» — твої спостереження й знання про нього. «Про себе» автоматично показується партнеру, щоб він міг додати свою відповідь про себе.",
      },
      {
        title: "Спільне уточнення",
        description:
          "У порівнянні відповідей можна побачити схожі теми, додати уточнення до нотатки партнера або прийняти уточнення до своєї.",
      },
      {
        title: "Розвивайте теми з AI",
        description:
          "AI-помічник, нові теми та аналіз сумісності доступні після підключення Gemini. AI для тем бачить лише назви й теги, а не приватні тексти нотаток.",
      },
    ],
  },
  dashboard: {
    title: "Ваш щоденний ритуал",
    icon: Heart,
    steps: [
      {
        title: "Отримайте повідомлення",
        description:
          "Рожева кнопка внизу відкриває наступне повідомлення від партнера. Угорі видно, скільки повідомлень ще доступно сьогодні.",
      },
      {
        title: "Зберігайте відчуття",
        description:
          "Ставте вподобайку, коли повідомлення особливо відгукнулося. Попередні повідомлення залишаються в історії, щоб до них можна було повернутися.",
      },
    ],
  },
};

export function FirstVisitTour({ tour }: { tour: TourId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const content = TOURS[tour];
  const Icon = content.icon;

  useEffect(() => {
    let active = true;
    fetch(`/api/users/onboarding?step=${tour}`)
      .then((response) => response.json())
      .then((data) => {
        if (active && data.show) setIsOpen(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [tour]);

  const finish = async () => {
    setIsOpen(false);
    if (tour !== "profile") {
      await fetch("/api/users/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete-step", step: tour }),
      }).catch(() => undefined);
    }
  };

  const next = () => {
    if (stepIndex + 1 >= content.steps.length) {
      void finish();
      return;
    }
    setStepIndex((index) => index + 1);
  };

  const step = content.steps[stepIndex];
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && void finish()}>
      <DialogContent className="rounded-[1.75rem] border-white/65 bg-white/84 shadow-[inset_0_1px_1px_rgba(255,255,255,.95),0_22px_65px_rgba(71,40,62,.2)] backdrop-blur-2xl sm:max-w-md dark:border-white/15 dark:bg-zinc-950/88">
        <DialogHeader className="text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-[1.05rem] bg-pink-100 text-pink-700 dark:bg-pink-950/45 dark:text-pink-200">
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>
            Крок {stepIndex + 1} з {content.steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-[1.25rem] border border-white/65 bg-white/48 p-4 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-sm font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => void finish()} className="rounded-[.9rem] text-xs">
            Пропустити
          </Button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <Button type="button" variant="outline" size="icon" onClick={() => setStepIndex((index) => index - 1)} className="h-10 w-10 rounded-[.9rem]">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <Button type="button" onClick={next} className="h-10 rounded-[.9rem] bg-pink-600 px-4 text-white hover:bg-pink-500">
              {stepIndex + 1 === content.steps.length ? <><Check className="h-4 w-4" /> Зрозуміло</> : <>Далі <ChevronRight className="h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
