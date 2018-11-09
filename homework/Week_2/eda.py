#!/usr/bin/env python
# Name: Koen Dielhoff
# Student number: 11269693

import csv
import pandas
import numpy as np
import matplotlib.pyplot as plt

heads = ['Country', 'Region', 'Pop. Density (per sq. mi.)',
         'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']

data_dict = {key: [] for key in heads}

def parse():
    with open('input.csv', 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if ('unknown' in (row[stat] for stat in heads) or
                '' in (row[stat] for stat in heads)):
                continue
            for stat in heads:
                try:
                    data_dict[stat].append(float(row[stat]))
                except:
                    if 'dollars' in row[stat]:
                        data_dict[stat].append(int(row[stat].rstrip(' dolars')))
                    else:
                        data_dict[stat].append(row[stat].rstrip())

def central_tendency(df):
    print(f"mean: {df.mean()}")
    print(f"median: {df.median()}")
    print(f"mode: {df.mode()}")
    print(f"std: {df.std()}")
    values = df.values
    plt.hist(values)
    plt.show()



if __name__ == "__main__":
    parse()
    df = pandas.DataFrame(data_dict)
    print(df.to_string())
    central_tendency(df.loc[:, 'GDP ($ per capita) dollars'])
