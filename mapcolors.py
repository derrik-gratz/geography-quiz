import json
from collections import defaultdict

with open('src/data/flag_colors.json', 'r') as f:
    color_map = json.load(f)

with open('src/data/country_data.json', 'r') as f:
    country_data = json.load(f)

inverted_dict = defaultdict(list)

for key, value in color_map.items():
    for color in value:
        inverted_dict[color].append(key)

for country in country_data:
    country_code = country['flagCode']
    colors = inverted_dict[country_code]
    country['colors'] = colors

for key, value in inverted_dict.items():
    print(f"{key}: {value}")

with open('src/data/country_data_with_colors.json', 'w') as f:
    json.dump(country_data, f, indent=2)

# for country in country_data:
#     country_code = country['code']
#     country_name = country['country']
#     country_color = color_map[country_code]
#     print(f"{country_name}: {country_color}")
