// Fake userData for testing
const fakeUserData = {
  userId: 'test_user_123',
  dailyChallenge: {
    streak: {
      current: 3,
      lastPlayed: '2024-01-15',
    },
    fullEntries: [
      {
        date: '2024-01-15',
        skillScore: 0,
        score: 0,
      },
      {
        date: '2024-01-14',
        skillScore: 1.3,
        score: 2.0,
      },
      {
        date: '2024-01-13',
        skillScore: 5,
        score: 5,
      },
    ],
  },
  countries: {
    MEX: {
      learning: { lastCorrect: null, learningRate: null },
      matrix: [
        // Input: name (0)
        [
          [], // prompted: name (0)
          [0.5, 0.4, 0.5], // prompted: flag (1)
          [0.4, 0.3, 0.4], // prompted: location (2)
        ],
        // Input: flag (1)
        [
          [0.3, 0.4, 0], // prompted: name (0)
          [], // prompted: flag (1)
          [0.2, 0.3, 0.1], // prompted: location (2)
        ],
        // Input: location (2)
        [
          [0.1], // prompted: name (0)
          [0.2], // prompted: flag (1)
          [], // prompted: location (2)
        ],
      ],
    },
    USA: {
      learning: { lastCorrect: null, learningRate: null },
      matrix: [
        // Input: name (0)
        [
          [], // prompted: name (0)
          [0.5, 0, 0, 0.4], // prompted: flag (1)
          [0.4, 0, 0, 0.3], // prompted: location (2)
        ],
        // Input: flag (1)
        [
          [0.3, 0], // prompted: name (0)
          [], // prompted: flag (1)
          [0.2, 0], // prompted: location (2)
        ],
        // Input: location (2)
        [
          [0.1, 0, 0], // prompted: name (0)
          [0.2, 0.2, 0], // prompted: flag (1)
          [], // prompted: location (2)
        ],
      ],
    },
    CAN: {
      learning: { lastCorrect: null, learningRate: null },
      matrix: [
        // Input: name (0)
        [
          [], // prompted: name (0)
          [0, 0, 0, 0.1], // prompted: flag (1)
          [0, 0, 0, 0.1], // prompted: location (2)
        ],
        // Input: flag (1)
        [
          [0, 0, 0], // prompted: name (0)
          [], // prompted: flag (1)
          [0, 0, 0], // prompted: location (2)
        ],
        // Input: location (2)
        [
          [0.1, 0, 0], // prompted: name (0)
          [0.2, 0.2, 0], // prompted: flag (1)
          [], // prompted: location (2)
        ],
      ],
    },
  },
};

// Export for use in testing
export default fakeUserData;
