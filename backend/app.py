from flask import Flask, request
import requests
import csv
import pandas as pd
import json
import numpy as np


app = Flask(__name__)

smallCrimes = pd.read_csv('smallCrimes.csv')
mediumCrimes = pd.read_csv('mediumCrimes.csv')
largeCrimes = pd.read_csv('largeCrimes.csv')


@app.route('/crimeDataSmall', methods=['GET', 'POST'])
def crimeDataHeatmapDetailsS():
    print("Small Crimes", smallCrimes)
    return smallCrimes[['latitude', 'longitude' ]].to_json(orient='records')
@app.route('/crimeDataMedium', methods=['GET', 'POST'])
def crimeDataHeatmapDetailsM():
    print("Medium Crimes", mediumCrimes)
    return mediumCrimes[['latitude', 'longitude' ]].to_json(orient='records')
@app.route('/crimeDataLarge', methods=['GET', 'POST'])
def crimeDataHeatmapDetailsL():
    print("Large Crimes", largeCrimes)
    return largeCrimes[['latitude', 'longitude' ]].to_json(orient='records')

@app.route('/')
def hello():
    return 'Hello, World!'





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
    # Append the ending coordinates of the location to the coordinates
    print("Coordinates", coordinates)
    

    #return result
    return [coordinates, result]


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
    originMain = {
        'latitude': 43.0418,
        'longitude': -76.1361
    }
    destinationMain = "966 Cumberland Ave, Syracuse, NY 13210"
    api_key = "AIzaSyAAFSFl1024iEV_upockgRh5GZ7Svpi_Bk"
    route_result = get_route(originMain, destinationMain, api_key)
    

    return route_result

def get_route(origin, destination, api_key):
    print("Origin", origin)
    print("Destination", destination)
    originLat = origin['latitude']
    originLng = origin['longitude']

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={originLat},{originLng}&destination={destination}&key={api_key}&mode=walking&alternatives=true"
    response = requests.get(url)
    result = response.json()
    print("Result", result)
    routes = result['routes'][0]['legs']
    
    coordinates = []
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
    
    # Check if any of the coordinates in the path intersect with the largeCrimes dataset
    path_intersects_crimes = False
    for coordinate in coordinates:
        if any((largeCrimes['latitude'] == coordinate['latitude']) & (largeCrimes['longitude'] == coordinate['longitude'])):
            path_intersects_crimes = True
            break
    # print("Coordinates", coordinates)
    # print("Result", result)
    # print("Path Intersects Crimes", path_intersects_crimes)
    return result
    
    return [coordinates, result, path_intersects_crimes]
if __name__ == '__main__':
    app.run(host='192.168.1.196', port=3000, debug=True)