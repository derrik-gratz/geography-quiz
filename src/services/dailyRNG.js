export function getDailySeed() {
  const today = new Date();
  return (
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  );
}

// Create a seeded RNG function from the seed number
export function seededRNG(seed) {
  let rngState = typeof seed === 'number' ? seed : Date.now();

  let t = (rngState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  rngState = t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
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
