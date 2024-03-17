from flask import Flask
import requests

app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello, World!'

def get_route(origin, destination, api_key):
    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={api_key}&mode=walking&alternatives=true"
    response = requests.get(url)
    result = response.json()
    print("Result", result)
    routes = result['routes'][0]['legs'][0]['steps']
    coordinates =[{ 'latitude': route['start_location']['lat'], 'longitude': route['start_location']['lng'] } for route in routes]
    # print("Coordinates", coordinates)
    for route in routes:
        print("Route", route['start_location']['lat'], route['start_location']['lng'])

    return coordinates

@app.route('/route')
def route():
    origin = "966 Lancaster Ave, Syracuse, NY 13210"
    destination = "966 Cumberland Ave, Syracuse, NY 13210"
    api_key = "AIzaSyAAFSFl1024iEV_upockgRh5GZ7Svpi_Bk"

    route_result = get_route(origin, destination, api_key)
    return route_result


if __name__ == '__main__':
    app.run(host='192.168.1.196', port=3000, debug=True)