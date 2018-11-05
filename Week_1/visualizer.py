#!/usr/bin/env python
# Name: Koen Dielhoff
# Student number: 11269693
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

def parse_csv():
    with open('movies.csv', 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data_dict[row['Year']].append(int(10 * float(row['Rating'])))

def plotter():
    avgval = []
    years = []
    for year in data_dict:
        total = 0
        for rating in data_dict[year]:
            total += rating
        total /= len(data_dict[year])
        avgval.append(total / 10)
        years.append(year)
    print(avgval)
    plt.plot(years, avgval, 'r')
    plt.title('Average ratings of movies per year')
    plt.show()


if __name__ == "__main__":
    print(data_dict)
    parse_csv()
    print(data_dict)
    plotter()
