---
name: ''
overview: ''
todos: []
isProject: false
---

# Geography Quiz Code Quality Improvement Plan

## Overview

This plan addresses five key improvement areas: state management consolidation, business logic testing, component/HTML structure simplification, CSS architecture hierarchy, and service layer refinement. The improvements are organized in phases that build on each other, ensuring a stable foundation before architectural changes.

## Current State Analysis

**State Management:**

- Main state in `[src/state/quizContext.js](src/state/quizContext.js)` using reducer pattern
- Local `useState` in multiple components: `QuizPrompt`, `ProfilePage`, `WorldMap`, `QuizLog`, `FlagSelect`, `TextInput`, `BaseMap`, `CollapsibleContainer`, `CountryTextEntry`
- `App.jsx` has `currentPage` state that could be in context
- Derived state calculated in both provider and components (e.g., `dailyChallengeCompleted` checked in `QuizPrompt`)

**Testing:**

- Only `[src/test/quizEngine.test.js](src/test/quizEngine.test.js)` exists
- No tests for: `storageService`, `statsService`, `spacedRepetitionEngine`, `filterCountryData`, reducer logic

**Component Structure:**

- 21 CSS files, many with minimal rules (e.g., `QuizPrompt.css` has 2 rules)
- Deep nesting with BEM-style classes
- Layout concerns mixed with component structure (`left-column`/`right-column` in `QuizPage`)

**CSS:**

- Variables in `[src/App.css](src/App.css)` but component-specific overrides scattered
- No clear hierarchy or design system
- Many small files that could be consolidated

## Phase 1: State Management Consolidation

**Goal:** Eliminate redundant state, centralize shared state in context, ensure state is declared at appropriate levels.

### 1.1 Audit and Document Current State Usage

- **Action:** Create inventory of all `useState` hooks across components
- **Files to review:**
- `[src/components/quiz/QuizPrompt.jsx](src/components/quiz/QuizPrompt.jsx)` - has 4 useState hooks
- `[src/components/profile/ProfilePage.jsx](src/components/profile/ProfilePage.jsx)` - has 4 useState hooks
- `[src/components/quiz/WorldMap.jsx](src/components/quiz/WorldMap.jsx)` - has 3 useState hooks
- `[src/components/quiz/QuizLog.jsx](src/components/quiz/QuizLog.jsx)` - has 2 useState hooks
- `[src/App.jsx](src/App.jsx)` - has 1 useState hook
- All other components with useState

### 1.2 Move Shared State to Context

- **Action:** Move `currentPage` from `App.jsx` to context
- Add `currentPage` and `setCurrentPage` to `[src/state/quizContext.js](src/state/quizContext.js)` reducer
- Update `[src/App.jsx](src/App.jsx)` to use context
- Update `NavigationBar` to use context
- **Action:** Move derived state calculations to provider
- Extract `dailyChallengeCompleted` check from `QuizPrompt` to `[src/state/quizProvider.jsx](src/state/quizProvider.jsx)`
- Extract `learningModeHasCountries` check from `QuizPrompt` to provider
- Add these as computed values in context using `useMemo`
- Update `QuizPrompt` to consume from context instead of local state

### 1.3 Identify and Separate UI-Only State

- **Action:** Categorize remaining `useState` hooks:
- **UI-only (keep local):** Collapsible state, input focus, hover states, temporary UI feedback
- **Shared/business (move to context):** Any state that affects multiple components or business logic
- **Examples:**
- `CollapsibleContainer.isCollapsed` - UI-only, keep local
- `WorldMap.selectedCountry` - UI-only for map interaction, keep local
- `QuizLog.exportSuccess` - UI-only feedback, keep local
- `ProfilePage.userData` - Consider if this should be in context for sharing

### 1.4 Consolidate Derived State in Provider

- **Action:** Review all `useMemo` calculations in components and move shared ones to provider
- Check `QuizPrompt` for derived state that could be in provider
- Ensure `currentPromptData`, `totalCountries`, `promptCompleted`, `isQuizFinished` are the only derived values needed
- Add any missing derived state to provider

### 1.5 Clean Up Reducer

- **Action:** Review `[src/state/quizContext.js](src/state/quizContext.js)` reducer for:
- Redundant state updates
- Opportunities to simplify action handlers
- Ensure state shape is minimal (no duplicate data)
- Document state shape clearly in JSDoc

## Phase 2: Business Logic Testing (Test-First Approach)

**Goal:** Establish comprehensive test coverage for all business logic with test-first mindset.

### 2.1 Extract Business Logic from Components

- **Action:** Identify business logic in components and extract to services
- Extract `dailyChallengeCompleted` check logic to `[src/services/statsService.js](src/services/statsService.js)` (if not already there)
- Extract `learningModeHasCountries` check to `spacedRepetitionEngine` or new service
- Move any calculation logic from `useMemo` in components to pure functions

### 2.2 Test Storage Service

- **Action:** Create `[src/test/storageService.test.js](src/test/storageService.test.js)`
- Test `saveDailyChallenge`, `loadDailyChallenge`, `getAllDailyChallenges`
- Test `updateCountryLearningData`, `getCountryLearningData`
- Test `loadAllUserData`, `getUserMetadata`
- Test IndexedDB operations with mocks
- Test error handling

### 2.3 Test Stats Service

- **Action:** Create `[src/test/statsService.test.js](src/test/statsService.test.js)`
- Test `dailyChallengeCompletedToday`
- Test all statistics calculation functions
- Test edge cases (empty data, missing fields)

### 2.4 Test Spaced Repetition Engine

- **Action:** Create `[src/test/spacedRepetitionEngine.test.js](src/test/spacedRepetitionEngine.test.js)`
- Test `getCountriesDueForReview`
- Test learning rate calculations
- Test update logic

### 2.5 Test Filter Country Data

- **Action:** Enhance `[src/test/filterCountryData.test.js](src/test/filterCountryData.test.js)` (create if doesn't exist)
- Test filtering by quiz set
- Test filtering by prompt types
- Test game mode filtering (dailyChallenge, learning, etc.)

### 2.6 Test Reducer Logic

- **Action:** Create `[src/test/quizContext.test.js](src/test/quizContext.test.js)` (enhance existing if present)
- Test all action types in reducer
- Test state transitions
- Test edge cases (invalid actions, boundary conditions)
- Test state immutability

### 2.7 Test Quiz Engine (Enhance Existing)

- **Action:** Review and enhance `[src/test/quizEngine.test.js](src/test/quizEngine.test.js)`
- Ensure all functions are covered
- Add edge case tests
- Test error conditions

## Phase 3: Component Structure & HTML Simplification

**Goal:** Simplify HTML structure, reduce nesting, use semantic HTML, improve organization.

### 3.1 Audit Component HTML Structure

- **Action:** Review all component JSX for:
- Unnecessary wrapper divs
- Deep nesting (>3 levels)
- Missing semantic HTML (`<main>`, `<section>`, `<article>`, `<header>`, `<nav>`)
- Inconsistent patterns

### 3.2 Simplify QuizPage Structure

- **Action:** Refactor `[src/components/quiz/QuizPage.jsx](src/components/quiz/QuizPage.jsx)`
- Replace generic divs with semantic HTML
- Consider extracting layout to a reusable component
- Simplify class names (reduce BEM nesting)
- Remove unnecessary wrapper divs

### 3.3 Simplify QuizPrompt Structure

- **Action:** Refactor `[src/components/quiz/QuizPrompt.jsx](src/components/quiz/QuizPrompt.jsx)`
- Reduce nesting in JSX
- Extract complex conditional rendering to separate components or functions
- Simplify class structure

### 3.4 Standardize Layout Patterns

- **Action:** Create reusable layout components if needed
- Consider `TwoColumnLayout` component if pattern is reused
- Or use CSS Grid/Flexbox more effectively to reduce wrapper divs

### 3.5 Review and Simplify All Components

- **Action:** Go through each component file and:
- Remove unnecessary divs
- Use semantic HTML where appropriate
- Flatten nesting where possible
- Ensure consistent structure patterns

## Phase 4: CSS Architecture & Hierarchy

**Goal:** Establish hierarchical CSS structure, consolidate files, create design system foundation.

### 4.1 Create Design System Foundation

- **Action:** Organize `[src/App.css](src/App.css)` into clear sections:
- CSS Custom Properties (variables) - colors, spacing, typography
- Base element styles
- Utility classes (if needed)
- Layout patterns
- Ensure all variables are documented

### 4.2 Audit and Consolidate CSS Files

- **Action:** Review all 21 CSS files:
- Identify files with <5 rules that could be merged
- Group related component styles
- Create consolidation plan

### 4.3 Consolidate Small CSS Files

- **Action:** Merge small files into logical groups:
- Consider merging quiz component styles: `QuizPrompt.css`, `QuizConfig.css`, `QuizLog.css` into `quiz-components.css`
- Or keep separate but ensure they follow hierarchy
- Keep component-specific CSS only if it's substantial (>10 rules)

### 4.4 Establish CSS Hierarchy

- **Action:** Create clear CSS import/loading order:

1. `index.css` - base reset, global styles
2. `App.css` - design tokens, base component styles
3. Component CSS files - component-specific overrides
4. Ensure no style conflicts or overrides

### 4.5 Remove Redundant CSS Rules

- **Action:** Audit for duplicate styles:
- Use tools or manual review to find duplicate rules
- Consolidate duplicate styles into base/utility classes
- Remove unused CSS

### 4.6 Improve CSS Organization Within Files

- **Action:** Standardize CSS file structure:
- Group related rules
- Use consistent commenting
- Follow BEM or chosen methodology consistently
- Document complex styles

## Phase 5: Service Layer Refinement

**Goal:** Ensure services are pure, well-separated, and follow consistent patterns.

### 5.1 Review Service Purity

- **Action:** Audit all service files:
- Ensure no React dependencies
- Ensure functions are pure where possible
- Extract any React-dependent logic

### 5.2 Separate Side Effects from State Management

- **Action:** Refactor `[src/state/quizProvider.jsx](src/state/quizProvider.jsx)`:
- Move storage operations to separate effect hooks
- Consider creating a `useQuizPersistence` hook for storage side effects
- Keep reducer pure (no side effects)

### 5.3 Standardize Service Interfaces

- **Action:** Review all services for consistency:
- Ensure async/await patterns are consistent
- Standardize error handling
- Ensure return types are consistent
- Add JSDoc to all exported functions

### 5.4 Extract Business Logic from Components

- **Action:** Move remaining business logic from components to services:
- Check `useQuizActions` for logic that should be in services
- Extract complex calculations to service functions
- Ensure components are primarily presentational

## Phase 6: Code Quality & Polish

**Goal:** Final improvements for professional codebase.

### 6.1 Documentation

- **Action:** Add JSDoc to all exported functions:
- Services
- Hooks
- Components (props)
- Reducer actions

### 6.2 Remove Dead Code

- **Action:** Clean up:
- Remove commented-out code (e.g., in `QuizPrompt.jsx`)
- Remove unused imports
- Remove unused functions

### 6.3 Error Handling

- **Action:** Standardize error handling:
- Ensure consistent error handling patterns
- Add error boundaries if needed
- Improve user-facing error messages

### 6.4 Type Safety (Optional)

- **Action:** Consider adding JSDoc type definitions:
- Add `@typedef` for complex types
- Add `@param` and `@returns` with types
- Consider TypeScript migration in future

## Phase 7: Professional Development Workflow & Infrastructure

**Goal:** Establish professional development workflow, tooling, and infrastructure standards.

### 7.1 Code Formatting & Linting

- **Action:** Set up Prettier for consistent code formatting
- Install Prettier: `npm install --save-dev prettier`
- Create `.prettierrc` configuration file
- Create `.prettierignore` file
- Add format scripts to `package.json`: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`
- Integrate with ESLint (install `eslint-config-prettier` to avoid conflicts)
- Consider adding format-on-save in IDE settings
- **Action:** Enhance ESLint configuration
- Review and expand ESLint rules for best practices
- Add rules for accessibility (`eslint-plugin-jsx-a11y`)
- Add rules for React best practices
- Ensure consistent rule enforcement

### 7.2 Pre-commit Hooks

- **Action:** Set up Husky and lint-staged
- Install: `npm install --save-dev husky lint-staged`
- Configure pre-commit hook to run:
- ESLint
- Prettier check
- Tests (optional, can be slow)
- Create `.lintstagedrc` or add to `package.json`
- Ensure hooks run on staged files only

### 7.3 README Documentation

- **Action:** Create comprehensive `README.md`
- Project description and purpose
- Installation instructions
- Development setup guide
- Available scripts and their purposes
- Project structure overview
- Technology stack
- Contributing guidelines (if applicable)
- License information
- Link to deployed version

### 7.4 Environment Configuration

- **Action:** Set up environment variable management
- Create `.env.example` file documenting required variables
- Create `.env.local` template (add to `.gitignore`)
- Document environment-specific configurations
- Use Vite's `import.meta.env` for environment variables
- Consider adding validation for required env vars at startup

### 7.5 Error Boundaries

- **Action:** Implement React Error Boundaries
- Create `ErrorBoundary` component in `src/components/base/ErrorBoundary.jsx`
- Wrap main app sections (Quiz, Profile) with error boundaries
- Provide user-friendly error messages
- Log errors to console (and potentially to error tracking service)
- Add fallback UI for error states
- Test error boundary behavior

### 7.6 Accessibility Improvements

- **Action:** Enhance accessibility (a11y) compliance
- Audit current accessibility (some ARIA labels exist but minimal)
- Add ARIA labels to all interactive elements
- Ensure keyboard navigation works throughout app
- Add focus management for modals/dialogs
- Ensure color contrast meets WCAG AA standards
- Add skip links for main content
- Test with screen readers
- Add `eslint-plugin-jsx-a11y` and fix violations
- Document accessibility features

### 7.7 Performance Optimization

- **Action:** Optimize bundle size and runtime performance
- Analyze bundle with `vite-bundle-visualizer` or `rollup-plugin-visualizer`
- Identify and lazy-load large components (ProfilePage, maps)
- Use `React.memo` for expensive components
- Optimize context value with `useMemo` to prevent unnecessary re-renders
- Review and optimize images/assets
- Add loading states for async operations
- Consider code splitting for routes (if adding routing)

### 7.8 CI/CD Pipeline

- **Action:** Set up GitHub Actions (or similar) for CI/CD
- Create `.github/workflows/ci.yml`
- Run on pull requests:
- Lint check
- Format check
- Type check (if using TypeScript)
- Test suite
- Build verification
- Run on main branch:
- All checks above
- Deploy to GitHub Pages (if applicable)
- Add status badges to README

### 7.9 Security Considerations

- **Action:** Review and improve security
- Audit dependencies for vulnerabilities: `npm audit`
- Set up Dependabot or similar for dependency updates
- Review data storage security (IndexedDB usage)
- Ensure no sensitive data in client-side code
- Review external API usage (if any)
- Add Content Security Policy headers (if deploying)
- Document security considerations

### 7.10 Development Tools

- **Action:** Add helpful development tools
- Consider adding React DevTools Profiler usage documentation
- Add development-only debugging helpers (already have `clearQuizData`)
- Document debugging strategies
- Consider adding Storybook for component development (optional)
- Add bundle size monitoring

### 7.11 Project Structure Documentation

- **Action:** Document project architecture
- Create `ARCHITECTURE.md` or add to README
- Document data flow (state management)
- Document component hierarchy
- Document service layer architecture
- Include diagrams if helpful (Mermaid)
- Document key design decisions

### 7.12 Version Management

- **Action:** Improve version and changelog management
- Use semantic versioning properly in `package.json`
- Create/improve `CHANGELOG.md` (currently have `changelog.txt`)
- Document versioning strategy
- Consider using `standard-version` or `semantic-release` for automated versioning

## Implementation Notes

- **Order matters:** Complete phases sequentially as they build on each other
- **Testing first:** Write tests before refactoring when possible (Phase 2)
- **Incremental:** Make small, focused changes and test frequently
- **Preserve functionality:** Ensure all existing features work after each phase

## Success Criteria

- All shared state is in context, UI-only state is local
- All business logic has test coverage (>80%)
- Component HTML is simplified, semantic, and consistent
- CSS follows clear hierarchy with minimal duplication
- Services are pure, well-tested, and consistently structured
- Code is well-documented and follows professional patterns
- Code is automatically formatted and linted
- Pre-commit hooks prevent bad commits
- Comprehensive README and documentation
- Error boundaries catch and handle errors gracefully
- Accessibility meets WCAG AA standards
- CI/CD pipeline validates all changes
- Bundle size is optimized and monitored
