correct flag is highlighted during active component. Flag filtering isn't working

make collapsible container border based on guesses even during review, adding borders based on correct answers. Will likely have to add a hook in useComponentState.

move to typescript
use a tsconfig.json file to tell the TypeScript to define the baseUrl and paths with '@'

Geojsons were pulled from https://github.com/nvkelso/natural-earth-vector/ on 2026/02/06 and modified to correct IS0_A3 codes for France (FRA) and Norway (NOR).

features/quiz/state/quizContext.js: Defines quiz state, provides reducer with non-react functions
features/quiz/state/quizProvider.jsx: Expose reducer in context
features/quiz/state/quizThunks.js: multi-step or async operations/dispatches on state
features/quiz/hooks/useQuizActions.js: Wraps dispatch in stable callbacks and adds UI/validation logic
