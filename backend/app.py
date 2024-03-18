from flask import Flask, request
import requests
import csv
import pandas as pd
import json
import numpy as np


app = Flask(__name__)

data = pd.read_csv('allCrimeData.csv')

@app.route('/')
def hello():
    return 'Hello, World!'


def pathGoesThoughCrime(crimeData, path):
    print(crimeData)
    crimeData = crimeData[['LAT', 'LONG']]
    for route in path:
        for legs in route['steps']:
            for crime in crimeData:
                print("Crime", float(crime["LAT"]), float(crime["LONG"]))
                print("Legs", legs['start_location']['lat'], legs['start_location']['lng'])
                # if float(crime['latitude']) > legs['start_location']['lat'] and float(crime['latitude']) < legs['end_location']['lat']:
                #     if float(crime['longitude']) > legs['start_location']['lng'] and float(crime['longitude']) < legs['end_location']['lng']:
                #         return True
    return False



def get_route(origin, destination, api_key):
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={api_key}&mode=walking&alternatives=true"
    response = requests.get(url)
    result = response.json()
    print("Result", result)
    routes = result['routes'][0]['legs']

    coordinates =[]
    coordinates.append({'latitude': routes[0]['start_location']['lat'], 'longitude': routes[0]['start_location']['lng']})
    # Append the starting coordinates of the location to the coordinates

    for route in routes:
        for legs in route['steps']:
            coordinates.append({ 
                'latitude': legs['start_location']['lat'], 
                'longitude': legs['start_location']['lng'] 
                })
            coordinates.append({ 
                'latitude': legs['end_location']['lat'], 
                'longitude': legs['end_location']['lng'] 
                })
            print("Legs", legs['start_location']['lat'], legs['start_location']['lng'])


    coordinates.append({'latitude': routes[-1]['end_location']['lat'], 'longitude': routes[-1]['end_location']['lng']})
    if pathGoesThoughCrime(data, routes) == True:
        print("Path goes through crime")
    else:
        print("Path does not go through crime")
    return result
    #return [coordinates, result]


@app.route('/route', methods=['GET', 'POST'])
def route():
    address = request.get_json()
    origin = address['origin']
    destination = address['destination']
    print("Address", address)
    print("Origin", origin)
    print("Destination", destination)
    originMain = origin
    destinationMain = destination
    api_key = "AIzaSyAAFSFl1024iEV_upockgRh5GZ7Svpi_Bk"
    route_result = get_route(origin, destination, api_key)
    return route_result

@app.route('/routeTest', methods=['GET', 'POST'])
def routeTest():
    originMain = "966 Lancaster Ave, Syracuse, NY 13210"
    destinationMain = "966 Cumberland Ave, Syracuse, NY 13210"
    api_key = "AIzaSyAAFSFl1024iEV_upockgRh5GZ7Svpi_Bk"
    route_result = get_route(originMain, destinationMain, api_key)
    return route_result

if __name__ == '__main__':
    app.run(host='192.168.1.196', port=3000, debug=True)