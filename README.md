# Roadmap

make learning mode selection in one field highlight in other fields. Then un-selecting clears all

# Housekeeping

- Review 'available prompts' for countries with duplicate flags. Collapse flag redundant flag codes

- Cleanup sets, make sure correct countries are included

- Only countries with flags should be included. West sahara is in the game but has no flag.

- Bounding boxes still appearing on some browsers

- Redundant flags showing in flag select (FR)

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