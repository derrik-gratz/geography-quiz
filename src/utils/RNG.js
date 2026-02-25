export function getDailySeed() {
  const today = new Date();
  return (
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  );
}

export function createSeededRNG(seed) {
  let state = typeof seed === 'number' ? seed : Date.now();

  return function () {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    state = t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray(data, seed) {
  if (!Array.isArray(data)) {
    console.error('shuffleArray: data must be an array', data);
    return [];
  }

  // Create a copy to avoid mutating the original array
  const shuffledData = [...data];
  const rng = createSeededRNG(seed);
  for (let i = shuffledData.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
  }
  return shuffledData;
}
