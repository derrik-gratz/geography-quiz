const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Fetch data from a URL and return as a Promise
 */
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Failed to fetch URL: ${error.message}`));
        });
    });
}

/**
 * Extract country codes and names from GeoJSON data using ISO_A3 and NAME fields
 */
function extractCountryDataFromGeoJSON(geoJSON) {
    const countryData = [];
    
    if (geoJSON.features && Array.isArray(geoJSON.features)) {
        geoJSON.features.forEach(feature => {
            if (feature.properties && feature.properties.ISO_A3 && feature.properties.NAME) {
                countryData.push({
                    code: feature.properties.ISO_A3.trim(),
                    name: feature.properties.NAME.trim()
                });
            }
        });
    }
    
    return countryData.sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Load local country data and extract codes and names
 */
function loadLocalCountryData() {
    try {
        const filePath = path.join(__dirname, 'src', 'data', 'country_data.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data.map(country => ({
            code: country.code,
            name: country.country
        })).sort((a, b) => a.code.localeCompare(b.code));
    } catch (error) {
        throw new Error(`Failed to load local country data: ${error.message}`);
    }
}

/**
 * Find missing country codes by comparing two arrays of country data
 */
function findMissingCountryCodes(geoJSONData, localData) {
    const geoJSONCodes = geoJSONData.map(item => item.code);
    const localCodes = localData.map(item => item.code);
    
    const geoJSONSet = new Set(geoJSONCodes);
    const localSet = new Set(localCodes);
    
    const missingFromLocal = geoJSONData.filter(item => !localSet.has(item.code));
    const extraInLocal = localData.filter(item => !geoJSONSet.has(item.code));
    
    return {
        missingFromLocal: missingFromLocal.sort((a, b) => a.code.localeCompare(b.code)),
        extraInLocal: extraInLocal.sort((a, b) => a.code.localeCompare(b.code)),
        geoJSONCount: geoJSONCodes.length,
        localCount: localCodes.length
    };
}

/**
 * Main function to check missing country codes
 */
async function checkMissingCountryCodes() {
    const geoJSONUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";
    
    try {
        console.log('Fetching countries from GeoJSON URL...');
        const geoJSONData = await fetchUrl(geoJSONUrl);
        
        console.log('Extracting country codes (ISO_A3) and names from GeoJSON...');
        const geoJSONCountries = extractCountryDataFromGeoJSON(geoJSONData);
        
        console.log('Loading local country data...');
        const localCountries = loadLocalCountryData();
        
        console.log('\n=== COUNTRY CODE COMPARISON ===');
        console.log(`Countries in GeoJSON (ISO_A3): ${geoJSONCountries.length}`);
        console.log(`Countries in local data: ${localCountries.length}`);
        
        const comparison = findMissingCountryCodes(geoJSONCountries, localCountries);
        
        console.log('\n=== MISSING FROM LOCAL DATA ===');
        if (comparison.missingFromLocal.length === 0) {
            console.log('No country codes missing from local data!');
        } else {
            comparison.missingFromLocal.forEach((country, index) => {
                console.log(`${index + 1}. ${country.code} - ${country.name}`);
            });
        }
        
        console.log('\n=== EXTRA IN LOCAL DATA ===');
        if (comparison.extraInLocal.length === 0) {
            console.log('No extra country codes in local data!');
        } else {
            comparison.extraInLocal.forEach((country, index) => {
                console.log(`${index + 1}. ${country.code} - ${country.name}`);
            });
        }
        
        console.log('\n=== SUMMARY ===');
        console.log(`Missing from local: ${comparison.missingFromLocal.length}`);
        console.log(`Extra in local: ${comparison.extraInLocal.length}`);
        
        // Save detailed results to a file
        const results = {
            timestamp: new Date().toISOString(),
            geoJSONUrl: geoJSONUrl,
            summary: {
                geoJSONCount: comparison.geoJSONCount,
                localCount: comparison.localCount,
                missingFromLocal: comparison.missingFromLocal.length,
                extraInLocal: comparison.extraInLocal.length
            },
            missingFromLocal: comparison.missingFromLocal,
            extraInLocal: comparison.extraInLocal,
            geoJSONCountries: geoJSONCountries,
            localCountries: localCountries
        };
        
        const outputPath = path.join(__dirname, 'country_code_comparison_results.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`\nDetailed results saved to: ${outputPath}`);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the check
checkMissingCountryCodes();
