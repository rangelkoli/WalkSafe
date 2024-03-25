from flask import Flask, request
import requests
import csv
import pandas as pd
import json
import numpy as np
import polyline as pl
from geopy.distance import geodesic


app = Flask(__name__)

smallCrimes = pd.read_csv('smallCrimes.csv')
mediumCrimes = pd.read_csv('mediumCrimes.csv')
largeCrimes = pd.read_csv('largeCrimes.csv')
goodWaypoints =[
    (43.038497, -76.180731),
    (43.041114, -76.169333), 
    (43.034190, -76.168420),
    (43.025417, -76.160784),
    (43.023092, -76.145535), 
    (43.022107, -76.150100), 
    (43.044238, -76.138307), 
    (43.028732, -76.113726),
    (43.042491, -76.083786),
    (43.055530, -76.112623),
    (43.059449, -76.094585),
    (43.052780, -76.123870),
    (43.044209, -76.134693),
    (43.042857, -76.145729),
    (43.045499, -76.149951),
    (43.048704, -76.153679),
    (43.040218, -76.168521),
    (43.039763, -76.159831),
    (43.036759, -76.120326),
    (43.037514, -76.122980)
    ]

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
    return 'The Server is Running!'



def are_points_on_polyline(points, polyline):
    """
    Determines if the given points are on the given polyline.

    Args:
        points (list): List of points in the form [(x1, y1), (x2, y2), ...].
        polyline (str): Encoded polyline representing a path.

    Returns:
        list: List of points that are on the polyline.

    """
    print("Points", points)
    polyline = pl.decode(polyline)
    newWaypoints = []
    for point in points:
        x = point[0]
        y = point[1]
        x = float(x)
        y = float(y)
        n = len(polyline)
        inside = False
        p1x, p1y = polyline[0]
        for i in range(n+1):
            p2x, p2y = polyline[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y-p1y)*(p2x-p1x)/(p2y-p1y)+p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        if inside:
            print("Inside", point)
            res = get_nearest_coordinates(point)
            
            # Calculate the distance between res and origin
            distance = geodesic((res[0], res[1]), (x, y)).meters
            
            if distance <= 2 * geodesic((res[0], res[1]), (x, y)).meters:
                print("1-2 roads away")
                newWaypoints.append(res)
            else:
                print("Further away")
            
    return newWaypoints


def get_nearest_coordinates(point):
    """
    Returns the nearest coordinates from the given point.

    Args:
        point (tuple): The coordinates of the point.

    Returns:
        tuple: The nearest coordinates.
    """
    distances = []
    for waypoint in goodWaypoints:
        distance = geodesic(point, waypoint).meters
        distances.append(distance)
    nearest_index = distances.index(min(distances))
    nearest_coordinates = goodWaypoints[nearest_index]
    return nearest_coordinates



def get_route(origin, destination, api_key):
    """
    Retrieves the walking route from the origin to the destination using the Google Maps Directions API.

    Args:
        origin (dict): Dictionary containing the latitude and longitude of the origin location.
        destination (str): The address or coordinates of the destination location.
        api_key (str): API key for accessing the Google Maps Directions API.

    Returns:
        dict: The JSON response containing the walking route information.
    """
    print("Origin", origin)
    print("Destination", destination)
    originLat = origin['latitude']
    originLng = origin['longitude']

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={originLat},{originLng}&destination={destination}&key={api_key}&mode=walking&alternatives=true"
    response = requests.get(url)
    result = response.json()
    print("Result", result)
    routes = result['routes'][0]['legs']

    coordinatestoSend = [ (latitude, longitude) for latitude, longitude in mediumCrimes[['latitude', 'longitude']].values]

    res = are_points_on_polyline(coordinatestoSend, result['routes'][0]['overview_polyline']['points'])
    if len(res) > 25:
        res = res[:25]
    if len(res) > 0:        
        waypoints = "|".join([f"{point[0]},{point[1]}" for point in res])
        url = f"https://maps.googleapis.com/maps/api/directions/json?origin={originLat},{originLng}&destination={destination}&key={api_key}&mode=walking&alternatives=true&waypoints=optimize:true|{waypoints}"
        response = requests.get(url)
        result = response.json()
        print("Result After Waypoints", result)
        return result

    return result

@app.route('/route', methods=['GET', 'POST'])
def route():
    """
    Handle the '/route' endpoint to calculate and return the route between the given origin and destination.

    Returns:
        str: The calculated route as a string.
    """
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
    """
    This function calculates and returns the route from the origin to the destination using the Google Maps API.

    :return: The route from the origin to the destination.
    """
    originMain = {
        'latitude': 43.032384, 
        'longitude': -76.1361
    }
    destinationMain = "966 Cumberland Ave, Syracuse, NY 13210"
    api_key = "AIzaSyAAFSFl1024iEV_upockgRh5GZ7Svpi_Bk"
    route_result = get_route(originMain, destinationMain, api_key)
    

    return route_result

@app.route('/routeWithoutWaypoints', methods=['GET', 'POST'])
def routeWithoutWaypoints():
    """
    Retrieves the origin and destination addresses from the request JSON,
    calculates the walking route using the Google Maps Directions API,
    and returns the result as a JSON response.

    Returns:
        dict: The JSON response containing the walking route information.
    """
    address = request.get_json()
    origin = address['origin']
    destination = address['destination']
    print("Address", address)
    print("Origin", origin)
    print("Destination", destination)
    originMain = origin
    destinationMain = destination
    api_key = "AIzaSyAAFSFl1024iEV_upockgRh5GZ7Svpi_Bk"
    originLat = origin['latitude']
    originLng = origin['longitude']

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={originLat},{originLng}&destination={destination}&key={api_key}&mode=walking&alternatives=true"
    response = requests.get(url)
    result = response.json()

    return result


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)