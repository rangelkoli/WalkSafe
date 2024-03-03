import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import MapView from 'react-native-maps'

export default function Maps() {


  return (
      <MapView
        style={{ flex: 2 }}
        initialRegion={{
          latitude: 43.032201,
          longitude: -76.122812,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      
      />



  )
}