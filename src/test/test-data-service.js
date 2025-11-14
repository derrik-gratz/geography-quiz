import { filterCountryData } from '../services/filterCountryData.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read JSON files
const countryData = JSON.parse(
    fs.readFileSync(join(__dirname, '../data/country_data.json'), 'utf-8')
);

// Test configurations
const testConfigs = [
    {
        name: 'Daily challenge',
        userConfig: {
            quizSet: { name: 'Daily challenge' },
            promptTypes: []
        }
    },
    {
        name: 'All countries',
        userConfig: {
            quizSet: { name: 'all' },
            promptTypes: ['name', 'flag']
        }
    }
];

// Run tests
testConfigs.forEach(test => {
    console.log(`\n=== Testing: ${test.name} ===`);
    try {
        const result = filterCountryData(test.userConfig, countryData);
        console.log(`Result count: ${result.length}`);
        console.log(`First 3 countries:`, result.slice(0, 3).map(c => ({
            code: c.code,
            country: c.country,
            availablePrompts: c.availablePrompts
        })));
    } catch (error) {
        console.error('Error:', error.message);
    }
});