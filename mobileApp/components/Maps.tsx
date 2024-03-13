import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './Auth'
import Account from './Account'
import { SafeAreaView, View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import SearchBar from './searchbar'
import MapViewDirections from 'react-native-maps-directions';
import googleAPIKEY from './lib/googleAPIKEY'
import { Button } from 'react-native-elements'
import Geocoder from 'react-native-geocoding'
import LottieView from 'lottie-react-native';
import alertBright from './alertBrightest.json'
import { Image } from 'react-native-elements'


Geocoder.init(googleAPIKEY); // use a valid API key

const mapCustomStyle = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ]

export default function Maps() {

  const [currentLocation, setCurrentLocation] = useState({ latitude: 43.032201, longitude: -76.122812 })
  const [destination, setDestination] = useState('')
  const [destinationLatLng, setDestinationLatLng] = useState({ lat: 0, lng: 0 })
  const [latlngDelta, setLatlngDelta] = useState({ latitudeDelta: 0.095, longitudeDelta: 0.045 })
  const [markers, setMarkers] = useState<{ latitude: number, longitude: number }[]>([]) // Add state variable for markers
  const [region , setRegion] = useState({latitude: 43.032201, longitude: -76.122812})
  const [mapView, setMapView] = useState<any>()
  const getMarkers = () => {
    supabase
      .from('alerts')
      .select('latitude, longitude')
      .then(({ data: alerts, error }) => {
        if (error) console.log('Error fetching alerts:', error)
        else {
          const newMarkers = alerts.map((alert: any) => ({
            latitude: alert.latitude,
            longitude: alert.longitude
          }))
          setMarkers(prevMarkers => [...prevMarkers, ...newMarkers])
        }
      })
  }
  getMarkers()
  useEffect(() => {
    supabase
      .channel('alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        console.log('Change received!', payload)
        setMarkers(prevMarkers => [...prevMarkers, { latitude: payload.new.latitude, longitude: payload.new.longitude }]) // Update markers state with new value
      })
      .subscribe()
  }, [])

  const getData = (destination: any) => {
    Geocoder.from(destination)
		.then(json => {
      setDestinationLatLng(json.results[0].geometry.location)
			var location = json.results[0].geometry.location;
			console.log(location);
		})
		.catch(error => console.warn(error));

    
    setDestination(destination)
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
        followsUserLocation={true}
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
        
        renderToHardwareTextureAndroid={true}
        removeClippedSubviews={true}
        role='alert'
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsPointsOfInterest={true}
        rotateEnabled={true}
        nativeID='map'
        needsOffscreenAlphaCompositing={true}
        customMapStyle={[]} // Add custom map style
        cacheEnabled={true}
        mapType='standard'

        
      >
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
            resetOnChange={false}
            precision='high'
            language='en'
            geodesic={true}
            channel='alerts'
            miterLimit={10}
            onReady={result => {
              console.log('Distance: ', result.distance)
              console.log('Duration: ', result.duration)
              
              // mapView.fitToCoordinates(result.coordinates, {
              //   edgePadding: {
              //     right: (width / 20),
              //     bottom: (height / 20),
              //     left: (width / 20),
              //     top: (height / 20),
              //   }
              // })
            }
              
            }
          />
        }
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
            onPress={() => console.log('Marker pressed')}
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
              {/* <LottieView 
              source={alertBright} 
              autoPlay 
              loop
              speed={0.1}
              style={{
                width: 40,
                height: 40,
              
              }} /> */}

           
            </Marker>
          ))
        }
      </MapView>
    </View>
  )
}
