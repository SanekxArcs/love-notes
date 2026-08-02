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
  KeyRound,
  History,
  CalendarHeart,
  NotebookText,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { ViewTransition } from "react";

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
    // AI-можливості
    {
      title: "AI-можливості",
      icon: <KeyRound className="h-8 w-8 text-amber-500" />,
      content: (
        <div className="space-y-4">
          <p>
            Кілька функцій додатку працюють через Gemini AI — генерація
            повідомлень, сканування тексту з фото та AI-помічник у нотатках
            про партнера. Щоб їх увімкнути:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Отримайте безкоштовний ключ на{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-amber-600 dark:text-amber-400"
              >
                aistudio.google.com
              </a>
            </li>
            <li>
              Перейдіть на сторінку <strong>Профіль</strong> і вставте його в
              поле <strong>&quot;Gemini API ключ&quot;</strong>
            </li>
            <li>
              Там же можна заповнити <strong>&quot;Інформація про
              партнера&quot;</strong> — AI використає це, щоб генерувати
              персональніші повідомлення
            </li>
            <li>
              Натисніть <strong>&quot;Зберегти профіль&quot;</strong>
            </li>
          </ol>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <h4 className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Що це відкриває
            </h4>
            <ul className="text-sm mt-1 list-disc pl-5 space-y-1">
              <li>
                Кнопку <strong>&quot;Згенерувати AI&quot;</strong> при
                створенні повідомлення
              </li>
              <li>Сканування тексту з фото через AI (крім локального розпізнавання)</li>
              <li>
                Кнопку <strong>&quot;AI-помічник&quot;</strong> на сторінці
                нотаток про партнера
              </li>
            </ul>
            <p className="text-sm mt-2">
              Без ключа весь інший функціонал додатку працює як завжди — це
              повністю опціонально, і ключ ніхто, крім вас, не бачить.
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
              Натисніть <strong>&quot;Додати&quot;</strong>
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
              За бажанням додайте <strong>особливу дату</strong> (день і
              місяць) — тоді це повідомлення матиме пріоритет саме в цей день
              щороку (день народження, річниця тощо)
            </li>
            <li>
              Текст можна написати самому, <strong>відсканувати з фото</strong>{" "}
              (локально або через AI) чи <strong>згенерувати AI</strong> — під
              полем тексту одразу видно відсоток унікальності порівняно з уже
              надісланими повідомленнями
            </li>
            <li>
              Натисніть <strong>&quot;Зберегти повідомлення&quot;</strong> для
              додавання повідомлення
            </li>
            <li>
              Щоб додати кілька повідомлень одразу, у діалозі{" "}
              <strong>&quot;Додати&quot;</strong> натисніть{" "}
              <strong>&quot;Масове додавання&quot;</strong> — кожен рядок стане
              окремим повідомленням
            </li>
            <li>
              Список непоказаних повідомлень можна відфільтрувати пошуком
              зверху сторінки
            </li>
          </ol>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Порада
            </h4>
            <p className="text-sm mt-1">
              Створіть запас повідомлень заздалегідь, щоб вашому партнеру завжди
              було що отримати. Можна підготувати різні повідомлення для різних
              настроїв та ситуацій.
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
    // Історія повідомлень
    {
      title: "Історія повідомлень",
      icon: <History className="h-8 w-8 text-slate-500" />,
      content: (
        <div className="space-y-4">
          <p>
            На сторінці <strong>&quot;Історія&quot;</strong> зберігаються всі
            повідомлення, які вже було показано вашому партнеру:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Скористайтеся <strong>пошуком</strong> зверху, щоб знайти
              повідомлення за текстом або іменем
            </li>
            <li>
              Натисніть на заголовок колонки (Ім&apos;я, Категорія, Дата
              показу), щоб відсортувати список
            </li>
            <li>
              Клікніть на рядок, щоб побачити повну картку повідомлення —
              текст, категорію, дату показу та реакцію (❤️/🤍)
            </li>
          </ol>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Порада
            </h4>
            <p className="text-sm mt-1">
              Історія — це живий літопис ваших теплих слів. Час від часу
              перегортайте її разом, щоб згадати приємні моменти.
            </p>
          </div>
        </div>
      ),
    },
    // Спільний календар
    {
      title: "Спільний календар",
      icon: <CalendarHeart className="h-8 w-8 text-fuchsia-500" />,
      content: (
        <div className="space-y-4">
          <p>
            Сторінка <strong>&quot;Календар&quot;</strong> — спільний з
            партнером простір для важливих і романтичних моментів. На
            відміну від нотаток, події тут одразу видно обом.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Натисніть <strong>&quot;Додати подію&quot;</strong> і оберіть
              тип:
            </li>
            <ul className="list-disc pl-5 space-y-1 mt-1 mb-2">
              <li>
                <strong>🎉 Важлива/романтична подія</strong> — з назвою,
                можна зробити щорічною (день народження, річниця)
              </li>
              <li>
                <strong>💞 Інтимний момент</strong> — простий режим (оцінка
                зірками/вогниками + нотатка) або детальний (тип активності,
                тривалість, ініціатор, захист, теги враження)
              </li>
              <li>
                <strong>📝 Щоденний момент</strong> — швидка нотатка про
                настрій дня
              </li>
            </ul>
            <li>
              Клацніть на будь-який день у сітці, щоб побачити всі події
              цього дня — свої та партнерові
            </li>
            <li>
              Редагувати чи видаляти можна лише власні події; події партнера
              видно, але без можливості зміни
            </li>
            <li>
              Показані повідомлення від партнера теж автоматично зʼявляються
              в календарі позначкою <strong>💌</strong> — лише для перегляду
            </li>
          </ol>
          <div className="p-4 bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded-lg">
            <h4 className="font-medium text-fuchsia-700 dark:text-fuchsia-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Порада
            </h4>
            <p className="text-sm mt-1">
              Використовуйте календар, щоб не забувати важливі дати і вести
              спільний, чесний журнал інтимного життя пари.
            </p>
          </div>
        </div>
      ),
    },
    // Нотатки про партнера
    {
      title: "Нотатки про партнера",
      icon: <NotebookText className="h-8 w-8 text-teal-500" />,
      content: (
        <div className="space-y-4">
          <p>
            Сторінка <strong>&quot;Нотатки про партнера&quot;</strong> — це
            ваш приватний записник уподобань партнера (квіти, музика, розміри
            одягу, улюблена їжа тощо). Партнер їх{" "}
            <strong>не бачить</strong>, поки ви самі не покажете.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Якщо нотаток ще немає, натисніть{" "}
              <strong>&quot;Заповнити початкові дані&quot;</strong> — короткий
              опитувальник із десятками готових питань швидко створить перші
              нотатки; його можна перервати в будь-який момент і продовжити
              пізніше з того ж місця
            </li>
            <li>
              Або додайте нотатку вручну: заголовок, опис і довільні теги
            </li>
            <li>
              Пошук зверху шукає одразу за заголовком, описом і тегами
            </li>
            <li>
              Натисніть на іконку ока на картці, щоб показати саме цю
              нотатку партнеру, або скористайтесь кнопкою{" "}
              <strong>&quot;Показати всі партнеру&quot;</strong> зверху
            </li>
            <li>
              Якщо партнер показав вам хоча б одну свою нотатку, зверху
              зʼявиться кнопка{" "}
              <strong>&quot;Нотатки від партнера&quot;</strong>
            </li>
            <li>
              Якщо додано Gemini API ключ у профілі (див. крок{" "}
              <strong>&quot;AI-можливості&quot;</strong>), доступна кнопка{" "}
              <strong>&quot;AI-помічник&quot;</strong> — чат, що бачить усі
              ваші нотатки і швидко підказує ідеї подарунків чи побачень
            </li>
          </ol>
          <div className="p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
            <h4 className="font-medium text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Порада
            </h4>
            <p className="text-sm mt-1">
              Показуйте партнеру лише ті нотатки, які не зіпсують сюрприз —
              решта залишаються повністю приватними.
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
    <div className="container py-10 max-w-3xl mx-auto overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <BackButton text="Початок користування" />
      </div>
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
              <div className="bg-linear-to-br from-pink-100 to-indigo-100 dark:from-pink-900/30 dark:to-indigo-900/30 p-3 rounded-full">
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

          <div className="grow text-center self-center">
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
