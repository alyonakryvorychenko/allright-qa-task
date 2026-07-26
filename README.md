# Allright QA Task — Quiz Booking E2E Test

Playwright (TypeScript) end-to-end тест, який проходить квіз реєстрації на
`https://stage.allright.com/uk/app/sign-up/long/charlie/age-range` від початку
до кінця та перевіряє, що користувача успішно доведено до бронювання пробного
уроку (сторінка dashboard або A/B-варіант `request-gotten`).

Папка `tests/old-code/` містить початкову JS-версію тесту і в аналіз/рефакторинг
не входить.

## Структура проекту

```
tests/
  quiz-booking.spec.ts        # сам тест
  helpers/
    QuizDriver.ts              # оркестратор проходження квізу (визначає тип кроку і викликає потрібний page object)
    test-data.ts               # генерація тестового email/телефону
  pages/                       # Page Object'и для окремих екранів квізу
    CookieBanner.page.ts
    QuizChoiceSteps.page.ts     # кроки з вибором варіанту (stack/info/image/hobby)
    QuizInputSteps.page.ts      # кроки з текстовим вводом (ім'я, телефон, email)
    LessonBookingSteps.page.ts  # вибір часу уроку
    DashboardPage.page.ts       # фінальна сторінка (dashboard / request-gotten)
```

## Встановлення

```bash
npm install
```

(`postinstall` сам підтягує Chromium для Playwright.)

## Запуск тестів

```bash
npm test                 # прогнати всі тести (headed, chromium — див. playwright.config.js)
npm run test:report      # відкрити останній HTML-звіт
npm run typecheck        # перевірити типи без запуску тестів
```

Запустити конкретний файл або тест:

```bash
npx playwright test tests/quiz-booking.spec.ts
npx playwright test -g "Quiz completion creates user"
```

Тести не паралеляться (`fullyParallel: false`, `workers: 1`) і йдуть у headed-режимі —
це налаштовано в `playwright.config.js`.

## Що б зробив далі за наявності більше часу

- **Перевірка на боці адмінки**: після проходження квізу заходити в адмін-панель,
  знаходити користувача за тестовим email/телефоном і перевіряти, що він
  доданий до бази і для нього створено час пробного дзвінка/уроку.
- **Очищення даних після тесту**: у хуці `afterEach`/`afterAll` видаляти
  щойно створеного тестового користувача з бази через адмінку (або
  адмін API), щоб тести не засмічували продакшн/стейдж базу даних.
- **Валідація номера телефона**: перевірити, що поле не приймає порожнє
  значення, не приймає літери, і що кількість символів відповідає формату,
  очікуваному для обраної країни.
- **Валідація email**: перевірити коректність формату email (базові невалідні
  кейси — без `@`, без домену тощо).
- **Перевірка на дублікати**: переконатись, що для email/телефону, які вже
  зареєстровані в системі, квіз коректно обробляє цю ситуацію (повідомлення
  про помилку/інша поведінка), а не мовчки створює дубль.
- **Покриття альтернативних гілок квізу**: зараз тест завжди обирає перший
  варіант відповіді (`stackFirstAnswer.first()` у `QuizChoiceSteps`), включно з
  роллю "я не батько, а дитина". Варто параметризувати `QuizDriver`/тест, щоб
  прогонятись і по інших варіантах вибору, а не лише по "щасливому шляху".
- **Перевірка збереження даних в адмінці**: звірити, що всі введені під час
  квізу значення (ім'я дитини, ім'я батьків, телефон, email, обрані відповіді)
  коректно та без спотворень збереглися в картці користувача в адмін-панелі.

---

# English version

Playwright (TypeScript) end-to-end test that walks through the sign-up quiz at
`https://stage.allright.com/uk/app/sign-up/long/charlie/age-range` from start
to finish and verifies the user is successfully taken to booking a trial
lesson (either the dashboard page or the `request-gotten` A/B variant).

## Project structure

```
tests/
  quiz-booking.spec.ts        # the test itself
  helpers/
    QuizDriver.ts              # quiz-flow orchestrator (detects the current step type and calls the right page object)
    test-data.ts               # generates test email/phone data
  pages/                       # Page Objects for individual quiz screens
    CookieBanner.page.ts
    QuizChoiceSteps.page.ts     # choice-based steps (stack/info/image/hobby)
    QuizInputSteps.page.ts      # text-input steps (name, phone, email)
    LessonBookingSteps.page.ts  # lesson time selection
    DashboardPage.page.ts       # final page (dashboard / request-gotten)
```

## Installation

```bash
npm install
```

(`postinstall` automatically installs Chromium for Playwright.)

## Running the tests

```bash
npm test                 # run all tests (headed, chromium — see playwright.config.js)
npm run test:report      # open the latest HTML report
npm run typecheck        # type-check without running tests
```

Run a specific file or test:

```bash
npx playwright test tests/quiz-booking.spec.ts
npx playwright test -g "Quiz completion creates user"
```

Tests are not parallelized (`fullyParallel: false`, `workers: 1`) and run in
headed mode — configured in `playwright.config.js`.

## What I'd do next given more time

- **Admin-side verification**: after completing the quiz, log into the admin
  panel, find the user by their test email/phone, and verify they were added
  to the database with a trial call/lesson time slot created for them.
- **Data cleanup after each test**: in an `afterEach`/`afterAll` hook, delete
  the freshly created test user from the database via the admin panel (or an
  admin API), so tests don't clutter the staging/production database.
- **Phone number validation**: verify the field rejects empty values and
  letters, and that the character count matches the format expected for the
  selected country.
- **Email validation**: verify basic invalid-format cases are rejected (no
  `@`, no domain, etc.).
- **Duplicate check**: confirm that quizzes started with an email/phone that's
  already registered are handled correctly (an error message or other defined
  behavior), instead of silently creating a duplicate.
- **Coverage of alternative quiz branches**: the test currently always picks
  the first answer option (`stackFirstAnswer.first()` in `QuizChoiceSteps`),
  including always choosing the "parent" role rather than "child". The
  `QuizDriver`/test should be parameterized to also run through other answer
  choices, not just the happy path.
- **Verify data persistence in the admin panel**: cross-check that all values
  entered during the quiz (child's name, parent's name, phone, email, chosen
  answers) are saved correctly and without corruption on the user's record in
  the admin panel.
