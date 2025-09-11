# Todo:

- Fix lat long specifications. Seems like inverted signs? 

- Remove scrolling/zooming when country is locked on. 

- possibly clean up passing of prompted info (coordinates are already in the `currentPrompt`, don't need to query the countryData for them)

- Remove 'available prompts' and instead rely on if the data is present in the dictionary
  - still need to fix prompting based on checkboxes

- handle submission on map

- add submission for flag selection?

- ivory coast alias not matching



# Feature additions

- smaller flag UI + color based filtering
  - https://gramener.com/flags/?show=flags&White=40-50%25

- Learning mode: selecting an answer in one window displays the answers in the other one. 

- Allow user to challenge themselves on only one type of response. E.g., only guessing flags, maps, names, etc.

- Fix contries found in geographies but not in countries

- Add reset and/or two finger drag to map

- Group like flags with multiple country codes (eg FR)

- Create groups of countries for challenges. Also possibly blacklist common countries


## **1. Core State Architecture**

### **Primary State Store**
```javascript
// Core application state
const appState = {
  // Quiz Engine
  currentPrompt: null,        // { country, promptType }
  promptHistory: [],          // Array of completed prompts
  
  // User Progress
  userProgress: {
    correct: 0,
    incorrect: 0,
    attempts: []              // Detailed attempt history
  },
  
  // Quiz Configuration
  quizConfig: {
    activeSet: null,          // Current quiz set
    enabledPromptTypes: ['text', 'flag', 'map'],
    autoAdvance: true         // Auto-generate next prompt
  }
}
```

### **Derived State**
```javascript
// Computed values that don't need to be stored
const derivedState = {
  currentCountry: appState.currentPrompt?.country,
  isSetComplete: checkSetCompletion(),
  progressPercentage: calculateProgress(),
  nextPrompt: generateNextPrompt()
}
```

## **2. Core Systems (in order of implementation)**

### **System 1: Quiz Engine**
```javascript
class QuizEngine {
  constructor(countries, quizSets) {
    this.countries = countries;
    this.quizSets = quizSets;
    this.currentPrompt = null;
  }
  
  generatePrompt(quizSet, enabledTypes) {
    // 1. Filter available countries based on set
    // 2. Filter out completed countries
    // 3. Randomly select country and prompt type
    // 4. Return prompt object
  }
  
  validateAnswer(prompt, userInput, inputType) {
    // Validate user input against prompt
    // Return { correct: boolean, feedback: string }
  }
  
  advancePrompt() {
    // Generate next prompt or mark set complete
  }
}
```

### **System 2: Progress Tracking**
```javascript
class ProgressTracker {
  constructor() {
    this.attempts = [];
    this.completedCountries = new Set();
  }
  
  recordAttempt(country, promptType, userInput, correct) {
    const attempt = {
      country,
      promptType,
      userInput,
      correct,
      timestamp: Date.now()
    };
    this.attempts.push(attempt);
    
    if (correct) {
      this.updateCompletion(country, promptType);
    }
  }
  
  isCountryComplete(country) {
    // Check if all three prompt types are correct
  }
  
  getProgressStats() {
    // Return completion percentages, streaks, etc.
  }
}
```

### **System 3: Input Handlers**
```javascript
class InputManager {
  constructor(quizEngine, progressTracker) {
    this.quizEngine = quizEngine;
    this.progressTracker = progressTracker;
  }
  
  handleTextInput(text) {
    const result = this.quizEngine.validateAnswer(
      this.currentPrompt, 
      text, 
      'text'
    );
    this.progressTracker.recordAttempt(
      this.currentPrompt.country,
      'text',
      text,
      result.correct
    );
    return result;
  }
  
  handleFlagSelection(flagCode) {
    // Similar logic for flag input
  }
  
  handleMapSelection(coordinates) {
    // Similar logic for map input
  }
}
```

## **3. State Management Strategy**

### **Option A: Simple React State (for MVP)**
```javascript
function App() {
  const [quizState, setQuizState] = useState({
    currentPrompt: null,
    progress: { correct: 0, incorrect: 0 },
    attempts: [],
    config: { activeSet: null, enabledTypes: ['text', 'flag', 'map'] }
  });
  
  const quizEngine = useMemo(() => new QuizEngine(countries, quizSets), []);
  const progressTracker = useMemo(() => new ProgressTracker(), []);
  
  // Event handlers update state through the systems
}
```

### **Option B: Redux/Zustand (for complex state)**
```javascript
const useQuizStore = create((set, get) => ({
  // State
  currentPrompt: null,
  progress: { correct: 0, incorrect: 0 },
  attempts: [],
  config: { activeSet: null, enabledTypes: ['text', 'flag', 'map'] },
  
  // Actions
  generatePrompt: () => {
    const engine = new QuizEngine(countries, quizSets);
    const prompt = engine.generatePrompt(get().config.activeSet, get().config.enabledTypes);
    set({ currentPrompt: prompt });
  },
  
  recordAttempt: (country, promptType, userInput, correct) => {
    const tracker = new ProgressTracker();
    tracker.recordAttempt(country, promptType, userInput, correct);
    set({ attempts: tracker.attempts });
  }
}));
```

## **4. Component Architecture**

### **Core Components (build first)**
```javascript
// 1. Quiz Container (orchestrates everything)
function QuizContainer() {
  const { currentPrompt, generatePrompt, recordAttempt } = useQuizStore();
  
  return (
    <div>
      <PromptDisplay prompt={currentPrompt} />
      <InputArea onAttempt={recordAttempt} />
      <ProgressDisplay />
    </div>
  );
}

// 2. Prompt Display (shows current question)
function PromptDisplay({ prompt }) {
  if (!prompt) return <div>Loading...</div>;
  
  switch (prompt.type) {
    case 'text': return <TextPrompt prompt={prompt} />;
    case 'flag': return <FlagPrompt prompt={prompt} />;
    case 'map': return <MapPrompt prompt={prompt} />;
  }
}

// 3. Input Area (handles user responses)
function InputArea({ onAttempt }) {
  return (
    <div>
      <TextInput onSubmit={onAttempt} />
      <FlagSelector onSubmit={onAttempt} />
      <MapSelector onSubmit={onAttempt} />
    </div>
  );
}
```

## **5. Data Flow Design**

```javascript
// Unidirectional data flow
User Action → Input Handler → Quiz Engine → Progress Tracker → State Update → UI Update

// Example flow:
1. User types "France" in text input
2. InputHandler.handleTextInput("France")
3. QuizEngine.validateAnswer(currentPrompt, "France", "text")
4. ProgressTracker.recordAttempt(country, "text", "France", true)
5. State updates with new attempt and progress
6. UI re-renders with updated progress and next prompt
```

## **6. Implementation Order**

### **Phase 1: Core Quiz Engine**
1. Basic prompt generation
2. Simple text input validation
3. Progress tracking
4. Basic UI for text prompts

### **Phase 2: Input Methods**
1. Flag selection system
2. Map interaction
3. Input method switching

### **Phase 3: Advanced Features**
1. Quiz sets and filtering
2. Detailed progress tracking
3. Export functionality
4. Advanced UI features

### **Phase 4: Polish**
1. Animations and transitions
2. Mobile responsiveness
3. Accessibility features
4. Performance optimizations

## **7. Key Design Principles**

1. **Separation of Concerns**: Quiz logic separate from UI
2. **Single Source of Truth**: All state in one place
3. **Immutable Updates**: Never mutate state directly
4. **Predictable Data Flow**: Unidirectional state updates
5. **Composable Systems**: Each system can work independently
6. **Testable Architecture**: Easy to unit test each system

This approach gives you a solid foundation that's easy to extend and maintain, while keeping the core quiz logic clean and reusable.