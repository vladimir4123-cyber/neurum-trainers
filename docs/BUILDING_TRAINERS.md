# Как собирать тренажёры Neurum — гайд для разработчика

Этот документ описывает, как устроены интерактивные тренажёры Neurum и как **добавить новый тренажёр**, чтобы он попал в единую систему: одинаковый вид, одинаковая механика уроков и практик, общие движки и стиль.

Читай сверху вниз, если делаешь первый тренажёр. Дальше держи под рукой раздел [«Чек-лист нового тренажёра»](#чек-лист-нового-тренажёра).

---

## 1. Что это за проект

Набор **статических HTML/CSS/JS** тренажёров по физике и математике для российской школы (5–11 класс, подготовка к ОГЭ). Без сборки, без фреймворков, без npm-зависимостей в рантайме. Открывается как обычные файлы, публикуется на GitHub Pages.

- Бренд — **Neuroom / Neurum**: светлая тема, шрифт **Aeonik Pro**, фиолетовый акцент `#6240FF`, белые карточки, мягкие тени.
- Язык интерфейса — **только русский**. Английский запрещён везде (кроме «XP» в геймификации). «В» вместо «V», «Н» вместо «N» и т.п.
- Каталог всех тренажёров — корневой `index.html` (карточки с фильтром по предмету).

### Технологии
- HTML + CSS (переменные-токены) + ES-модули (`<script type="module">`).
- 2D-графика — inline SVG и `<canvas>`.
- 3D-приборы — Three.js (только вольтметр, амперметр, динамометр), через CDN importmap.
- Прогресс — `localStorage` (сейчас **временно отключён**, см. §9).

---

## 2. Структура репозитория

```
/
├── index.html                 ← каталог всех тренажёров (карточки + фильтр)
├── assets/
│   ├── tokens.css             ← дизайн-токены: цвета, шрифты, радиусы, тени
│   ├── images/
│   │   ├── trainers/          ← hero-картинки тренажёров для каталога (png)
│   │   └── voltmeter/         ← (устаревшее) старые png карточек вольтметра
│   └── lesson/                ← ★ ОБЩИЕ ДВИЖКИ (не дублировать в тренажёрах!)
│       ├── lesson-engine.js   ← движок УРОКА  (runLesson)
│       ├── lesson.css         ← стили уроков
│       ├── practice-engine.js ← движок ПРАКТИКИ (runPractice)
│       ├── practice.css       ← стили практик
│       └── voltmeter-parts.js ← общие SVG-детали (батарейка, лампа, провода)
│
├── voltmeter/                 ← ЭТАЛОННЫЙ тренажёр (по нему сверяться)
│   ├── index.html             ← 3D-прибор (Three.js) + редирект на demo/
│   ├── demo/index.html        ← ХАБ для учителя (hero + карточки тем и практик)
│   ├── lesson-voltage/        ← тема 1  (index.html)
│   ├── lesson-device/         ← тема 2
│   ├── lesson-price/          ← тема 3
│   ├── lesson-reading/        ← тема 4
│   ├── practice-quiz/         ← практика
│   ├── practice-garland/      ← практика
│   └── practice-battery/      ← практика
│
├── electrostatics/            ← эталон «истории» (немагазинный прибор)
│   ├── index.html             ← редирект на demo/
│   ├── legacy.html            ← старый монолит (архив, не используется)
│   ├── demo/                  ← хаб
│   ├── lesson-charge/  lesson-forces/  lesson-induction/
│   └── practice-detective/  practice-life/
│
├── sound/  melting/  magnetism/         ← тренажёры-«истории» (та же схема)
├── ampermeter/  dynamometer/            ← приборы с 3D (device/ + ammeter.js/dyno-parts.js)
├── fraction-pizza/  math-dungeon/  trig-circle/   ← математика (одиночные игры)
└── docs/BUILDING_TRAINERS.md   ← этот файл
```

### Ключевой принцип: **тренажёр = тонкие файлы над общими движками**
Логика урока и практики живёт в `assets/lesson/*.js`. Страница урока/практики — это в основном **данные** (шаги, вопросы, иллюстрации) + вызов движка. Не копируй логику движка в тренажёр.

---

## 3. Анатомия тренажёра

Каждый тренажёр (кроме чисто-игровой математики) состоит из трёх слоёв:

| Слой | Папка | На чём | Что делает |
|---|---|---|---|
| **Хаб** | `<trainer>/demo/` | своя вёрстка (копия с эталона) | Витрина для учителя: hero, кнопка «Провести урок», карточки тем и практик, «Поделиться» |
| **Темы** | `<trainer>/lesson-*/` | `runLesson` (lesson-engine) | Пошаговая теория: заголовок → текст → иллюстрация → вопрос |
| **Практики** | `<trainer>/practice-*/` | `runPractice` (practice-engine) | Задания с уровнями сложности, рандомизацией, вводом ответа, финалом со звёздами |

Плюс два служебных файла в корне тренажёра:
- `index.html` — **редирект** на `demo/` (или, если есть 3D-прибор — сам прибор с редиректом, см. §7).
- `legacy.html` — архив старой версии (если тренажёр конвертировали). Не подключается, но пусть лежит.

---

## 4. Дизайн-система (обязательно)

Все токены — в `assets/tokens.css`. **Подключай его первой строкой** и пользуйся переменными, не хардкодь цвета.

```html
<link rel="stylesheet" href="/assets/tokens.css">
```

### Палитра
| Токен | Значение | Где |
|---|---|---|
| `--purple-1` | `#6240FF` | главный акцент, кнопка «Дальше», активные состояния |
| `--purple-2` | темнее | hover primary-кнопки |
| `--purple-4` | `#EEF0FF` | светлые подложки, чипы |
| `--fg-1` | `#232323` (Black1) | основной текст, значения |
| `--fg-2` | Black2 | вторичный текст |
| `--fg-3` | Black3 | подписи, лейблы |
| `--white` | `#FFFFFF` | фон, карточки |
| `--success` | зелёный | «верно», XP |
| `--danger` | красный | «неверно» |
| `--radius-md / -xl / -2xl` | 10 / 16 / 24px | скругления |
| `--font-display` / `--font-sans` | Aeonik Pro | заголовки / текст |
| `--ease-standard` | `cubic-bezier(.2,.7,.2,1)` | переходы |
| `--shadow-purple` | — | тень фиолетовой кнопки |

### Правила стиля (скилл `make-interfaces-feel-better`)
- **Тени вместо бордеров.** Глубину дают слоёные полупрозрачные `box-shadow`, а не рамки.
- **Скругления концентрические:** внешний радиус = внутренний + паддинг.
- **`font-variant-numeric: tabular-nums`** на всех меняющихся числах (счёт, XP, показания).
- **`text-wrap: balance`** на заголовках, **`pretty`** на тексте.
- **`scale(0.96)` на нажатии** кнопок (никогда меньше 0.95).
- **Никогда `transition: all`** — только конкретные свойства.
- **Кнопки в интерфейсе:** фиолетовая `#6240FF` — ТОЛЬКО «Дальше»/главное действие. Кнопки внутри шага (действия, «сначала») — **чёрные или белые**.
- **`-webkit-font-smoothing: antialiased`** на body.

---

## 5. Тема урока — движок `runLesson`

### Скелет страницы `<trainer>/lesson-xxx/index.html`
```html
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate">
<title>Название темы · Тренажёр</title>
<link rel="stylesheet" href="/assets/tokens.css">
<link rel="stylesheet" href="/assets/lesson/lesson.css?v=3">
<style>
  /* локальные стили визуалов этого урока */
  .step-visual{ flex-direction: column; }   /* если визуал = панель + подпись + кнопки */
  .canvas-panel{ width:100%; max-width:560px; margin:0 auto; border-radius:var(--radius-xl);
    background:linear-gradient(160deg,#F6F3FF,#EEF0FF); padding:10px; }
  .canvas-panel canvas{ width:100%; display:block; }
  .canvas-hint{ margin:14px 0 0; text-align:center; font-size:17px; color:var(--fg-2); text-wrap:pretty; }
</style>
</head>
<body>
  <div class="top">
    <a class="close-btn" href="../demo/" aria-label="Закрыть">✕</a>
    <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
    <span class="step-counter"><span id="stepNow">1</span> / <span id="stepTotal">1</span></span>
  </div>
  <main id="stepHost"></main>
  <div class="feedback" id="feedback">
    <div class="fb-icon" id="fbIcon">✓</div>
    <div class="fb-body"><p class="fb-title" id="fbTitle"></p><p class="fb-hint" id="fbHint"></p></div>
  </div>
  <div class="bottom">
    <button class="btn-back" id="backBtn" hidden>← Назад</button>
    <button class="btn-continue" id="continueBtn" disabled>Дальше</button>
  </div>

  <script type="module">
    import { runLesson } from '/assets/lesson/lesson-engine.js?v=4';
    /* … данные шагов, визуалы, интерактивы … */
    runLesson({ lessonId, storageKey, homeHref, nextHref, steps, visuals, onInteract });
  </script>
</body>
</html>
```

### API `runLesson(cfg)`
| Поле | Что |
|---|---|
| `lessonId` | id темы для localStorage (напр. `'voltage'`) |
| `storageKey` | ключ прогресса тренажёра (напр. `'voltmeter-progress'`) |
| `homeHref` | куда ведёт «К темам» (`'../demo/'`) |
| `nextHref` | следующая тема — куда ведёт «Следующая тема →». Если нет → это последняя тема |
| `steps` | массив шагов (см. ниже) |
| `visuals` | `{ имя: () => '<svg…>' }` — функции, возвращающие разметку иллюстрации шага |
| `onInteract` | `(step, ctx) => {}` для шагов `type:'interact'`; `ctx = { done, root, mascot }` |

### Типы шагов
```js
// Порядок вывода движком: ЗАГОЛОВОК → ТЕКСТ → ИЛЛЮСТРАЦИЯ → (варианты). Кнопка внизу.
const steps = [
  // теория с картинкой
  { phase:'theory', type:'info', visual:'amber', big:true,
    title:'Это статическое электричество',
    text:'Невидимая сила … <b>жирным — акцент</b>.' },

  // интерактив (canvas/svg, логика в onInteract). «Дальше» активна ВСЕГДА.
  { phase:'theory', type:'interact', id:'rub', visual:'rub',
    title:'Заряды: два вида',
    text:'Потри шарик о свитер …' },

  // разделитель фазы (полноэкранный)
  { phase:'check', type:'splash', title:'Проверь себя', text:'Один вопрос — и тема твоя.' },

  // вопрос
  { phase:'check', type:'question',
    title:'Вопрос',
    text:'Шарик потёрли о волосы …',
    options:[
      { id:'a', text:'…', correct:false },
      { id:'b', text:'…', correct:true },
      { id:'c', text:'…', correct:false },
    ],
    right:'Пояснение при верном ответе.',
    wrong:'Пояснение при ошибке.' },
];
```

- `big: true` на шаге `type:'info'` → иллюстрация становится **гигантской** (класс `.step-visual--big`). Чередуй: обычный интерактив → гигантский info → обычный → гигантский. Ритм.
- `visual` ссылается на ключ в `visuals`. Для интерактива `visuals.rub` возвращает контейнер с `<canvas>`, а логику пишешь в `onInteract`.
- В `onInteract` вызывай `ctx.done()` когда ученик выполнил действие (для совместимости; кнопка «Дальше» и так активна всегда).

### Структура урока (педагогика)
Линейно 4 фазы: **теория → splash «Проверь себя» → вопросы → финал**. Каждый шаг теории должен быть интерактивным или с живой иллюстрацией. «Проверь себя» (внутри урока) ≠ «Практика» (отдельная страница).

---

## 6. Практика — движок `runPractice`

Практика ≠ тест. Формула настоящей практики:
> **сам действуешь прибором → сам считываешь показания → сам делаешь вывод**, с **рандомизацией** (второй заход ≠ первый) и **тремя уровнями сложности**.

Идеально — воспроизводит реальную **лабораторную из учебника** (Пёрышкин), а не выдуманную задачу.

### Скелет `<trainer>/practice-xxx/index.html`
```html
<link rel="stylesheet" href="/assets/tokens.css">
<link rel="stylesheet" href="/assets/lesson/lesson.css?v=3">
<link rel="stylesheet" href="/assets/lesson/practice.css?v=4">
…
<div class="top">
  <a class="close-btn" href="../demo/">✕</a>
  <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
  <span class="step-counter"><span id="stepNow">1</span> / <span id="stepTotal">4</span></span>
</div>
<main id="stage"></main>
<div class="bottom" id="bottom"></div>
<script type="module">
  import { runPractice } from '/assets/lesson/practice-engine.js?v=4';
  runPractice({ practiceId, storageKey, homeHref, title, subtitle, levels, buildSteps });
</script>
```

### API `runPractice(cfg)`
| Поле | Что |
|---|---|
| `practiceId` | id для localStorage |
| `storageKey` | ключ прогресса тренажёра |
| `homeHref` | «К темам» |
| `title` / `subtitle` | заголовок и завязка на экране выбора уровня и в финале |
| `levels` | `{ easy:{label,desc,xp}, medium:{…}, hard:{…} }` — три уровня, выбор перед стартом |
| `buildSteps(levelKey, rnd)` | **вызывается заново на каждый старт** и на «Пройти ещё раз» → возвращает массив шагов. `rnd = Math.random`. Здесь рандомизация и рамп сложности по уровню |

### Типы шагов практики
```js
// сам действуешь: своя интерактивная сцена
{ type:'action', title, text, render(host, ctx){ /* ctx.done() открывает «Дальше», ctx.miss(), ctx.fb(html,'ok'|'err'|'hint') */ } }

// сам считываешь и вписываешь число (движок сам проверяет с допуском и ведёт подсказки)
{ type:'reading', title, text, render(host, ctx){…}, answer, tolerance, unit:'В', hints:[…], right }

// сам делаешь вывод: выбор из вариантов (движок перемешивает)
{ type:'choice', title, text, render?(host,ctx),
  options:[ { text, correct }, … ],   // ★ ВСЕГДА 4 варианта, ровно один correct:true
  right, wrong }
```

**Раскладка `choice`-шага:** сцена/иконка → «Задача N из M» мелким надзаголовком (`.p-kicker`) → сам вопрос крупным (`.p-title`) → варианты. Обратная связь — плашка **✓ Верно! / ✕ Неверно** над объяснением (делает движок).

**Финал:** 3 звезды с анимацией заполнения (3 — без ошибок, 2 — до двух, 1 — дальше) + карточки статов (уровень, XP, ошибки). Всё рисует движок.

### Обязательные правила практик
1. **Всегда ровно 4 варианта** в `choice` (ровно один `correct:true`). Исключение — игровые раунды с бинарным выбором (тип «какой полюс N / +/−/нельзя определить»), где варианты завязаны на механику сцены.
2. **Рандомизация:** все числа/сценарии генерируй в `buildSteps` через `rnd`, чтобы повтор был другим.
3. **Три уровня** с разным XP; сложность растёт: easy — круглые значения и подсказки; hard — ловушки, строже допуск, обратные задачи.

---

## 7. Хаб тренажёра (`demo/`)

Копируй с `voltmeter/demo/index.html` или `electrostatics/demo/index.html`. Внутри:
- **Sticky topbar:** ссылка «← Все тренажёры» (`href="../../"`), кнопка «Поделиться с учениками» (копирует ссылку / системный share).
- **Hero (во всю ширину):** превью прибора/иллюстрация + заголовок + описание для учителя + мета-строка (`N тем · живой прибор · M практик`) + кнопка **«Провести урок»** (ведёт в первую тему). Если есть 3D-прибор — ещё кнопка **«Показать прибор»**.
- **Секция «Темы урока»:** карточки тем (`.topic`) с анимированными inline-SVG иллюстрациями.
- **Секция «Практика для учеников»:** карточки практик (`.practice`).

Данные тем/практик — массивы `TOPICS` и `PRACTICES` в конце файла; карточки рендерятся из них. Иллюстрации карточек — inline-SVG в объекте `ILLUS` (см. эталон вольтметра/амперметра): плоские, светлые, **анимированные** (`<animate>`, `<animateTransform>`, `<animateMotion>`).

### 3D-приборы (только вольтметр, амперметр, динамометр)
Настоящий Three.js-прибор лежит в `<trainer>/index.html` (вольтметр) или `<trainer>/device/index.html` (амперметр, динамометр). Встраивается:
- **В hero-превью:** `<iframe src="../device/?embed=1">` — крутится сам (autoRotate).
- **По кнопке «Показать прибор»:** `<iframe src="../device/?embed=1&back=1&panel=1">` — прибор слева + светлая панель настроек справа + крестик закрытия.

Флаги в устройстве: `?embed=1` прячет весь чром и оставляет только canvas; `?back` добавляет крестик; `?panel=1` строит правую панель, кнопки/слайдеры которой «стреляют» событиями по родным (скрытым) регуляторам прибора. **3D-амперметра/динамометра нет смысла делать с нуля** — они уже есть; для нового прибора-со-стрелкой можно клонировать вольтметр и перекрасить шкалу.

---

## 8. Иллюстрации — стиль (важно)

Объяснительные иллюстрации внутри уроков (заряды, молекулы, графики, приборы-схемы) рисуем в **плоском стиле**:

- **Плоские сплошные заливки.** НИКАКИХ `createRadialGradient`, НИКАКОГО `shadowBlur`-глоу (исключение — короткая искра-разряд как акцент).
- **БЕЗ жирного чёрного контура.** Края фигур — тонкие (1.5–2.5px), того же цвета, но темнее. Хелперы (копируй из `electrostatics/lesson-charge/index.html`):
  ```js
  const tint = (hex,t)=>{…};   // мешает к белому (светлее)
  const shade = (hex,t)=>{…};  // мешает к чёрному (темнее) — для краёв и знаков
  ```
  Знаки/буквы внутри фигур — `shade(color, .4….55)`, не чёрные.
- **Зерно/шум** поверх иллюстраций уже включено глобально в `lesson.css` (`.step-visual::after`, feTurbulence, opacity .05) — оживляет плоскость. Ничего делать не нужно.
- **Единый шрифт** для подписей на canvas — `var(--font-display), sans-serif` (не `-apple-system`/`system-ui`); НЕ капай размеры (`Math.min(20,…)` даёт ~10px — мелко), ставь `Math.round(w*0.036…0.042)`; для центрирования текста в SVG используй `dominant-baseline="central"` (не ручной сдвиг `y+5.5` — «плывёт» при смене шрифта).
- **Всё крупно, читается «с задней парты».** Один крупный объект, много воздуха.
- **Всегда анимированные.** Никакого английского и брендинга внутри картинок.
- Палитра: `+`красный `#E5484D`, `−`синий `#2F80ED`, акцент `#6240FF`, нейтрали текста `#6B7180`, конструкции `#C9CEDA`.

Реалистичные 3D-батарейка/лампа/приборы в вольтметре — **отдельный слой** (намеренно объёмные, `assets/lesson/voltmeter-parts.js`), их плоскими НЕ делаем.

---

## 9. Соглашения и грабли

- **Кэш ES-модулей и CSS.** Браузер держит старые версии даже при `no-store`. При правке ОБЩИХ файлов — бампай версию в `?v=N` во ВСЕХ страницах, что их подключают. Текущие версии: `lesson.css?v=3`, `lesson-engine.js?v=4`, `practice-engine.js?v=4`, `practice.css?v=4`. (Пример замены: `grep -rl 'lesson-engine.js?v=4' --include=index.html . | xargs perl -pi -e 's/v=4/v=5/'`.)
- **`.step-visual` в lesson.css — flex-row.** Если визуал шага = панель + подпись + кнопки в столбик, добавь на странице `.step-visual{ flex-direction: column; }`.
- **rAF-циклы canvas глуши** через `if (!canvas.isConnected) return;` — шаги пересоздают DOM, иначе утечка.
- **`<meta http-equiv="Cache-Control" content="no-store…">`** на каждой странице.
- **Редирект + legacy.** Конвертируешь старый монолит: `git mv старое.html legacy.html`, новый `index.html` = редирект (`<script>location.replace('demo/')</script>` + `<meta refresh>`).
- **localStorage-прогресс временно отключён** (сбрасывается при обновлении). В движках блок `saveProgress` закомментирован (`⏸`). Чтобы вернуть — раскомментировать в `lesson-engine.js` и `practice-engine.js`.
- **Уровни в каталоге временно разблокированы** (иконка-замок осталась, но кликаются).
- **Русский, tabular-nums, tokens.css** — не забывай на каждой странице.

---

## 10. Как проверять

- **Синтаксис** без браузера: извлеки inline-JS и прогони Node:
  ```bash
  awk '/<script type="module">/{f=1;next} /<\/script>/{f=0} f' path/index.html > /tmp/x.mjs
  node --check /tmp/x.mjs
  ```
- **Глазами** — локальный сервер (в проекте есть; открывать `http://localhost:PORT/<trainer>/demo/`), жёсткий рефреш `Cmd+Shift+R` (кэш!).
- **Математика в практиках** — перепроверяй, что `correct`/`answer` совпадают с реальной арифметикой (особенно рандомные генераторы).

---

## Чек-лист нового тренажёра

Пример: делаем тренажёр `pressure` (давление).

1. **Каталог.** В корневом `index.html` добавь карточку в массив `TRAINERS` (название, предмет, класс, hero-картинка `assets/images/trainers/pressure.png`, ссылка `pressure/demo/`).
2. **Хаб.** `pressure/demo/index.html` — копия с эталона; заполни `TOPICS`, `PRACTICES`, `ILLUS` (анимированные SVG), тексты для учителя, hero.
3. **Редирект.** `pressure/index.html` → редирект на `demo/`.
4. **Темы.** `pressure/lesson-*/index.html` — по скелету §5. Данные шагов, визуалы (плоский стиль §8), интерактивы. Цепочка через `nextHref`, у последней — без него. `storageKey:'pressure-progress'`. Импорт `lesson-engine.js?v=4`.
5. **Практики.** `pressure/practice-*/index.html` — по скелету §6. Три уровня, рандомизация в `buildSteps`, ровно 4 варианта в `choice`, рамп сложности. Импорт `practice-engine.js?v=4`, `practice.css?v=4`.
6. **Проверка.** `node --check` каждой страницы; открыть глазами; сверить математику.
7. **Единый вид?** Пройдись по §4 (токены), §8 (иллюстрации), §9 (соглашения). Нет английского, нет градиентов/глоу в схемах, кнопка «Дальше» фиолетовая, остальные — чёрные/белые.

> Не изобретай новую структуру. Бери ближайший эталон: **«история» без прибора** → `electrostatics/`; **прибор со шкалой** → `ampermeter/` / `voltmeter/`; **математическая игра** → `fraction-pizza/` (с рампом сложности внутри прохождения).
