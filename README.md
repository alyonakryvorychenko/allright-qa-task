# Allright QA Task — Quiz Booking E2E Test

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
- **Integrate AI to automatically determine the answer selection during quiz execution**: this will allow the    quiz to follow different paths on each run while keeping the automation code clean and avoiding excessive  hardcoded decision logic.
- **Verify data persistence in the admin panel**: cross-check that all values
  entered during the quiz (child's name, parent's name, phone, email, chosen
  answers) are saved correctly and without corruption on the user's record in
  the admin panel.
