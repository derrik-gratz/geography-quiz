<!-- 3be9ac69-3ac6-402c-8ccc-41810774168b 6d58714d-bb0a-47b8-b540-b8edb064bb84 -->
# Geography Quiz Full Rebuild Plan

## Overview

Complete rebuild of the geography quiz application from scratch with elegant, learning-friendly architecture. Focus on clean data flow, centralized state management, and preparation for future dynamic server migration. All existing functionality will be preserved.

## Design Principles

**Core Philosophy:**

- **Pass data down, don't re-query** - Components receive complete data objects, never query country data themselves
- **Single source of truth** - All state lives in one place (React Context)
- **Separation of concerns** - Services handle logic, Context handles state, Components handle presentation
- **Learning-friendly** - Use standard React patterns, avoid over-engineering
- **Future-ready** - Structure data and services for easy API migration later

**Key Improvements:**

- Eliminate prop drilling - use Context for shared state
- Pass complete prompt objects (not just country codes) to avoid re-querying
- Centralize all quiz logic in services
- Clean component boundaries - presentational components only
- Normalized data structures ready for database

## Phase 1: Foundation - Services Layer

**Goal:** Create pure service functions that handle all business logic and data operations.

**Files to Create:**

- `src/services/sessionService.js` - Generate session IDs, track metadata
- `src/services/quizDataService.js` - Persist quiz state (localStorage now, API-ready interface)
- `src/services/analyticsService.js` - Log events (localStorage now, API-ready interface)
- `src/services/quizEngineService.js` - Pure functions for prompt generation, answer validation
- `src/services/countryDataService.js` - Refactor existing service to be pure functions
- `src/services/statsService.js` - Calculate statistics from progress data

**Key Design Decisions:**

- All services are pure functions or classes with no React dependencies
- Async interfaces even for localStorage (prepares for API swap)
- Normalized data structures: `{ sessionId, timestamp, countryCode, promptType, answerType, correct, attempts }`
- Services can be tested independently
- No side effects except explicit persistence calls

**Example Structure:**

```javascript
// quizEngineService.js - Pure functions
export function generatePrompt(countryData, currentIndex) { ... }
export function validateAnswer(prompt, userAnswer, answerType) { ... }
export function calculateCompletion(answers, requiredTypes) { ... }

// quizDataService.js - Persistence layer
export async function saveProgress(sessionId, progressData) { ... }
export async function loadProgress(sessionId) { ... }
```

**Dependencies:** None (can build in isolation)

## Phase 2: Centralized State with React Context

**Goal:** Create single source of truth for all quiz state using React Context API.

**Files to Create:**

- `src/contexts/QuizContext.jsx` - Main context provider with all quiz state
- `src/hooks/useQuiz.js` - Custom hook wrapper for easier context access

**State Structure:**

```javascript
{
  // Configuration
  quizSet: string,
  selectedPromptTypes: string[],
  
  // Current quiz state
  currentPrompt: { countryCode, promptType, countryData, ... } | null,
  currentAnswers: { map?: string, text?: string, flag?: string },
  currentAttempts: { map: number, text: number, flag: number },
  
  // History
  promptHistory: Array<{ countryCode, promptType, completionStatus, ... }>,
  
  // Status
  isQuizFinished: boolean,
  totalCountries: number,
  
  // Actions
  setQuizSet: (set: string) => void,
  setSelectedPromptTypes: (types: string[]) => void,
  generatePrompt: () => void,
  submitAnswer: (type: string, value: any) => void,
  resetQuiz: () => void,
  // ... etc
}
```

**Key Design Decisions:**

- Context holds ALL quiz state (no scattered useState)
- Actions are methods in context value (not separate functions)
- Derived state computed in context (e.g., `isComplete`, `requiredAnswerTypes`)
- Context provider handles all state updates
- Components consume via `useQuiz()` hook

**Dependencies:** Phase 1 (services layer for logic)

## Phase 3: Rebuild Core Components

**Goal:** Build clean, presentational components that read from context and dispatch actions.

**Files to Create (rebuild from scratch):**

- `src/components/QuizApp.jsx` - Main app container (replaces App.jsx)
- `src/components/QuizConfig.jsx` - Configuration UI (reads/writes to context)
- `src/components/QuizPrompt.jsx` - Prompt display (receives full prompt object)
- `src/components/QuizLog.jsx` - Progress log (reads history from context)
- `src/components/TextInput.jsx` - Text input component
- `src/components/FlagSelect.jsx` - Flag selection component
- `src/components/WorldMap.jsx` - Map component

**Key Design Decisions:**

- Components receive complete data objects (e.g., `currentPrompt.countryData`, not just `countryCode`)
- No prop drilling - components use `useQuiz()` hook
- Presentational focus - components don't contain business logic
- Clear prop interfaces - components declare exactly what they need
- Reusable where possible - components are self-contained

**Example Pattern:**

```javascript
// Component receives full data, never queries
function QuizPrompt() {
  const { currentPrompt, generatePrompt } = useQuiz();
  
  // currentPrompt already has countryData, no need to query
  if (!currentPrompt) return <EmptyState />;
  
  return <div>{currentPrompt.countryData.country}</div>;
}
```

**Dependencies:** Phase 2 (context must exist)

## Phase 4: Integrate Services with Context

**Goal:** Connect services to context for persistence and analytics.

**Files to Modify:**

- `src/contexts/QuizContext.jsx` - Add service calls to state updates
- Auto-save progress on state changes
- Log analytics events on user actions
- Initialize session on mount

**Key Design Decisions:**

- Context provider calls services when state changes
- Auto-save progress (don't wait for explicit save)
- Log all significant events (answer submission, quiz completion, etc.)
- Handle localStorage errors gracefully
- Session initialized once on app mount

**Integration Points:**

- `generatePrompt()` → log 'prompt_generated' event
- `submitAnswer()` → log 'answer_submitted' event, save progress
- `resetQuiz()` → log 'quiz_reset' event
- Quiz completion → log 'quiz_completed' event, save final progress

**Dependencies:** Phase 3 (components), Phase 1 (services)

## Phase 5: Statistics and Data Display

**Goal:** Add statistics calculation and display using centralized data.

**Files to Create:**

- `src/components/StatsPanel.jsx` (optional) - Statistics display component
- Enhance `src/services/statsService.js` with full calculation logic

**Files to Modify:**

- `src/components/QuizLog.jsx` - Use statsService for calculations
- Add statistics to context if needed for display

**Key Design Decisions:**

- Statistics computed from `promptHistory` in context
- Same calculation logic works client-side now, server-side later
- Statistics available through context or computed on-demand
- Display stats in QuizLog or separate component

**Dependencies:** Phase 4 (integrated services)

## Phase 6: Polish and Optimization

**Goal:** Optimize performance, ensure consistency, clean up code.

**Files to Review:**

- Add React.memo to components that don't need frequent re-renders
- Optimize context value to prevent unnecessary re-renders (use useMemo)
- Review all components for unused code
- Ensure consistent code style
- Add error boundaries if needed

**Key Design Decisions:**

- Use `useMemo` for context value to prevent re-renders
- Memoize expensive computations (stats, filtered data)
- Keep components focused and small
- Document component interfaces

**Dependencies:** All previous phases

## Phase 7: Future-Proofing for API Migration

**Goal:** Add abstraction layer for easy migration to dynamic server.

**Files to Create:**

- `src/services/apiClient.js` - API client with same interface as localStorage services
- `src/services/migrationService.js` - Utility to migrate localStorage data to server

**Files to Modify:**

- Update services to support both `local` and `remote` modes
- Add configuration for API endpoint (defaults to localStorage)

**Key Design Decisions:**

- API client methods match localStorage service methods
- Easy to swap: change one config value
- Migration utility exports localStorage data in API format
- Document API contract for future backend

**Example:**

```javascript
// quizDataService.js
const MODE = import.meta.env.VITE_DATA_MODE || 'local';

export async function saveProgress(sessionId, data) {
  if (MODE === 'remote') {
    return apiClient.saveProgress(sessionId, data);
  }
  return localStorage.setItem(...);
}
```

**Dependencies:** Phase 6 (polish)

## Implementation Order Summary

1. **Phase 1:** Services layer (foundation, no dependencies)
2. **Phase 2:** Centralized state (depends on services structure)
3. **Phase 3:** Refactor engine (depends on centralized state)
4. **Phase 4:** Simplify components (depends on refactored engine)
5. **Phase 5:** Integrate services (depends on components + services)
6. **Phase 6:** Statistics (depends on integrated services)
7. **Phase 7:** Cleanup (depends on all functionality)
8. **Phase 8:** Future-proofing (depends on cleanup)

## Testing Strategy

After each phase:

- Verify all existing functionality still works
- Test quiz flow end-to-end
- Check localStorage persistence
- Validate statistics calculations

## Rebuild Approach

**Full Rebuild Philosophy:**

- Start from scratch with clean architecture - don't preserve existing patterns
- Only reuse existing code if it's already optimal (primarily data JSON files)
- Existing code serves as reference for functionality requirements, not implementation patterns
- Build new components/services with the new architecture in mind from the start
- No need for backward compatibility or incremental migration

**What to Keep:**

- `src/data/` JSON files (country_data.json, quiz_sets.json, flag_colors.json) - these are data, not code
- Existing functionality requirements (what the app does)
- Component concepts (what components exist), but rebuild them completely

**What to Rebuild:**

- All service files (start fresh with clean interfaces)
- All hooks (replace with Context-based approach)
- All components (rebuild with new data flow patterns)
- State management (replace scattered hooks with Context)
- Data flow (eliminate prop drilling, use Context)

**Implementation Strategy:**

- Build new architecture from scratch
- Reference old code only to understand functionality requirements
- Once new system works, remove old code completely
- Clean slate approach - build the right way from the start

### To-dos

- [ ] Create data services layer: sessionService, quizDataService, analyticsService, statsService with localStorage implementation and async interfaces ready for API swap
- [ ] Create centralized state management (Context or Zustand) consolidating useQuizEngine and useQuizConfig into single source of truth
- [ ] Refactor quiz engine logic into pure services, integrate with centralized state, simplify useQuizEngine hook
- [ ] Simplify components (QuizPrompt, QuizLog, QuizConfig, App) to use centralized state, remove prop drilling and local state management
- [ ] Integrate data services with application: auto-save progress, log analytics events, track sessions
- [ ] Implement statistics calculation and display using centralized data and statsService
- [ ] Remove dead code, optimize performance, ensure consistency across codebase
- [ ] Add API client abstraction layer and migration utilities for future dynamic server integration