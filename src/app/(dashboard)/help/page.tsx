"use client";

import { startTransition, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  User,
  MessageSquare,
  Phone,
  Settings,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function HelpPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    // Про Love Notes
    {
      title: "Про Love Notes",
      icon: <Info className="h-8 w-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg font-medium">
            Що таке Love Notes і для чого це потрібно?
          </p>

          <div className="space-y-2">
            <p>
              <strong>Love Notes</strong> - це особливий простір для пар, який
              перетворює обмін повідомленнями на приємний ритуал і справжню
              подію дня.
            </p>

            <h3 className="text-md font-medium mt-4">
              Чому не просто месенджер?
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Очікування і сюрприз</strong> - обмежена кількість
                повідомлень на день створює відчуття передчуття та робить кожне
                повідомлення особливим
              </li>
              <li>
                <strong>Зручне планування</strong> - створіть запас приємних
                слів заздалегідь, щоб вони доставлялись навіть у ваш
                найзайнятіший день
              </li>
              <li>
                <strong>Зберігання історії</strong> - всі ваші теплі слова
                залишаються в одному місці, створюючи літопис ваших почуттів
              </li>
              <li>
                <strong>Свідома комунікація</strong> - додаток заохочує вас
                писати осмислені, щирі повідомлення замість побутових
                повсякденних повідомлень
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <h4 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Heart className="h-4 w-4" /> Як це працює
            </h4>
            <p className="text-sm mt-1">
              Ви створюєте повідомлення для коханої людини, встановлюєте ліміт
              їх показу в день, а ваш партнер отримує їх як теплі сюрпризи
              протягом дня у зручний час. Час смутку, радості, втоми або просто
              вільний час - кожен момент може стати особливим. Це створює
              приємний ритуал і особливий момент у повсякденному житті. Оскільки
              повідомлення вибираються випадково, то кожен день може бути
              справжнім сюрпризом. А на цей додаток надихнула мене моя кохана,
              яка подарувала мені баночку з записками, щоб я дивився кожного дня
              і згадував про неї. Тож і ви не забувайте про своїх коханих. І
              зробіть їм приємний сюрприз.
            </p>
          </div>
        </div>
      ),
    },
    // Початок
    {
      title: "Початок",
      icon: <User className="h-8 w-8 text-pink-500" />,
      content: (
        <div className="space-y-4">
          <p>Після реєстрації вам потрібно налаштувати свій профіль:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Перейдіть на сторінку <strong>Профіль</strong>
            </li>
            <li>
              Знайдіть розділ <strong>&quot;Ваш ID для поширення&quot;</strong>{" "}
              і поділіться цим ID з партнером
            </li>
            <li>
              Попросіть партнера поділитися своїм ID і введіть його в поле{" "}
              <strong>&quot;ID вашого партнера&quot;</strong> Якщо ваш партнер
              правильно вказав ID то ви побачите його ім&apos;я
            </li>
            <li>
              Введіть свій номер телефону, щоб партнер міг зв&apos;язатися з
              вами
            </li>
          </ol>
          <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
            <h4 className="font-medium text-pink-700 dark:text-pink-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Порада
            </h4>
            <p className="text-sm mt-1">
              Встановіть надійний пароль і збережіть його в безпечному місці.
              Функція відновлення пароля наразі недоступна.
            </p>
          </div>
        </div>
      ),
    },
    // Налаштування лімітів
    {
      title: "Налаштування лімітів",
      icon: <Settings className="h-8 w-8 text-indigo-500" />,
      content: (
        <div className="space-y-4">
          <p>
            Для кращого досвіду використання, налаштуйте ліміти повідомлень:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              На сторінці профілю знайдіть поле{" "}
              <strong>&quot;Денний ліміт повідомлень&quot;</strong>
            </li>
            <li>
              Встановіть кількість повідомлень, яку ваш партнер може отримати за
              день (рекомендовано: 1-3)
            </li>
            <li>
              Натисніть <strong>&quot;Зберегти профіль&quot;</strong> для
              збереження налаштувань
            </li>
          </ol>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
            <h4 className="font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Рекомендація
            </h4>
            <p className="text-sm mt-1">
              Ми рекомендуємо встановлювати ліміт 2-3 повідомлення на день. Якщо
              партнеру потрібно більше повідомлень, можливо, варто частіше
              спілкуватися вживу або по телефону.
            </p>
          </div>
        </div>
      ),
    },
    // Створення повідомлень
    {
      title: "Створення повідомлень",
      icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p>Тепер настав час створити повідомлення для вашого партнера:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Перейдіть на сторінку <strong>&quot;Повідомлення&quot;</strong>
            </li>
            <li>
              Натисніть <strong>&quot;Додати повідомлення&quot;</strong>
            </li>
            <li>Введіть текст вашого повідомлення та оберіть категорію:</li>
            <ul className="list-disc pl-5 space-y-1 mt-1 mb-2">
              <li>
                <strong>Невідома</strong> - для справжнього сюрпризу
              </li>
              <li>
                <strong>Щоденне</strong> - стандартні повідомлення кохання. А це
                тільки одна на день.
              </li>
              <li>
                <strong>Екстра</strong> - Додаткові повідомлення можуть бути
                після щодених і не враховуються в ліміті.
              </li>
            </ul>
            <li>
              Натисніть <strong>&quot;Зберегти повідомлення&quot;</strong> для
              додавання повідомлення
            </li>
            <li>
              Для додавання кількох повідомлень одразу, використовуйте функцію{" "}
              <strong>&quot;Масове додавання&quot;</strong>
            </li>
          </ol>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Порада
            </h4>
            <p className="text-sm mt-1">
              Створіть запас повідомлень заздалегідь, щоб вашому партнеру завжди
              було що отримати. Можна підготувати різні повідомлення для різних
              настроїв та ситуацій. Скоро буде можливість згенерувати
              повідомлення автоматично.
            </p>
          </div>
        </div>
      ),
    },
    // Перегляд повідомлень
    {
      title: "Перегляд повідомлень",
      icon: <Heart className="h-8 w-8 text-rose-500" />,
      content: (
        <div className="space-y-4">
          <p>Щоб переглядати повідомлення від вашого партнера:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Перейдіть на <strong>Головну сторінку</strong>
            </li>
            <li>Ви побачите панель з таймером до наступного повідомлення</li>
            <li>
              Натисніть <strong>&quot;Показати повідомлення&quot;</strong> або{" "}
              <strong>&quot;Хочеться ще!&quot;</strong>, щоб отримати нове
              повідомлення (якщо ліміт не вичерпано)
            </li>
            <li>
              Якщо ліміт вичерпано або у партнера закінчилися повідомлення, ви
              побачите кнопку для дзвінка
            </li>
            <li>Нижче ви побачите список повідомлень, які вже отримали</li>
            <li>
              Натисніть на серце біля повідомлення, щоб відзначити, що воно вам
              сподобалося
            </li>
          </ol>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg">
            <h4 className="font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Нагадування
            </h4>
            <p className="text-sm mt-1">
              Ліміт повідомлень оновлюється щодня опівночі за вашим місцевим
              часом. Обговоріть з партнером найкращий час для перегляду
              повідомлень, щоб зробити цей момент особливим для вас обох.
            </p>
          </div>
        </div>
      ),
    },
    // Зв'язок з партнером
    {
      title: "Зв'язок з партнером",
      icon: <Phone className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p>Якщо повідомлень не вистачає:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Коли ліміт повідомлень вичерпано, на головній сторінці
              з&apos;явиться кнопка{" "}
              <strong>&quot;Зателефонувати партнеру&quot;</strong>
            </li>
            <li>
              Натискання на неї автоматично здійснить дзвінок на номер партнера
            </li>
            <li>
              Також ви можете бачити історію переглянутих повідомлень у розділі{" "}
              <strong>&quot;Історія&quot;</strong>
            </li>
          </ol>
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg mt-4">
            <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Найважливіше
            </h4>
            <p className="text-sm mt-1">
              Пам&apos;ятайте, що цей додаток - лише доповнення до ваших
              стосунків. Найбільш цінним завжди залишається живе спілкування.
              Використовуйте додаток, щоб показати свою турботу, але не
              замінюйте ним реальне спілкування.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () =>
    startTransition(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setTimeout(() => {
          document
            .getElementById("HELP")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });

  const prevStep = () =>
    startTransition(() => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    });

  return (
    <div
      
      className="container py-10 max-w-3xl mx-auto overflow-hidden"
    >
      <ViewTransition name="buttons-top">
      <div className="flex justify-between items-center mb-8">
        <BackButton text="Початок користування" />
      </div>
      </ViewTransition>

      {/* Progress steps */}
      <ViewTransition
          onUpdate={(instance) => {
            instance.old.animate(
              {
                opacity: [1, 0],
              },
              { duration: 500 }
            );

            instance.new.animate(
              {
                opacity: [0, 1],
              },
              { duration: 300 }
            );
          }}
        >
      <div id="HELP" className="flex justify-between mb-8 relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>
        
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex flex-col items-center cursor-pointer`}
              onClick={() => setCurrentStep(index)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full z-10 ${
                  index <= currentStep
                    ? "bg-pink-500 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-2 hidden md:inline-block ${
                  index === currentStep ? "font-semibold text-pink-500" : ""
                }`}
              >
                {step.title}
              </span>
            </motion.div>
          ))}
        
      </div>
      </ViewTransition>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-pink-200 dark:border-pink-900">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4 gap-3">
              <div className="bg-gradient-to-br from-pink-100 to-indigo-100 dark:from-pink-900/30 dark:to-indigo-900/30 p-3 rounded-full">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-semibold">
                {steps[currentStep].title}
              </h2>
            </div>
            <div className="py-4">{steps[currentStep].content}</div>
          </CardContent>
        </Card>
      </motion.div>
  <ViewTransition name="buttons">
      <div className="flex justify-between mt-8 gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className={currentStep === 0 ? "opacity-50" : ""}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>

        <div className="flex-grow text-center self-center">
          <span className="text-sm text-gray-500">
            Крок {currentStep + 1} з {steps.length}
          </span>
        </div>
       

        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>
            Далі <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Link href="/dashboard">
            <Button>
              На головну <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
        
      </div>
      </ViewTransition>
    </div>
  );
}
