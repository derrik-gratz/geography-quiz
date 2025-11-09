# Roadmap

Continue building data filtering service

Does filtering from ui component/user input need to be a hook, not a service? consider this, or can I just trigger it on config change. Start here next time.

Build quiz engine
  - possibly a as a hook not service. Services are pure logic functions with no react dependencies (no state). Hooks use state

# Housekeeping

- Add a filtering step in the data filtering service to remove countries with no avialble prompt types in the json
  - There may be temporary disables where I don't want to delete the data, but don't want it in the game for now. Or maybe this isn't needed, and can just use git tracking to get the data back when it's ready to be added.

- Review 'available prompts' for countries with duplicate flags

- Cleanup sets, make sure correct countries are included

# Future feature plans

- Learning mode: selecting an answer in one window displays the answers in the other one. 

- Allow user to challenge themselves on only one type of response. E.g., only guessing flags, maps, names, etc.

- Fix contries found in geographies but not in countries

- Group like flags with multiple country codes (eg FR)

- Create groups of countries for challenges. Also possibly blacklist common countries

Changelog:

2025-11-09: 
- initiate remake, starting with countryDataService
- 'availablePrompts' added to countryData.json
- Added filtering based on config
  - Daily challenge functionality implemented by filtering countries 'availablePrompts' to 1 random choice based on daily seed. 
  - Confirmed proper use with src/tests/test-data-service.js. 