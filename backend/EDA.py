import requests 

response = requests.get("https://services6.arcgis.com/bdPqSfflsdgFRVVM/arcgis/rest/services/crime_data_1_auto_update/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json")

print(response.content)