import { describe, it, expect } from 'vitest';
import { expectTypeOf } from 'expect-type';
import mockUserData from '@/test/data/mockUserData.js';
import {
  getCountriesDueForReview,
  updateLearningRate,
  getEngineSettings,
} from '@/utils/spacedRepetitionEngine.js';

describe('getCountriesDueForReview', () => {
  it('should return an array of countries due for review', () => {
    const countriesDueForReview = getCountriesDueForReview(
      mockUserData,
      new Date('2026-01-17'),
    );
    expectTypeOf(countriesDueForReview).toBeArray();
    expect(countriesDueForReview.length).toBeGreaterThan(0);
  });
  it('countries should be up for review only after the time passed exceeds the learning rate', () => {
    const countriesDueForReview1 = getCountriesDueForReview(
      mockUserData,
      new Date('2026-01-17'),
    );
    expect(countriesDueForReview1).not.toContain('USA');
    const countriesDueForReview2 = getCountriesDueForReview(
      mockUserData,
      new Date('2026-01-19'),
    );
    expect(countriesDueForReview2).toContain('USA');
  });
  it('countries with no learning rate should be up for review immediately', () => {
    const countriesDueForReview = getCountriesDueForReview(
      mockUserData,
      new Date('2026-01-17'),
    );
    expect(countriesDueForReview).toContain('ARG');
  });
});

describe('updateLearningRate', () => {
  const { DEFAULT_LEARNING_RATE, MIN_LEARNING_RATE, MAX_LEARNING_RATE } =
    getEngineSettings();
  it('learning rate should increase on correct answer', () => {
    expect(updateLearningRate(DEFAULT_LEARNING_RATE, true)).toBeGreaterThan(
      DEFAULT_LEARNING_RATE,
    );
  });
  it('learning rate should decrease on incorrect answer', () => {
    expect(updateLearningRate(DEFAULT_LEARNING_RATE, false)).toBeLessThan(
      DEFAULT_LEARNING_RATE,
    );
  });
  it('learning rate should not exceed max learning rate', () => {
    expect(updateLearningRate(MAX_LEARNING_RATE, true)).toBe(MAX_LEARNING_RATE);
  });
  it('learning rate should not fall below min learning rate', () => {
    expect(updateLearningRate(MIN_LEARNING_RATE, false)).toBe(
      MIN_LEARNING_RATE,
    );
  });
});
