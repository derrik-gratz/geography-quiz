# Roadmap

major states:
  inactive, receiving user config
  active, receiving user input
  reviewing, showing user history but not accepting input
    could tie this to learning mode where you can still click other countries, but doesn't log the inputs
    so review mode CAN have history shown (and a correct answer shown), but has no submit functionality
      yellow for selected in review, still standard correct/incorrect color scheme

how to handle give ups? 
  with prompt, there is a brief window where the generic prompt content triggers, but that is quickly overwriten by the event watcher which generates the next prompt. Need to add a sleep condition
  Prompt entry components need to be aware that the prompt is given up, so they can show the correct answer
  Where to manage this state? Should it be a 'quizStatus?'

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