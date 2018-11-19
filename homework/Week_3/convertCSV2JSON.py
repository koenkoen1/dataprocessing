#!/usr/bin/env python
# Name: Koen Dielhoff
# Student number: 11269693

import csv
import json

data_dict = {}

def csv_to_json(filename):
    """
    parses csv file and converts to json
    """
    with open(f"{filename}.csv", 'r') as csvfile:
        reader = csv.DictReader(csvfile)

        # the first field is assumed to be a unique identifier
        field = reader.fieldnames[0]

        # parse csvfile
        for row in reader:
            tempdict = {}
            for key in row:
                if not key == field:
                    tempdict[key] = row[key]
            data_dict[row[field]] = tempdict

    # create jsonfile
    with open(f"{filename}.json", 'w') as outfile:
        json.dump(data_dict, outfile, indent=4)

if __name__ == "__main__":
    csv_to_json("divorce_rate")
