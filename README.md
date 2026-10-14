# 4 Axis Compass

A local, exploratory 28–32-question assessment that scores four independent dimensions and plots two compasses. Built with React, TypeScript, and Vite. No account, backend, analytics, or network submission is used.

## Run in Visual Studio Code or Visual Studio

Open this folder in the IDE and use its terminal:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173/`). Node.js 20.19+ or 22.12+ is required by this Vite version. The project uses the included `package-lock.json` and npm.

## Checks

```sh
npm run typecheck
npm run lint
npm run test
npm run build
```

`npm run test` uses Node's test runner and Vite's TypeScript module loader. The build output is in `dist/`; `npm run preview` can serve it locally.

## How it works

- `src/data/questions.ts` contains 32 unchanged items and IDs: A1–A8, M1/M2/M4–M9, AU1–AU8, E1–E8. M3 is intentionally absent. A6, M9, AU6, and E6 are reserved as conditional tie-break questions. Each new session shuffles the 28 core IDs and the reserved IDs, then saves that order so progress and review stay consistent.
- `src/domain/` validates responses, calculates scores, classifies regions, and maps true coordinates to SVG. It has no React or browser storage dependency.
- `src/data/palette.ts` is the single source for the 16 archetype titles and their canonical solid colors. The result shows the archetype as its heading, with the color name and hex below it.
- `src/services/persistence.ts` validates a versioned localStorage session. The app keeps only the current session under `four-axis-compass:session:v1`. If storage is blocked or full, the assessment continues in memory and says that a refresh will not preserve progress.
- `src/features/` contains the assessment, result, and compass interfaces. Results are recalculated from current answers after edits.

Statements use four directional choices worth −2, −1, +1, or +2, with reverse coding where needed. Scenarios keep five choices, including a meaningful equal-weight midpoint worth 0. An axis score is `(sum of its seven core contributions / 14) × 100`, ranging from −100 to +100. Economic is Left (−) to Right (+); Authority is Libertarian (−) to Authoritarian (+); Moral Radius is Proximal (−) to Universal (+); Agency is Structure (−) to Individual (+).

**Tie policy:** An axis with a nonzero score uses that score's direction. If its score is zero, the app counts how many of its seven answers point toward each pole, ignoring scenario midpoints. If those counts also tie, it asks the reserved four-choice statement for that axis. The reserved answer selects the persona side but does not alter the seven-question score or plotted coordinate. Every completed assessment resolves to one of the 16 canonical colors; a plotted zero remains at the center. There is no dead zone or color intensity adjustment.

This is an exploratory description of these responses, not a validated diagnostic instrument. Scores are neither population percentiles nor confidence estimates. The locked working questionnaire is not presented as psychometrically validated.
