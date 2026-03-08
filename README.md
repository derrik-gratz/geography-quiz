Profile page:
User icon
Name, possibly some level or 'member since' etc.

three cards:
Daily challenge streak | avg daily challenge skill score | learning rate coverage (% > 60 days)

Profile page rows don't flex at same rate

```
.profile-page__content-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
}

.profile-page__content-row > * {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 768px) {
  .profile-page__content-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .profile-page__content-row > * {
    flex: 0 0 auto;
  }
}
```

Badges

Score timeline

Interactive map

Todo:

Settings page (nav bar)

Global stats page (nav bar)

Sandbox mode (globe icon, nav bar)

Learning mode currently allows two guesses?

Move from css vars to theme vars inside component css

make collapsible container border based on guesses even during review, adding borders based on correct answers. Will likely have to add a hook in useComponentState.

move to typescript
use a tsconfig.json file to tell the TypeScript to define the baseUrl and paths with '@'

Geojsons were pulled from https://github.com/nvkelso/natural-earth-vector/ on 2026/02/06 and modified to correct IS0_A3 codes for France (FRA) and Norway (NOR).

features/quiz/state/quizContext.js: Defines quiz state, provides reducer with non-react functions
features/quiz/state/quizProvider.jsx: Expose reducer in context
features/quiz/state/quizThunks.js: multi-step or async operations/dispatches on state
features/quiz/hooks/useQuizActions.js: Wraps dispatch in stable callbacks and adds UI/validation logic
