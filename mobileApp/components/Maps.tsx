import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './Auth'
import Account from './Account'
import { SafeAreaView, View, Text, Pressable } from 'react-native'
import { Session } from '@supabase/supabase-js'
import MapView, { Marker, PROVIDER_GOOGLE, Callout,Polyline, Heatmap } from 'react-native-maps'
import SearchBar from './searchbar'
import MapViewDirections from 'react-native-maps-directions';
import googleAPIKEY from './lib/googleAPIKEY'
import { Button } from 'react-native-elements'
import Geocoder from 'react-native-geocoding'
import LottieView from 'lottie-react-native';
import alertBright from './alertBrightest.json'
import { Image } from 'react-native-elements'
import { setValue } from './lib/currentLocation'
import axios from 'axios'
import GetLocation from 'react-native-get-location'
import * as Location from 'expo-location';

Geocoder.init(googleAPIKEY); // use a valid API key

const mapCustomStyle = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ]

export default function Maps({ session }: { session: Session}) {

  const [currentLocationAsString, setCurrentLocationAsString] = useState('')
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number }>({
    latitude: 43.032201,
    longitude: -76.122812
  })
  const [destination, setDestination] = useState('')
  const [destinationLatLng, setDestinationLatLng] = useState({ lat: 0, lng: 0 })
  const [latlngDelta, setLatlngDelta] = useState({ latitudeDelta: 0.095, longitudeDelta: 0.045 })
  const [markers, setMarkers] = useState<{ latitude: number, longitude: number, alert:string, likes:number }[]>([]) // Add state variable for markers
  const [familyMarkers, setFamilyMarkers] = useState<[{}]>([{
    username: '',
    currentLocation: { latitude: 0, longitude: 0 },
    avatar_url: ''
  }]) // Add state variable for markers
  const [region , setRegion] = useState({latitude: 43.032201, longitude: -76.122812, latitudeDelta: 0.0922, longitudeDelta: 0.0421})
  const [mapView, setMapView] = useState<any>()
  const [polylineCoordinates, setPolylineCoordinates] = useState<any>([{latitude: 43.032201, longitude: -76.122812}, {latitude: 43.032201, longitude: -76.122812}])
  const getMarkers = () => {
    supabase
      .from('alerts')
      .select('latitude, longitude, alert, likes')
      .then(({ data: alerts, error }) => {
        if (error) console.log('Error fetching alerts:', error)
        else {
          const newMarkers = alerts.map((alert: any) => ({
            latitude: alert.latitude,
            longitude: alert.longitude,
            alert: alert.alert,
            likes: alert.likes
          }))
          setMarkers(prevMarkers => [...prevMarkers, ...newMarkers])
        }
      })
  }
  const updateLocationDB = async () => {
    Geocoder.from(currentLocation)
		.then(json => {
        		var addressComponent = json.results[0].formatted_address;
			console.log("Address", addressComponent);
      setCurrentLocationAsString(addressComponent)

		})
		.catch(error => console.warn(error));
    const { data, error } = await supabase
      .from('profiles')
      .update({ currentLocation: currentLocation })
      .eq('id', session?.user?.id)
    if (error) console.log('Error updating location:', error)
    else console.log('Location updated:', data)
  }
  
const location = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
    return;
  }
  let location = await Location.getCurrentPositionAsync({});
  console.log("currLoc",location.coords.latitude, location.coords.longitude);
  const lat = location.coords.latitude
  const lon = location.coords.longitude
  setCurrentLocation({latitude: lat, longitude: lon})
  console.log('Current Location:', currentLocation)
}
  useEffect(() => {
    location()
    getMarkers() // Call getMarkers function once at the start
    setValue(currentLocation)
    getFamilyMarkers()
    getHeatMapMarkers()

    const interval = setInterval(() => {
      getMarkers()
      console.log('Current Location From Maps:', currentLocation)
      location()
      getFamilyMarkers()

    }, 10000) // Fetch markers every 1 minute

    return () => {
      clearInterval(interval)
    }
  }, [])
  useEffect(() => {
    updateLocationDB()
    const interval = setInterval(() => {
      updateLocationDB()
    }, 60000) // Update Location every 1 min
    return () => {
      clearInterval(interval)
    }
  }, [])
  const getFamilyMarkers = async () => {
    const { data: family, error } = await supabase
      .from('profiles')
      .select('username, currentLocation, avatar_url')
      .eq('id', session?.user?.id)
    if (family && family.length > 0) {
      const id = session?.user?.id; // Define the id variable
      const friendsUUIDs = ['f2d4a61d-a345-49d1-98e6-24d61b46aabc', 'fdd5fe65-11dc-4e82-830a-1502b152fc6e']; // Array of UUIDs
      const { data: friends, error: friendsError } = await supabase
        .from('profiles')
        .select('username, family, currentLocation, avatar_url')
        .in('id', friendsUUIDs); // Use 'in' instead of 'containedBy'
        setFamilyMarkers(friends);

    }
  }

  const getData = (destination: any) => {
    Geocoder.from(destination)
		.then(json => {
      setDestinationLatLng(json.results[0].geometry.location)
			var location = json.results[0].geometry.location;
			console.log(location);
		})
		.catch(error => console.warn(error)); 
    setDestination(destination)

    
    console.log('Current Location:', currentLocation)
    console.log('Destination:', destination)

    axios.post('http://192.168.1.196:5000/route', {
      origin: currentLocationAsString,
      destination: destination,
    })
      .then(function (response) {
        console.log("ROUTE:", response.data);
        setPolylineCoordinates(response.data[0])
      })
      .catch(function (error) {
        console.log(error);
      });
    // axios.get('http://192.168.1.196:5000/route')
    //   .then(function (response) {
    //     console.log("ROUTE:", response.data);
    //     setPolylineCoordinates(response.data[0])
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
  }

  const increaseLikes = async (alert: string) => {
    const { data, error } = await supabase
      .from('alerts')
      .update({ likes: 1 })
      .eq('alert', alert)
  }
// Heatmap Markers
const [heatMapMarkers, setHeatMapMarkers] = useState<any>([

])

const getHeatMapMarkers = async () => {
  try {
    const response = await axios.get('http://192.168.1.196:5000/crimeData');
    console.log("HEATMAP MARKERS:", response.data);
    setHeatMapMarkers(response.data);
    console.log('Heatmap Markers:', response.data);
  } catch (error) {
    console.log(error);
  }
}



  return (
    <View style={{ flex: 1, display: 'flex' }}>
      <SafeAreaView style={{
        position: 'absolute', // Take the view out of the normal layout flow
        zIndex: 1, // Ensure this view appears on top
        width: '100%', // Take the full width of the screen
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 20,
      }}>
        <SearchBar onSearch={getData} />
        {/* <Button title="Get Location" onPress={() => {
          setMarkers(prevMarkers => [...prevMarkers, { latitude: 43.032201, longitude: -76.122812 }]) // Update markers state with new value
        }} /> */}

      </SafeAreaView>
      <MapView
      ref={mapView}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        googleMapId='3277db22b22e7eab'
        initialRegion={{
          latitude: 43.032201,
          longitude: -76.122812,
          latitudeDelta: latlngDelta.latitudeDelta,
          longitudeDelta: latlngDelta.longitudeDelta,
        }}
        onRegionChange={(region) => {
          setRegion(region)
        }
        }
        role='alert'
        showsUserLocation={true}
        showsMyLocationButton={true}
        rotateEnabled={true}
        nativeID='map'
        customMapStyle={[]} // Add custom map style
        cacheEnabled={true}
        mapType='standard'  
      >
        {
          heatMapMarkers.length > 0 &&
          <Heatmap
            points={heatMapMarkers}
            opacity={1}
            radius={40}
            gradient={{
              colors: ["#00FF00", "#FF0000"],
              startPoints: [0.001, 0.8],
              colorMapSize: 256
            }}

          />
        }
        {
          familyMarkers.length > 0 &&
          familyMarkers.map((familyMarker: any, index: number) => (
            <Marker
              key={index}
              coordinate={{ latitude: familyMarker.currentLocation.latitude, longitude: familyMarker.currentLocation.longitude }}
              title={familyMarker.username}
              description={familyMarker.username}
              tappable={true}
              onPress={() => console.log('Marker pressed')}
              tracksViewChanges={false}
              tracksInfoWindowChanges={false}
              stopPropagation={true}
              icon={require('./batman175.png')}
              

            >
              <Callout tooltip={true} onPress={() => console.log('Callout pressed')} style={{

              }}>
                <View style={{ flex: 1,
                  padding: 10, 
                  display: 'flex', 
                  flexDirection: 'row', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor:'white',
                  borderRadius: 20,
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 2 },

                  
                  }}>
                  <Text>{familyMarker.username}</Text>
                  <Pressable onPress={() => console.log('Pressed')} style={{

                  }}>

                  </Pressable>
                </View>
              </Callout>
            </Marker>
          ))
        }
        {/* <Marker coordinate={{ latitude: 43.032201, longitude: -76.122812 }} /> */}
        {destination &&
          <MapViewDirections
            origin={currentLocation}
            destination={destination}
            apikey={googleAPIKEY}
            strokeWidth={3}
            mode='WALKING'
            optimizeWaypoints={true}
            strokeColor="hotpink"
            onStart={(params) => {
              console.log(`Started routing between "${params.origin}" and "${params.destination}"`)
            }}
            splitWaypoints={true}
            waypoints={[]} // Add waypoints
            precision='high'
            language='en'
            channel='alerts'
            miterLimit={10}
            onReady={result => {
              console.log('Distance: ', result.distance)
              console.log('Duration: ', result.duration)
              setRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              })
            }
            }
            onError={(errorMessage) => {
              console.log('GOT AN ERROR', errorMessage)
            }}
            region='us-east-1'
            
          />
        }
        {/* {destination &&
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="hotpink" // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={3}
            removeClippedSubviews={true}
            pointerEvents='auto'
          />
        } */}
        {
          destination && 
          <Marker
            coordinate={{ latitude: destinationLatLng.lat, longitude: destinationLatLng.lng }}
            title={"Destination"}
            description={"Destination"}
            shouldRasterizeIOS={true}
            tracksViewChanges={true}
            tracksInfoWindowChanges={true}
            tappable={true}
            onPress={(event) => {
              console.log(event.nativeEvent)
             }}          
             />
        }
        {
          markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={"Alert"}
              description={"Alert"}
              tappable={true}
              onPress={() => console.log('Marker pressed')}
              tracksViewChanges={false}
              tracksInfoWindowChanges={false}
              stopPropagation={true}
              // icon={require('./alertSmallDangerS.png')}
              icon={require('./alertYellow.png')}
            >
              <Callout tooltip={true} onPress={() => console.log('Callout pressed')}>
                <View style={{ flex: 1,
                  padding: 5, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor:'white',
                  borderRadius: 20,
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 2 },
                  gap: 10,
                  
                  }}>
                  <Text>Alert</Text>
                  <View style={{ flex: 1,
                    padding: 5, 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    backgroundColor:'white',
                    borderRadius: 20,
                    shadowColor: 'black',
                    shadowOffset: { width: 0, height: 2 },
                    gap: 10,
                    
                    }}>
                  <Pressable onPress={() => {
                    increaseLikes(marker.alert)
                    supabase.from('alerts').update({ likes: marker.likes + 1 }).eq('alert', marker.alert)
                    marker.likes += 1
                    
                  }}>
                  <Image source={require('./likeButton.png')} style={{ padding:10, width: 15, height: 15 }} />

                  </Pressable>
                    <Text>{marker.likes}</Text>
                  </View>

                </View>
              </Callout>
            </Marker>
          ))
        }
      </MapView>
    </View>
  )
}
