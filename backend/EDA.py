import requests 
import csv

response = requests.get("https://services6.arcgis.com/bdPqSfflsdgFRVVM/arcgis/rest/services/crime_data_1_auto_update/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json")

data = response.json()

# Extract relevant data from the response
crime_data = data['features']

# Write the crime data to a CSV file
with open('allCrimeData.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Crime ID', 'Crime Type', 'Latitude', 'Longitude'])
    for crime in crime_data:
        crime_id = crime['attributes']['CrimeID']
        crime_type = crime['attributes']['CrimeType']
        latitude = crime['geometry']['y']
        longitude = crime['geometry']['x']
        writer.writerow([crime_id, crime_type, latitude, longitude])

print("CSV file created: allCrimeData.csv")


