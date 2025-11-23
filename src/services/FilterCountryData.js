// import countryData from '../data/country_data.json' with { type: 'json' };
import quizSets from '../data/quiz_sets.json' with { type: 'json' };
import { seededRNG, getDailySeed } from './DailyRNG.js'

const dailyChallengeLength = 5; 

// redundant check to see if country can fulfill prompt type, which should be specified in the country data
function hasPromptType(country, promptType) {
    switch (promptType) {
        case 'name':
            return country.country && country.country.trim() !== '';
        case 'location':
            return country.location?.lat != null && country.location?.long != null;
        case 'flag':
            return country.flagCode && country.flagCode !== null;
        default:
            return false;
    }
}



// Shuffle array using Fisher-Yates algorithm
export function shuffleArray(data, seed) {
    // Ensure data is an array
    if (!Array.isArray(data)) {
        console.error('shuffleArray: data must be an array', data);
        return [];
    }
    
    // Create a copy to avoid mutating the original array
    const shuffledData = [...data];
    for (let i = shuffledData.length - 1; i > 0; i--) {
        const j = Math.floor(seededRNG(seed) * (i + 1));
        [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
    }
    return shuffledData;
}

// Handle user configs to filter data for prompts
export function filterCountryData(quizSet, selectedPromptTypes, countryData) {
    let filteredCountryData = countryData;
    // Quiz set filtering
    if (!quizSet) {
        console.error(`No quiz set selected for filtering`);
        return [];
    } else if (quizSet === 'Daily challenge') {
        // Maybe a little unelegant in here with the early return, but doesn't have a prompt type config
        const dailySeed = getDailySeed();

        filteredCountryData = shuffleArray(countryData, dailySeed).slice(0, dailyChallengeLength);

        // 1 prompt type, randomly selected
        // filteredCountryData = filteredCountryData.map(country => {
        //     const selectedPromptType = shuffleArray(country.availablePrompts, dailySeed)[0];
        //     return {
        //         ...country,
        //         availablePrompts: [selectedPromptType]
        //     };
        // })...
        return filteredCountryData;
    } else if (quizSet !== 'all') {
        const quizSetData = quizSets.find(q => q.name === quizSet);
        if (quizSetData) {
            filteredCountryData = countryData.filter(country => quizSetData.countryCodes.includes(country.code));
        } else {
            console.error(`Invalid quiz set: ${quizSet}`);
            // filteredCountryData = countryData;
            return [];
        }
    }

    filteredCountryData = shuffleArray(filteredCountryData, Date.now());
    
    

    // Filter by prompt types
    if (selectedPromptTypes && selectedPromptTypes.length > 0) {
        filteredCountryData = filteredCountryData.filter(country => {
            if (country.availablePrompts) {
                return country.availablePrompts.some(type => selectedPromptTypes.includes(type));
            } else {
                // redundant, should be specified in country data, but safety
                console.log('Country missing availablePrompts:', country);
                return selectedPromptTypes.some(type => hasPromptType(country, type));
            }
        })
    }
    
    return filteredCountryData;
}

// Generate prompt queue