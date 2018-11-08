#!/usr/bin/env python
# Name: Koen Dielhoff
# Student number: 11269693

import csv
import pandas

stats = ['Country', 'Region', 'Pop. Density (per sq. mi.)',
         'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']

data_dict = {key: [] for key in stats}


with open('input.csv', 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if ('unknown' in (row[stat] for stat in stats) or
            '' in (row[stat] for stat in stats)):
            continue
        for stat in stats:
            try:
                data_dict[stat].append(float(row[stat]))
            except:
                if 'dollars' in row[stat]:
                    data_dict[stat].append(int(row[stat].rstrip(' dollars')))
                else:
                    data_dict[stat].append(row[stat].rstrip(' '))
    dataframe = pandas.DataFrame(data_dict)
    print(dataframe.to_string())
