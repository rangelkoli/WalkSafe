import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './Auth'
import Account from './Account'
import { SafeAreaView, View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import SearchBar from './searchbar'

export default function Maps() {

  const [currentLocation, setCurrentLocation] = useState({ latitude: 43.032201, longitude: -76.122812 })
  const [destination, setDestination] = useState('')
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log(session)
  }

  )
  supabase
  .channel('alerts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
    console.log('Change received!', payload)
  })
  .subscribe()

  const getData = (data: any) => {
    console.log(data)
  }

  return (
    <View style={{ flex: 1, display: 'flex'  }}>
      <SafeAreaView style={{     
        position: 'absolute', // Take the view out of the normal layout flow
        zIndex: 1, // Ensure this view appears on top
        width: '100%', // Take the full width of the screen
        height: 100,
        justifyContent : 'center',
        alignItems: 'center',
        marginTop: 20,
        }}>
      <SearchBar onSearch={getData} />

      </SafeAreaView>
      <MapView
        provider={PROVIDER_GOOGLE}
        followsUserLocation={true}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 43.032201,
          longitude: -76.122812,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={{ latitude: 43.032201, longitude: -76.122812 }} />

      </MapView>

    </View>



  )
}