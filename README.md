# Part A — Approach

To build reliable automated coverage for this quiz, I would focus on validating the final business outcome rather than a fixed sequence of quiz steps. The primary goal of the test is to verify that, after completing the quiz, a user account is successfully created and a trial lesson is booked.

Deterministic tests should validate only the critical business logic that always has a predictable expected result:

- User account creation.
- Trial lesson booking.
- Correct API behavior.
- Navigation between pages.
- Form validation.
- Absence of critical JavaScript and API errors.

I would use AI only for areas where the logic changes frequently and hardcoding would make the tests difficult to maintain:

- Identifying the type of a new screen.
- Selecting an appropriate answer for new A/B test variations.
- Adapting to changes in the quiz structure.
- Recognizing new or modified question types and choosing the most appropriate action.

At the same time, I would not validate the exact order of quiz steps, question texts, or marketing content, since these elements frequently change as part of A/B testing and do not affect the core business outcome. Covering them would only make the tests brittle and increase maintenance costs.

The framework should dynamically determine both the page type and the total number of quiz steps instead of relying on hardcoded logic. Using the Page Object Model together with dedicated handlers for each page type would allow the automation to support new A/B variations with minimal code changes.

In the CI/CD pipeline, I would run the end-to-end test on every Pull Request to detect regressions as early as possible. In addition, I would schedule nightly runs to continuously validate different A/B variants and identify issues in the staging environment.

The main risks of this approach are unexpected UI changes, incorrect AI decisions when encountering completely new page types, and the accumulation of test data in the staging environment. To mitigate these risks, I would implement test monitoring, add fallback logic when AI cannot determine the page type, and regularly clean up test data (for example, by removing test users on a scheduled basis).

# Part B — Implementation

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
