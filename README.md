Todo:

move from collapsible container to accordion

Settings page (nav bar)

Badges

Global stats page (nav bar)

Sandbox mode (globe icon, nav bar)

Learning mode currently allows two guesses?

Move from css vars to theme vars inside component css

make collapsible container border based on guesses even during review, adding borders based on correct answers. Will likely have to add a hook in useComponentState.

user preferences/settings
Review timeout
Flag size
colorblind mode

move to typescript
use a tsconfig.json file to tell the TypeScript to define the baseUrl and paths with '@'

Geojsons were pulled from https://github.com/nvkelso/natural-earth-vector/ on 2026/02/06 and modified to correct IS0_A3 codes for France (FRA) and Norway (NOR).

features/quiz/state/quizContext.js: Defines quiz state, provides reducer with non-react functions
features/quiz/state/quizProvider.jsx: Expose reducer in context
features/quiz/state/quizThunks.js: multi-step or async operations/dispatches on state
features/quiz/hooks/useQuizActions.js: Wraps dispatch in stable callbacks and adds UI/validation logic
