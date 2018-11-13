#!/usr/bin/env python
# Name: Koen Dielhoff
# Student number: 11269693

import csv
import pandas
import numpy as np
import matplotlib.pyplot as plt
import statistics as st
import json

# global list of important statistics
heads = ['Country', 'Region', 'Pop. Density (per sq. mi.)',
         'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']

# global dictionary for the data
data_dict = {key: [] for key in heads}

def parse():
    """
    take the important statistics from every country from a CSV file and group
    them by statistic, cleaning them up if necessary
    """
    with open('input.csv', 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # skip countries which do not have some of the required statistics
            if ('unknown' in (row[stat] for stat in heads) or
                '' in (row[stat] for stat in heads)):
                continue

            # iterate for every statistic
            for stat in heads:
                # clean up floats and add to global dictionary
                try:
                    data_dict[stat].append(float(row[stat].replace(',','.')))
                except:
                    # clean up integers and add to global dictionary
                    if 'dollars' in row[stat]:
                        data_dict[stat].append(int(row[stat].rstrip(' dolars')))

                    # remove unnecessary spaces and add to global dictionary
                    else:
                        data_dict[stat].append(row[stat].rstrip())


def remove_outliers(stat):
    """
    removes outliers among the values of a provided stat in global dictionary
    """
    mean = st.mean(data_dict[stat])
    stdev = st.stdev(data_dict[stat])
    outlier = False
    todelete = []

    # select the outliers
    for index in range(len(data_dict[stat])):
        if abs(data_dict[stat][index] - mean) > 3*stdev:
            todelete.append(index)
            outlier = True

    # outliers are removed after the for loop to avoid disrupting the loop
    for index in reversed(todelete):
        for head in heads:
            del data_dict[head][index]

def central_tendency(df):
    """
    calculates values relevant to the central tendency and
    makes a histogram of the data in the series
    """
    print(f"Mean: {df.mean()}")
    print(f"Median: {df.median()}")
    print(f"Mode: {df.mode()}")

    values = df.values
    plt.hist(values, bins=15)
    plt.show()

def five_number_summary(df):
    """
    calculates the five number summary and
    makes a boxplot of the data in the series
    """
    print(f"Minimum: {df.min()}")
    print(f"First Quartile: {df.quantile(0.25)}")
    print(f"Mean: {df.mean()}")
    print(f"Third Quartile: {df.quantile(0.75)}")
    print(f"Maximum: {df.max()}")

    values = df.values
    plt.boxplot(values)
    plt.show()

def to_json(df):
    """
    converts data in dataframe to json format and writes data to data.json
    """
    data = {}
    columns = df.columns
    for i in range(len(df.index)):
        values = df.iloc[i].values
        temp_dict = {columns[1]: values[1], columns[2]: values[2],
                     columns[3]: values[3], columns[4]: int(values[4]), }
        data[values[0]] = temp_dict

    with open('data.json', 'w') as outfile:
        json.dump(data, outfile, indent=4)

if __name__ == "__main__":
    parse()

    # remove outliers for every statistic
    remove_outliers('GDP ($ per capita) dollars')
    remove_outliers('Infant mortality (per 1000 births)')
    remove_outliers('Pop. Density (per sq. mi.)')

    # create a pandas dataframe with the parsed, preprocessed data
    df = pandas.DataFrame(data_dict)

    # calculate central tendency and make histogram with GDP data
    print("GDP ($ per capita) dollars")
    central_tendency(df.loc[:, 'GDP ($ per capita) dollars'])

    # calculate five number summary and make boxplot with infant mortality data
    print("\nInfant mortality (per 1000 births)")
    five_number_summary(df.loc[:, 'Infant mortality (per 1000 births)'])

    # write to json
    to_json(df)
