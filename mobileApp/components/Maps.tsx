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
export default function Maps() {

  const [currentLocation, setCurrentLocation] = useState({ latitude: 43.032201, longitude: -76.122812 })
  const [destination, setDestination] = useState('')
  const [latlngDelta, setLatlngDelta] = useState({ latitudeDelta: 0.095, longitudeDelta: 0.045 })
  const [markers, setMarkers] = useState<{ latitude: number, longitude: number }[]>([]) // Add state variable for markers

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
        provider={PROVIDER_GOOGLE}
        followsUserLocation={true}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 43.032201,
          longitude: -76.122812,
          latitudeDelta: latlngDelta.latitudeDelta,
          longitudeDelta: latlngDelta.longitudeDelta,
        }}
        
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsPointsOfInterest={true}
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
        {/* {
          destination && 
          <Marker
            coordinate={{}}
            title={"Destination"}
            description={"Destination"}
            shouldRasterizeIOS={true}
            tracksViewChanges={true}
            tracksInfoWindowChanges={true}
            tappable={true}
            onPress={() => console.log('Marker pressed')}
        } */}

        {
          markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={"Alert"}
              description={"Alert"}
              shouldRasterizeIOS={true}
              tracksViewChanges={true}
              tracksInfoWindowChanges={true}
              tappable={true}
              onPress={() => console.log('Marker pressed')}
            />
          ))
        }
      </MapView>

    </View>
  )
}
