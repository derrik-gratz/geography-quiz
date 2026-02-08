import { describe, it, expect } from 'vitest';
import {expectTypeOf} from 'expect-type'
import countryData from '../data/country_data.json' with { type: 'json' };
import quizSets from '../data/quiz_sets.json' with { type: 'json' };
import flagColors from '../data/flag_colors.json' with { type: 'json' };

import flagIcons from 'flag-icons';

describe('country_data.json format', () => {
    it('all records should have valid format', () => {
        countryData.forEach(country => {
            expectTypeOf(country.country).toBeString();
            expectTypeOf(country.aliases).toBeArray();
            expectTypeOf(country.code).toBeString();
            expect(country.code.length).toBe(3);
            expectTypeOf(country.location).toBeArray();
            expectTypeOf(country.location[0]).toBeNumber();
            expectTypeOf(country.location[1]).toBeNumber();
            expectTypeOf(country.flagCode).toBeString();
            expect(country.flagCode.length).toBe(2);
            expectTypeOf(country.availablePrompts).toBeArray();
        });
    });
    it('all countries should have at least one prompt type available of name, flag, or location', () => {
        countryData.forEach(country => {
            expect(country.availablePrompts.length).toBeGreaterThan(0);
            expect(
                country.availablePrompts.every(prompt => ['name', 'flag', 'location'].includes(prompt)),
                `Country ${country.country} has invalid prompt types.`
            ).toBe(true);
        });
    });
    it('for shared flags, only one country should have flag as an available prompt', () => {
        const flags = countryData.map(country => country.flagCode);
        let duplicates = flags.filter((item, index) => {
            return flags.indexOf(item) !== index;
        });
        duplicates = [...new Set(duplicates)];
        duplicates.forEach(flagCode => {
            let promptingCountries = 0;
            countryData.forEach(country => {
                if (country.flagCode === flagCode && country.availablePrompts.includes('flag')) {
                    promptingCountries++;
                }
            });
            expect(
                promptingCountries,
                `Flag code ${flagCode} found for multiple countries with flag as an available prompt.`
            ).toEqual(1);
        });
    });
});

describe('quiz_sets.json format', () => {
    it('Quiz set codes should be valid country codes', () => {
        const validCodes = new Set(countryData.map(c => c.code));
        quizSets.forEach(quizSet => {
            const invalidCodes = quizSet.countryCodes.filter(code => !validCodes.has(code));
            expect(
                invalidCodes,
                `Quiz set "${quizSet.name}" has invalid country codes: ${invalidCodes.join(', ')}`
            ).toEqual([]);
        });
    });
});

describe('flag_colors.json format', () => {
    it('Flag colors are stored in an object of arrays', () => {
        expectTypeOf(flagColors).toBeObject()
    })
    it('Flag color arrays should have only flag codes found in country_data.json', () => {
        const validCodes = new Set(countryData.map(c => c.flagCode));
        Object.keys(flagColors).forEach(color => {
            const invalidCodes = flagColors[color].filter(code => !validCodes.has(code));
            expect(
                invalidCodes,
                `Flag color array "${color}" has invalid flag codes: ${invalidCodes.join(', ')}`
            ).toEqual([]);
        });
    });
});

import flagIconList from 'flag-icons/country.json' with { type: 'json' };
import mainGeographies from '../assets/ne_50m_admin_0_countries.json' with { type: 'json' };
import tinyGeographies from '../assets/ne_50m_admin_0_tiny_countries.json' with { type: 'json' };

describe('data codes consistent with packages', () => {
    const countryDataISOA3 = new Set(countryData.map((c) => c.code));
    const countryDataISOA2 = countryData.map(c => c.flagCode.toLowerCase());
    const availableFlagIcons = new Set(flagIconList.map(x => x.code));
    it('Flag codes have SVG available in flag-icons package', () => {
        const invalid = countryDataISOA2.filter(code => !availableFlagIcons.has(code));
        expect(invalid, `Invalid flag codes: ${invalid.join(', ')}`).toEqual([]);
    })
    it('countries in country_data.json have geography available', () => {
        countryDataISOA3.forEach(code => {
            const featureLarge = mainGeographies.features.find(f => f.properties.ISO_A3 === code);
            const featureTiny = tinyGeographies.features.find(f => f.properties.ISO_A3 === code);
            expect(featureLarge || featureTiny, `Country ${code} has no geography available`).toBeDefined();
        });
    })
    it('identify additional countries with geographies and flags not in country_data.json', () => {
        const missingCountriesLarge = mainGeographies.features
            .filter(geo => 
                !countryDataISOA3.has(geo.properties.ISO_A3) && 
                geo.properties.ISO_A3 !== '-99'// &&
                // availableFlagIcons.has(geo.properties.ISO_A2)
            )
            .map(geo => [geo.properties.ISO_A3, geo.properties.NAME_EN]);
        if (missingCountriesLarge.length > 0) {
            console.log(`Large geographies available but not in country data: ${missingCountriesLarge.join('; ')}`);
        }
        // expect(missingCountriesLarge, `Large geographies available with flag but not in country dada: ${missingCountriesLarge}`).toEqual([])
        const missingCountriesTiny = tinyGeographies.features
            .filter(geo => 
                !countryDataISOA3.has(geo.properties.ISO_A3) && 
                geo.properties.ISO_A3 !== '-99' //&&
                //availableFlagIcons.has(geo.properties.ISO_A2)
            )
            .map(geo => [geo.properties.ISO_A3, geo.properties.NAME_EN]);
        // expect(missingCountriesTiny, `Large geographies available with flag but not in country dada: ${missingCountriesTiny}`).toEqual([])
        if (missingCountriesTiny.length > 0) {
            console.log(`Tiny geographies available but not in country data: ${missingCountriesTiny}`);
        }
    })
})