import allCountryData from '../data/country_data.json';
import allQuizSets from '../data/quiz_sets.json';

/**
 * Service for filtering and processing country data for quiz generation
 * Handles quiz set filtering, prompt type validation, and daily challenge logic
 */
export class CountryDataService {
    
    /**
     * Get available countries based on quiz set and prompt type selection
     * 
     * @param {string|null} quizSet - Quiz set name or 'all' for all countries
     * @param {string[]} selectedPromptTypes - Array of selected prompt types
     * @returns {Array} Filtered and processed country data
     */
    static getEngineData(quizSet, selectedPromptTypes) {
        const rng = this.dailyRng();
        let quizData;

        if (quizSet === 'Daily challenge') {
            quizData = this.filterDailyChallenge(allCountryData, rng);
        } else {
            quizData = this.filterCountryPool(allCountryData, quizSet, rng);
            
            quizData = this.filterPromptTypes(quizData, selectedPromptTypes);
        }

        return this.shuffleWithSeed(quizData, rng);
    }
    
    /**
     * Filter and mask countries for daily challenge
     * 
     * @param {Array} allCountryData - All available country data
     * @param {Function} rng - Random number generator
     * @returns {Array} Filtered and masked country data
     */
    static filterDailyChallenge(allCountryData, rng) {
        const dailyChallengeCount = 5;
        const shuffledCountryData = allCountryData.sort((a, b) => rng() - 0.5);
        const subsetCountryData = shuffledCountryData.slice(0, dailyChallengeCount);

        return subsetCountryData.map(country => {
            // Use fallback if acceptable_prompt_types doesn't exist
            const availablePromptTypes = country.availablePromptTypes || ['name', 'location'];
            const keepIndex = Math.floor(rng() * availablePromptTypes.length);
            const keepPromptType = availablePromptTypes[keepIndex];

            return {
                ...country,
                availablePromptTypes: [keepPromptType]
            };
        });
    }

    /**
     * Get base country pool based on quiz set selection
     * 
     * @param {Array} allCountryData - All available country data
     * @param {string|null} quizSet - Quiz set name or 'all'
     * @param {Function} rng - Random number generator
     * @returns {Array} Base country data
     */
    static filterCountryPool(allCountryData, quizSet, rng) {
        if (!quizSet || quizSet === 'all') {
            return allCountryData;
        } else {
            const quizSetData = allQuizSets.find(q => q.name === quizSet);
            if (!quizSetData) {
                console.log(`Quiz set ${quizSet} not found`);
                return [];
            }
            // Filter countries to only include those in the quiz set
            return allCountryData.filter(country => 
                quizSetData.country_codes.includes(country.code)
            );
        }
    }
    
    /**
     * Filter countries to only include those compatible with selected prompt types
     * 
     * @param {Array} countryData - Array of country objects
     * @param {string[]} selectedTypes - Array of selected prompt types
     * @returns {Array} Filtered country data
     */
    static filterPromptTypes(countryData, selectedTypes) {
        if (!selectedTypes || selectedTypes.length === 0) {
            return countryData;
        } 
        return countryData.filter(country => {
            // Use fallback if availablePromptTypes doesn't exist
            const countryPromptTypes = country.availablePromptTypes || ['name', 'location'];
            // Check if country supports ALL selected prompt types
            return selectedTypes.every(type => countryPromptTypes.includes(type));
        }).map(country => ({
            ...country, 
            // Restrict availablePromptTypes to only the selected types
            availablePromptTypes: selectedTypes.filter(type => 
                (country.availablePromptTypes || ['name', 'location']).includes(type)
            )
        }));
    }
    
    /**
     * Generate seeded random number generator for daily challenges
     * 
     * @returns {Function} Random number generator function
     */
    static dailyRng() {
        const today = new Date();
        let seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        return function() {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    
    /**
     * Shuffle countries with a seed for consistent ordering
     * 
     * @param {Array} quizData - Array of country objects
     * @param {Function} rng - Random number generator
     * @returns {Array} Shuffled country data
     */
    static shuffleWithSeed(quizData, rng) {
        const shuffledCountryData = quizData.sort((a, b) => rng() - 0.5);
        return shuffledCountryData;
    }
}