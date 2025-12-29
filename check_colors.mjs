import countryData from './src/data/country_data.json' with { type: 'json' };
import {writeFile} from 'fs/promises';

async function main() {
    let colors = {};
    const countryDataCleaned = countryData.map(({ colors: countryColors, ...rest }) => {
        if (countryColors) {
            for (const color of countryColors) {
                colors[color] = colors[color] || [];
                colors[color].push(rest.flagCode);
            }
        }
        return rest;
    })
    // for (const country of countryData) {
    //     for (const color of country.colors) {
    //         colors[color] = colors[color] || [];
    //         colors[color].push(country.flagCode);
    //     }
    // }
    console.log(colors);
    console.log(countryDataCleaned);
    await Promise.all([
        writeFile(
            './src/data/country_data.json',
            JSON.stringify(countryDataCleaned, null, 2),
            'utf8'
        ),
        writeFile(
            './src/data/flag_colors.json',
            JSON.stringify(colors, null, 2),
            'utf8'
        )
    ]);
    // await writeFile('./src/data/flag_colors.json', JSON.stringify(colors, null, 2));
};

main();
